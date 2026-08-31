import React, { createContext, useContext, useEffect, useState } from 'react';
import { initialCategories, initialOrders, initialProducts, initialSettings } from '../data/initialData';
import {
  AgeGroup,
  CartItem,
  CategoryInfo,
  CustomerInfo,
  DeliveryMethod,
  FilterState,
  GenderCategory,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductSize,
  StoreSettings,
} from '../types';

// Declaração global para acessar a biblioteca do Supabase adicionada no HTML
declare global {
  interface Window {
    supabase?: any;
  }
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface InstitutionalState {
  isOpen: boolean;
  slug: string;
  title: string;
}

interface StoreContextType {
  products: Product[];
  categories: CategoryInfo[];
  orders: Order[];
  settings: StoreSettings;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  
  addToCart: (product: Product, size: ProductSize, quantity?: number, color?: string) => void;
  updateCartQuantity: (index: number, delta: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  
  filterState: FilterState;
  setFilterCategory: (cat: AgeGroup | 'todas', subcat?: GenderCategory | 'todas', subCategoryName?: string | 'todas') => void;
  setFilterSubcategoryName: (subCategoryName: string | 'todas') => void;
  setFilterSeason: (season: string | 'todas') => void;
  setFilterGender: (gender: GenderCategory | 'todas') => void;
  setFilterSize: (size: ProductSize | 'todos') => void;
  setFilterSearch: (query: string) => void;
  setFilterSort: (sort: FilterState['sortBy']) => void;
  resetFilters: () => void;
  
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isSizeGuideOpen: boolean;
  setIsSizeGuideOpen: (open: boolean) => void;
  institutionalModal: InstitutionalState;
  openInstitutionalModal: (slug: string, title: string) => void;
  closeInstitutionalModal: () => void;
  
  lastCreatedOrder: Order | null;
  setLastCreatedOrder: (order: Order | null) => void;
  placeOrder: (customer: CustomerInfo, deliveryMethod: DeliveryMethod, paymentMethod: PaymentMethod) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  
  isAdminLoggedIn: boolean;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  loginAdmin: (code: string) => boolean;
  logoutAdmin: () => void;
  addProduct: (newProd: Omit<Product, 'id'>) => void;
  updateProduct: (updatedProd: Product) => void;
  deleteProduct: (productId: string) => void;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  updateCategory: (updatedCat: CategoryInfo) => void;
  addCategory: (newCat: CategoryInfo) => void;
  deleteCategory: (catId: string) => void;
  addSubcategoryToCategory: (categoryId: string, subcategoryName: string) => void;
  removeSubcategoryFromCategory: (categoryId: string, subcategoryName: string) => void;
  updateSubcategoryInCategory: (categoryId: string, oldName: string, newName: string) => void;
  deleteOrder: (orderId: string) => void;
  changeAdminPassword: (oldPass: string, newPass: string) => boolean;
  
  lgpdAccepted: boolean;
  acceptLgpd: () => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  PRODUCTS: 'majoca_products_v6',
  CATEGORIES: 'majoca_categories_v6',
  ORDERS: 'majoca_orders_v6',
  SETTINGS: 'majoca_settings_v6',
  CART: 'majoca_cart_v6',
  LGPD: 'majoca_lgpd_v6',
  ADMIN_AUTH: 'majoca_admin_auth_v6',
  ADMIN_PASSWORD: 'majoca_admin_password_v6',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return initialProducts || [];
    } catch {
      return initialProducts || [];
    }
  });

  // Busca inicial dos produtos no Supabase assim que a loja carrega
  useEffect(() => {
    const fetchProductsFromSupabase = async () => {
      if (window.supabase) {
        try {
          const { data, error } = await window.supabase.from('produtos').select('*');
          if (!error && data && data.length > 0) {
            setProducts(data);
          }
        } catch (e) {
          console.error("Erro ao carregar produtos do Supabase:", e);
        }
      }
    };
    fetchProductsFromSupabase();
  }, []);

  const [categories, setCategories] = useState<CategoryInfo[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return initialCategories || [];
    } catch {
      return initialCategories || [];
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : (initialOrders || []);
    } catch {
      return initialOrders || [];
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : (initialSettings || {});
    } catch {
      return initialSettings || {};
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CART);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [lgpdAccepted, setLgpdAccepted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEYS.LGPD) === 'true';
    } catch {
      return false;
    }
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [institutionalModal, setInstitutionalModal] = useState<InstitutionalState>({
    isOpen: false,
    slug: '',
    title: '',
  });

  const [filterState, setFilterState] = useState<FilterState>({
    search: '',
    category: 'todas',
    subcategory: 'todas',
    subCategoryName: 'todas',
    season: 'todas',
    size: 'todos',
    sortBy: 'destaques',
  });

  useEffect(() => {
    document.title = 'Majoca Moda - Moda Infanto-Juvenil';
  }, []);

  useEffect(() => {
    try { localStorage.setItem(LOCAL_STORAGE_KEYS.PRODUCTS, JSON.stringify(products)); } catch {}
  }, [products]);

  useEffect(() => {
    try { localStorage.setItem(LOCAL_STORAGE_KEYS.CATEGORIES, JSON.stringify(categories)); } catch {}
  }, [categories]);

  useEffect(() => {
    try { localStorage.setItem(LOCAL_STORAGE_KEYS.ORDERS, JSON.stringify(orders)); } catch {}
  }, [orders]);

  useEffect(() => {
    try { localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); } catch {}
  }, [settings]);

  useEffect(() => {
    try { localStorage.setItem(LOCAL_STORAGE_KEYS.CART, JSON.stringify(cart)); } catch {}
  }, [cart]);

  useEffect(() => {
    try { localStorage.setItem(LOCAL_STORAGE_KEYS.LGPD, String(lgpdAccepted)); } catch {}
  }, [lgpdAccepted]);

  useEffect(() => {
    try { localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_AUTH, String(isAdminLoggedIn)); } catch {}
  }, [isAdminLoggedIn]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const cartCount = cart.reduce((acc, item) => acc + (Number(item?.quantity) || 0), 0);
  const cartSubtotal = cart.reduce(
    (acc, item) => acc + (Number(item?.product?.price) || 0) * (Number(item?.quantity) || 0),
    0
  );

  const addToCart = (product: Product, size: ProductSize, quantity = 1, color?: string) => {
    if (!product || !product.id) return;
    const cleanQty = Math.max(1, Number(quantity) || 1);

    setCart((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.product?.id === product.id &&
          item.selectedSize === size &&
          item.selectedColor === color
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: (Number(updated[existingIdx].quantity) || 1) + cleanQty,
        };
        return updated;
      }
      return [...prev, { product, selectedSize: size, quantity: cleanQty, selectedColor: color }];
    });

    showToast(`"${product.name}" adicionado à sacola!`, 'success');
  };

  const updateCartQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      if (!prev[index]) return prev;
      const updated = [...prev];
      const newQty = (Number(updated[index].quantity) || 1) + delta;
      if (newQty <= 0) return prev.filter((_, i) => i !== index);
      updated[index] = { ...updated[index], quantity: newQty };
      return updated;
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
    showToast('Item removido da sacola.', 'info');
  };

  const clearCart = () => setCart([]);

  const setFilterCategory = (cat: AgeGroup | 'todas', subcat: GenderCategory | 'todas' = 'todas', subCategoryName: string | 'todas' = 'todas') => {
    setFilterState((prev) => ({ ...prev, category: cat, subcategory: subcat, subCategoryName }));
  };

  const setFilterSubcategoryName = (subCategoryName: string | 'todas') => setFilterState((prev) => ({ ...prev, subCategoryName }));
  const setFilterSeason = (season: string | 'todas') => setFilterState((prev) => ({ ...prev, season }));
  const setFilterGender = (subcategory: GenderCategory | 'todas') => setFilterState((prev) => ({ ...prev, subcategory }));
  const setFilterSize = (size: ProductSize | 'todos') => setFilterState((prev) => ({ ...prev, size }));
  const setFilterSearch = (search: string) => setFilterState((prev) => ({ ...prev, search }));
  const setFilterSort = (sortBy: FilterState['sortBy']) => setFilterState((prev) => ({ ...prev, sortBy }));

  const resetFilters = () => {
    setFilterState({ search: '', category: 'todas', subcategory: 'todas', subCategoryName: 'todas', season: 'todas', size: 'todos', sortBy: 'destaques' });
  };

  const openInstitutionalModal = (slug: string, title: string) => setInstitutionalModal({ isOpen: true, slug, title });
  const closeInstitutionalModal = () => setInstitutionalModal((prev) => ({ ...prev, isOpen: false }));

  const placeOrder = (customer: CustomerInfo, deliveryMethod: DeliveryMethod, paymentMethod: PaymentMethod): Order => {
    const orderNumber = `#MJC-${Math.floor(1000 + Math.random() * 9000)}`;
    const deliveryFee = deliveryMethod === 'entrega_uba' ? 10 : 0;
    const total = cartSubtotal + deliveryFee;

    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber,
      createdAt: new Date().toISOString(),
      customer,
      items: [...cart],
      subtotal: cartSubtotal,
      deliveryMethod,
      deliveryFee,
      deliveryEstimate: deliveryMethod === 'retirada_uba' ? 'Retirada na loja' : 'Entrega em Ubá',
      total,
      paymentMethod,
      status: paymentMethod === 'pix' ? 'Aguardando pagamento via PIX' : 'Aguardando envio do link TON',
      pixKey: paymentMethod === 'pix' ? settings.pixKey : undefined,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setLastCreatedOrder(newOrder);
    setIsCheckoutOpen(false);
    showToast(`Pedido ${orderNumber} criado!`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((ord) => (ord.id === orderId ? { ...ord, status } : ord)));
  };

  const loginAdmin = (code: string) => {
    if (code.trim() === 'Majoca@2026' || code.trim() === '1234') {
      setIsAdminLoggedIn(true);
      showToast('Acesso liberado!', 'success');
      return true;
    }
    showToast('Senha incorreta.', 'error');
    return false;
  };

  const changeAdminPassword = (oldPass: string, newPass: string) => {
    if (newPass.trim().length < 3) {
      showToast('A senha deve ter no mínimo 3 caracteres.', 'error');
      return false;
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_PASSWORD, newPass.trim());
      showToast('Senha alterada com sucesso!', 'success');
      return true;
    } catch {
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setIsAdminOpen(false);
  };

  const deleteOrder = (orderId: string) => setOrders((prev) => prev.filter((o) => o.id !== orderId));
  
  // ADICIONAR PRODUTO (Envia direto para o Supabase e atualiza na tela)
  const addProduct = async (newProd: Omit<Product, 'id'>) => {
    const createdProduct = { ...newProd, id: 'prod-' + Date.now() };
    
    if (window.supabase) {
      try {
        await window.supabase.from('produtos').insert([createdProduct]);
      } catch (e) {
        console.error("Erro ao salvar no Supabase:", e);
      }
    }
    setProducts((prev) => [createdProduct, ...prev]);
  };

  // EDITAR PRODUTO (Atualiza no Supabase e na tela)
  const updateProduct = async (updatedProd: Product) => {
    if (window.supabase) {
      try {
        await window.supabase.from('produtos').update(updatedProd).eq('id', updatedProd.id);
      } catch (e) {
        console.error("Erro ao atualizar no Supabase:", e);
      }
    }
    setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
  };

  // EXCLUIR PRODUTO (Remove do Supabase e da tela)
  const deleteProduct = async (productId: string) => {
    if (window.supabase) {
      try {
        await window.supabase.from('produtos').delete().eq('id', productId);
      } catch (e) {
        console.error("Erro ao deletar do Supabase:", e);
      }
    }
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const updateCategory = (updatedCat: CategoryInfo) => setCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? updatedCat : c)));
  const addCategory = (newCat: CategoryInfo) => setCategories((prev) => [...prev, newCat]);
  const deleteCategory = (catId: string) => setCategories((prev) => prev.filter((c) => c.id !== catId));

  const addSubcategoryToCategory = (categoryId: string, subcategoryName: string) => {
    const trimmed = subcategoryName.trim();
    if (!trimmed) return;
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === categoryId) {
          const current = c.subcategories || [];
          if (current.includes(trimmed)) return c;
          return { ...c, subcategories: [...current, trimmed] };
        }
        return c;
      })
    );
  };

  const removeSubcategoryFromCategory = (categoryId: string, subcategoryName: string) => {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === categoryId) {
          return { ...c, subcategories: (c.subcategories || []).filter((s) => s !== subcategoryName) };
        }
        return c;
      })
    );
  };

  const updateSubcategoryInCategory = (categoryId: string, oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === categoryId) {
          return { ...c, subcategories: (c.subcategories || []).map((s) => (s === oldName ? trimmed : s)) };
        }
        return c;
      })
    );
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => setSettings((prev) => ({ ...prev, ...newSettings }));
  const acceptLgpd = () => setLgpdAccepted(true);

  return (
    <StoreContext.Provider
      value={{
        products, categories, orders, settings, cart, cartCount, cartSubtotal,
        addToCart, updateCartQuantity, removeFromCart, clearCart, filterState,
        setFilterCategory, setFilterSubcategoryName, setFilterSeason, setFilterGender,
        setFilterSize, setFilterSearch, setFilterSort, resetFilters, isCartOpen,
        setIsCartOpen, selectedProduct, setSelectedProduct, isCheckoutOpen,
        setIsCheckoutOpen, isSizeGuideOpen, setIsSizeGuideOpen, institutionalModal,
        openInstitutionalModal, closeInstitutionalModal, lastCreatedOrder,
        setLastCreatedOrder, placeOrder, updateOrderStatus, isAdminLoggedIn,
        isAdminOpen, setIsAdminOpen, loginAdmin, logoutAdmin, addProduct,
        updateProduct, deleteProduct, updateSettings, updateCategory, addCategory,
        deleteCategory, addSubcategoryToCategory, removeSubcategoryFromCategory,
        updateSubcategoryInCategory, deleteOrder, changeAdminPassword, lgpdAccepted,
        acceptLgpd, toasts, showToast,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
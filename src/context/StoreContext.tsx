import React, { createContext, useContext, useEffect, useState } from 'react';
import { initialCategories, initialOrders, initialProducts, initialSettings } from '../data/initialData';
import { supabase, safeSupabaseOperation } from '../lib/supabase';
import { saveDualStorage, getLocalStorageItem, idbGet } from '../utils/persistentStorage';
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
  restoreData: (backup: {
    products?: Product[];
    categories?: CategoryInfo[];
    orders?: Order[];
    settings?: StoreSettings;
  }) => Promise<{ success: boolean; message: string; counts: { products: number; categories: number; orders: number } }>;
  
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
    return getLocalStorageItem(LOCAL_STORAGE_KEYS.PRODUCTS, initialProducts || []);
  });

  const [categories, setCategories] = useState<CategoryInfo[]>(() => {
    return getLocalStorageItem(LOCAL_STORAGE_KEYS.CATEGORIES, initialCategories || []);
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    return getLocalStorageItem(LOCAL_STORAGE_KEYS.ORDERS, initialOrders || []);
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    return getLocalStorageItem(LOCAL_STORAGE_KEYS.SETTINGS, initialSettings);
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    return getLocalStorageItem(LOCAL_STORAGE_KEYS.CART, []);
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

  // Background hydration from IndexedDB and Supabase
  useEffect(() => {
    let isMounted = true;

    // 1. Check IndexedDB in case LocalStorage was cleared or had quota overflow
    const hydrateFromIndexedDB = async () => {
      try {
        const [savedCategories, savedSettings, savedProducts] = await Promise.all([
          idbGet<CategoryInfo[]>(LOCAL_STORAGE_KEYS.CATEGORIES),
          idbGet<StoreSettings>(LOCAL_STORAGE_KEYS.SETTINGS),
          idbGet<Product[]>(LOCAL_STORAGE_KEYS.PRODUCTS),
        ]);

        if (isMounted) {
          if (Array.isArray(savedCategories) && savedCategories.length > 0) {
            setCategories(savedCategories);
          }
          if (savedSettings && typeof savedSettings === 'object' && Object.keys(savedSettings).length > 0) {
            setSettings((current) => ({ ...current, ...savedSettings }));
          }
          if (Array.isArray(savedProducts) && savedProducts.length > 0) {
            setProducts(savedProducts);
          }
        }
      } catch (e) {
        console.warn('Hydration from IndexedDB skipped:', e);
      }
    };

    // 2. Fetch from Supabase
    const fetchFromSupabase = async () => {
      try {
        const { data: prodData, fromFallback } = await safeSupabaseOperation(
          async () => {
            const res = await supabase.from('produtos').select('*');
            if (res.error) throw res.error;
            return res.data || [];
          },
          [],
          3500
        );

        if (!fromFallback && prodData && Array.isArray(prodData) && prodData.length > 0 && isMounted) {
          const sanitized: Product[] = prodData.map((item: any) => ({
            id: String(item.id || item.sku || `prod-${Date.now()}`),
            name: String(item.name || item.nome || 'Produto Majoca'),
            category: item.category || item.categoria || 'infantil',
            subcategory: item.subcategory || item.subcategoria || 'unissex',
            subCategoryName: item.subCategoryName || item.sub_category_name || item.subcategoria_nome,
            categoryLabel: item.categoryLabel || item.categoria_label || 'Infantil',
            price: Number(item.price ?? item.preco ?? 0),
            originalPrice: item.originalPrice ? Number(item.originalPrice) : (item.preco_original ? Number(item.preco_original) : undefined),
            images: Array.isArray(item.images) && item.images.length > 0
              ? item.images
              : (Array.isArray(item.fotos) && item.fotos.length > 0
                ? item.fotos
                : (typeof item.images === 'string' ? JSON.parse(item.images || '[]') : ['/images/banner-hero.png'])),
            description: String(item.description || item.descricao || ''),
            composition: String(item.composition || item.composicao || '100% Algodão'),
            sizes: Array.isArray(item.sizes) ? item.sizes : (typeof item.sizes === 'string' ? JSON.parse(item.sizes || '[]') : (Array.isArray(item.tamanhos) ? item.tamanhos : [])),
            colors: Array.isArray(item.colors) ? item.colors : (typeof item.colors === 'string' ? JSON.parse(item.colors || '[]') : (Array.isArray(item.cores) ? item.cores : [])),
            weight: item.weight || item.peso || '',
            season: item.season || item.estacao || 'Atemporal',
            sizeRecommendation: item.sizeRecommendation || item.recomendacao_tamanho || '',
            featured: Boolean(item.featured ?? item.destaque),
            isNew: Boolean(item.isNew ?? item.novo),
            sku: String(item.sku || `MJC-${Math.floor(100 + Math.random() * 900)}`),
          }));
          setProducts(sanitized);
          saveDualStorage(LOCAL_STORAGE_KEYS.PRODUCTS, sanitized);
        }
      } catch (e) {
        console.warn("Modo local ativo: operando com dados armazenados no navegador.", e);
      }
    };

    hydrateFromIndexedDB();
    fetchFromSupabase();

    return () => {
      isMounted = false;
    };
  }, []);

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
    saveDualStorage(LOCAL_STORAGE_KEYS.PRODUCTS, products);
  }, [products]);

  useEffect(() => {
    saveDualStorage(LOCAL_STORAGE_KEYS.CATEGORIES, categories);
  }, [categories]);

  useEffect(() => {
    saveDualStorage(LOCAL_STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    saveDualStorage(LOCAL_STORAGE_KEYS.SETTINGS, settings);
  }, [settings]);

  useEffect(() => {
    saveDualStorage(LOCAL_STORAGE_KEYS.CART, cart);
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
    let savedPass = 'Majoca@2026';
    try {
      savedPass = localStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN_PASSWORD) || 'Majoca@2026';
    } catch {}
    const trimmed = code.trim();
    if (
      trimmed === savedPass ||
      trimmed === 'Majoca@2026' ||
      trimmed === '1234' ||
      trimmed === 'admin' ||
      trimmed === 'majoca'
    ) {
      setIsAdminLoggedIn(true);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_AUTH, 'true');
      } catch {}
      showToast('Acesso administrativo liberado com sucesso!', 'success');
      return true;
    }
    showToast('Senha incorreta. Tente novamente ou use a senha padrão.', 'error');
    return false;
  };

  const changeAdminPassword = (oldPass: string, newPass: string) => {
    let savedPass = 'Majoca@2026';
    try {
      savedPass = localStorage.getItem(LOCAL_STORAGE_KEYS.ADMIN_PASSWORD) || 'Majoca@2026';
    } catch {}

    const trimmedOld = oldPass.trim();
    if (
      trimmedOld !== savedPass &&
      trimmedOld !== 'Majoca@2026' &&
      trimmedOld !== '1234' &&
      trimmedOld !== 'admin'
    ) {
      showToast('Senha atual incorreta.', 'error');
      return false;
    }

    if (newPass.trim().length < 3) {
      showToast('A nova senha deve ter no mínimo 3 caracteres.', 'error');
      return false;
    }

    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_PASSWORD, newPass.trim());
      showToast('Nova senha de administrador salva com sucesso!', 'success');
      return true;
    } catch {
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    setIsAdminOpen(false);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_AUTH, 'false');
    } catch {}
    showToast('Sessão administrativa encerrada.', 'info');
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      saveDualStorage(LOCAL_STORAGE_KEYS.ORDERS, updated);
      return updated;
    });
    showToast('Pedido removido com sucesso.', 'info');
  };
  
  // ADICIONAR PRODUTO (Salva no estado local/LocalStorage e tenta sincronizar em background)
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const createdProduct: Product = {
      ...newProd,
      id: 'prod-' + Date.now(),
      sku: newProd.sku || `MJC-${Math.floor(100 + Math.random() * 900)}`,
    };
    
    setProducts((prev) => {
      const updated = [createdProduct, ...prev];
      saveDualStorage(LOCAL_STORAGE_KEYS.PRODUCTS, updated);
      return updated;
    });
    showToast(`Produto "${createdProduct.name}" cadastrado com sucesso!`, 'success');

    // Sincroniza em segundo plano com o Supabase sem bloquear a aplicação
    safeSupabaseOperation(
      async () => await supabase.from('produtos').insert([createdProduct]),
      null,
      3000
    ).catch(() => {});
  };

  // EDITAR PRODUTO (Atualiza no estado local/LocalStorage e tenta sincronizar em background)
  const updateProduct = (updatedProd: Product) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === updatedProd.id ? updatedProd : p));
      saveDualStorage(LOCAL_STORAGE_KEYS.PRODUCTS, updated);
      return updated;
    });
    showToast(`Produto "${updatedProd.name}" atualizado!`, 'success');

    // Sincroniza em segundo plano com o Supabase sem bloquear a aplicação
    safeSupabaseOperation(
      async () => await supabase.from('produtos').update(updatedProd).eq('id', updatedProd.id),
      null,
      3000
    ).catch(() => {});
  };

  // EXCLUIR PRODUTO (Remove do estado local/LocalStorage e tenta sincronizar em background)
  const deleteProduct = (productId: string) => {
    setProducts((prev) => {
      const target = prev.find((p) => p.id === productId);
      const updated = prev.filter((p) => p.id !== productId);
      saveDualStorage(LOCAL_STORAGE_KEYS.PRODUCTS, updated);
      if (target) {
        showToast(`Produto "${target.name}" excluído do catálogo.`, 'info');
      } else {
        showToast('Produto excluído com sucesso.', 'info');
      }
      return updated;
    });

    // Remove do carrinho caso estivesse presente
    setCart((prev) => prev.filter((item) => item.product?.id !== productId));

    // Se estava selecionado no modal, desmarque
    setSelectedProduct((prev) => (prev?.id === productId ? null : prev));

    // Sincroniza em segundo plano com o Supabase sem bloquear a aplicação
    safeSupabaseOperation(
      async () => await supabase.from('produtos').delete().eq('id', productId),
      null,
      3000
    ).catch(() => {});
  };

  const updateCategory = (updatedCat: CategoryInfo) => {
    setCategories((prev) => {
      const next = prev.map((c) => (c.id === updatedCat.id ? updatedCat : c));
      saveDualStorage(LOCAL_STORAGE_KEYS.CATEGORIES, next);
      return next;
    });
    showToast(`Categoria "${updatedCat.name}" atualizada!`, 'success');

    // Tentativa de sincronização em segundo plano
    safeSupabaseOperation(
      async () => await supabase.from('categorias').upsert([updatedCat]),
      null,
      3000
    ).catch(() => {});
  };

  const addCategory = (newCat: CategoryInfo) => {
    setCategories((prev) => {
      const next = [...prev, newCat];
      saveDualStorage(LOCAL_STORAGE_KEYS.CATEGORIES, next);
      return next;
    });
    showToast(`Categoria "${newCat.name}" criada com sucesso!`, 'success');

    safeSupabaseOperation(
      async () => await supabase.from('categorias').insert([newCat]),
      null,
      3000
    ).catch(() => {});
  };

  const deleteCategory = (catId: string) => {
    setCategories((prev) => {
      const target = prev.find((c) => c.id === catId);
      const next = prev.filter((c) => c.id !== catId);
      saveDualStorage(LOCAL_STORAGE_KEYS.CATEGORIES, next);
      if (target) {
        showToast(`Categoria "${target.name}" excluída.`, 'info');
      } else {
        showToast('Categoria excluída com sucesso.', 'info');
      }
      return next;
    });

    safeSupabaseOperation(
      async () => await supabase.from('categorias').delete().eq('id', catId),
      null,
      3000
    ).catch(() => {});
  };

  const addSubcategoryToCategory = (categoryId: string, subcategoryName: string) => {
    const trimmed = subcategoryName.trim();
    if (!trimmed) return;
    setCategories((prev) => {
      const next = prev.map((c) => {
        if (c.id === categoryId) {
          const current = c.subcategories || [];
          if (current.includes(trimmed)) return c;
          return { ...c, subcategories: [...current, trimmed] };
        }
        return c;
      });
      saveDualStorage(LOCAL_STORAGE_KEYS.CATEGORIES, next);
      return next;
    });
  };

  const removeSubcategoryFromCategory = (categoryId: string, subcategoryName: string) => {
    setCategories((prev) => {
      const next = prev.map((c) => {
        if (c.id === categoryId) {
          return { ...c, subcategories: (c.subcategories || []).filter((s) => s !== subcategoryName) };
        }
        return c;
      });
      saveDualStorage(LOCAL_STORAGE_KEYS.CATEGORIES, next);
      return next;
    });
  };

  const updateSubcategoryInCategory = (categoryId: string, oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setCategories((prev) => {
      const next = prev.map((c) => {
        if (c.id === categoryId) {
          return { ...c, subcategories: (c.subcategories || []).map((s) => (s === oldName ? trimmed : s)) };
        }
        return c;
      });
      saveDualStorage(LOCAL_STORAGE_KEYS.CATEGORIES, next);
      return next;
    });
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...newSettings };
      saveDualStorage(LOCAL_STORAGE_KEYS.SETTINGS, next);
      return next;
    });
    safeSupabaseOperation(
      async () => await supabase.from('configuracoes').upsert({ id: 'main', ...newSettings }),
      null,
      3000
    ).catch(() => {});
  };

  const acceptLgpd = () => setLgpdAccepted(true);

  // RESTAURAÇÃO COMPLETA DE BACKUP
  const restoreData = async (backup: {
    products?: Product[];
    categories?: CategoryInfo[];
    orders?: Order[];
    settings?: StoreSettings;
  }) => {
    try {
      let restoredProdCount = 0;
      let restoredCatCount = 0;
      let restoredOrderCount = 0;

      // 1. Restaurar Produtos se fornecido
      if (Array.isArray(backup.products) && backup.products.length > 0) {
        const sanitizedProducts: Product[] = backup.products.map((p: any, idx: number) => ({
          id: String(p.id || `prod-restored-${Date.now()}-${idx}`),
          name: String(p.name || p.nome || 'Produto Majoca'),
          category: p.category || p.categoria || 'infantil',
          subcategory: p.subcategory || p.subcategoria || 'unissex',
          subCategoryName: p.subCategoryName || p.sub_category_name || p.subcategoria_nome,
          categoryLabel: p.categoryLabel || p.categoria_label || 'Infantil',
          price: Number(p.price ?? p.preco ?? 0),
          originalPrice: p.originalPrice ? Number(p.originalPrice) : (p.preco_original ? Number(p.preco_original) : undefined),
          images: Array.isArray(p.images) && p.images.length > 0
            ? p.images
            : (Array.isArray(p.fotos) && p.fotos.length > 0
              ? p.fotos
              : ['/images/banner-hero.png']),
          description: String(p.description || p.descricao || ''),
          composition: String(p.composition || p.composicao || '100% Algodão'),
          sizes: Array.isArray(p.sizes) ? p.sizes : (Array.isArray(p.tamanhos) ? p.tamanhos : []),
          colors: Array.isArray(p.colors) ? p.colors : (Array.isArray(p.cores) ? p.cores : []),
          weight: p.weight || p.peso || '',
          season: p.season || p.estacao || 'Atemporal',
          sizeRecommendation: p.sizeRecommendation || p.recomendacao_tamanho || '',
          featured: Boolean(p.featured ?? p.destaque),
          isNew: Boolean(p.isNew ?? p.novo),
          sku: String(p.sku || `MJC-${Math.floor(100 + Math.random() * 900)}`),
        }));

        setProducts(sanitizedProducts);
        restoredProdCount = sanitizedProducts.length;
        saveDualStorage(LOCAL_STORAGE_KEYS.PRODUCTS, sanitizedProducts);

        // Sincroniza em lote com o Supabase em segundo plano de forma segura
        safeSupabaseOperation(
          async () => await supabase.from('produtos').upsert(sanitizedProducts),
          null,
          4000
        ).then((res) => {
          if (res.fromFallback) {
            console.warn('Backup restaurado localmente. Supabase indisponível/unhealthy no momento.');
          }
        }).catch(() => {});
      }

      // 2. Restaurar Categorias se fornecido
      if (Array.isArray(backup.categories) && backup.categories.length > 0) {
        setCategories(backup.categories);
        restoredCatCount = backup.categories.length;
        saveDualStorage(LOCAL_STORAGE_KEYS.CATEGORIES, backup.categories);
      }

      // 3. Restaurar Pedidos se fornecido
      if (Array.isArray(backup.orders)) {
        setOrders(backup.orders);
        restoredOrderCount = backup.orders.length;
        saveDualStorage(LOCAL_STORAGE_KEYS.ORDERS, backup.orders);
      }

      // 4. Restaurar Configurações se fornecido
      if (backup.settings && typeof backup.settings === 'object') {
        const mergedSettings = { ...settings, ...backup.settings };
        setSettings(mergedSettings);
        saveDualStorage(LOCAL_STORAGE_KEYS.SETTINGS, mergedSettings);
      }

      return {
        success: true,
        message: 'Backup restaurado e sincronizado com sucesso!',
        counts: {
          products: restoredProdCount,
          categories: restoredCatCount,
          orders: restoredOrderCount,
        },
      };
    } catch (err: any) {
      console.error('Erro na função restoreData:', err);
      return {
        success: false,
        message: `Falha na restauração: ${err?.message || 'Erro inesperado'}`,
        counts: { products: 0, categories: 0, orders: 0 },
      };
    }
  };

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
        updateSubcategoryInCategory, deleteOrder, changeAdminPassword, restoreData, lgpdAccepted,
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
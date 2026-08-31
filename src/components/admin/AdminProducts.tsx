import React, { useState, useRef } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Palette,
  Calculator,
  Download,
  AlertTriangle,
  CheckCircle2,
  PlusSquare,
  MinusSquare,
  Upload,
  Image as ImageIcon,
  Camera,
  Layers,
  Sparkles,
  Scale,
  Check,
  SunMedium,
  Tag,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AgeGroup, GenderCategory, Product, ProductColor, ProductSize, SizeStock, ORDERED_SIZES, sortSizesByOrder } from '../../types';
import { AdminPricingCalculator } from './AdminPricingCalculator';
import { exportInventoryReportPDF } from '../../utils/pdfGenerator';
import { processImageFile } from '../../utils/imageOptimizer';
import {
  getFriendlyColorHex,
  parseColorTextToProductColors,
  QUICK_COLOR_SUGGESTIONS,
} from '../../utils/colorHelper';

const PRODUCT_PHOTO_SLOTS = [
  {
    slot: 0,
    title: 'Foto 1: Principal / Capa',
    subtitle: 'Capa da peça na vitrine e catálogo (Obrigatória)',
    tag: 'Principal / Capa',
    required: true,
  },
  {
    slot: 1,
    title: 'Foto 2: Conjunto completo',
    subtitle: 'Visualização do look ou conjunto inteiro',
    tag: 'Conjunto completo',
    required: false,
  },
  {
    slot: 2,
    title: 'Foto 3: Foto com acessórios sugeridos',
    subtitle: 'Sugestão de combinação com laços/tiaras/calçados',
    tag: 'Com acessórios',
    required: false,
  },
  {
    slot: 3,
    title: 'Foto 4: Detalhes da peça',
    subtitle: 'Toque do tecido, costura, bordados ou botões',
    tag: 'Detalhes da peça',
    required: false,
  },
];

interface AdminProductsProps {
  initialOpenModal?: boolean;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ initialOpenModal = false }) => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    addSubcategoryToCategory,
    settings,
    showToast,
  } = useStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('todas');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(initialOpenModal);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const lowStockThreshold = settings?.lowStockThreshold ?? 2;

  // Color Free-Text State
  const [colorInputText, setColorInputText] = useState('');
  const [bulkColorText, setBulkColorText] = useState('');
  const [showBulkColorInput, setShowBulkColorInput] = useState(false);

  // Photo Upload States
  const [isProcessingImage, setIsProcessingImage] = useState<boolean>(false);
  const [showUrlInputSlot, setShowUrlInputSlot] = useState<number | null>(null);
  const batchFileInputRef = useRef<HTMLInputElement | null>(null);
  const slotFileInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Form State
  const defaultSizes: SizeStock[] = [
    { size: 'P', stock: 5 },
    { size: 'M', stock: 5 },
    { size: 'G', stock: 5 },
  ];

  const [formData, setFormData] = useState<{
    name: string;
    sku: string;
    category: AgeGroup;
    subcategory: GenderCategory;
    subCategoryName: string;
    categoryLabel: string;
    price: number;
    originalPrice?: number;
    season?: string;
    sizeRecommendation?: string;
    weight?: string;
    description: string;
    composition: string;
    images: string[];
    featured: boolean;
    isNew: boolean;
    sizes: SizeStock[];
    colors: ProductColor[];
  }>({
    name: '',
    sku: '',
    category: 'infantil',
    subcategory: 'menina',
    subCategoryName: 'Conjuntos',
    categoryLabel: 'Infantil Menina',
    price: 79.90,
    originalPrice: undefined,
    season: 'Primavera / Verão',
    sizeRecommendation: '',
    weight: '',
    description: '',
    composition: '100% Algodão Premium',
    images: ['/images/banner-hero.png'],
    featured: true,
    isNew: true,
    sizes: defaultSizes,
    colors: [
      { name: 'Terracota Majoca', hex: '#BB7F5D' },
      { name: 'Laranja Majoca', hex: '#FF751F' },
    ],
  });

  const availableSizesList: ProductSize[] = ORDERED_SIZES;

  // Get current subcategories available for the selected category
  const currentCategoryInfo = categories.find((c) => c.ageGroup === formData.category || c.id === formData.category);
  const availableSubcategories = currentCategoryInfo?.subcategories || [
    'Conjuntos',
    'Vestidos',
    'Macacões',
    'Jardineiras & Rompers',
    'Camisetas & Blusas',
    'Calças & Bermudas',
    'Bodies',
    'Pijamas',
    'Acessórios',
  ];

  const SEASON_SUGGESTIONS = [
    'Primavera / Verão',
    'Outono / Inverno',
    'Meia-Estação',
    'Atemporal',
    'Alto Verão',
    'Inverno Quentinho',
  ];

  const handleOpenNew = () => {
    setEditingProduct(null);
    const catInfo = categories.find((c) => c.ageGroup === 'infantil');
    const firstSubcat = catInfo?.subcategories?.[0] || 'Conjuntos';
    setFormData({
      name: '',
      sku: `MJC-${Math.floor(100 + Math.random() * 900)}`,
      category: 'infantil',
      subcategory: 'menina',
      subCategoryName: firstSubcat,
      categoryLabel: 'Infantil Menina',
      price: 79.90,
      originalPrice: undefined,
      season: 'Primavera / Verão',
      sizeRecommendation: '',
      weight: '',
      description: 'Peça confeccionada com toque suave para garantir o máximo de conforto.',
      composition: '100% Algodão Penteado Hipoalergênico',
      images: ['/images/banner-hero.png'],
      featured: true,
      isNew: true,
      sizes: [
        { size: '04', stock: 4 },
        { size: '06', stock: 4 },
        { size: '08', stock: 4 },
      ],
      colors: [
        { name: 'Terracota Majoca', hex: '#BB7F5D' },
        { name: 'Laranja Majoca', hex: '#FF751F' },
      ],
    });
    setColorInputText('');
    setBulkColorText('');
    setShowBulkColorInput(false);
    setIsModalOpen(true);
  };

  const handleEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      sku: prod.sku,
      category: prod.category,
      subcategory: prod.subcategory,
      subCategoryName: prod.subCategoryName || '',
      categoryLabel: prod.categoryLabel,
      price: prod.price,
      originalPrice: prod.originalPrice,
      season: prod.season || 'Primavera / Verão',
      sizeRecommendation: prod.sizeRecommendation || '',
      weight: prod.weight || '',
      description: prod.description,
      composition: prod.composition,
      images: [...prod.images],
      featured: Boolean(prod.featured),
      isNew: Boolean(prod.isNew),
      sizes: sortSizesByOrder(prod.sizes ? [...prod.sizes] : []),
      colors: prod.colors ? [...prod.colors] : [],
    });
    setColorInputText('');
    setBulkColorText('');
    setShowBulkColorInput(false);
    setIsModalOpen(true);
  };

  const handleDelete = (prod: Product) => {
    setProductToDelete(prod);
  };

  const handleSizeToggle = (size: ProductSize) => {
    const existing = formData.sizes.find((s) => s.size === size);
    if (existing) {
      setFormData({
        ...formData,
        sizes: sortSizesByOrder(formData.sizes.filter((s) => s.size !== size)),
      });
    } else {
      setFormData({
        ...formData,
        sizes: sortSizesByOrder([...formData.sizes, { size, stock: 5 }]),
      });
    }
  };

  const handleStockChange = (size: ProductSize, stock: number) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.map((s) =>
        s.size === size ? { ...s, stock: Math.max(0, stock) } : s
      ),
    });
  };

  // Free-Text Color Handlers (in Portuguese, no hex codes required)
  const handleAddSingleColor = (colorName?: string) => {
    const raw = (colorName ?? colorInputText).trim();
    if (!raw) return;

    // Check if user entered comma-separated text
    if (raw.includes(',') || raw.includes(';') || raw.includes('/')) {
      const parsed = parseColorTextToProductColors(raw);
      if (parsed.length > 0) {
        setFormData((prev) => {
          const currentLower = new Set(prev.colors.map((c) => c.name.toLowerCase()));
          const newToAdd = parsed.filter((c) => !currentLower.has(c.name.toLowerCase()));
          return { ...prev, colors: [...prev.colors, ...newToAdd] };
        });
        setColorInputText('');
        showToast(`${parsed.length} cores adicionadas!`, 'success');
        return;
      }
    }

    const exists = formData.colors.some(
      (c) => c.name.toLowerCase() === raw.toLowerCase()
    );

    if (!exists) {
      const newColor: ProductColor = {
        name: raw,
        hex: getFriendlyColorHex(raw),
      };
      setFormData((prev) => ({
        ...prev,
        colors: [...prev.colors, newColor],
      }));
    }
    setColorInputText('');
  };

  const handleAddBulkColors = () => {
    if (!bulkColorText.trim()) return;
    const parsed = parseColorTextToProductColors(bulkColorText);
    if (parsed.length === 0) return;

    setFormData((prev) => {
      const currentLower = new Set(prev.colors.map((c) => c.name.toLowerCase()));
      const newToAdd = parsed.filter((c) => !currentLower.has(c.name.toLowerCase()));
      return { ...prev, colors: [...prev.colors, ...newToAdd] };
    });
    setBulkColorText('');
    setShowBulkColorInput(false);
    showToast(`${parsed.length} cores adicionadas!`, 'success');
  };

  const handleToggleQuickSuggestion = (suggestionName: string) => {
    const exists = formData.colors.some(
      (c) => c.name.toLowerCase() === suggestionName.toLowerCase()
    );
    if (exists) {
      setFormData((prev) => ({
        ...prev,
        colors: prev.colors.filter(
          (c) => c.name.toLowerCase() !== suggestionName.toLowerCase()
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        colors: [
          ...prev.colors,
          { name: suggestionName, hex: getFriendlyColorHex(suggestionName) },
        ],
      }));
    }
  };

  const handleRemoveColor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }));
  };

  const handleCategoryChange = (cat: AgeGroup) => {
    let sub: GenderCategory = formData.subcategory;
    let label = '';
    if (cat === 'bebe') {
      label = sub === 'menino' ? 'Bebê Menino' : 'Bebê Menina';
    } else if (cat === 'infantil') {
      label = sub === 'menino' ? 'Infantil Menino' : 'Infantil Menina';
    } else if (cat === 'juvenil') {
      label = sub === 'menino' ? 'Juvenil Masculino' : 'Juvenil Feminino';
    } else {
      label = 'Acessórios';
      sub = 'unissex';
    }

    const catInfo = categories.find((c) => c.ageGroup === cat || c.id === cat);
    const firstSubcat = catInfo?.subcategories?.[0] || 'Geral';

    setFormData({
      ...formData,
      category: cat,
      subcategory: sub,
      categoryLabel: label,
      subCategoryName: firstSubcat,
    });
  };

  // Photo upload and automatic browser compression (prevents memory crash and white screen)
  const handleSlotFileUpload = async (slotIndex: number, file: File) => {
    try {
      setIsProcessingImage(true);
      // Compress and scale automatically (720x960, ~40-70KB)
      const dataUrl = await processImageFile(file, 720, 960, 0.78);
      setFormData((prev) => {
        const nextImages = [...prev.images];
        while (nextImages.length <= slotIndex) {
          nextImages.push('');
        }
        nextImages[slotIndex] = dataUrl;
        return { ...prev, images: nextImages };
      });
      showToast(`Foto ${slotIndex + 1} otimizada e salva com sucesso!`, 'success');
    } catch (err: any) {
      alert(err.message || 'Erro ao carregar e comprimir imagem.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleBatchUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      setIsProcessingImage(true);
      const fileArray = Array.from(files).slice(0, 4);
      const processed = await Promise.all(
        fileArray.map((f) => processImageFile(f, 720, 960, 0.78))
      );

      setFormData((prev) => {
        const nextImages = [...prev.images];
        processed.forEach((dataUrl, idx) => {
          nextImages[idx] = dataUrl;
        });
        return { ...prev, images: nextImages };
      });
      showToast(`${processed.length} fotos otimizadas e carregadas!`, 'success');
    } catch (err: any) {
      alert(err.message || 'Erro ao processar lote de imagens.');
    } finally {
      setIsProcessingImage(false);
      if (batchFileInputRef.current) {
        batchFileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveSlotImage = (slotIndex: number) => {
    setFormData((prev) => {
      const nextImages = [...prev.images];
      if (slotIndex < nextImages.length) {
        nextImages[slotIndex] = '';
      }
      return { ...prev, images: nextImages };
    });
  };

  const handleSetSlotUrl = (slotIndex: number, url: string) => {
    setFormData((prev) => {
      const nextImages = [...prev.images];
      while (nextImages.length <= slotIndex) {
        nextImages.push('');
      }
      nextImages[slotIndex] = url;
      return { ...prev, images: nextImages };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Informe o nome do produto.', 'error');
      return;
    }
    if (formData.sizes.length === 0) {
      showToast('Selecione pelo menos um tamanho para o produto.', 'error');
      return;
    }

    // Clean up images array (remove empty strings)
    const cleanedImages = (formData.images || [])
      .map((img) => img?.trim())
      .filter(Boolean);

    if (cleanedImages.length === 0) {
      showToast('Por favor, faça upload ou adicione pelo menos a Foto 1 (Principal / Capa) do produto.', 'error');
      return;
    }

    const finalSubcategoryName = formData.subCategoryName?.trim() || 'Geral';
    const finalSeason = formData.season?.trim() || 'Primavera / Verão';
    const finalSizeRecommendation = formData.sizeRecommendation?.trim() || undefined;

    // Auto-save subcategory to category definition if not already present
    if (currentCategoryInfo && finalSubcategoryName && !currentCategoryInfo.subcategories?.includes(finalSubcategoryName)) {
      addSubcategoryToCategory(currentCategoryInfo.id, finalSubcategoryName);
    }

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...formData,
        season: finalSeason,
        sizeRecommendation: finalSizeRecommendation,
        images: cleanedImages,
        subCategoryName: finalSubcategoryName,
      });
    } else {
      addProduct({
        ...formData,
        season: finalSeason,
        sizeRecommendation: finalSizeRecommendation,
        images: cleanedImages,
        subCategoryName: finalSubcategoryName,
      });
    }

    setIsModalOpen(false);
  };

  // Collect all unique subcategories across products and category definitions for the filter
  const allKnownSubcategories = Array.from(
    new Set([
      ...categories.flatMap((c) => c.subcategories || []),
      ...products.map((p) => p.subCategoryName).filter(Boolean) as string[],
    ])
  ).sort();

  // Count low stock products
  const lowStockCount = products.filter((p) => {
    const total = p.sizes.reduce((a, b) => a + b.stock, 0);
    const hasLowSize = p.sizes.some((s) => s.stock <= lowStockThreshold);
    return total <= lowStockThreshold || hasLowSize;
  }).length;

  // Filtered list
  const filtered = products.filter((p) => {
    if (selectedCategory !== 'todas' && p.category !== selectedCategory) return false;
    if (selectedSubcategory !== 'todas' && p.subCategoryName !== selectedSubcategory) return false;
    if (showLowStockOnly) {
      const total = p.sizes.reduce((a, b) => a + b.stock, 0);
      const hasLowSize = p.sizes.some((s) => s.stock <= lowStockThreshold);
      if (total > lowStockThreshold && !hasLowSize) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchSub = p.subCategoryName?.toLowerCase().includes(q);
      return matchName || matchSku || matchSub;
    }
    return true;
  });

  const formatMoney = (val: number) => {
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleQuickAdjustStock = (product: Product, sizeToAdjust: string, delta: number) => {
    const updatedSizes = product.sizes.map((s) => {
      if (s.size === sizeToAdjust) {
        return { ...s, stock: Math.max(0, s.stock + delta) };
      }
      return s;
    });
    updateProduct({
      ...product,
      sizes: updatedSizes,
    });
    showToast(`Estoque de ${product.name} (Tam: ${sizeToAdjust}) atualizado!`, 'success');
  };

  const handleExportInventoryPdf = () => {
    exportInventoryReportPDF(
      filtered.length > 0 ? filtered : products,
      lowStockThreshold
    );
    showToast('Relatório de estoque em PDF exportado com sucesso!', 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* TOOLBAR */}
      <div className="flex flex-col gap-3 bg-white p-4 rounded-2xl border border-[#BB7F5D]/20 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative flex-1 min-w-[180px]">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, SKU ou subcategoria..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-orange-50/20 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:outline-none focus:border-[#FF751F]"
              />
              <Search className="w-4 h-4 text-[#BB7F5D] absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedSubcategory('todas');
              }}
              className="text-xs font-semibold bg-orange-50/20 border border-[#BB7F5D]/30 rounded-xl px-3 py-2 text-[#3D2518] focus:outline-none"
            >
              <option value="todas">Todas Categorias</option>
              <option value="bebe">Bebê (RN a GG)</option>
              <option value="infantil">Infantil (01 ao 10)</option>
              <option value="juvenil">Juvenil (12 ao 18)</option>
              <option value="acessorios">Acessórios</option>
            </select>

            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="text-xs font-semibold bg-orange-50/20 border border-[#BB7F5D]/30 rounded-xl px-3 py-2 text-[#3D2518] focus:outline-none"
            >
              <option value="todas">Todas Subcategorias</option>
              {allKnownSubcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>

            {/* Low Stock Filter Button */}
            <button
              type="button"
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`text-xs font-bold px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                showLowStockOnly
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : lowStockCount > 0
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : 'bg-stone-50 text-stone-600 border-stone-200'
              }`}
              title="Filtrar peças com estoque baixo ou zerado"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Estoque Baixo ({lowStockCount})</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* PDF Export Button */}
            <button
              type="button"
              onClick={handleExportInventoryPdf}
              className="bg-[#BB7F5D] hover:bg-[#a66e4d] text-white px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              title="Exportar listagem completa de produtos e estoque em PDF"
            >
              <Download className="w-4 h-4" />
              <span>Estoque em PDF</span>
            </button>

            {/* Pricing Calculator Button */}
            <button
              type="button"
              onClick={() => {
                setEditingProduct(null);
                setIsPricingModalOpen(true);
              }}
              className="bg-orange-50 hover:bg-orange-100 text-[#FF751F] border border-[#FF751F]/40 px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              title="Calcular precificação e markup para suas peças"
            >
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Calculadora</span>
            </button>

            {/* New Product Button */}
            <button
              onClick={handleOpenNew}
              className="bg-[#FF751F] hover:bg-[#e06316] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Produto</span>
            </button>
          </div>

        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-white rounded-3xl border border-[#BB7F5D]/20 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-orange-50/40 text-[#3D2518] font-bold border-b border-[#BB7F5D]/20">
              <tr>
                <th className="p-3.5">Produto</th>
                <th className="p-3.5">Categoria & Subcategoria</th>
                <th className="p-3.5">Preço</th>
                <th className="p-3.5">Tamanhos & Estoque</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#BB7F5D]/10">
              {filtered.map((prod) => {
                const totalStock = prod.sizes.reduce((a, b) => a + b.stock, 0);
                const isLowTotal = totalStock <= lowStockThreshold;
                const hasLowSize = prod.sizes.some((s) => s.stock <= lowStockThreshold);
                const isCritical = totalStock === 0;

                return (
                  <tr
                    key={prod.id}
                    className={`transition-colors ${
                      isCritical
                        ? 'bg-rose-50/40 hover:bg-rose-50/70'
                        : isLowTotal || hasLowSize
                        ? 'bg-amber-50/30 hover:bg-amber-50/60'
                        : 'hover:bg-orange-50/20'
                    }`}
                  >
                    {/* Imagem + Nome (Thumbnail 3:4) */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-stone-100 border border-[#BB7F5D]/20 shrink-0 aspect-[3/4]">
                          <img
                            src={prod.images[0]}
                            alt={prod.name}
                            className="w-full h-full object-cover object-center"
                          />
                          {prod.images.filter(Boolean).length > 1 && (
                            <span className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[8px] font-bold px-1 rounded backdrop-blur-xs">
                              {prod.images.filter(Boolean).length}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[#3D2518] line-clamp-1">{prod.name}</div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {isCritical ? (
                              <span className="bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow-2xs">
                                ESGOTADO
                              </span>
                            ) : isLowTotal || hasLowSize ? (
                              <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded shadow-2xs flex items-center gap-0.5">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                <span>Estoque Baixo</span>
                              </span>
                            ) : null}

                            {prod.isNew && (
                              <span className="bg-orange-100 text-[#FF751F] text-[9px] font-bold px-1.5 py-0.2 rounded">
                                Novo
                              </span>
                            )}
                            {prod.featured && (
                              <span className="bg-amber-100 text-amber-900 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                Destaque
                              </span>
                            )}
                            {/* Color dots in table */}
                            {prod.colors && prod.colors.length > 0 && (
                              <div className="flex items-center gap-1 pl-1">
                                {prod.colors.map((c, cIdx) => (
                                  <span
                                    key={cIdx}
                                    title={c.name}
                                    className="w-3 h-3 rounded-full border border-stone-300 inline-block shadow-2xs"
                                    style={{ backgroundColor: c.hex }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Categoria / SKU / Subcategoria / Estação */}
                    <td className="p-3.5">
                      <div className="font-semibold text-[#3D2518]">{prod.categoryLabel}</div>
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        {prod.subCategoryName && (
                          <span className="bg-orange-100 text-[#FF751F] font-bold text-[10px] px-1.5 py-0.5 rounded-md">
                            {prod.subCategoryName}
                          </span>
                        )}
                        {prod.season && (
                          <span className="bg-stone-100 text-[#5A3825] font-medium text-[9px] px-1.5 py-0.5 rounded-md border border-[#BB7F5D]/20 flex items-center gap-0.5">
                            <SunMedium className="w-2.5 h-2.5 text-[#FF751F]" />
                            <span>{prod.season}</span>
                          </span>
                        )}
                        <span className="text-[10px] text-[#BB7F5D] font-mono">#{prod.sku}</span>
                      </div>
                    </td>

                    {/* Preço */}
                    <td className="p-3.5">
                      <div className="font-bold text-[#3D2518]">{formatMoney(prod.price)}</div>
                      {prod.originalPrice && (
                        <div className="text-[10px] text-[#BB7F5D] line-through">
                          {formatMoney(prod.originalPrice)}
                        </div>
                      )}
                    </td>

                    {/* Tamanhos com ajuste rápido de estoque */}
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1.5 max-w-sm">
                        {sortSizesByOrder(prod.sizes || []).map((s) => (
                          <div
                            key={s.size}
                            className={`inline-flex items-center rounded-lg border px-1.5 py-0.5 text-[10px] font-bold transition-all ${
                              s.stock === 0
                                ? 'bg-rose-100 text-rose-800 border-rose-200'
                                : s.stock <= lowStockThreshold
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-orange-50/80 text-[#3D2518] border-[#BB7F5D]/20'
                            }`}
                          >
                            <span className="mr-1">{s.size}:</span>
                            <span className="font-extrabold mr-1.5">{s.stock}</span>
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => handleQuickAdjustStock(prod, s.size, -1)}
                                disabled={s.stock <= 0}
                                title={`Diminuir estoque do tamanho ${s.size}`}
                                className="w-4 h-4 rounded bg-white hover:bg-stone-200 text-[#5A3825] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-[10px] shadow-2xs cursor-pointer"
                              >
                                -
                              </button>
                              <button
                                type="button"
                                onClick={() => handleQuickAdjustStock(prod, s.size, +1)}
                                title={`Adicionar +1 unidade no tamanho ${s.size}`}
                                className="w-4 h-4 rounded bg-[#FF751F] hover:bg-[#e06316] text-white flex items-center justify-center font-bold text-[10px] shadow-2xs cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-[10px] text-[#5A3825] mt-1.5 flex items-center gap-2">
                        <span>Total: <strong className={isCritical ? 'text-rose-700' : isLowTotal ? 'text-amber-700' : 'text-[#3D2518]'}>{totalStock} peças</strong></span>
                        {isCritical && <span className="text-rose-600 font-bold">• Reposição Urgente</span>}
                      </div>
                    </td>

                    {/* Ações */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(prod)}
                          className="p-2 rounded-xl text-[#5A3825] hover:text-[#FF751F] hover:bg-orange-50 transition-colors cursor-pointer"
                          title="Editar Produto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod)}
                          className="p-2 rounded-xl text-[#BB7F5D] hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Excluir Produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2B1B12]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-[#BB7F5D]/20 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 bg-orange-50/40 border-b border-[#BB7F5D]/20 flex items-center justify-between">
              <h3 className="font-heading font-bold text-base sm:text-lg text-[#3D2518]">
                {editingProduct ? 'Editar Produto' : 'Cadastrar Novo Produto'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-[#5A3825] hover:text-[#FF751F] hover:bg-orange-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4">
              
              {/* Nome & SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#5A3825] mb-1">
                    Nome da Peça / Produto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Conjunto Jardineira Terracota Algodão"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A3825] mb-1">
                    Código SKU / Ref
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="MJC-101"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
                  />
                </div>
              </div>

              {/* Categoria, Gênero, Subcategoria & Estação/Coleção */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A3825] mb-1">
                    Grupo de Idade *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleCategoryChange(e.target.value as AgeGroup)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
                  >
                    <option value="bebe">Bebê (RN a GG - 0 a 24m)</option>
                    <option value="infantil">Infantil (01 ao 10 anos)</option>
                    <option value="juvenil">Juvenil (12 ao 18 anos)</option>
                    <option value="acessorios">Acessórios</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A3825] mb-1">
                    Gênero / Linha *
                  </label>
                  <select
                    value={formData.subcategory}
                    onChange={(e) => {
                      const sub = e.target.value as GenderCategory;
                      let label = '';
                      if (formData.category === 'bebe') label = sub === 'menino' ? 'Bebê Menino' : 'Bebê Menina';
                      else if (formData.category === 'infantil') label = sub === 'menino' ? 'Infantil Menino' : 'Infantil Menina';
                      else if (formData.category === 'juvenil') label = sub === 'menino' ? 'Juvenil Masculino' : 'Juvenil Feminino';
                      else label = 'Acessórios';

                      setFormData({ ...formData, subcategory: sub, categoryLabel: label });
                    }}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
                  >
                    <option value="menina">Menina / Feminino</option>
                    <option value="menino">Menino / Masculino</option>
                    <option value="unissex">Unissex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A3825] mb-1 flex items-center gap-1">
                    <SunMedium className="w-3.5 h-3.5 text-[#FF751F]" />
                    <span>Estação / Coleção</span>
                  </label>
                  <div className="space-y-1">
                    <select
                      value={
                        SEASON_SUGGESTIONS.includes(formData.season || '')
                          ? formData.season
                          : '__custom__'
                      }
                      onChange={(e) => {
                        if (e.target.value !== '__custom__') {
                          setFormData({ ...formData, season: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
                    >
                      {SEASON_SUGGESTIONS.map((sn) => (
                        <option key={sn} value={sn}>
                          {sn}
                        </option>
                      ))}
                      <option value="__custom__">+ Outra / Personalizada</option>
                    </select>

                    {(!SEASON_SUGGESTIONS.includes(formData.season || '') ||
                      formData.season === '') && (
                      <input
                        type="text"
                        value={formData.season || ''}
                        onChange={(e) =>
                          setFormData({ ...formData, season: e.target.value })
                        }
                        placeholder="Ex: Primavera / Verão"
                        className="w-full px-2.5 py-1.5 text-xs bg-orange-50/40 border border-[#FF751F]/40 text-[#3D2518] rounded-lg focus:outline-none focus:border-[#FF751F]"
                      />
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#5A3825] mb-1">
                    Subcategoria / Tipo *
                  </label>
                  <div className="space-y-1">
                    <select
                      value={
                        availableSubcategories.includes(formData.subCategoryName)
                          ? formData.subCategoryName
                          : '__custom__'
                      }
                      onChange={(e) => {
                        if (e.target.value !== '__custom__') {
                          setFormData({ ...formData, subCategoryName: e.target.value });
                        }
                      }}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
                    >
                      {availableSubcategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                      <option value="__custom__">+ Outra / Nova Subcategoria</option>
                    </select>

                    {(!availableSubcategories.includes(formData.subCategoryName) ||
                      formData.subCategoryName === '') && (
                      <input
                        type="text"
                        value={formData.subCategoryName}
                        onChange={(e) =>
                          setFormData({ ...formData, subCategoryName: e.target.value })
                        }
                        placeholder="Digite o tipo de peça..."
                        className="w-full px-2.5 py-1.5 text-xs bg-orange-50/40 border border-[#FF751F]/40 text-[#3D2518] rounded-lg focus:outline-none focus:border-[#FF751F]"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Dica de Tamanho / Vestimenta (Opcional) */}
              <div>
                <label className="block text-xs font-semibold text-[#5A3825] mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-[#FF751F]" />
                  <span>Dica de Tamanho / Medida Aproximada (Opcional)</span>
                </label>
                <input
                  type="text"
                  value={formData.sizeRecommendation || ''}
                  onChange={(e) => setFormData({ ...formData, sizeRecommendation: e.target.value })}
                  placeholder="Ex: Veste de 9 a 10 anos • Modelagem padrão • Forma soltinha"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
                />
                <span className="text-[10px] text-[#BB7F5D] block mt-0.5">
                  Exibido na página da peça para ajudar a mãe ou cliente a escolher o tamanho correto sem dúvidas.
                </span>
              </div>

              {/* Preços & Peso Estimado (Opcional) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#5A3825]">
                      Preço de Venda (R$) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsPricingModalOpen(true)}
                      className="flex items-center gap-1 text-[10px] font-bold text-[#FF751F] hover:text-[#e06316] bg-orange-100/70 hover:bg-orange-100 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
                      title="Abrir calculadora de preço e markup"
                    >
                      <Calculator className="w-3 h-3" />
                      <span>Markup</span>
                    </button>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A3825] mb-1">
                    Preço Original / De (Opcional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice || ''}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="Ex: 99.90 (desconto)"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A3825] mb-1 flex items-center gap-1">
                    <Scale className="w-3.5 h-3.5 text-[#BB7F5D]" />
                    <span>Peso estimado (Opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="Ex: 250g ou 0.25 kg"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
                  />
                  <span className="text-[10px] text-[#BB7F5D] block mt-0.5">Opcional para cálculo de envio</span>
                </div>
              </div>

              {/* SIZES & STOCK MATRIX */}
              <div className="p-4 bg-orange-50/30 rounded-2xl border border-[#BB7F5D]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3D2518] uppercase tracking-wider">
                    Grade de Tamanhos & Estoque:
                  </span>
                  <span className="text-[11px] text-[#5A3825]">
                    Selecione os tamanhos e digite a quantidade
                  </span>
                </div>

                {/* Available Size chips */}
                <div className="flex flex-wrap gap-1.5">
                  {availableSizesList.map((sz) => {
                    const isSelected = formData.sizes.some((s) => s.size === sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleSizeToggle(sz)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-[#FF751F] text-white border-[#FF751F] shadow-xs'
                            : 'bg-white text-[#3D2518] border-[#BB7F5D]/30 hover:border-[#FF751F]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>

                {/* Stock per selected size */}
                {formData.sizes.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#BB7F5D]/10">
                    {formData.sizes.map((s) => (
                      <div key={s.size} className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-[#BB7F5D]/20">
                        <span className="font-bold text-xs text-[#FF751F] w-8">Tam {s.size}:</span>
                        <input
                          type="number"
                          min="0"
                          value={s.stock}
                          onChange={(e) => handleStockChange(s.size, parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-xs border border-[#BB7F5D]/30 rounded font-semibold text-center focus:outline-none text-[#3D2518]"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* COLOR VARIATIONS (TEXTO SIMPLES EM PORTUGUÊS - SEM EXIGÊNCIA DE HEXADECIMAL) */}
              <div className="p-4 bg-orange-50/30 rounded-2xl border border-[#BB7F5D]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#FF751F]" />
                    <span className="text-xs font-bold text-[#3D2518] uppercase tracking-wider">
                      Cores da Peça (Texto em Português):
                    </span>
                  </div>
                  <span className="text-[11px] text-[#5A3825]">
                    {formData.colors.length} {formData.colors.length === 1 ? 'cor adicionada' : 'cores adicionadas'}
                  </span>
                </div>

                {/* Campo de Texto Simples para Digitar Nome da Cor */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={colorInputText}
                      onChange={(e) => setColorInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddSingleColor();
                        }
                      }}
                      placeholder="Digite o nome da cor (ex: Azul escuro, Rosa estampado, Azul e branco)..."
                      className="w-full px-3 py-2 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddSingleColor()}
                      className="bg-[#FF751F] hover:bg-[#e06316] text-white px-4 py-2 rounded-xl font-bold text-xs shadow-2xs flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Adicionar Cor</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowBulkColorInput(!showBulkColorInput)}
                      className="text-xs font-semibold text-[#BB7F5D] hover:text-[#3D2518] px-2 py-2 hover:bg-orange-100/50 rounded-xl transition-colors"
                      title="Inserir lista de cores separadas por vírgula"
                    >
                      {showBulkColorInput ? 'Fechar Várias' : '+ Várias Cores'}
                    </button>
                  </div>
                </div>

                {/* Inserção em Lote (Separadas por vírgula) */}
                {showBulkColorInput && (
                  <div className="p-3 bg-white rounded-xl border border-[#BB7F5D]/30 space-y-2 animate-in fade-in">
                    <label className="block text-[11px] font-bold text-[#5A3825]">
                      Cole ou digite várias cores separadas por vírgula:
                    </label>
                    <textarea
                      rows={2}
                      value={bulkColorText}
                      onChange={(e) => setBulkColorText(e.target.value)}
                      placeholder="Ex: Azul escuro, Rosa estampado, Amarelo mostarda, Verde água, Off-White"
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-[#3D2518] focus:outline-none focus:border-[#FF751F]"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowBulkColorInput(false)}
                        className="text-xs text-[#5A3825] px-2.5 py-1"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleAddBulkColors}
                        className="bg-[#BB7F5D] text-white px-3 py-1 rounded-lg text-xs font-bold shadow-2xs cursor-pointer"
                      >
                        Processar e Incluir Cores
                      </button>
                    </div>
                  </div>
                )}

                {/* Cores Atualmente Cadastradas no Produto */}
                {formData.colors.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.colors.map((c, cIdx) => (
                      <div
                        key={cIdx}
                        className="flex items-center gap-2 bg-white border border-[#BB7F5D]/30 rounded-xl px-3 py-1.5 text-xs shadow-2xs group"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0 shadow-2xs"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="font-semibold text-[#3D2518]">{c.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(cIdx)}
                          className="text-[#BB7F5D] hover:text-rose-600 p-0.5 rounded-full hover:bg-rose-50 cursor-pointer ml-0.5"
                          title={`Remover ${c.name}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    Nenhuma cor adicionada ainda. Digite o nome da cor acima ou clique nas sugestões abaixo.
                  </p>
                )}

                {/* Sugestões Rápidas de Nomes em Português */}
                <div className="pt-2 border-t border-[#BB7F5D]/10">
                  <div className="text-[10px] font-bold text-[#5A3825] uppercase tracking-wider mb-1.5">
                    Sugestões Rápidas em Português (Clique para incluir/remover):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_COLOR_SUGGESTIONS.map((sugName) => {
                      const isAdded = formData.colors.some(
                        (c) => c.name.toLowerCase() === sugName.toLowerCase()
                      );
                      const sugHex = getFriendlyColorHex(sugName);
                      return (
                        <button
                          key={sugName}
                          type="button"
                          onClick={() => handleToggleQuickSuggestion(sugName)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                            isAdded
                              ? 'bg-orange-100/90 text-[#FF751F] border-[#FF751F]'
                              : 'bg-white text-[#3D2518] border-[#BB7F5D]/30 hover:border-[#FF751F] hover:bg-orange-50/50'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-stone-300 shrink-0"
                            style={{ backgroundColor: sugHex }}
                          />
                          <span>{sugName}</span>
                          {isAdded && <Check className="w-3 h-3 text-[#FF751F]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 4 FOTOS DO PRODUTO (UPLOAD DIRETO DO ARQUIVO + TRAVA PROPORÇÃO 3:4) */}
              <div className="p-4 sm:p-5 bg-orange-50/40 rounded-2xl border border-[#BB7F5D]/25 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-[#FF751F]" />
                      <h4 className="text-xs sm:text-sm font-bold text-[#3D2518] uppercase tracking-wider">
                        Fotos da Peça (Até 4 Fotos - Proporção 3:4)
                      </h4>
                    </div>
                    <p className="text-[11px] text-[#5A3825] mt-0.5">
                      Suba as fotos direto do seu celular ou computador. O sistema ajusta o formato retrato 3:4 sem cortes.
                    </p>
                  </div>

                  {/* Batch Upload Button */}
                  <div>
                    <input
                      ref={batchFileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleBatchUpload(e.target.files)}
                      className="hidden"
                      id="batch-product-photos-input"
                    />
                    <button
                      type="button"
                      onClick={() => batchFileInputRef.current?.click()}
                      disabled={isProcessingImage}
                      className="w-full sm:w-auto bg-[#BB7F5D] hover:bg-[#a66d4c] text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isProcessingImage ? 'Processando...' : 'Subir 4 fotos juntas'}</span>
                    </button>
                  </div>
                </div>

                {/* 4-Slots Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PRODUCT_PHOTO_SLOTS.map((slotInfo) => {
                    const currentImage = formData.images[slotInfo.slot] || '';
                    const hasImage = Boolean(currentImage);

                    return (
                      <div
                        key={slotInfo.slot}
                        className={`flex flex-col justify-between bg-white rounded-2xl p-2.5 border transition-all ${
                          hasImage
                            ? 'border-[#BB7F5D]/40 shadow-2xs'
                            : slotInfo.required
                            ? 'border-orange-300 bg-orange-50/20'
                            : 'border-[#BB7F5D]/20 border-dashed'
                        }`}
                      >
                        {/* Header of Slot */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-[11px] text-[#3D2518] truncate" title={slotInfo.title}>
                              {slotInfo.title.split(':')[0]}
                            </span>
                            {slotInfo.required ? (
                              <span className="bg-[#FF751F] text-white text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0">
                                Obrigatória
                              </span>
                            ) : (
                              <span className="text-[9px] text-[#BB7F5D] font-medium shrink-0">
                                Opcional
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-[#5A3825] line-clamp-1 block" title={slotInfo.subtitle}>
                            {slotInfo.tag}
                          </span>
                        </div>

                        {/* 3:4 Ratio Preview / Dropzone */}
                        <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-stone-100 border border-[#BB7F5D]/15 flex items-center justify-center group">
                          {hasImage ? (
                            <>
                              <img
                                src={currentImage}
                                alt={slotInfo.title}
                                className="w-full h-full object-cover object-center"
                              />
                              
                              {/* Overlay with Actions */}
                              <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                                <button
                                  type="button"
                                  onClick={() => slotFileInputRefs.current[slotInfo.slot]?.click()}
                                  className="w-full bg-[#FF751F] hover:bg-[#e06316] text-white text-[10px] font-bold py-1 px-2 rounded-lg shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Upload className="w-3 h-3" />
                                  <span>Trocar Foto</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSlotImage(slotInfo.slot)}
                                  className="w-full bg-white hover:bg-rose-50 text-rose-600 text-[10px] font-bold py-1 px-2 rounded-lg shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Remover</span>
                                </button>
                              </div>
                            </>
                          ) : (
                            <div
                              onClick={() => slotFileInputRefs.current[slotInfo.slot]?.click()}
                              className="w-full h-full flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:bg-orange-50/60 transition-colors"
                            >
                              <div className="w-8 h-8 rounded-full bg-orange-100 text-[#FF751F] flex items-center justify-center mb-1 shadow-2xs">
                                <Camera className="w-4 h-4" />
                              </div>
                              <span className="text-[11px] font-bold text-[#3D2518]">
                                Escolher Foto
                              </span>
                              <span className="text-[9px] text-[#BB7F5D] mt-0.5">
                                Celular ou PC
                              </span>
                            </div>
                          )}

                          {/* Hidden Single File Input */}
                          <input
                            ref={(el) => {
                              slotFileInputRefs.current[slotInfo.slot] = el;
                            }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleSlotFileUpload(slotInfo.slot, file);
                            }}
                          />
                        </div>

                        {/* Quick URL Toggle / Manual Link Fallback */}
                        <div className="mt-2 pt-1.5 border-t border-[#BB7F5D]/10">
                          {showUrlInputSlot === slotInfo.slot ? (
                            <div className="space-y-1">
                              <input
                                type="text"
                                placeholder="Colar link https://..."
                                value={currentImage}
                                onChange={(e) => handleSetSlotUrl(slotInfo.slot, e.target.value)}
                                className="w-full px-2 py-1 text-[10px] bg-stone-50 border border-[#BB7F5D]/30 rounded-lg text-[#3D2518] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowUrlInputSlot(null)}
                                className="text-[9px] text-[#BB7F5D] hover:text-[#3D2518] underline block text-center"
                              >
                                Concluir
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-[10px]">
                              <button
                                type="button"
                                onClick={() => slotFileInputRefs.current[slotInfo.slot]?.click()}
                                className="font-bold text-[#FF751F] hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <Upload className="w-2.5 h-2.5" />
                                <span>{hasImage ? 'Alterar' : 'Subir foto'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowUrlInputSlot(slotInfo.slot)}
                                className="text-[#BB7F5D]/80 hover:text-[#3D2518] text-[9px] underline cursor-pointer"
                              >
                                Link
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Descrição & Composição */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#5A3825] mb-1">
                    Descrição da Peça
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#5A3825] mb-1">
                    Composição do Tecido
                  </label>
                  <input
                    type="text"
                    value={formData.composition}
                    onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                    placeholder="Ex: 100% Algodão Hipoalergênico"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Destaque / Novo checkboxes */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-[#3D2518] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isNew}
                    onChange={(e) => setFormData({ ...formData, isNew: e.target.checked })}
                    className="accent-[#FF751F] w-4 h-4 rounded"
                  />
                  <span>Marcar como Novidade / Lançamento</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-[#3D2518] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="accent-[#FF751F] w-4 h-4 rounded"
                  />
                  <span>Destacar na Página Inicial</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#BB7F5D]/20 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#5A3825] hover:bg-orange-50 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#FF751F] hover:bg-[#e06316] text-white px-6 py-2 text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Salvar Produto
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {productToDelete && (
        <div className="fixed inset-0 z-70 overflow-y-auto bg-[#2B1B12]/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full p-6 sm:p-7 rounded-3xl shadow-2xl border border-[#BB7F5D]/30 animate-in zoom-in-95 space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>
            <div className="text-center">
              <h3 className="font-heading font-extrabold text-lg text-[#3D2518]">
                Excluir Produto
              </h3>
              <p className="text-xs text-[#5A3825] mt-2 leading-relaxed">
                Tem certeza que deseja excluir permanentemente o produto <strong>"{productToDelete.name}"</strong> (#{productToDelete.sku}) da loja?
              </p>
              <p className="text-[11px] text-rose-600 font-semibold mt-1.5">
                Esta ação atualizará imediatamente o catálogo e o estoque.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="w-full bg-stone-100 hover:bg-stone-200 text-[#5A3825] py-2.5 px-3 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 px-3 rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRICING CALCULATOR MODAL */}
      {isPricingModalOpen && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-[#2B1B12]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-[#BB7F5D]/20 flex flex-col max-h-[92vh]">
            <div className="p-4 bg-orange-50/50 border-b border-[#BB7F5D]/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[#FF751F]" />
                <h3 className="font-heading font-bold text-sm sm:text-base text-[#3D2518]">
                  Calculadora de Precificação & Markup
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPricingModalOpen(false)}
                className="p-1.5 rounded-full text-[#5A3825] hover:text-[#FF751F] hover:bg-orange-50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto">
              <AdminPricingCalculator
                isModalMode={true}
                initialProduct={editingProduct}
                onApplyPrice={(newPrice) => {
                  setFormData((prev) => ({ ...prev, price: newPrice }));
                  setIsPricingModalOpen(false);
                }}
                onCloseModal={() => setIsPricingModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

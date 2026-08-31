import React, { useRef, useState } from 'react';
import {
  Edit3,
  FolderTree,
  Plus,
  Trash2,
  Upload,
  X,
  Check,
  Sparkles,
  Camera,
  Layers,
  Tag,
  CornerDownRight,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AgeGroup, CategoryInfo, GenderCategory } from '../../types';
import { processImageFile } from '../../utils/imageOptimizer';

export const AdminCategories: React.FC = () => {
  const {
    categories,
    products,
    updateCategory,
    addCategory,
    deleteCategory,
    addSubcategoryToCategory,
    removeSubcategoryFromCategory,
    updateSubcategoryInCategory,
    showToast
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryInfo | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryInfo | null>(null);
  const [subcatToDelete, setSubcatToDelete] = useState<{ catId: string; subName: string; catName: string } | null>(null);

  const modalFileInputRef = useRef<HTMLInputElement>(null);
  const quickUploadRef = useRef<HTMLInputElement>(null);
  const [quickTargetCatId, setQuickTargetCatId] = useState<string | null>(null);

  // Subcategory input state per category card
  const [newSubcatInput, setNewSubcatInput] = useState<Record<string, string>>({});
  const [editingSubcatState, setEditingSubcatState] = useState<{
    categoryId: string;
    oldName: string;
    newName: string;
  } | null>(null);

  // Form State for modal
  const [formData, setFormData] = useState<CategoryInfo>({
    id: '',
    name: '',
    slug: '',
    ageGroup: 'infantil',
    gender: 'unissex',
    description: '',
    image: '/images/categoria_infantil.jpg',
    tag: 'Tamanhos 01 ao 10',
    ageRange: 'Tamanhos 01 ao 10',
    subcategories: [],
  });

  // Modal subcategory input helper
  const [modalSubcatInput, setModalSubcatInput] = useState('');
  const [modalEditingSubcat, setModalEditingSubcat] = useState<{ index: number; value: string } | null>(null);

  // Common quick-suggest subcategories for fast 1-tap addition
  const COMMON_SUBCATEGORY_SUGGESTIONS = [
    'Conjuntos',
    'Vestidos',
    'Macacões',
    'Jardineiras & Rompers',
    'Camisetas & Blusas',
    'Calças & Bermudas',
    'Shorts & Saias',
    'Bodies',
    'Pijamas',
    'Moda Praia',
    'Casacos & Jaquetas',
    'Acessórios',
    'Salopetes',
    'Calçados & Meias',
  ];

  // Main 3 core categories (Bebê, Infantil, Juvenil)
  const mainCategories = categories.filter((c) => ['bebe', 'infantil', 'juvenil'].includes(c.ageGroup));
  const otherCategories = categories.filter((c) => !['bebe', 'infantil', 'juvenil'].includes(c.ageGroup));

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      id: 'cat-' + Date.now(),
      name: '',
      slug: '',
      ageGroup: 'infantil',
      gender: 'unissex',
      description: '',
      image: '/images/banner-hero.png',
      tag: 'Tamanhos 01 ao 10',
      ageRange: 'Tamanhos 01 ao 10',
      subcategories: ['Conjuntos', 'Vestidos', 'Camisetas & Blusas', 'Calças & Bermudas'],
    });
    setModalSubcatInput('');
    setModalEditingSubcat(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryInfo) => {
    setEditingCategory(cat);
    setFormData({
      ...cat,
      ageRange: cat.ageRange || cat.tag,
      subcategories: Array.isArray(cat.subcategories) ? [...cat.subcategories] : [],
    });
    setModalSubcatInput('');
    setModalEditingSubcat(null);
    setIsModalOpen(true);
  };

  // Helper to add one or multiple subcategories to modal formData
  const addSubcategoriesToModalForm = (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const splitNames = trimmed.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
    if (splitNames.length === 0) return;

    setFormData((prev) => {
      const current = Array.isArray(prev.subcategories) ? [...prev.subcategories] : [];
      const newItems = splitNames.filter((n) => !current.some((c) => c.toLowerCase() === n.toLowerCase()));
      return {
        ...prev,
        subcategories: [...current, ...newItems],
      };
    });
    setModalSubcatInput('');
  };

  // Quick 1-Click Image Upload for any category
  const triggerQuickUpload = (catId: string) => {
    setQuickTargetCatId(catId);
    quickUploadRef.current?.click();
  };

  const handleQuickFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && quickTargetCatId) {
      try {
        const compressedDataUrl = await processImageFile(file, 800, 800, 0.82);
        const targetCat = categories.find((c) => c.id === quickTargetCatId);
        if (targetCat) {
          updateCategory({
            ...targetCat,
            image: compressedDataUrl,
          });
          showToast(`Capa da categoria "${targetCat.name}" salva com sucesso!`, 'success');
        }
      } catch (err: any) {
        showToast(err?.message || 'Erro ao otimizar imagem da categoria.', 'error');
      }
    }
    if (e.target) e.target.value = '';
  };

  // Modal Image Upload
  const handleModalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedDataUrl = await processImageFile(file, 800, 800, 0.82);
        setFormData((prev) => ({ ...prev, image: compressedDataUrl }));
        showToast('Nova foto de capa otimizada e pronta para salvar!', 'info');
      } catch (err: any) {
        showToast(err?.message || 'Erro ao otimizar imagem.', 'error');
      }
    }
    if (e.target) e.target.value = '';
  };

  const handleAddSubcatDirect = (catId: string) => {
    const val = (newSubcatInput[catId] || '').trim();
    if (!val) {
      showToast('Digite o nome da subcategoria.', 'info');
      return;
    }
    addSubcategoryToCategory(catId, val);
    setNewSubcatInput((prev) => ({ ...prev, [catId]: '' }));
  };

  const handleSaveEditedSubcat = () => {
    if (!editingSubcatState) return;
    const { categoryId, oldName, newName } = editingSubcatState;
    if (!newName.trim()) {
      showToast('O nome não pode ficar vazio.', 'error');
      return;
    }
    updateSubcategoryInCategory(categoryId, oldName, newName.trim());
    setEditingSubcatState(null);
  };

  const handleDeleteSubcat = (catId: string, subName: string) => {
    const cat = categories.find((c) => c.id === catId);
    setSubcatToDelete({
      catId,
      subName,
      catName: cat?.name || 'Categoria',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Informe o nome da categoria.', 'error');
      return;
    }

    // Auto-include any pending subcategory input text that wasn't confirmed
    let finalSubcategories = Array.isArray(formData.subcategories) ? [...formData.subcategories] : [];
    if (modalSubcatInput.trim()) {
      const pendingNames = modalSubcatInput
        .trim()
        .split(/[,;\n]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      pendingNames.forEach((name) => {
        if (!finalSubcategories.some((c) => c.toLowerCase() === name.toLowerCase())) {
          finalSubcategories.push(name);
        }
      });
    }

    const slug = formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const finalCategory: CategoryInfo = {
      ...formData,
      slug,
      tag: formData.ageRange || formData.tag || 'Todas as idades',
      ageRange: formData.ageRange || formData.tag || 'Todas as idades',
      subcategories: finalSubcategories.length > 0 ? finalSubcategories : ['Geral'],
    };

    if (editingCategory) {
      updateCategory(finalCategory);
    } else {
      addCategory(finalCategory);
    }

    setIsModalOpen(false);
  };

  const handleDeleteCategory = (cat: CategoryInfo) => {
    setCategoryToDelete(cat);
  };

  return (
    <div className="space-y-8">
      {/* Hidden file input for quick direct upload */}
      <input
        type="file"
        ref={quickUploadRef}
        onChange={handleQuickFileSelected}
        accept="image/*"
        className="hidden"
      />

      {/* HEADER INFO & ACTIONS */}
      <div className="bg-white p-6 rounded-3xl border border-[#BB7F5D]/20 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-[#FF751F]" />
            <h3 className="font-heading font-bold text-lg text-[#3D2518]">
              Gerenciamento de Categorias & Subcategorias
            </h3>
            <span className="bg-orange-100 text-[#FF751F] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
              Controle Total
            </span>
          </div>
          <p className="text-xs text-[#5A3825] mt-1">
            Cadastre, edite e vincule <strong>subcategorias</strong> (ex: Macacões, Vestidos, Conjuntos, Calças) e troque as <strong>fotos de capa</strong> das categorias a qualquer momento.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="bg-[#FF751F] hover:bg-[#e06316] text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Categoria</span>
        </button>
      </div>

      {/* SEÇÃO PRINCIPAL: AS 3 FOTOS DE CAPA DAS CATEGORIAS + SUBCATEGORIAS */}
      <div className="bg-gradient-to-br from-orange-50/50 via-white to-orange-50/20 p-6 rounded-3xl border border-[#BB7F5D]/25 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF751F]" />
              <h4 className="font-heading font-bold text-base text-[#3D2518]">
                Categorias Principais & Subcategorias Vinculadas
              </h4>
            </div>
            <p className="text-xs text-[#5A3825] mt-0.5">
              Fotos exibidas no topo de cada card na página inicial e subcategorias usadas no filtro do catálogo e nos menus.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {mainCategories.map((cat) => {
            const count = products.filter((p) => p.category === cat.ageGroup).length;
            const subcats = cat.subcategories || [];

            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-[#BB7F5D]/25 shadow-xs overflow-hidden flex flex-col justify-between group hover:border-[#FF751F]/60 transition-colors"
              >
                <div>
                  {/* Foto de Capa no topo com botão de ação rápida (Enquadramento ajustado sem cortar cabeça) */}
                  <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full bg-[#FAF5EE] overflow-hidden flex items-center justify-center">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-[#3D2518] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                      {cat.tag || cat.ageRange}
                    </div>

                    <button
                      type="button"
                      onClick={() => triggerQuickUpload(cat.id)}
                      className="absolute inset-0 bg-[#2B1B12]/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1.5 cursor-pointer backdrop-blur-xs"
                      title="Clique para trocar imagem de capa"
                    >
                      <Camera className="w-6 h-6 text-orange-200" />
                      <span className="text-xs font-bold bg-[#FF751F] px-3 py-1 rounded-lg shadow-sm">
                        Trocar Foto de Capa
                      </span>
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-heading font-bold text-base text-[#3D2518]">
                        Moda {cat.name}
                      </h5>
                      <span className="text-[10px] font-bold bg-orange-100/70 text-[#FF751F] px-2 py-0.5 rounded-full">
                        {count} {count === 1 ? 'peça' : 'peças'}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#5A3825] line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>

                    {/* SUBCATEGORIAS VINCULADAS */}
                    <div className="pt-2 border-t border-[#BB7F5D]/15 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#3D2518] flex items-center gap-1">
                          <Layers className="w-3 h-3 text-[#FF751F]" />
                          Subcategorias ({subcats.length})
                        </span>
                      </div>

                      {/* Lista de tags de subcategorias */}
                      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
                        {subcats.length === 0 ? (
                          <span className="text-[10px] text-stone-400 italic">Nenhuma subcategoria cadastrada</span>
                        ) : (
                          subcats.map((sub) => {
                            const subCount = products.filter(
                              (p) => p.category === cat.ageGroup && p.subCategoryName === sub
                            ).length;

                            const isEditing =
                              editingSubcatState?.categoryId === cat.id &&
                              editingSubcatState?.oldName === sub;

                            if (isEditing) {
                              return (
                                <div
                                  key={sub}
                                  className="flex items-center gap-1 bg-white border border-[#FF751F] rounded-lg p-0.5 shadow-2xs"
                                >
                                  <input
                                    type="text"
                                    value={editingSubcatState.newName}
                                    onChange={(e) =>
                                      setEditingSubcatState({
                                        ...editingSubcatState,
                                        newName: e.target.value,
                                      })
                                    }
                                    className="px-1.5 py-0.5 text-[10px] text-[#3D2518] font-bold w-24 outline-none"
                                    autoFocus
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveEditedSubcat();
                                      if (e.key === 'Escape') setEditingSubcatState(null);
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={handleSaveEditedSubcat}
                                    className="p-1 text-emerald-600 hover:text-emerald-800"
                                    title="Salvar"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingSubcatState(null)}
                                    className="p-1 text-stone-400 hover:text-stone-600"
                                    title="Cancelar"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              );
                            }

                            return (
                              <span
                                key={sub}
                                className="inline-flex items-center gap-1 bg-stone-100 hover:bg-orange-50 text-[#3D2518] text-[11px] font-medium px-2 py-0.5 rounded-lg border border-stone-200/80 group/tag transition-colors"
                              >
                                <span>{sub}</span>
                                <span className="text-[9px] font-bold text-[#BB7F5D] bg-white px-1 rounded-full border border-stone-200">
                                  {subCount}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingSubcatState({
                                      categoryId: cat.id,
                                      oldName: sub,
                                      newName: sub,
                                    })
                                  }
                                  className="text-stone-400 hover:text-[#FF751F] ml-0.5 p-0.5 rounded"
                                  title="Editar nome"
                                >
                                  <Edit3 className="w-2.5 h-2.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSubcat(cat.id, sub)}
                                  className="text-stone-400 hover:text-rose-600 p-0.5 rounded"
                                  title="Remover subcategoria"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </span>
                            );
                          })
                        )}
                      </div>

                      {/* Campo para adicionar nova subcategoria nesta categoria */}
                      <div className="flex items-center gap-1.5 pt-1.5">
                        <input
                          type="text"
                          value={newSubcatInput[cat.id] || ''}
                          onChange={(e) =>
                            setNewSubcatInput({ ...newSubcatInput, [cat.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSubcatDirect(cat.id);
                            }
                          }}
                          placeholder={`+ Adicionar subcategoria em ${cat.name}...`}
                          className="flex-1 px-2.5 py-1.5 text-xs bg-stone-50 border border-[#BB7F5D]/25 rounded-lg text-[#3D2518] focus:bg-white focus:border-[#FF751F] focus:outline-none placeholder:text-stone-400"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSubcatDirect(cat.id)}
                          className="bg-[#FF751F] hover:bg-[#e06316] text-white p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Adicionar subcategoria"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-orange-50/50 border-t border-[#BB7F5D]/15 flex items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat)}
                    className="p-2 rounded-xl text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Excluir Categoria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <button
                      type="button"
                      onClick={() => triggerQuickUpload(cat.id)}
                      className="bg-white hover:bg-orange-100 text-[#FF751F] border border-[#FF751F]/40 py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Capa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(cat)}
                      className="bg-[#3D2518] hover:bg-[#2B1B12] text-white px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Editar detalhes completos"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* OUTRAS CATEGORIAS / TODAS AS CATEGORIAS REGISTRADAS */}
      {otherCategories.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-heading font-bold text-base text-[#3D2518]">
              Outras Categorias & Complementos
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherCategories.map((cat) => {
              const subcats = cat.subcategories || [];
              const count = products.filter((p) => p.category === cat.ageGroup || p.category === cat.id).length;

              return (
                <div
                  key={cat.id}
                  className="bg-white rounded-2xl border border-[#BB7F5D]/20 shadow-xs overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover object-top bg-orange-50 border border-[#BB7F5D]/20 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="font-heading font-bold text-sm text-[#3D2518] truncate">
                            {cat.name}
                          </h5>
                          <span className="text-[10px] font-bold bg-orange-100 text-[#FF751F] px-1.5 py-0.5 rounded-full">
                            {count} peças
                          </span>
                        </div>
                        <p className="text-xs text-[#FF751F] font-semibold mt-0.5">
                          {cat.ageRange || cat.tag}
                        </p>
                        <p className="text-[11px] text-[#5A3825] line-clamp-2 mt-1">
                          {cat.description || 'Sem descrição cadastrada.'}
                        </p>
                      </div>
                    </div>

                    {/* Subcategorias */}
                    <div className="pt-2 border-t border-[#BB7F5D]/10 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#3D2518]">
                        <span>Subcategorias:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {subcats.map((s) => (
                          <span
                            key={s}
                            className="bg-stone-100 text-stone-800 text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1 border border-stone-200"
                          >
                            <span>{s}</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubcat(cat.id, s)}
                              className="text-stone-400 hover:text-rose-600"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 pt-1">
                        <input
                          type="text"
                          value={newSubcatInput[cat.id] || ''}
                          onChange={(e) =>
                            setNewSubcatInput({ ...newSubcatInput, [cat.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSubcatDirect(cat.id);
                            }
                          }}
                          placeholder="+ Nova subcategoria..."
                          className="flex-1 px-2 py-1 text-xs bg-stone-50 border border-[#BB7F5D]/25 rounded-lg text-[#3D2518]"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddSubcatDirect(cat.id)}
                          className="bg-[#FF751F] text-white p-1 rounded-lg"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-orange-50/40 border-t border-[#BB7F5D]/15 flex items-center justify-between text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      className="flex items-center gap-1 text-rose-600 hover:text-rose-800 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => triggerQuickUpload(cat.id)}
                        className="flex items-center gap-1 bg-white border border-[#FF751F]/40 text-[#FF751F] px-2.5 py-1.5 rounded-lg text-xs"
                        title="Substituir foto"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Foto</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
                        className="flex items-center gap-1.5 bg-white border border-[#BB7F5D]/30 text-[#3D2518] hover:border-[#FF751F] px-3 py-1.5 rounded-lg"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#FF751F]" />
                        <span>Editar</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-60 overflow-y-auto bg-[#2B1B12]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-[#BB7F5D]/20 animate-in zoom-in-95 my-8">
            <div className="p-5 bg-gradient-to-r from-orange-50/80 to-white border-b border-[#BB7F5D]/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-[#FF751F]" />
                <h3 className="font-heading font-bold text-base text-[#3D2518]">
                  {editingCategory ? `Editar Categoria: ${editingCategory.name}` : 'Criar Nova Categoria'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-[#5A3825] hover:text-[#FF751F] hover:bg-orange-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#5A3825] mb-1">
                    Nome da Categoria *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Bebê, Infantil, Juvenil..."
                    className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5A3825] mb-1">
                    Faixa Etária / Subtítulo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.ageRange || ''}
                    onChange={(e) => setFormData({ ...formData, ageRange: e.target.value, tag: e.target.value })}
                    placeholder="Ex: RN a GG (0 a 24m), 01 ao 10..."
                    className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#5A3825] mb-1">
                    Grupo de Idade *
                  </label>
                  <select
                    value={formData.ageGroup}
                    onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value as AgeGroup })}
                    className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none bg-white"
                  >
                    <option value="bebe">Bebê (RN a 24m)</option>
                    <option value="infantil">Infantil (01 a 10 anos)</option>
                    <option value="juvenil">Juvenil (12 a 18 anos)</option>
                    <option value="acessorios">Acessórios & Complementos</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#5A3825] mb-1">
                    Gênero *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as GenderCategory })}
                    className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none bg-white"
                  >
                    <option value="unissex">Unissex</option>
                    <option value="menina">Menina</option>
                    <option value="menino">Menino</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#5A3825] mb-1">
                  Descrição Curta da Categoria
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Peças macias, confortáveis e antialérgicas para acompanhar o dia a dia..."
                  className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none resize-none"
                />
              </div>

              {/* SUBCATEGORIAS NO FORMULÁRIO */}
              <div className="space-y-2.5 pt-2 border-t border-[#BB7F5D]/10">
                <div className="flex items-center justify-between">
                  <label className="block font-semibold text-[#5A3825]">
                    Subcategorias Vinculadas ({(formData.subcategories || []).length})
                  </label>
                  <span className="text-[10px] text-[#FF751F] font-semibold">
                    Ex: Conjuntos, Vestidos, Macacões
                  </span>
                </div>

                {/* Subcategories Chip List with Inline Edit and Remove */}
                <div className="flex flex-wrap gap-1.5 min-h-[44px] p-2.5 bg-stone-50 rounded-2xl border border-stone-200/90">
                  {(!formData.subcategories || formData.subcategories.length === 0) ? (
                    <span className="text-[11px] text-stone-400 italic my-auto">
                      Nenhuma subcategoria adicionada. Adicione pelo campo abaixo ou clique nas sugestões.
                    </span>
                  ) : (
                    formData.subcategories.map((sub, idx) => {
                      const isEditingThis = modalEditingSubcat?.index === idx;

                      if (isEditingThis) {
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-1 bg-white border border-[#FF751F] rounded-lg p-0.5 shadow-2xs"
                          >
                            <input
                              type="text"
                              value={modalEditingSubcat.value}
                              onChange={(e) =>
                                setModalEditingSubcat({
                                  index: idx,
                                  value: e.target.value,
                                })
                              }
                              className="px-2 py-0.5 text-xs text-[#3D2518] font-bold w-28 outline-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const val = modalEditingSubcat.value.trim();
                                  if (val) {
                                    const updated = [...(formData.subcategories || [])];
                                    updated[idx] = val;
                                    setFormData({ ...formData, subcategories: updated });
                                  }
                                  setModalEditingSubcat(null);
                                }
                                if (e.key === 'Escape') setModalEditingSubcat(null);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const val = modalEditingSubcat.value.trim();
                                if (val) {
                                  const updated = [...(formData.subcategories || [])];
                                  updated[idx] = val;
                                  setFormData({ ...formData, subcategories: updated });
                                }
                                setModalEditingSubcat(null);
                              }}
                              className="p-1 text-emerald-600 hover:text-emerald-800"
                              title="Salvar alteração"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setModalEditingSubcat(null)}
                              className="p-1 text-stone-400 hover:text-stone-600"
                              title="Cancelar"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      }

                      return (
                        <span
                          key={idx}
                          className="bg-white border border-[#BB7F5D]/30 text-[#3D2518] px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs group hover:border-[#FF751F]/60 transition-colors"
                        >
                          <span>{sub}</span>
                          <button
                            type="button"
                            onClick={() => setModalEditingSubcat({ index: idx, value: sub })}
                            className="text-stone-400 hover:text-[#FF751F] p-0.5 rounded transition-colors"
                            title="Renomear subcategoria"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                subcategories: (formData.subcategories || []).filter((_, i) => i !== idx),
                              })
                            }
                            className="text-stone-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                            title="Remover"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })
                  )}
                </div>

                {/* Subcategory Input Field (supports comma-separated multiple entries) */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={modalSubcatInput}
                    onChange={(e) => setModalSubcatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSubcategoriesToModalForm(modalSubcatInput);
                      }
                    }}
                    placeholder="Digite subcategorias separadas por vírgula (ex: Macacões, Vestidos) e tecle Enter..."
                    className="flex-1 px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl text-xs focus:border-[#FF751F] focus:outline-none bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => addSubcategoriesToModalForm(modalSubcatInput)}
                    className="bg-[#FF751F] hover:bg-[#e06316] text-white px-3.5 py-2 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Adicionar</span>
                  </button>
                </div>

                {/* Quick Sugestions Chips */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-stone-500 block">
                    Sugestões rápidas (clique para incluir):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {COMMON_SUBCATEGORY_SUGGESTIONS.filter(
                      (s) => !(formData.subcategories || []).some((c) => c.toLowerCase() === s.toLowerCase())
                    )
                      .slice(0, 8)
                      .map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => addSubcategoriesToModalForm(suggestion)}
                          className="bg-orange-50 hover:bg-orange-100 text-[#FF751F] border border-[#FF751F]/30 px-2 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-0.5 transition-colors cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>{suggestion}</span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* IMAGE UPLOAD & URL */}
              <div className="space-y-2 pt-2 border-t border-[#BB7F5D]/10">
                <label className="block font-semibold text-[#5A3825]">
                  Foto / Capa da Categoria (Exibida no topo do Card)
                </label>
                <div className="flex items-center gap-3">
                  <img
                    src={formData.image}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-2xl object-cover object-top border border-[#BB7F5D]/30 bg-orange-50 shrink-0"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="file"
                      ref={modalFileInputRef}
                      onChange={handleModalFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => modalFileInputRef.current?.click()}
                        className="bg-orange-50 hover:bg-orange-100 text-[#FF751F] border border-[#FF751F]/40 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Carregar Foto do Computador/Celular</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Ou digite o link direto da imagem..."
                      className="w-full px-2.5 py-1.5 border border-[#BB7F5D]/30 text-[#3D2518] rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#BB7F5D]/15 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-[#5A3825] hover:bg-orange-50 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#FF751F] hover:bg-[#e06316] text-white px-5 py-2 rounded-xl font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY DELETE CONFIRMATION MODAL */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-70 overflow-y-auto bg-[#2B1B12]/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full p-6 sm:p-7 rounded-3xl shadow-2xl border border-[#BB7F5D]/30 animate-in zoom-in-95 space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>
            <div className="text-center">
              <h3 className="font-heading font-extrabold text-lg text-[#3D2518]">
                Excluir Categoria
              </h3>
              <p className="text-xs text-[#5A3825] mt-2 leading-relaxed">
                Deseja realmente excluir a categoria <strong>"{categoryToDelete.name}"</strong>?
              </p>
              {products.filter((p) => p.category === categoryToDelete.id || p.category === categoryToDelete.ageGroup).length > 0 && (
                <div className="mt-2.5 p-3 bg-amber-50 rounded-xl border border-amber-200 text-left">
                  <p className="text-[11px] font-bold text-amber-900">
                    Atenção: Existem {products.filter((p) => p.category === categoryToDelete.id || p.category === categoryToDelete.ageGroup).length} produto(s) vinculados a esta faixa.
                  </p>
                  <p className="text-[10px] text-amber-700 mt-0.5">
                    Eles permanecerão no catálogo, mas não serão listados sob esta categoria excluída.
                  </p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="w-full bg-stone-100 hover:bg-stone-200 text-[#5A3825] py-2.5 px-3 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCategory(categoryToDelete.id);
                  setCategoryToDelete(null);
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

      {/* SUBCATEGORY DELETE CONFIRMATION MODAL */}
      {subcatToDelete && (
        <div className="fixed inset-0 z-70 overflow-y-auto bg-[#2B1B12]/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white max-w-md w-full p-6 sm:p-7 rounded-3xl shadow-2xl border border-[#BB7F5D]/30 animate-in zoom-in-95 space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-heading font-extrabold text-base text-[#3D2518]">
                Remover Subcategoria
              </h3>
              <p className="text-xs text-[#5A3825] mt-2 leading-relaxed">
                Deseja remover a subcategoria <strong>"{subcatToDelete.subName}"</strong> de <strong>"{subcatToDelete.catName}"</strong>?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSubcatToDelete(null)}
                className="w-full bg-stone-100 hover:bg-stone-200 text-[#5A3825] py-2.5 px-3 rounded-xl font-bold text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  removeSubcategoryFromCategory(subcatToDelete.catId, subcatToDelete.subName);
                  setSubcatToDelete(null);
                }}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 px-3 rounded-xl font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Remover</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

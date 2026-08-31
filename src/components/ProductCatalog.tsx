import React from 'react';
import { X, ArrowUpDown, Layers, Sparkles, Filter, SlidersHorizontal, SunMedium, Users } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';
import { AgeGroup, GenderCategory, ProductSize, ORDERED_SIZES } from '../types';

export const ProductCatalog: React.FC = () => {
  const {
    products,
    categories,
    filterState,
    setFilterCategory,
    setFilterSubcategoryName,
    setFilterSeason,
    setFilterGender,
    setFilterSize,
    setFilterSearch,
    setFilterSort,
    resetFilters,
  } = useStore();

  // Filter out category tabs that currently have 0 products registered (except 'todas')
  const activeCategoryTabs = React.useMemo(() => {
    const baseTabs: { id: AgeGroup | 'todas'; label: string }[] = [
      { id: 'todas', label: 'Todas as Peças' },
      { id: 'bebe', label: 'Bebê (RN ao GG)' },
      { id: 'infantil', label: 'Infantil (01 ao 10)' },
      { id: 'juvenil', label: 'Juvenil (12 ao 18)' },
      { id: 'acessorios', label: 'Acessórios' },
    ];

    return baseTabs.filter((tab) => {
      if (tab.id === 'todas') return true;
      const count = products.filter((p) => p.category === tab.id).length;
      return count > 0;
    });
  }, [products]);

  // Derive relevant subcategories with > 0 products in the selected category
  const relevantSubcategories = React.useMemo(() => {
    const subcatCounts: Record<string, number> = {};
    products.forEach((p) => {
      if (filterState.category !== 'todas' && p.category !== filterState.category) return;
      if (p.subCategoryName && p.subCategoryName.trim()) {
        subcatCounts[p.subCategoryName] = (subcatCounts[p.subCategoryName] || 0) + 1;
      }
    });

    return Object.keys(subcatCounts).filter((name) => subcatCounts[name] > 0);
  }, [products, filterState.category]);

  // Extract available sizes with stock > 0 across products, in logical ascending order
  const availableSizes = React.useMemo(() => {
    const sizeSet = new Set<ProductSize>();
    products.forEach((p) => {
      p.sizes?.forEach((s) => {
        if (s.stock > 0) {
          sizeSet.add(s.size);
        }
      });
    });
    return ORDERED_SIZES.filter((sz) => sizeSet.has(sz));
  }, [products]);

  // Extract available seasons across registered products
  const availableSeasons = React.useMemo(() => {
    const seasons = new Set<string>();
    products.forEach((p) => {
      if (p.season && p.season.trim()) {
        seasons.add(p.season.trim());
      }
    });
    return Array.from(seasons);
  }, [products]);

  // Filter products based on all filter parameters
  const filteredProducts = products.filter((prod) => {
    // Search query filter
    if (filterState.search.trim()) {
      const q = filterState.search.toLowerCase();
      const matchName = prod.name.toLowerCase().includes(q);
      const matchDesc = (prod.description || '').toLowerCase().includes(q);
      const matchSku = (prod.sku || '').toLowerCase().includes(q);
      const matchCat = (prod.categoryLabel || '').toLowerCase().includes(q);
      const matchSub = (prod.subCategoryName || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchSku && !matchCat && !matchSub) return false;
    }

    // Category filter
    if (filterState.category !== 'todas') {
      if (prod.category !== filterState.category) return false;
    }

    // Gender filter
    if (filterState.subcategory !== 'todas') {
      if (prod.subcategory !== filterState.subcategory && prod.subcategory !== 'unissex') {
        return false;
      }
    }

    // Subcategory name filter
    if (filterState.subCategoryName && filterState.subCategoryName !== 'todas') {
      if (prod.subCategoryName !== filterState.subCategoryName) {
        return false;
      }
    }

    // Season filter
    if (filterState.season && filterState.season !== 'todas') {
      if (prod.season !== filterState.season) {
        return false;
      }
    }

    // Size in-stock filter
    if (filterState.size !== 'todos') {
      const hasSize = prod.sizes.some((s) => s.size === filterState.size && s.stock > 0);
      if (!hasSize) return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (filterState.sortBy === 'menor_preco') {
      return a.price - b.price;
    }
    if (filterState.sortBy === 'maior_preco') {
      return b.price - a.price;
    }
    if (filterState.sortBy === 'recentes') {
      return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    }
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const hasActiveFilters =
    filterState.category !== 'todas' ||
    filterState.subcategory !== 'todas' ||
    (filterState.subCategoryName && filterState.subCategoryName !== 'todas') ||
    (filterState.season && filterState.season !== 'todas') ||
    filterState.size !== 'todos' ||
    Boolean(filterState.search.trim());

  return (
    <section id="catalogo-produtos" className="py-12 sm:py-16 bg-[#FFFDFB] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
          <div>
            <span className="text-xs font-bold text-[#BB7F5D] uppercase tracking-wider block mb-1">
              Catálogo Interativo
            </span>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#3D2518] tracking-tight">
              Nossas Coleções
            </h2>
          </div>

          <div className="text-xs text-[#5A3825]">
            Mostrando <strong>{sortedProducts.length}</strong> {sortedProducts.length === 1 ? 'peça disponível' : 'peças disponíveis'}
          </div>
        </div>

        {/* 1. CLEAN CATEGORY TABS (Auto-hides categories with 0 products) */}
        {activeCategoryTabs.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
            {activeCategoryTabs.map((tab) => {
              const isSelected = filterState.category === tab.id;
              const count = tab.id === 'todas'
                ? products.length
                : products.filter((p) => p.category === tab.id).length;

              return (
                <button
                  key={tab.id}
                  onClick={() => setFilterCategory(tab.id, 'todas', 'todas')}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#FF751F] text-white shadow-sm'
                      : 'bg-white text-[#3D2518] border border-[#BB7F5D]/30 hover:border-[#FF751F] hover:bg-orange-50/50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-orange-100 text-[#FF751F]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 2. SUBCATEGORY PILLS (Only if relevant subcategories exist) */}
        {relevantSubcategories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-4">
            <button
              onClick={() => setFilterSubcategoryName('todas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                !filterState.subCategoryName || filterState.subCategoryName === 'todas'
                  ? 'bg-[#3D2518] text-white'
                  : 'bg-white text-[#5A3825] border border-stone-200 hover:border-[#FF751F] hover:bg-orange-50/50'
              }`}
            >
              Todos os Tipos
            </button>

            {relevantSubcategories.map((subName) => {
              const isSelected = filterState.subCategoryName === subName;
              const count = products.filter((p) => {
                if (filterState.category !== 'todas' && p.category !== filterState.category) return false;
                return p.subCategoryName === subName;
              }).length;

              return (
                <button
                  key={subName}
                  onClick={() => setFilterSubcategoryName(isSelected ? 'todas' : subName)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#FF751F] text-white shadow-2xs'
                      : 'bg-white text-[#3D2518] border border-[#BB7F5D]/25 hover:border-[#FF751F] hover:bg-orange-50/50'
                  }`}
                >
                  <span>{subName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-orange-100 text-[#FF751F]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 3. CONSOLIDATED DROPDOWN FILTER BAR (Tamanho, Gênero, Estação, Ordenar por) */}
        <div className="bg-white rounded-2xl p-3 sm:p-4 border border-[#BB7F5D]/20 shadow-2xs mb-8 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
            
            {/* Gênero / Linha Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-[#5A3825] uppercase tracking-wider mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#FF751F]" />
                <span>Gênero / Linha</span>
              </label>
              <select
                id="select-gender-filter"
                value={filterState.subcategory}
                onChange={(e) => setFilterGender(e.target.value as GenderCategory | 'todas')}
                className="w-full text-xs font-semibold bg-orange-50/30 border border-[#BB7F5D]/30 rounded-xl px-3 py-2 text-[#3D2518] focus:outline-none focus:border-[#FF751F] cursor-pointer"
              >
                <option value="todas">Todos os Gêneros</option>
                <option value="menina">Menina / Feminino</option>
                <option value="menino">Menino / Masculino</option>
                <option value="unissex">Unissex</option>
              </select>
            </div>

            {/* Tamanho Dropdown (Strict Logical Order: RN, P, M, G, GG, 01..18, Único) */}
            <div>
              <label className="block text-[11px] font-bold text-[#5A3825] uppercase tracking-wider mb-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF751F]" />
                <span>Tamanho</span>
              </label>
              <select
                id="select-size-filter"
                value={filterState.size}
                onChange={(e) => setFilterSize(e.target.value as ProductSize | 'todos')}
                className="w-full text-xs font-semibold bg-orange-50/30 border border-[#BB7F5D]/30 rounded-xl px-3 py-2 text-[#3D2518] focus:outline-none focus:border-[#FF751F] cursor-pointer"
              >
                <option value="todos">Todos os Tamanhos</option>
                {availableSizes.map((sz) => (
                  <option key={sz} value={sz}>
                    Tamanho {sz}
                  </option>
                ))}
              </select>
            </div>

            {/* Estação / Coleção Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-[#5A3825] uppercase tracking-wider mb-1 flex items-center gap-1">
                <SunMedium className="w-3.5 h-3.5 text-[#FF751F]" />
                <span>Estação / Coleção</span>
              </label>
              <select
                id="select-season-filter"
                value={filterState.season || 'todas'}
                onChange={(e) => setFilterSeason(e.target.value)}
                className="w-full text-xs font-semibold bg-orange-50/30 border border-[#BB7F5D]/30 rounded-xl px-3 py-2 text-[#3D2518] focus:outline-none focus:border-[#FF751F] cursor-pointer"
              >
                <option value="todas">Todas as Estações</option>
                {availableSeasons.map((seasonName) => (
                  <option key={seasonName} value={seasonName}>
                    {seasonName}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenar por Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-[#5A3825] uppercase tracking-wider mb-1 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#FF751F]" />
                <span>Ordenar por</span>
              </label>
              <select
                id="select-sort-by"
                value={filterState.sortBy}
                onChange={(e) => setFilterSort(e.target.value as any)}
                className="w-full text-xs font-semibold bg-orange-50/30 border border-[#BB7F5D]/30 rounded-xl px-3 py-2 text-[#3D2518] focus:outline-none focus:border-[#FF751F] cursor-pointer"
              >
                <option value="destaques">Destaques da Majoca</option>
                <option value="recentes">Lançamentos / Novidades</option>
                <option value="menor_preco">Menor Preço</option>
                <option value="maior_preco">Maior Preço</option>
              </select>
            </div>

          </div>

          {/* ACTIVE FILTER SUMMARY CHIPS & RESET */}
          {hasActiveFilters && (
            <div className="pt-2.5 border-t border-[#BB7F5D]/15 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5 text-[#5A3825]">
                <span className="font-semibold text-[#3D2518] text-[11px]">Filtros ativos:</span>
                
                {filterState.search && (
                  <span className="bg-orange-100 text-[#FF751F] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 text-[11px]">
                    Busca: "{filterState.search}"
                    <button onClick={() => setFilterSearch('')} title="Remover"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {filterState.category !== 'todas' && (
                  <span className="bg-orange-100 text-[#FF751F] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 text-[11px]">
                    Categoria: {filterState.category}
                    <button onClick={() => setFilterCategory('todas')} title="Remover"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {filterState.subCategoryName && filterState.subCategoryName !== 'todas' && (
                  <span className="bg-[#FF751F] text-white px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 text-[11px]">
                    Tipo: {filterState.subCategoryName}
                    <button onClick={() => setFilterSubcategoryName('todas')} title="Remover"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {filterState.subcategory !== 'todas' && (
                  <span className="bg-[#BB7F5D]/20 text-[#3D2518] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 text-[11px]">
                    Gênero: {filterState.subcategory}
                    <button onClick={() => setFilterGender('todas')} title="Remover"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {filterState.season && filterState.season !== 'todas' && (
                  <span className="bg-[#BB7F5D]/20 text-[#3D2518] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 text-[11px]">
                    Coleção: {filterState.season}
                    <button onClick={() => setFilterSeason('todas')} title="Remover"><X className="w-3 h-3" /></button>
                  </span>
                )}

                {filterState.size !== 'todos' && (
                  <span className="bg-[#BB7F5D]/20 text-[#3D2518] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1 text-[11px]">
                    Tam: {filterState.size}
                    <button onClick={() => setFilterSize('todos')} title="Remover"><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>

              <button
                onClick={resetFilters}
                className="text-[#FF751F] hover:text-[#e06316] font-bold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Limpar todos os filtros
              </button>
            </div>
          )}
        </div>

        {/* PRODUCTS GRID */}
        {sortedProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#BB7F5D]/20 p-8 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 bg-orange-50 text-[#FF751F] rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            {products.length === 0 ? (
              <>
                <h3 className="font-heading font-bold text-lg text-[#3D2518]">
                  Catálogo em Atualização
                </h3>
                <p className="text-xs sm:text-sm text-[#5A3825] mt-1 max-w-md mx-auto leading-relaxed">
                  Nenhum produto cadastrado no momento. Cadastre novas peças no Painel Administrativo ou aguarde as novidades da coleção!
                </p>
              </>
            ) : (
              <>
                <h3 className="font-heading font-bold text-lg text-[#3D2518]">
                  Nenhuma peça encontrada com os filtros selecionados
                </h3>
                <p className="text-xs sm:text-sm text-[#5A3825] mt-1 max-w-md mx-auto">
                  Tente selecionar outro tamanho, gênero ou coleção, ou clique abaixo para ver todas as peças do estoque.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-5 bg-[#FF751F] hover:bg-[#e06316] text-white px-6 py-2.5 rounded-full font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  Ver Todas as Peças do Estoque
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

import React, { useState } from 'react';
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ShieldCheck,
  Ruler,
  ChevronDown,
  Lock,
  Home,
  Info,
  FileText,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AgeGroup, GenderCategory } from '../types';
import { BrandLogo } from './BrandLogo';

export const Header: React.FC = () => {
  const {
    settings,
    categories,
    cartCount,
    setIsCartOpen,
    setFilterCategory,
    filterState,
    setFilterSearch,
    setIsSizeGuideOpen,
    setIsAdminOpen,
    isAdminLoggedIn,
    openInstitutionalModal,
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<AgeGroup | null>(null);
  const [searchInput, setSearchInput] = useState(filterState.search);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilterSearch(searchInput);
    const catalogElem = document.getElementById('catalogo-produtos');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (
    cat: AgeGroup | 'todas',
    subcat?: GenderCategory | 'todas',
    subCategoryName?: string
  ) => {
    setFilterCategory(cat, subcat || 'todas', subCategoryName || 'todas');
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    const catalogElem = document.getElementById('catalogo-produtos');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHomeClick = () => {
    setFilterCategory('todas', 'todas', 'todas');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <header id="site-header" className="sticky top-0 z-40 bg-white border-b border-[#BB7F5D]/20 shadow-xs">
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#BB7F5D] text-white text-xs sm:text-sm font-medium py-2 px-4 text-center tracking-wide flex items-center justify-center">
        <span>{settings.topAnnouncement}</span>
      </div>

      {/* 2. MAIN HEADER BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Mobile Menu Button */}
          <button
            id="btn-mobile-menu"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#3D2518] hover:bg-orange-50 transition-colors"
            aria-label="Abrir menu de navegação"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* BRAND LOGO (Exclusivamente a logomarca oficial, sem escrita repetida) */}
          <div className="flex items-center">
            <a
              id="brand-logo-link"
              href="#inicio"
              onClick={(e) => {
                e.preventDefault();
                handleHomeClick();
              }}
              className="flex items-center group cursor-pointer"
              title="Majoca Moda - Início"
            >
              <BrandLogo className="group-hover:opacity-95" />
            </a>
          </div>

          {/* DESKTOP INSTITUTIONAL & CATEGORY NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Link Institucional: Início */}
            <button
              id="nav-link-inicio"
              onClick={handleHomeClick}
              className={`px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
                filterState.category === 'todas'
                  ? 'text-[#FF751F] bg-orange-50'
                  : 'text-[#3D2518] hover:text-[#FF751F] hover:bg-orange-50/50'
              }`}
            >
              Início
            </button>

            {/* Bebê */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('bebe')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                id="nav-category-bebe"
                onClick={() => handleCategoryClick('bebe')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
                  filterState.category === 'bebe'
                    ? 'text-[#FF751F] bg-orange-50'
                    : 'text-[#3D2518] hover:text-[#FF751F] hover:bg-orange-50/50'
                }`}
              >
                <span>Bebê</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {activeDropdown === 'bebe' && (
                <div className="absolute top-full left-0 w-60 bg-white border border-[#BB7F5D]/20 rounded-2xl shadow-xl p-3 mt-1 z-50 animate-in fade-in slide-in-from-top-1 space-y-2">
                  <div className="px-2 py-0.5 text-[10px] font-bold text-[#BB7F5D] uppercase tracking-wider">
                    RN ao GG (0 a 24m)
                  </div>
                  
                  {/* Gênero */}
                  <div className="grid grid-cols-2 gap-1 pb-1.5 border-b border-[#BB7F5D]/15">
                    <button
                      onClick={() => handleCategoryClick('bebe', 'menina')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-[#3D2518] hover:bg-orange-50 hover:text-[#FF751F] rounded-lg text-left"
                    >
                      Bebê Menina
                    </button>
                    <button
                      onClick={() => handleCategoryClick('bebe', 'menino')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-[#3D2518] hover:bg-orange-50 hover:text-[#FF751F] rounded-lg text-left"
                    >
                      Bebê Menino
                    </button>
                  </div>

                  {/* Subcategorias */}
                  <div className="space-y-1">
                    <div className="px-2 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      Por Tipo de Peça
                    </div>
                    <div className="grid grid-cols-1 gap-0.5">
                      {(categories.find((c) => c.ageGroup === 'bebe')?.subcategories || [
                        'Macacões',
                        'Jardineiras & Rompers',
                        'Conjuntos',
                        'Bodies & Culotes',
                        'Vestidinhos',
                      ]).map((sub) => (
                        <button
                          key={sub}
                          onClick={() => handleCategoryClick('bebe', 'todas', sub)}
                          className="w-full text-left px-2.5 py-1.5 text-xs text-[#3D2518] hover:bg-orange-50 hover:text-[#FF751F] rounded-lg transition-colors flex items-center justify-between"
                        >
                          <span>{sub}</span>
                          <span className="text-[10px] text-[#BB7F5D]">&rarr;</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[#BB7F5D]/15 pt-1.5">
                    <button
                      onClick={() => handleCategoryClick('bebe')}
                      className="w-full text-center px-2 py-1 text-xs font-bold text-[#FF751F] hover:underline"
                    >
                      Ver todas as peças de Bebê &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Infantil */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('infantil')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                id="nav-category-infantil"
                onClick={() => handleCategoryClick('infantil')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
                  filterState.category === 'infantil'
                    ? 'text-[#FF751F] bg-orange-50'
                    : 'text-[#3D2518] hover:text-[#FF751F] hover:bg-orange-50/50'
                }`}
              >
                <span>Infantil</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {activeDropdown === 'infantil' && (
                <div className="absolute top-full left-0 w-60 bg-white border border-[#BB7F5D]/20 rounded-2xl shadow-xl p-3 mt-1 z-50 animate-in fade-in slide-in-from-top-1 space-y-2">
                  <div className="px-2 py-0.5 text-[10px] font-bold text-[#BB7F5D] uppercase tracking-wider">
                    Tamanhos 01 ao 10
                  </div>

                  {/* Gênero */}
                  <div className="grid grid-cols-2 gap-1 pb-1.5 border-b border-[#BB7F5D]/15">
                    <button
                      onClick={() => handleCategoryClick('infantil', 'menina')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-[#3D2518] hover:bg-orange-50 hover:text-[#FF751F] rounded-lg text-left"
                    >
                      Menina Infantil
                    </button>
                    <button
                      onClick={() => handleCategoryClick('infantil', 'menino')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-[#3D2518] hover:bg-orange-50 hover:text-[#FF751F] rounded-lg text-left"
                    >
                      Menino Infantil
                    </button>
                  </div>

                  {/* Subcategorias */}
                  <div className="space-y-1">
                    <div className="px-2 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      Por Tipo de Peça
                    </div>
                    <div className="grid grid-cols-1 gap-0.5">
                      {(categories.find((c) => c.ageGroup === 'infantil')?.subcategories || [
                        'Conjuntos',
                        'Vestidos',
                        'Camisetas & Blusas',
                        'Calças & Bermudas',
                        'Jardineiras',
                        'Pijamas',
                      ]).map((sub) => (
                        <button
                          key={sub}
                          onClick={() => handleCategoryClick('infantil', 'todas', sub)}
                          className="w-full text-left px-2.5 py-1.5 text-xs text-[#3D2518] hover:bg-orange-50 hover:text-[#FF751F] rounded-lg transition-colors flex items-center justify-between"
                        >
                          <span>{sub}</span>
                          <span className="text-[10px] text-[#BB7F5D]">&rarr;</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[#BB7F5D]/15 pt-1.5">
                    <button
                      onClick={() => handleCategoryClick('infantil')}
                      className="w-full text-center px-2 py-1 text-xs font-bold text-[#FF751F] hover:underline"
                    >
                      Ver todo o Infantil &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Juvenil */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown('juvenil')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                id="nav-category-juvenil"
                onClick={() => handleCategoryClick('juvenil')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
                  filterState.category === 'juvenil'
                    ? 'text-[#FF751F] bg-orange-50'
                    : 'text-[#3D2518] hover:text-[#FF751F] hover:bg-orange-50/50'
                }`}
              >
                <span>Juvenil</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {activeDropdown === 'juvenil' && (
                <div className="absolute top-full left-0 w-60 bg-white border border-[#BB7F5D]/20 rounded-2xl shadow-xl p-3 mt-1 z-50 animate-in fade-in slide-in-from-top-1 space-y-2">
                  <div className="px-2 py-0.5 text-[10px] font-bold text-[#BB7F5D] uppercase tracking-wider">
                    Tamanhos 12 ao 18
                  </div>

                  {/* Gênero */}
                  <div className="grid grid-cols-2 gap-1 pb-1.5 border-b border-[#BB7F5D]/15">
                    <button
                      onClick={() => handleCategoryClick('juvenil', 'menina')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-[#3D2518] hover:bg-orange-50 hover:text-[#FF751F] rounded-lg text-left"
                    >
                      Juvenil Feminino
                    </button>
                    <button
                      onClick={() => handleCategoryClick('juvenil', 'menino')}
                      className="px-2.5 py-1.5 text-xs font-semibold text-[#3D2518] hover:bg-orange-50 hover:text-[#FF751F] rounded-lg text-left"
                    >
                      Juvenil Masculino
                    </button>
                  </div>

                  {/* Subcategorias */}
                  <div className="space-y-1">
                    <div className="px-2 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      Por Tipo de Peça
                    </div>
                    <div className="grid grid-cols-1 gap-0.5">
                      {(categories.find((c) => c.ageGroup === 'juvenil')?.subcategories || [
                        'Conjuntos',
                        'Vestidos & Saias',
                        'Camisetas & Tops',
                        'Calças & Shorts',
                        'Casacos & Jaquetas',
                      ]).map((sub) => (
                        <button
                          key={sub}
                          onClick={() => handleCategoryClick('juvenil', 'todas', sub)}
                          className="w-full text-left px-2.5 py-1.5 text-xs text-[#3D2518] hover:bg-orange-50 hover:text-[#FF751F] rounded-lg transition-colors flex items-center justify-between"
                        >
                          <span>{sub}</span>
                          <span className="text-[10px] text-[#BB7F5D]">&rarr;</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-[#BB7F5D]/15 pt-1.5">
                    <button
                      onClick={() => handleCategoryClick('juvenil')}
                      className="w-full text-center px-2 py-1 text-xs font-bold text-[#FF751F] hover:underline"
                    >
                      Ver todo o Juvenil &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Acessórios */}
            <button
              id="nav-category-acessorios"
              onClick={() => handleCategoryClick('acessorios')}
              className={`px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
                filterState.category === 'acessorios'
                  ? 'text-[#FF751F] bg-orange-50'
                  : 'text-[#3D2518] hover:text-[#FF751F] hover:bg-orange-50/50'
              }`}
            >
              Acessórios
            </button>

            {/* Links Institucionais: Sobre e Termos */}
            <button
              id="nav-link-sobre"
              onClick={() => openInstitutionalModal('sobre', 'Sobre a Majoca Moda')}
              className="px-3 py-2 rounded-full text-sm font-semibold text-[#3D2518] hover:text-[#FF751F] hover:bg-orange-50/50 transition-colors"
            >
              Sobre
            </button>

            <button
              id="nav-link-termos"
              onClick={() => openInstitutionalModal('termos', 'Termos e Condições')}
              className="px-3 py-2 rounded-full text-sm font-semibold text-[#3D2518] hover:text-[#FF751F] hover:bg-orange-50/50 transition-colors"
            >
              Termos
            </button>
          </nav>

          {/* ACTIONS: SEARCH, SIZE GUIDE, CART, ADMIN */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block">
              <input
                id="header-search-input"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar vestidos, conjuntos..."
                className="w-44 lg:w-56 pl-9 pr-4 py-2 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white border border-[#BB7F5D]/30 rounded-full focus:outline-none focus:border-[#FF751F] focus:ring-1 focus:ring-[#FF751F] transition-all text-[#3D2518]"
              />
              <Search className="w-4 h-4 text-[#BB7F5D] absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            {/* Mobile Search Toggle */}
            <button
              id="btn-mobile-search-toggle"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="sm:hidden p-2 rounded-full text-[#3D2518] hover:bg-orange-50"
              aria-label="Buscar produtos"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Size Guide shortcut */}
            <button
              id="btn-size-guide"
              onClick={() => setIsSizeGuideOpen(true)}
              className="hidden md:flex items-center gap-1 text-xs font-medium text-[#5A3825] hover:text-[#FF751F] px-2.5 py-1.5 rounded-lg hover:bg-orange-50 transition-colors"
              title="Guia de Tamanhos (0 a 18 anos)"
            >
              <Ruler className="w-4 h-4 text-[#BB7F5D]" />
              <span className="hidden xl:inline">Tabela de Medidas</span>
            </button>

            {/* Shopping Bag Button */}
            <button
              id="btn-open-cart"
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-[#FF751F] hover:bg-[#e06316] text-white px-3.5 sm:px-4 py-2.5 rounded-full font-semibold text-xs sm:text-sm shadow-sm transition-all hover:shadow-md cursor-pointer"
              aria-label="Abrir sacola de compras"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Sacola</span>
              <span className="w-5 h-5 bg-white text-[#FF751F] rounded-full text-xs font-bold flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            </button>

            {/* Admin Panel Entry */}
            <button
              id="btn-header-admin"
              onClick={() => setIsAdminOpen(true)}
              className={`p-2 rounded-full transition-colors ${
                isAdminLoggedIn
                  ? 'text-[#FF751F] bg-orange-100 hover:bg-orange-200'
                  : 'text-[#BB7F5D] hover:text-[#FF751F] hover:bg-orange-50'
              }`}
              title={isAdminLoggedIn ? 'Painel Administrativo (Conectado)' : 'Acesso Restrito do Lojista'}
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Expansion */}
        {isSearchExpanded && (
          <div className="sm:hidden pb-3 px-1">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                id="mobile-search-input"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar por nome, categoria, tamanho..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-stone-50 border border-[#BB7F5D]/30 rounded-full focus:outline-none focus:border-[#FF751F] text-[#3D2518]"
                autoFocus
              />
              <Search className="w-4 h-4 text-[#BB7F5D] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </form>
          </div>
        )}
      </div>

      {/* MOBILE DRAWER NAVIGATION */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#BB7F5D]/20 bg-white px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2">
          
          {/* Institutional Links in Mobile */}
          <div className="flex items-center gap-2 pb-2 border-b border-[#BB7F5D]/10">
            <button
              onClick={handleHomeClick}
              className="flex-1 py-2 px-3 rounded-xl bg-orange-50 text-xs font-bold text-[#FF751F] text-center"
            >
              Início
            </button>
            <button
              onClick={() => {
                openInstitutionalModal('sobre', 'Sobre a Majoca Moda');
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-stone-50 hover:bg-orange-50 text-xs font-bold text-[#3D2518] text-center"
            >
              Sobre
            </button>
            <button
              onClick={() => {
                openInstitutionalModal('termos', 'Termos e Condições');
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-stone-50 hover:bg-orange-50 text-xs font-bold text-[#3D2518] text-center"
            >
              Termos
            </button>
          </div>

          <div className="font-heading font-semibold text-xs text-[#BB7F5D] uppercase tracking-wider px-1">
            Categorias do Catálogo
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleCategoryClick('bebe', 'menina')}
              className="text-left p-2.5 rounded-xl bg-stone-50 hover:bg-orange-50 text-xs font-semibold text-[#3D2518]"
            >
              Bebê Menina
              <span className="block text-[10px] text-[#BB7F5D] font-normal">RN ao GG</span>
            </button>
            <button
              onClick={() => handleCategoryClick('bebe', 'menino')}
              className="text-left p-2.5 rounded-xl bg-stone-50 hover:bg-orange-50 text-xs font-semibold text-[#3D2518]"
            >
              Bebê Menino
              <span className="block text-[10px] text-[#BB7F5D] font-normal">RN ao GG</span>
            </button>
            <button
              onClick={() => handleCategoryClick('infantil', 'menina')}
              className="text-left p-2.5 rounded-xl bg-stone-50 hover:bg-orange-50 text-xs font-semibold text-[#3D2518]"
            >
              Menina Infantil
              <span className="block text-[10px] text-[#BB7F5D] font-normal">Tam 01 ao 10</span>
            </button>
            <button
              onClick={() => handleCategoryClick('infantil', 'menino')}
              className="text-left p-2.5 rounded-xl bg-stone-50 hover:bg-orange-50 text-xs font-semibold text-[#3D2518]"
            >
              Menino Infantil
              <span className="block text-[10px] text-[#BB7F5D] font-normal">Tam 01 ao 10</span>
            </button>
            <button
              onClick={() => handleCategoryClick('juvenil', 'menina')}
              className="text-left p-2.5 rounded-xl bg-stone-50 hover:bg-orange-50 text-xs font-semibold text-[#3D2518]"
            >
              Juvenil Menina
              <span className="block text-[10px] text-[#BB7F5D] font-normal">Tam 12 ao 18</span>
            </button>
            <button
              onClick={() => handleCategoryClick('juvenil', 'menino')}
              className="text-left p-2.5 rounded-xl bg-stone-50 hover:bg-orange-50 text-xs font-semibold text-[#3D2518]"
            >
              Juvenil Menino
              <span className="block text-[10px] text-[#BB7F5D] font-normal">Tam 12 ao 18</span>
            </button>
            <button
              onClick={() => handleCategoryClick('acessorios')}
              className="col-span-2 text-left p-2.5 rounded-xl bg-stone-50 hover:bg-orange-50 text-xs font-semibold text-[#3D2518]"
            >
              Acessórios (Laços, Bonés, Faixas & Meias)
            </button>
          </div>

          {/* Mobile Quick Subcategories */}
          <div className="space-y-1.5 pt-2 border-t border-[#BB7F5D]/15">
            <div className="text-[11px] font-bold text-[#BB7F5D] uppercase tracking-wider px-1">
              Subcategorias em Destaque
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(Array.from(new Set(categories.flatMap((c) => c.subcategories || []))) as string[])
                .slice(0, 8)
                .map((subName) => (
                  <button
                    key={subName}
                    onClick={() => handleCategoryClick('todas', 'todas', subName)}
                    className="px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#3D2518] hover:bg-[#FF751F] hover:text-white transition-colors"
                  >
                    {subName}
                  </button>
                ))}
            </div>
          </div>

          <div className="border-t border-[#BB7F5D]/20 pt-3 flex flex-col gap-2">
            <button
              onClick={() => {
                setIsSizeGuideOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs font-medium text-[#3D2518] p-2 hover:bg-orange-50 rounded-lg"
            >
              <Ruler className="w-4 h-4 text-[#BB7F5D]" />
              Guia de Tamanhos (0 ao 18 anos)
            </button>
            <button
              onClick={() => {
                openInstitutionalModal('trocas', 'Política de Trocas e Devoluções');
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs font-medium text-[#3D2518] p-2 hover:bg-orange-50 rounded-lg"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Garantia & Troca Fácil
            </button>
            <button
              onClick={() => {
                setIsAdminOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs font-medium text-[#FF751F] p-2 hover:bg-orange-50 rounded-lg"
            >
              <Lock className="w-4 h-4" />
              Painel Administrativo da Loja
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

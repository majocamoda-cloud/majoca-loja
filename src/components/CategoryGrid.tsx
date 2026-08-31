import React from 'react';
import { ArrowRight, Sparkles, ShoppingBag, Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { AgeGroup, GenderCategory } from '../types';

export const CategoryGrid: React.FC = () => {
  const { categories, products, setFilterCategory } = useStore();

  const handleSelectCategory = (
    ageGroup: AgeGroup | 'todas',
    gender?: GenderCategory | 'todas',
    subCategoryName?: string
  ) => {
    setFilterCategory(ageGroup, gender || 'todas', subCategoryName || 'todas');
    const catalogElem = document.getElementById('catalogo-produtos');
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // The 3 main core categories (Bebê, Infantil, Juvenil)
  const mainCategories = categories.filter((c) => ['bebe', 'infantil', 'juvenil'].includes(c.ageGroup));
  const otherCategories = categories.filter((c) => !['bebe', 'infantil', 'juvenil'].includes(c.ageGroup));

  return (
    <section id="secao-categorias" className="py-12 sm:py-16 bg-[#FDFBF9] border-b border-[#BB7F5D]/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-block bg-orange-100/70 text-[#FF751F] text-xs font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full mb-3 shadow-2xs">
            Faixas Etárias
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#3D2518] tracking-tight">
            Explore por Idade
          </h2>
          <p className="text-[#5A3825] text-sm sm:text-base mt-2.5 max-w-xl mx-auto">
            Peças do RN ao 18 anos organizadas para cada fase do seu filho.
          </p>
        </div>

        {/* 3 Main Featured Categories Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {mainCategories.map((cat) => {
            const count = products.filter((p) => p.category === cat.ageGroup).length;

            return (
              <div
                key={cat.id}
                className="group bg-white rounded-3xl border border-[#BB7F5D]/20 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col overflow-hidden"
              >
                {/* 1. [FOTO DA CATEGORIA NO TOPO DO CARD - ENQUADRAMENTO AJUSTADO SEM CORTAR CABEÇA/TOPO] */}
                <div 
                  onClick={() => handleSelectCategory(cat.ageGroup, cat.gender)}
                  className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden bg-[#FAF5EE] cursor-pointer flex items-center justify-center"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Subtle top badge for Age Tag */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs text-[#3D2518] text-xs font-extrabold px-3 py-1 rounded-full shadow-sm border border-[#BB7F5D]/20">
                    {cat.tag || cat.ageRange}
                  </div>

                  {/* Stock count badge */}
                  <div className="absolute top-4 right-4 bg-[#2B1B12]/75 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                    {count} {count === 1 ? 'peça' : 'peças'}
                  </div>
                </div>

                {/* 2. [CORPO DO CARD: TÍTULO / FAIXA DE TAMANHO + DESCRIÇÃO CURTA + BOTÃO] */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Faixa de Tamanho Subtitle */}
                    <span className="text-xs font-bold text-[#FF751F] uppercase tracking-wider block">
                      {cat.tag || cat.ageRange}
                    </span>

                    {/* Título da Categoria */}
                    <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#3D2518] mt-1 group-hover:text-[#FF751F] transition-colors">
                      Moda {cat.name}
                    </h3>

                    {/* Descrição Curta */}
                    <p className="text-xs sm:text-sm text-[#5A3825] leading-relaxed mt-2 line-clamp-2">
                      {cat.description || 'Peças confortáveis e cheias de estilo para esta faixa de idade.'}
                    </p>

                    {/* Subcategorias Chips */}
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-2 border-t border-[#BB7F5D]/10">
                        {cat.subcategories.slice(0, 4).map((sub) => (
                          <button
                            key={sub}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectCategory(cat.ageGroup, 'todas', sub);
                            }}
                            className="bg-orange-50 hover:bg-[#FF751F] text-[#5A3825] hover:text-white px-2 py-0.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer border border-[#BB7F5D]/15"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* Botão 'Ver produtos' */}
                    <button
                      type="button"
                      onClick={() => handleSelectCategory(cat.ageGroup, cat.gender)}
                      className="w-full bg-[#FF751F] hover:bg-[#e06316] text-white py-3 px-4 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-orange-500/15 flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:bg-[#e06316]"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Ver produtos</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform ml-1" />
                    </button>

                    {/* Sub-filtros rápidos por gênero */}
                    <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-[#BB7F5D]">
                      <span>Filtrar:</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCategory(cat.ageGroup, 'menina');
                        }}
                        className="hover:text-[#FF751F] hover:underline cursor-pointer"
                      >
                        Menina
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCategory(cat.ageGroup, 'menino');
                        }}
                        className="hover:text-[#FF751F] hover:underline cursor-pointer"
                      >
                        Menino
                      </button>
                      <span>•</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCategory(cat.ageGroup, 'todas');
                        }}
                        className="hover:text-[#FF751F] hover:underline cursor-pointer"
                      >
                        Todos
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional category cards (e.g. Acessórios & Ver Catálogo Completo) */}
        {otherCategories.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {otherCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleSelectCategory(cat.ageGroup, cat.gender)}
                className="group bg-white rounded-3xl border border-[#BB7F5D]/20 shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex flex-col sm:flex-row items-center p-4 sm:p-5 gap-4"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full sm:w-28 h-32 sm:h-28 rounded-2xl object-cover object-top border border-[#BB7F5D]/20 shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-[11px] font-bold text-[#FF751F] uppercase tracking-wider">
                    {cat.tag}
                  </span>
                  <h4 className="font-heading font-bold text-lg text-[#3D2518]">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-[#5A3825] line-clamp-2">
                    {cat.description}
                  </p>
                </div>
                <button
                  type="button"
                  className="w-full sm:w-auto bg-orange-50 hover:bg-[#FF751F] text-[#FF751F] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0"
                >
                  <span>Ver produtos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

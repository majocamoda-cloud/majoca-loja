import React from 'react';
import { X, Ruler } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { sizeGuideData } from '../data/initialData';

export const SizeGuideModal: React.FC = () => {
  const { isSizeGuideOpen, setIsSizeGuideOpen } = useStore();

  if (!isSizeGuideOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2B1B12]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in">
      <div
        id="size-guide-modal-container"
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-[#BB7F5D]/20 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
      >
        {/* HEADER */}
        <div className="p-5 sm:p-6 bg-orange-50/30 border-b border-[#BB7F5D]/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF751F] flex items-center justify-center">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-lg sm:text-xl text-[#3D2518]">
                Tabela de Medidas (0 ao 18 anos)
              </h2>
              <p className="text-xs text-[#BB7F5D]">
                Referência para Bebês, Crianças e Adolescentes
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSizeGuideOpen(false)}
            className="p-2 rounded-full text-[#5A3825] hover:text-[#FF751F] hover:bg-orange-100/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Helpful advice */}
          <div className="p-4 bg-orange-50/70 rounded-2xl border border-orange-200/70 text-xs text-[#5A3825] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-[#FF751F]">
              <Ruler className="w-4 h-4" />
              <span>Dica de Medida:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Crianças crescem rápido. Em caso de dúvida entre dois tamanhos, recomendamos sempre optar pelo tamanho maior para garantir conforto e maior tempo de uso das peças.
            </p>
          </div>

          {/* TABLES */}
          {sizeGuideData.map((section, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="font-heading font-bold text-sm text-[#3D2518] flex items-center gap-2 border-b border-[#BB7F5D]/20 pb-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF751F]" />
                <span>{section.category}</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-[#BB7F5D]/20 rounded-xl overflow-hidden">
                  <thead className="bg-orange-50/60 text-[#3D2518] font-bold">
                    <tr>
                      <th className="p-2.5">Tamanho</th>
                      <th className="p-2.5">Idade Sugerida</th>
                      <th className="p-2.5">Altura</th>
                      <th className="p-2.5">Peso / Medidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#BB7F5D]/10 bg-white">
                    {section.items.map((it: any, i: number) => (
                      <tr key={i} className="hover:bg-orange-50/40 transition-colors">
                        <td className="p-2.5 font-bold text-[#3D2518]">{it.size}</td>
                        <td className="p-2.5 text-[#5A3825]">{it.age}</td>
                        <td className="p-2.5 text-[#5A3825]">{it.height}</td>
                        <td className="p-2.5 text-[#5A3825]">
                          {it.weight ? `Peso: ${it.weight}` : `Tórax: ${it.chest} | Cint: ${it.waist}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {/* HOW TO MEASURE TIPS */}
          <div className="bg-orange-50/20 p-4 rounded-2xl border border-[#BB7F5D]/20 text-xs space-y-2">
            <h4 className="font-heading font-bold text-[#3D2518]">Como medir seu filho(a):</h4>
            <ul className="space-y-1 text-[11px] text-[#5A3825] list-disc list-inside">
              <li><strong>Altura:</strong> Meça da cabeça aos pés, descalço, encostado em uma parede reta.</li>
              <li><strong>Tórax/Busto:</strong> Passe a fita métrica abaixo dos braços na parte mais larga do peito.</li>
              <li><strong>Cintura:</strong> Meça na linha natural da cintura, acima do umbigo, sem apertar.</li>
            </ul>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-orange-50/30 border-t border-[#BB7F5D]/20 text-center">
          <button
            onClick={() => setIsSizeGuideOpen(false)}
            className="bg-[#FF751F] hover:bg-[#e06316] text-white px-8 py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            Voltar às Compras
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldCheck, Save, QrCode, Store, Clock, Mail, Phone, MapPin, AlertTriangle, Check, Copy } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { StoreSettings } from '../../types';
import { generatePixQRCodeDataURL } from '../../utils/pixPayload';

export const AdminSettings: React.FC = () => {
  const { settings, updateSettings, changeAdminPassword, showToast } = useStore();
  
  // Store details form
  const [formSettings, setFormSettings] = useState<StoreSettings>(settings);
  const [previewQrCode, setPreviewQrCode] = useState<string>('');
  const [previewPayload, setPreviewPayload] = useState<string>('');
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Generate live preview for settings
  useEffect(() => {
    if (formSettings.pixKey) {
      let isMounted = true;
      generatePixQRCodeDataURL({
        pixKey: formSettings.pixKey,
        merchantName: formSettings.pixHolderName || 'MAJOCA MODA',
        merchantCity: formSettings.addressCity ? formSettings.addressCity.split('-')[0].trim() : 'UBA',
        amount: 79.90,
        txId: 'TESTEPIX',
        description: 'Teste Pix Majoca',
      }).then(({ qrCodeDataUrl, pixCopiaECola }) => {
        if (isMounted) {
          setPreviewQrCode(qrCodeDataUrl);
          setPreviewPayload(pixCopiaECola);
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [formSettings.pixKey, formSettings.pixHolderName, formSettings.addressCity]);

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState(false);

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
    showToast('Configurações da loja salvas com sucesso!', 'success');
  };

  const handleCopyPreviewPayload = () => {
    if (previewPayload) {
      navigator.clipboard.writeText(previewPayload);
      setCopiedPayload(true);
      showToast('Código Pix de teste copiado!', 'success');
      setTimeout(() => setCopiedPayload(false), 3000);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess(false);

    if (newPass.length < 4) {
      setPassError('A nova senha deve possuir no mínimo 4 caracteres.');
      return;
    }

    if (newPass !== confirmPass) {
      setPassError('A confirmação da nova senha não coincide.');
      return;
    }

    const success = changeAdminPassword(currentPass, newPass);
    if (success) {
      setPassSuccess(true);
      showToast('Senha de administrador alterada com sucesso!', 'success');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } else {
      setPassError('A senha atual informada está incorreta.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. ABA DE SENHA & SEGURANÇA */}
      <div className="bg-white p-6 rounded-3xl border border-[#BB7F5D]/20 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#BB7F5D]/10">
          <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF751F] flex items-center justify-center">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-[#3D2518]">
              Segurança & Senha de Acesso ao Painel (Acesso Master)
            </h3>
            <p className="text-[11px] text-[#5A3825]">
              Altere a senha mestre utilizada para acessar a administração da loja (Senha inicial padrão: <strong>Majoca@2026</strong>).
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs max-w-xl">
          {passError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl font-medium">
              {passError}
            </div>
          )}

          {passSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Senha alterada com sucesso! Utilize a nova senha nos próximos logins.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                Senha Atual
              </label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Senha atual"
                className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                Nova Senha
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="Mín. 4 dígitos"
                className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Repita a senha"
                className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-[#FF751F] hover:bg-[#e06316] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs flex items-center gap-2 transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Atualizar Senha de Acesso</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. DADOS DE PAGAMENTO & PIX COM PREVIEW DO QR CODE */}
      <form onSubmit={handleSettingsSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-[#BB7F5D]/20 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#BB7F5D]/10">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF751F] flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-[#3D2518]">
                Chave PIX e QR Code Automático
              </h3>
              <p className="text-[11px] text-[#5A3825]">
                O sistema gera dinamicamente o QR Code EMV e Pix Copia e Cola com o valor exato no checkout.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                Chave PIX Oficial (Ex: Celular, CNPJ, Email)
              </label>
              <input
                type="text"
                required
                value={formSettings.pixKey}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, pixKey: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                Tipo da Chave
              </label>
              <input
                type="text"
                required
                value={formSettings.pixKeyType}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, pixKeyType: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                Nome do Titular / Favorecido
              </label>
              <input
                type="text"
                required
                value={formSettings.pixHolderName}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, pixHolderName: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
              />
            </div>
          </div>

          {/* Live Preview QR Code box */}
          {previewQrCode && (
            <div className="mt-4 p-4 bg-orange-50/40 rounded-2xl border border-orange-200/80 flex flex-col sm:flex-row items-center gap-4 text-xs">
              <div className="shrink-0 flex flex-col items-center">
                <img
                  src={previewQrCode}
                  alt="Pré-visualização do QR Code Pix"
                  className="w-24 h-24 object-contain rounded-lg border border-[#BB7F5D]/20 shadow-xs bg-white p-1"
                />
                <span className="text-[9px] font-bold text-[#FF751F] mt-1">Prévia de Teste</span>
              </div>
              <div className="flex-1 space-y-1.5 text-left">
                <div className="font-bold text-[#3D2518] flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>QR Code Gerado e Validado com Sucesso!</span>
                </div>
                <p className="text-[11px] text-[#5A3825]">
                  Seus clientes poderão apontar a câmera ou copiar a chave diretamente no checkout para confirmação instantânea.
                </p>
                <button
                  type="button"
                  onClick={handleCopyPreviewPayload}
                  className="bg-white hover:bg-orange-50 text-[#5A3825] border border-[#BB7F5D]/30 px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedPayload ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPayload ? 'Código Teste Copiado!' : 'Copiar Pix Copia e Cola (Exemplo)'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. AUTOMAÇÃO DE ESTOQUE & AVISOS */}
        <div className="bg-white p-6 rounded-3xl border border-[#BB7F5D]/20 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#BB7F5D]/10">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-[#3D2518]">
                Automação de Estoque & Alertas de Reposição
              </h3>
              <p className="text-[11px] text-[#5A3825]">
                Configure o gatilho mínimo para o painel emitir avisos visuais de estoque baixo e gerar relatórios de reposição.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                Limite para Alerta de Estoque Baixo (unidades por tamanho)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="50"
                  required
                  value={formSettings.lowStockThreshold ?? 2}
                  onChange={(e) =>
                    setFormSettings({
                      ...formSettings,
                      lowStockThreshold: Math.max(0, parseInt(e.target.value) || 0),
                    })
                  }
                  className="w-24 px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none font-bold text-sm"
                />
                <span className="text-[11px] text-[#5A3825]">
                  unidades por tamanho
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-[#5A3825] text-[11px] leading-relaxed">
              <strong>Como funciona:</strong> Quando qualquer tamanho de produto atingir <strong>{formSettings.lowStockThreshold ?? 2} unidades</strong> ou menos, o painel exibirá o aviso visual em destaque e permitirá exportação instantânea da lista de compras.
            </div>
          </div>
        </div>

        {/* 4. DADOS DE ATENDIMENTO, LOJA E HORÁRIOS */}
        <div className="bg-white p-6 rounded-3xl border border-[#BB7F5D]/20 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#BB7F5D]/10">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FF751F] flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-[#3D2518]">
                Atendimento, Endereço & Contatos
              </h3>
              <p className="text-[11px] text-[#5A3825]">
                Informações exibidas no cabeçalho, rodapé e nos botões de contato.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                WhatsApp de Atendimento
              </label>
              <input
                type="text"
                required
                value={formSettings.whatsappNumber}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, whatsappNumber: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                E-mail Institucional
              </label>
              <input
                type="email"
                required
                value={formSettings.contactEmail}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, contactEmail: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                CNPJ da Loja
              </label>
              <input
                type="text"
                required
                value={formSettings.cnpj}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, cnpj: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#5A3825] mb-1">
                Endereço Completo da Loja Física (Ubá/MG)
              </label>
              <input
                type="text"
                required
                value={formSettings.addressFull}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, addressFull: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                Cidade / Estado
              </label>
              <input
                type="text"
                required
                value={formSettings.addressCity}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, addressCity: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                Horário (Segunda a Sexta)
              </label>
              <input
                type="text"
                value={formSettings.scheduleWeek}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, scheduleWeek: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#5A3825] mb-1">
                Horário (Sábado)
              </label>
              <input
                type="text"
                value={formSettings.scheduleSaturday}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, scheduleSaturday: e.target.value })
                }
                className="w-full px-3 py-2 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:border-[#FF751F] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#FF751F] hover:bg-[#e06316] text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Informações da Loja</span>
          </button>
        </div>
      </form>

    </div>
  );
};

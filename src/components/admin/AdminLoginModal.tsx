import React, { useState } from 'react';
import { Lock, X, Key, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AdminLoginModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onSuccess, onClose }) => {
  const { loginAdmin } = useStore();
  const [accessCode, setAccessCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      setErrorMessage('Por favor, informe a senha ou código de acesso.');
      return;
    }

    const ok = loginAdmin(accessCode.trim());
    if (ok) {
      setErrorMessage('');
      onSuccess();
    } else {
      setErrorMessage('Senha incorreta. Utilize a senha configurada.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2B1B12]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-[#BB7F5D]/20 animate-in zoom-in-95 duration-200">
        
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#5A3825] hover:text-[#FF751F] hover:bg-orange-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* HEADER */}
        <div className="p-6 sm:p-8 text-center bg-gradient-to-b from-orange-50/80 to-white border-b border-[#BB7F5D]/15">
          <div className="w-14 h-14 rounded-2xl bg-[#FF751F] text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-orange-500/20">
            <Lock className="w-7 h-7" />
          </div>
          <span className="text-[11px] font-bold text-[#BB7F5D] uppercase tracking-wider bg-orange-100/60 px-2.5 py-0.5 rounded-full inline-block">
            Controle Total • Acesso Master
          </span>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#3D2518] mt-1.5">
            Painel Administrativo
          </h2>
          <p className="text-xs text-[#5A3825] mt-1">
            Digite a senha para gerenciar produtos, estoque, categorias, banners e pedidos.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#3D2518] uppercase tracking-wider">
                Senha de Acesso
              </label>
              <span className="text-[10px] text-[#BB7F5D] font-mono">
                Padrão: Majoca@2026
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={accessCode}
                onChange={(e) => {
                  setAccessCode(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Digite a senha..."
                className="w-full pl-10 pr-10 py-3 text-sm bg-orange-50/20 border border-[#BB7F5D]/30 text-[#3D2518] rounded-xl focus:outline-none focus:border-[#FF751F] focus:bg-white"
                autoFocus
              />
              <Key className="w-4 h-4 text-[#BB7F5D] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BB7F5D] hover:text-[#FF751F]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMessage ? (
              <p className="text-xs text-rose-600 mt-2 font-medium">{errorMessage}</p>
            ) : (
              <p className="text-[11px] text-[#5A3825] mt-2">
                A senha padrão inicial é <strong>Majoca@2026</strong>. Você pode alterá-la nas configurações do painel.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#FF751F] hover:bg-[#e06316] text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Liberar Controle Total</span>
          </button>
        </form>

      </div>
    </div>
  );
};

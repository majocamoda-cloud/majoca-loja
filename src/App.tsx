import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { DynamicSeo } from './components/DynamicSeo';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryGrid } from './components/CategoryGrid';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { SizeGuideModal } from './components/SizeGuideModal';
import { InstitutionalModal } from './components/InstitutionalModal';
import { LgpdBanner } from './components/LgpdBanner';
import { WhatsAppFloating } from './components/WhatsAppFloating';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/admin/AdminPanel';
import { CheckCircle2, AlertCircle, Info, RefreshCw, Trash2 } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMsg: string;
}

class StoreErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMsg: '',
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMsg: error?.message || 'Erro inesperado' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('StoreErrorBoundary interceptou erro:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, errorMsg: '' });
    window.location.reload();
  };

  public handleClearStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FDFBF9] flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl shadow-xl border border-[#BB7F5D]/20 text-center space-y-4">
            <div className="w-14 h-14 bg-orange-100 text-[#FF751F] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="font-heading font-bold text-xl text-[#3D2518]">
              Ops! Algo inesperado aconteceu
            </h2>
            <p className="text-xs text-[#5A3825] leading-relaxed">
              Ocorreu uma pequena instabilidade no carregamento da loja. Não se preocupe, seus dados estão seguros.
            </p>

            {this.state.errorMsg && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-[11px] font-mono text-left break-words max-h-28 overflow-y-auto border border-red-200">
                <strong>Detalhe técnico:</strong> {this.state.errorMsg}
              </div>
            )}

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full bg-[#FF751F] hover:bg-[#e06316] text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recarregar a Loja</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearStorage}
                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 py-2.5 px-4 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors border border-stone-300"
              >
                <Trash2 className="w-4 h-4 text-stone-500" />
                <span>Limpar Dados do Navegador e Recarregar</span>
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ToastContainer: React.FC = () => {
  const { toasts } = useStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`p-3.5 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-right-5 fade-in duration-200 pointer-events-auto ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : toast.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-[#3D2518] text-white border-[#BB7F5D]/50'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

const MainContent: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF9] text-stone-800 font-sans selection:bg-[#FF751F]/20 selection:text-[#FF751F]">
      <DynamicSeo />
      <Header />

      <main className="flex-1 space-y-12 sm:space-y-16 pb-16">
        <HeroBanner />
        <CategoryGrid />
        <ProductCatalog />
      </main>

      <Footer />

      <ProductModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderConfirmationModal />
      <SizeGuideModal />
      <InstitutionalModal />
      <AdminPanel />

      <WhatsAppFloating />
      <LgpdBanner />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <StoreErrorBoundary>
      <StoreProvider>
        <MainContent />
      </StoreProvider>
    </StoreErrorBoundary>
  );
}
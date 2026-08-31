import React, { useState, useRef } from 'react';
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  FileJson,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Cloud,
  CloudDownload,
  CloudUpload,
  HardDrive,
  Clock,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  Package,
  FolderTree,
  ShoppingBag,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { supabase, checkSupabaseHealth, safeSupabaseOperation } from '../../lib/supabase';
import { Product, CategoryInfo, Order, StoreSettings } from '../../types';

export const AdminBackupRestore: React.FC = () => {
  const {
    products,
    categories,
    orders,
    settings,
    restoreData,
    showToast,
  } = useStore();

  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isCheckingCloud, setIsCheckingCloud] = useState(false);
  const [cloudStatus, setCloudStatus] = useState<'idle' | 'connected' | 'error'>('idle');
  const [cloudMessage, setCloudMessage] = useState('');
  
  // File upload & preview state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedBackup, setParsedBackup] = useState<{
    version?: string;
    exportDate?: string;
    products?: Product[];
    categories?: CategoryInfo[];
    orders?: Order[];
    settings?: StoreSettings;
    isSupabaseDirect?: boolean;
  } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [restoreProgress, setRestoreProgress] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Test Supabase Connection & Health
  const handleTestCloudConnection = async () => {
    setIsCheckingCloud(true);
    setCloudStatus('idle');
    setCloudMessage('');

    try {
      const health = await checkSupabaseHealth(3500);

      if (health.online && health.status === 'healthy') {
        setCloudStatus('connected');
        setCloudMessage(`Conexão ativa e respondendo! (${health.latencyMs}ms)`);
        showToast('Conexão com Supabase verificada com sucesso!', 'success');
      } else {
        setCloudStatus('error');
        setCloudMessage(
          health.message || 'Banco do Supabase retornou status unhealthy / inacessível. O modo de segurança local está ativo.'
        );
        showToast('Supabase indisponível. A loja está operando com persistência LocalStorage + Backup JSON.', 'info');
      }
    } catch (err: any) {
      setCloudStatus('error');
      setCloudMessage(`Falha de conexão: ${err?.message || 'Servidor inacessível'}. Modo local ativo.`);
      showToast('Supabase indisponível no momento.', 'info');
    } finally {
      setIsCheckingCloud(false);
    }
  };

  // 1. EXPORT BACKUP
  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      // 1. Attempt to fetch latest products from Supabase with safe fallback
      let cloudProducts: any[] = [];
      try {
        const { data, fromFallback } = await safeSupabaseOperation(
          async () => {
            const res = await supabase.from('produtos').select('*');
            if (res.error) throw res.error;
            return res.data || [];
          },
          [],
          2500
        );
        if (!fromFallback && data && data.length > 0) {
          cloudProducts = data;
        }
      } catch (err) {
        console.warn('Exportação fallback local:', err);
      }

      const now = new Date();
      const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const dateFormatted = now.toLocaleString('pt-BR');

      const backupPayload = {
        metadata: {
          appName: 'Majoca Moda Infantojuvenil',
          version: '2.0',
          exportDate: dateFormatted,
          isoDate: now.toISOString(),
          description: 'Backup completo da base de dados (Catálogo, Categorias, Pedidos, Configurações e Supabase)',
        },
        counts: {
          products: products.length,
          categories: categories.length,
          orders: orders.length,
          supabaseRows: cloudProducts.length,
        },
        products: products,
        categories: categories,
        orders: orders,
        settings: settings,
        supabaseSnapshot: cloudProducts.length > 0 ? cloudProducts : undefined,
      };

      const jsonString = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `majoca_backup_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Backup exportado e baixado com sucesso!', 'success');
    } catch (err: any) {
      console.error('Erro ao exportar backup:', err);
      showToast(`Erro ao exportar backup: ${err?.message || 'Falha inesperada'}`, 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // 2. READ & VALIDATE UPLOADED JSON FILE
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    processSelectedFile(file);
  };

  const processSelectedFile = (file?: File) => {
    setFileError(null);
    setParsedBackup(null);

    if (!file) return;

    if (!file.name.endsWith('.json') && file.type !== 'application/json') {
      setFileError('O arquivo selecionado deve ser no formato .JSON.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Check format: full backup object or raw products array
        let extractedProducts: Product[] = [];
        let extractedCategories: CategoryInfo[] = [];
        let extractedOrders: Order[] = [];
        let extractedSettings: StoreSettings | undefined = undefined;
        let exportDate = '';
        let version = '';

        if (Array.isArray(parsed)) {
          // Direct array of products
          extractedProducts = parsed;
          exportDate = 'Arquivo de lista de produtos direta';
        } else if (typeof parsed === 'object' && parsed !== null) {
          extractedProducts = Array.isArray(parsed.products)
            ? parsed.products
            : (Array.isArray(parsed.produtos) ? parsed.produtos : []);
          extractedCategories = Array.isArray(parsed.categories)
            ? parsed.categories
            : (Array.isArray(parsed.categorias) ? parsed.categorias : []);
          extractedOrders = Array.isArray(parsed.orders)
            ? parsed.orders
            : (Array.isArray(parsed.pedidos) ? parsed.pedidos : []);
          extractedSettings = parsed.settings || parsed.configuracoes;
          exportDate = parsed.metadata?.exportDate || parsed.exportDate || 'Data não especificada';
          version = parsed.metadata?.version || '1.0';
        }

        if (extractedProducts.length === 0 && extractedCategories.length === 0 && extractedOrders.length === 0 && !extractedSettings) {
          setFileError('O arquivo JSON não contém estruturas de dados válidas da Majoca Moda (produtos, categorias ou configurações).');
          return;
        }

        setParsedBackup({
          version,
          exportDate,
          products: extractedProducts,
          categories: extractedCategories,
          orders: extractedOrders,
          settings: extractedSettings,
        });
      } catch (err: any) {
        setFileError(`Arquivo JSON corrompido ou formato inválido: ${err?.message || 'Erro de sintaxe'}`);
      }
    };

    reader.onerror = () => {
      setFileError('Erro ao ler o arquivo selecionado.');
    };

    reader.readAsText(file);
  };

  // 3. EXECUTE RESTORE
  const handleExecuteRestore = async () => {
    if (!parsedBackup) return;

    const confirmRestore = window.confirm(
      `ATENÇÃO: Deseja realmente restaurar os dados do arquivo?\n\n` +
      `• ${parsedBackup.products?.length || 0} Produtos\n` +
      `• ${parsedBackup.categories?.length || 0} Categorias\n` +
      `• ${parsedBackup.orders?.length || 0} Pedidos\n\n` +
      `Os dados atuais da loja e do Supabase serão sincronizados com as informações deste backup.`
    );

    if (!confirmRestore) return;

    setIsRestoring(true);
    setRestoreProgress('Iniciando restauração dos dados...');

    try {
      const result = await restoreData({
        products: parsedBackup.products,
        categories: parsedBackup.categories,
        orders: parsedBackup.orders,
        settings: parsedBackup.settings,
      });

      if (result.success) {
        setRestoreProgress('Dados restaurados com sucesso!');
        showToast('Backup restaurado e sincronizado com sucesso!', 'success');
        // Reset file state
        setTimeout(() => {
          setSelectedFile(null);
          setParsedBackup(null);
          setRestoreProgress('');
          if (fileInputRef.current) fileInputRef.current.value = '';
        }, 2000);
      } else {
        setFileError(result.message);
        showToast(result.message, 'error');
      }
    } catch (err: any) {
      console.error('Erro na restauração:', err);
      setFileError(`Erro ao restaurar dados: ${err?.message || 'Falha desconhecida'}`);
      showToast('Falha na restauração do backup.', 'error');
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. HEADER SECTION */}
      <div className="bg-gradient-to-r from-orange-500 to-[#FF751F] text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold mb-3 tracking-wide">
            <Database className="w-3.5 h-3.5" />
            <span>Gerenciamento de Dados & Segurança</span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-white mb-2">
            Backup & Restauração Completa
          </h2>
          <p className="text-orange-50 text-xs sm:text-sm leading-relaxed">
            Exporte cópias de segurança em formato JSON com todos os produtos, fotos, categorias, pedidos e configurações. Restaure facilmente seus dados na nuvem (Supabase) e no navegador.
          </p>
        </div>

        {/* Ambient Decorative Icons */}
        <Cloud className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10 pointer-events-none" />
      </div>

      {/* 2. CLOUD CONNECTION STATUS BAR */}
      <div className="bg-white p-5 rounded-3xl border border-[#BB7F5D]/20 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-[#FF751F] shrink-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading font-bold text-sm text-[#3D2518]">
                Nuvem Supabase (PostgreSQL)
              </h3>
              {cloudStatus === 'connected' && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Conectado (Online)
                </span>
              )}
              {cloudStatus === 'error' && (
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" /> Modo Local Ativo (Resiliente)
                </span>
              )}
              {cloudStatus === 'idle' && (
                <span className="bg-stone-100 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-stone-500" /> LocalStorage + Supabase
                </span>
              )}
            </div>
            <p className="text-xs text-[#BB7F5D] mt-0.5">
              {cloudMessage || 'Persistência local ativada: salvar, alterar e excluir produtos funciona 100% mesmo se a nuvem estiver indisponível.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleTestCloudConnection}
          disabled={isCheckingCloud}
          className="w-full sm:w-auto px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer border border-stone-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isCheckingCloud ? 'animate-spin text-[#FF751F]' : ''}`} />
          <span>{isCheckingCloud ? 'Verificando...' : 'Testar Conexão'}</span>
        </button>
      </div>

      {/* 3. TWO CARDS GRID: EXPORT & RESTORE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: EXPORTAR BACKUP */}
        <div className="bg-white p-6 rounded-3xl border border-[#BB7F5D]/20 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CloudDownload className="w-6 h-6" />
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                Download JSON
              </span>
            </div>

            <h3 className="font-heading font-extrabold text-lg text-[#3D2518] mb-1">
              Exportar Backup (.JSON)
            </h3>
            <p className="text-xs text-[#5A3825] leading-relaxed mb-6">
              Gera um arquivo completo com todos os registros atuais da sua loja prontos para arquivamento ou migração.
            </p>

            {/* Current Metrics in Store */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
                <div className="flex items-center gap-2 text-[#FF751F] font-bold text-xs mb-1">
                  <Package className="w-3.5 h-3.5" />
                  <span>Produtos</span>
                </div>
                <div className="text-xl font-heading font-black text-[#3D2518]">
                  {products.length}
                </div>
                <span className="text-[10px] text-stone-500">peças com fotos & estoque</span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs mb-1">
                  <FolderTree className="w-3.5 h-3.5" />
                  <span>Categorias</span>
                </div>
                <div className="text-xl font-heading font-black text-[#3D2518]">
                  {categories.length}
                </div>
                <span className="text-[10px] text-stone-500">seções & subcategorias</span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mb-1">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Pedidos</span>
                </div>
                <div className="text-xl font-heading font-black text-[#3D2518]">
                  {orders.length}
                </div>
                <span className="text-[10px] text-stone-500">histórico de vendas</span>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xs mb-1">
                  <SettingsIcon className="w-3.5 h-3.5" />
                  <span>Configurações</span>
                </div>
                <div className="text-xl font-heading font-black text-[#3D2518]">
                  100%
                </div>
                <span className="text-[10px] text-stone-500">Pix, frete, contatos</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExportBackup}
            disabled={isExporting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 active:scale-[0.99]"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Gerando Arquivo JSON...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Baixar Backup Completo (.JSON)</span>
              </>
            )}
          </button>
        </div>

        {/* CARD 2: IMPORTAR / RESTAURAR */}
        <div className="bg-white p-6 rounded-3xl border border-[#BB7F5D]/20 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF751F] flex items-center justify-center">
                <CloudUpload className="w-6 h-6" />
              </div>
              <span className="bg-orange-50 text-[#FF751F] text-xs font-bold px-3 py-1 rounded-full border border-[#FF751F]/30">
                Importação & Sincronização
              </span>
            </div>

            <h3 className="font-heading font-extrabold text-lg text-[#3D2518] mb-1">
              Importar / Restaurar Backup (.JSON)
            </h3>
            <p className="text-xs text-[#5A3825] leading-relaxed mb-4">
              Selecione ou arraste um arquivo JSON de backup previamente exportado para recuperar todos os produtos e configurações.
            </p>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#BB7F5D]/30 hover:border-[#FF751F] bg-orange-50/20 hover:bg-orange-50/40 transition-colors rounded-2xl p-5 text-center cursor-pointer mb-4"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
              <FileJson className="w-8 h-8 text-[#FF751F] mx-auto mb-2 opacity-80" />
              <p className="text-xs font-bold text-[#3D2518]">
                {selectedFile ? selectedFile.name : 'Clique para selecionar ou arraste o arquivo .JSON aqui'}
              </p>
              <span className="text-[10px] text-stone-500 mt-1 block">
                Tamanho máximo recomendado: 25MB
              </span>
            </div>

            {/* Error banner if any */}
            {fileError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{fileError}</span>
              </div>
            )}

            {/* Parsed summary preview */}
            {parsedBackup && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl mb-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Arquivo verificado e pronto para restaurar!</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px] text-emerald-900 pt-1">
                  <div className="bg-white/80 p-2 rounded-xl border border-emerald-100 text-center">
                    <strong className="block text-sm text-emerald-700">{parsedBackup.products?.length || 0}</strong>
                    <span>Produtos</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-emerald-100 text-center">
                    <strong className="block text-sm text-emerald-700">{parsedBackup.categories?.length || 0}</strong>
                    <span>Categorias</span>
                  </div>
                  <div className="bg-white/80 p-2 rounded-xl border border-emerald-100 text-center">
                    <strong className="block text-sm text-emerald-700">{parsedBackup.orders?.length || 0}</strong>
                    <span>Pedidos</span>
                  </div>
                </div>
                {parsedBackup.exportDate && (
                  <p className="text-[10px] text-emerald-800 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-emerald-600" />
                    <span>Data de criação: {parsedBackup.exportDate}</span>
                  </p>
                )}
              </div>
            )}

            {/* Progress indicator */}
            {restoreProgress && (
              <div className="p-3 bg-orange-50 border border-[#FF751F]/30 text-[#3D2518] rounded-2xl text-xs flex items-center gap-2 mb-4">
                <RefreshCw className="w-4 h-4 text-[#FF751F] animate-spin" />
                <span className="font-medium">{restoreProgress}</span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleExecuteRestore}
            disabled={!parsedBackup || isRestoring}
            className="w-full bg-[#FF751F] hover:bg-[#e06316] text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
          >
            {isRestoring ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Restaurando & Sincronizando...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Importar / Restaurar Backup (.JSON)</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* 4. SECURITY & BEST PRACTICES NOTICE */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-5 sm:p-6 text-xs text-[#5A3825] space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>Boas Práticas de Segurança e Estoque</span>
        </div>
        <ul className="list-disc list-inside space-y-1.5 text-amber-950/80 pl-1">
          <li>Recomendamos exportar um arquivo de backup antes de realizar alterações em lote ou grandes promoções.</li>
          <li>Ao restaurar um backup, os produtos são atualizados no banco de dados Supabase e no armazenamento local seguro do navegador.</li>
          <li>Você pode guardar os arquivos JSON baixados no Google Drive, pendrive ou computador para histórico contábil.</li>
        </ul>
      </div>

    </div>
  );
};

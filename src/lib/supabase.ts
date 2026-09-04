import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_SUPABASE_URL = 'https://mlmibaizghdmnxgrqjts.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_PWp5CEv9Zfg2nQ0LYIruYw_nrNFgo2t';

// Recupera credenciais com suporte a configuração personalizada no LocalStorage
export function getActiveSupabaseConfig(): { url: string; anonKey: string; isCustom: boolean } {
  let url = DEFAULT_SUPABASE_URL;
  let anonKey = DEFAULT_SUPABASE_ANON_KEY;
  let isCustom = false;

  if (typeof window !== 'undefined') {
    try {
      const customUrl = localStorage.getItem('majoca_custom_supabase_url');
      const customKey = localStorage.getItem('majoca_custom_supabase_key');
      if (customUrl && customUrl.trim().startsWith('http')) {
        url = customUrl.trim();
        isCustom = true;
      }
      if (customKey && customKey.trim().length > 10) {
        anonKey = customKey.trim();
        isCustom = true;
      }
    } catch {
      // Ignora erro de acesso ao localStorage
    }
  }

  return { url, anonKey, isCustom };
}

// Criação do cliente com configurações defensivas
const initialConfig = getActiveSupabaseConfig();
export let SUPABASE_URL = initialConfig.url;
export let SUPABASE_ANON_KEY = initialConfig.anonKey;

export let supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'x-application-name': 'majoca-moda-web',
    },
  },
});

/**
 * Atualiza o cliente Supabase em tempo de execução quando o administrador salva novas credenciais
 */
export function reconfigureSupabaseClient(newUrl?: string, newKey?: string) {
  if (typeof window !== 'undefined') {
    if (newUrl) localStorage.setItem('majoca_custom_supabase_url', newUrl.trim());
    if (newKey) localStorage.setItem('majoca_custom_supabase_key', newKey.trim());
  }
  const config = getActiveSupabaseConfig();
  SUPABASE_URL = config.url;
  SUPABASE_ANON_KEY = config.anonKey;

  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'x-application-name': 'majoca-moda-web',
      },
    },
  });

  return supabase;
}

/**
 * Script SQL para desativar a verificação de RLS ou permitir leitura pública
 */
export const SUPABASE_RLS_FIX_SQL = `-- ===============================================================
-- SCRIPT DE AJUSTE DE RLS (SUPABASE) - LOJA MAJOCA MODA
-- Execute este script no menu "SQL Editor" do painel Supabase
-- ===============================================================

-- 1. OPÇÃO RECOMENDADA: Desativar verificação de RLS na tabela de produtos
ALTER TABLE IF EXISTS produtos DISABLE ROW LEVEL SECURITY;

-- 2. CASO PREFIRA MANTER RLS ATIVADO, LIBERE O ACESSO PÚBLICO:
ALTER TABLE IF EXISTS produtos ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas conflitantes se existirem
DROP POLICY IF EXISTS "Acesso público leitura produtos" ON produtos;
DROP POLICY IF EXISTS "Acesso público escrita produtos" ON produtos;
DROP POLICY IF EXISTS "Public Select Produtos" ON produtos;

-- Cria política permitindo leitura pública por qualquer visitante (Anon / Web):
CREATE POLICY "Acesso público leitura produtos" 
ON produtos 
FOR SELECT 
USING (true);

-- Cria política permitindo inserção, atualização e exclusão pelo painel:
CREATE POLICY "Acesso público escrita produtos" 
ON produtos 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 3. Desativar RLS também para categorias e pedidos (opcional):
ALTER TABLE IF EXISTS categorias DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS configuracoes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS pedidos DISABLE ROW LEVEL SECURITY;`;

/**
 * Interface com resultado detalhado de saúde e RLS
 */
export interface SupabaseHealthResult {
  online: boolean;
  status: 'healthy' | 'rls_restricted' | 'unhealthy' | 'offline';
  message: string;
  latencyMs?: number;
  isRlsRestricted: boolean;
  isFallbackActive: boolean;
  sqlFix: string;
  details?: string;
}

/**
 * Identifica se uma mensagem ou código de erro está relacionado ao RLS do PostgreSQL/Supabase
 */
export function isRlsRelatedError(error: any): boolean {
  if (!error) return false;
  const msg = String(error.message || error.details || error.hint || '').toLowerCase();
  const code = String(error.code || '');
  const status = Number(error.status || 0);

  return (
    code === '42501' || // insufficient_privilege / RLS violation
    msg.includes('row-level security') ||
    msg.includes('row level security') ||
    msg.includes('rls') ||
    msg.includes('permission denied') ||
    msg.includes('violates row-level security policy') ||
    msg.includes('not authorized') ||
    status === 401 ||
    status === 403
  );
}

/**
 * Verifica se a conexão com o Supabase está ativa e se há bloqueio de RLS com timeout seguro
 */
export async function checkSupabaseHealth(timeoutMs = 3500): Promise<SupabaseHealthResult> {
  const startTime = Date.now();
  try {
    const fetchPromise = supabase
      .from('produtos')
      .select('id, name, preco, price', { count: 'exact' })
      .limit(1);

    const timeoutPromise = new Promise<{ data: null; error: { message: string; code?: string } }>((_, reject) =>
      setTimeout(() => reject(new Error('Tempo limite de conexão excedido (Timeout).')), timeoutMs)
    );

    const result = await Promise.race([fetchPromise, timeoutPromise]);
    const latencyMs = Date.now() - startTime;

    if (result && 'error' in result && result.error) {
      const isRls = isRlsRelatedError(result.error);
      const isKeyProblem = String(result.error.message || '').includes('API key');

      if (isRls || isKeyProblem) {
        return {
          online: false,
          status: 'rls_restricted',
          isRlsRestricted: true,
          isFallbackActive: true,
          message: isKeyProblem
            ? 'Aviso de autenticação/chave no Supabase. Fallback automático ativado: o catálogo local/backup está sendo exibido para os visitantes.'
            : 'Bloqueio de RLS detectado no Supabase. O fallback automático está ativo e os produtos do backup/estado inicial estão sendo exibidos normalmente.',
          latencyMs,
          sqlFix: SUPABASE_RLS_FIX_SQL,
          details: result.error.message,
        };
      }

      return {
        online: false,
        status: 'unhealthy',
        isRlsRestricted: false,
        isFallbackActive: true,
        message: `Servidor acessível, mas retornou status: ${result.error.message || 'Verifique estrutura das tabelas'}. Modo de segurança local ativo.`,
        latencyMs,
        sqlFix: SUPABASE_RLS_FIX_SQL,
        details: result.error.message,
      };
    }

    return {
      online: true,
      status: 'healthy',
      isRlsRestricted: false,
      isFallbackActive: false,
      message: `Conexão ativa e saudável (${latencyMs}ms). Tabela produtos acessível publicamente sem bloqueios de RLS.`,
      latencyMs,
      sqlFix: SUPABASE_RLS_FIX_SQL,
    };
  } catch (err: any) {
    const isRls = isRlsRelatedError(err);
    return {
      online: false,
      status: isRls ? 'rls_restricted' : 'offline',
      isRlsRestricted: isRls,
      isFallbackActive: true,
      message: err?.message || 'Banco de dados inacessível ou pausado. O catálogo do backup/estado inicial está ativo para todos os visitantes.',
      sqlFix: SUPABASE_RLS_FIX_SQL,
      details: err?.message,
    };
  }
}

/**
 * Executa uma operação no Supabase de forma segura com timeout e fallback garantido
 */
export async function safeSupabaseOperation<T>(
  operation: () => PromiseLike<T> | Promise<T>,
  fallbackValue: T,
  timeoutMs = 4000
): Promise<{ data: T; fromFallback: boolean; isRlsBlocked?: boolean; error?: any }> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase operation timed out')), timeoutMs)
    );

    const data = await Promise.race([Promise.resolve(operation()), timeoutPromise]);
    return { data, fromFallback: false };
  } catch (error: any) {
    const isRls = isRlsRelatedError(error);
    if (isRls) {
      console.warn('[Supabase RLS Detectado] Ativando fallback automático para catálogo inicial/backup:', error?.message);
    } else {
      console.warn('[Supabase Fallback Ativo] Operando com dados locais/iniciais:', error?.message);
    }
    return { data: fallbackValue, fromFallback: true, isRlsBlocked: isRls, error };
  }
}

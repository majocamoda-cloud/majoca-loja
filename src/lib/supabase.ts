import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://mlmibaizghdmnxgrqjts.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_PWp5CEv9Zfg2nQ0LYIruYw_nrNFgo2t';

// Criação do cliente com configurações defensivas
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
 * Interface com resultado de verificação de saúde da conexão
 */
export interface SupabaseHealthResult {
  online: boolean;
  status: 'healthy' | 'unhealthy' | 'offline';
  message: string;
  latencyMs?: number;
}

/**
 * Verifica se a conexão com o Supabase está ativa e saudável com timeout
 */
export async function checkSupabaseHealth(timeoutMs = 3500): Promise<SupabaseHealthResult> {
  const startTime = Date.now();
  try {
    const fetchPromise = supabase
      .from('produtos')
      .select('id', { count: 'exact', head: true })
      .limit(1);

    const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((_, reject) =>
      setTimeout(() => reject(new Error('Tempo limite de conexão excedido (Timeout).')), timeoutMs)
    );

    const result = await Promise.race([fetchPromise, timeoutPromise]);
    const latencyMs = Date.now() - startTime;

    if (result && 'error' in result && result.error) {
      // Caso a tabela ainda não exista ou haja erro de permissão
      return {
        online: false,
        status: 'unhealthy',
        message: `Servidor acessível, mas retornou aviso: ${result.error.message || 'Verifique permissões RLS'}`,
        latencyMs,
      };
    }

    return {
      online: true,
      status: 'healthy',
      message: `Conexão ativa e saudável (${latencyMs}ms).`,
      latencyMs,
    };
  } catch (err: any) {
    return {
      online: false,
      status: 'offline',
      message: err?.message || 'Banco de dados inacessível ou pausado. Operando em modo de segurança local.',
    };
  }
}

/**
 * Executa uma operação no Supabase de forma segura com timeout e fallback
 */
export async function safeSupabaseOperation<T>(
  operation: () => PromiseLike<T> | Promise<T>,
  fallbackValue: T,
  timeoutMs = 4000
): Promise<{ data: T; fromFallback: boolean; error?: any }> {
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase operation timed out')), timeoutMs)
    );

    const data = await Promise.race([Promise.resolve(operation()), timeoutPromise]);
    return { data, fromFallback: false };
  } catch (error) {
    console.warn('Supabase operation fell back to local storage:', error);
    return { data: fallbackValue, fromFallback: true, error };
  }
}

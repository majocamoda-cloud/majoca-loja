import { ProductColor } from '../types';

/**
 * Intelligent color dictionary mapping Portuguese color names to aesthetic hex tones.
 */
const PORTUGUESE_COLOR_MAP: { [key: string]: string } = {
  // Terracota & Laranjas (Majoca Brand)
  terracota: '#BB7F5D',
  laranja: '#FF751F',
  'laranja majoca': '#FF751F',
  'terracota majoca': '#BB7F5D',
  coral: '#FF6F61',
  pessego: '#FFCBA4',
  pêssego: '#FFCBA4',
  ferrugem: '#B7410E',
  tijolo: '#C05A46',

  // Rosas
  rosa: '#F472B6',
  'rosa bebe': '#FBCFE8',
  'rosa bebê': '#FBCFE8',
  'rosa claro': '#FCE7F3',
  'rosa pink': '#EC4899',
  pink: '#EC4899',
  fucsia: '#D946EF',
  fúcsia: '#D946EF',
  magenta: '#E11D48',
  chiclete: '#FB7185',
  rose: '#FDA4AF',
  rosé: '#FDA4AF',
  salmao: '#FA8072',
  salmão: '#FA8072',

  // Azuis
  azul: '#3B82F6',
  'azul bebe': '#BFDBFE',
  'azul bebê': '#BFDBFE',
  'azul claro': '#93C5FD',
  'azul marinho': '#1E3A8A',
  marinho: '#1E3A8A',
  'azul royal': '#1D4ED8',
  royal: '#1D4ED8',
  'azul turquesa': '#06B6D4',
  turquesa: '#06B6D4',
  jeans: '#4B6B94',
  'azul escuro': '#1E293B',
  indigo: '#4F46E5',
  índigo: '#4F46E5',
  celeste: '#7DD3FC',

  // Verdes
  verde: '#22C55E',
  'verde agua': '#6EE7B7',
  'verde água': '#6EE7B7',
  'verde militar': '#4D5D43',
  militar: '#4D5D43',
  menta: '#A7F3D0',
  'verde menta': '#A7F3D0',
  musgo: '#3F6212',
  oliva: '#65A30D',
  'verde bandeira': '#15803D',
  lima: '#84CC16',
  'verde lima': '#84CC16',

  // Amarelos & Dourados
  amarelo: '#FACC15',
  'amarelo bebe': '#FEF08A',
  'amarelo bebê': '#FEF08A',
  'amarelo claro': '#FEF9C3',
  mostarda: '#CA8A04',
  dourado: '#EAB308',
  ouro: '#EAB308',
  canario: '#FDE047',
  canário: '#FDE047',

  // Vermelhos & Vinhos
  vermelho: '#EF4444',
  'vermelho cereja': '#DC2626',
  cereja: '#DC2626',
  vinho: '#881337',
  bordo: '#831843',
  bordô: '#831843',
  marsala: '#6B2D5C',
  carmesim: '#991B1B',

  // Roxos & Lilases
  roxo: '#8B5CF6',
  lilas: '#C4B5FD',
  lilás: '#C4B5FD',
  lavanda: '#DDD6FE',
  violeta: '#7C3AED',
  uva: '#581C87',
  ameixa: '#4A0E4E',

  // Neutros & Tons Terrosos
  branco: '#FFFFFF',
  'off white': '#FAF9F6',
  'off-white': '#FAF9F6',
  offwhite: '#FAF9F6',
  preto: '#18181B',
  cinza: '#9CA3AF',
  'cinza mescla': '#9CA3AF',
  mescla: '#9CA3AF',
  chumbo: '#374151',
  'cinza claro': '#E5E7EB',
  bege: '#E7D7C1',
  nude: '#EED9C4',
  cru: '#F5F5DC',
  areia: '#E6D7B9',
  caramelo: '#A36838',
  marrom: '#78350F',
  cafe: '#451A03',
  café: '#451A03',
  creme: '#FEF3C7',
  marfim: '#FFFFF0',

  // Estampados e Especiais
  estampado: '#EC4899',
  'rosa estampado': '#F472B6',
  'azul estampado': '#3B82F6',
  'azul e branco': '#3B82F6',
  'vermelho e branco': '#EF4444',
  'preto e branco': '#18181B',
  multicolorido: '#FF751F',
  colorido: '#F59E0B',
  floral: '#FB7185',
  listrado: '#4B5563',
  xadrez: '#B91C1C',
  poa: '#F43F5E',
  poá: '#F43F5E',
  tie_dye: '#8B5CF6',
};

/**
 * Finds best matching hex for a given Portuguese color text string.
 */
export function getFriendlyColorHex(colorName: string, fallbackHex = '#FF751F'): string {
  if (!colorName || typeof colorName !== 'string') return fallbackHex;
  const clean = colorName.trim().toLowerCase();

  // Exact match
  if (PORTUGUESE_COLOR_MAP[clean]) {
    return PORTUGUESE_COLOR_MAP[clean];
  }

  // Substring match
  for (const [key, hex] of Object.entries(PORTUGUESE_COLOR_MAP)) {
    if (clean.includes(key)) {
      return hex;
    }
  }

  // Fallback to Majoca Brand Orange or Terracota based on hash
  const hash = clean.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const fallbacks = ['#BB7F5D', '#FF751F', '#3D2518', '#E67E22', '#D35400', '#C0392B'];
  return fallbacks[hash % fallbacks.length];
}

/**
 * Parses user free-text string (e.g. "Azul escuro, Rosa estampado, Vermelho") into ProductColor array
 */
export function parseColorTextToProductColors(text: string): ProductColor[] {
  if (!text || typeof text !== 'string') return [];

  // Split by comma, semicolon, slash, or newline
  const rawParts = text.split(/[,;\n/]+/);
  const colors: ProductColor[] = [];
  const seenNames = new Set<string>();

  for (const raw of rawParts) {
    const trimmed = raw.trim();
    if (trimmed.length > 0) {
      const lower = trimmed.toLowerCase();
      if (!seenNames.has(lower)) {
        seenNames.add(lower);
        colors.push({
          name: trimmed,
          hex: getFriendlyColorHex(trimmed),
        });
      }
    }
  }

  return colors;
}

/**
 * Popular quick-selection color suggestions in Portuguese
 */
export const QUICK_COLOR_SUGGESTIONS = [
  'Terracota Majoca',
  'Laranja Majoca',
  'Azul Marinho',
  'Azul Bebê',
  'Rosa Bebê',
  'Rosa Pink',
  'Rosa Estampado',
  'Vermelho',
  'Branco',
  'Off-White',
  'Preto',
  'Amarelo',
  'Verde Água',
  'Verde Militar',
  'Lilás',
  'Cinza Mescla',
  'Bege / Cru',
  'Multicolorido / Estampado',
];

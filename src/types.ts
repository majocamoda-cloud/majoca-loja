export type AgeGroup = 'bebe' | 'infantil' | 'juvenil' | 'acessorios';

export type GenderCategory = 'menina' | 'menino' | 'unissex' | 'todos';

export type ProductSize = 
  | 'RN' | 'P' | 'M' | 'G' | 'GG'
  | '01' | '02' | '03' | '04' | '06' | '08' | '10'
  | '12' | '14' | '16' | '18'
  | 'Único';

export const ORDERED_SIZES: ProductSize[] = [
  'RN', 'P', 'M', 'G', 'GG',
  '01', '02', '03', '04', '06', '08', '10',
  '12', '14', '16', '18',
  'Único'
];

export const sortSizesByOrder = <T extends { size: ProductSize }>(sizes: T[]): T[] => {
  return [...sizes].sort((a, b) => {
    const idxA = ORDERED_SIZES.indexOf(a.size);
    const idxB = ORDERED_SIZES.indexOf(b.size);
    const valA = idxA === -1 ? 999 : idxA;
    const valB = idxB === -1 ? 999 : idxB;
    return valA - valB;
  });
};

export interface SizeStock {
  size: ProductSize;
  stock: number;
}

export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  category: AgeGroup;
  subcategory: GenderCategory;
  subCategoryName?: string;
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  composition: string;
  sizes: SizeStock[];
  colors?: ProductColor[];
  weight?: string;
  season?: string;
  sizeRecommendation?: string;
  featured?: boolean;
  isNew?: boolean;
  sku: string;
}

export interface CategoryInfo {
  id: string;
  name: string;
  slug: string;
  ageGroup: AgeGroup;
  gender?: GenderCategory;
  description: string;
  image: string;
  tag: string;
  ageRange?: string;
  subcategories?: string[];
}

export interface CartItem {
  product: Product;
  selectedSize: ProductSize;
  selectedColor?: string;
  quantity: number;
}

export type DeliveryMethod = 'retirada_uba' | 'entrega_uba' | 'envio_calcular';

export type PaymentMethod = 'pix' | 'ton_cartao';

export type OrderStatus = 
  | 'Aguardando pagamento via PIX'
  | 'Aguardando envio do link TON'
  | 'Pago / Em separação'
  | 'Pronto para Retirada em Ubá'
  | 'Enviado / Em trânsito'
  | 'Entregue / Concluído'
  | 'Cancelado';

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  cpf?: string;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    complement?: string;
    city: string;
    state: string;
    cep: string;
  };
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  customer: CustomerInfo;
  items: CartItem[];
  subtotal: number;
  deliveryMethod: DeliveryMethod;
  deliveryFee: number;
  deliveryEstimate: string;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  pixKey?: string;
  paymentNotes?: string;
}

export interface StoreSettings {
  storeName: string;
  topAnnouncement: string;
  heroTitle: string;
  heroSubtitle: string;
  heroButtonPrimaryText: string;
  heroButtonSecondaryText: string;
  heroImage: string;
  whatsappNumber: string;
  pixKey: string;
  pixKeyType: string;
  pixHolderName: string;
  pixBank: string;
  contactEmail: string;
  addressFull: string;
  addressCity: string;
  cnpj: string;
  scheduleWeek: string;
  scheduleSaturday: string;
  minOrderValue?: number;
  lowStockThreshold?: number;
}

export interface FilterState {
  search: string;
  category: AgeGroup | 'todas';
  subcategory: GenderCategory | 'todas';
  subCategoryName: string | 'todas';
  season: string | 'todas';
  size: ProductSize | 'todos';
  sortBy: 'destaques' | 'recentes' | 'menor_preco' | 'maior_preco';
}

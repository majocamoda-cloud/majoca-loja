import { CategoryInfo, Order, Product, StoreSettings } from '../types';

export const initialSettings: StoreSettings = {
  storeName: 'Majoca Moda',
  topAnnouncement: 'Peças selecionadas com carinho para vestir bebês, crianças e adolescentes.',
  heroTitle: 'Dos primeiros passos ao estilo próprio.',
  heroSubtitle: 'A Majoca Moda acompanha todas as fases do RN ao 18 anos, do bebê ao estilo único da juventude.',
  heroButtonPrimaryText: 'Ver novidades',
  heroButtonSecondaryText: 'Explorar categorias',
  heroImage: '',
  whatsappNumber: '(32) 99928-2917',
  pixKey: '(32) 98702-2878',
  pixKeyType: 'Telefone Celular',
  pixHolderName: 'Majoca Moda Infanto-Juvenil',
  pixBank: 'Instituição Bancária Autorizada',
  contactEmail: 'majocamoda@gmail.com',
  addressFull: 'Av. Elpidia da Silva Fagundes, 409, Térreo, Santa Edwiges, Ubá/MG',
  addressCity: 'Ubá - MG',
  cnpj: '66.570.851/0001-88',
  scheduleWeek: 'Seg a Sex: 13h às 19h',
  scheduleSaturday: 'Sábado: 10h às 20h',
  minOrderValue: 0,
  lowStockThreshold: 2,
};

export const initialCategories: CategoryInfo[] = [];

export const initialProducts: Product[] = [];

export const initialOrders: Order[] = [];

export const sizeGuideData = [
  {
    category: 'Bebê (0 a 24 Meses)',
    items: [
      { size: 'RN (Recém-Nascido)', age: '0 a 1 mês', height: 'Até 52 cm', weight: 'Até 4 kg' },
      { size: 'P', age: '1 a 3 meses', height: '52 a 60 cm', weight: '4 a 6 kg' },
      { size: 'M', age: '3 a 6 meses', height: '60 a 67 cm', weight: '6 a 8 kg' },
      { size: 'G', age: '6 a 9 meses', height: '67 a 72 cm', weight: '8 a 9.5 kg' },
      { size: 'GG', age: '9 a 12 meses', height: '72 a 77 cm', weight: '9.5 a 11 kg' },
    ],
  },
  {
    category: 'Infantil (1 a 10 Anos)',
    items: [
      { size: '01', age: '12 a 18 meses', height: '77 a 82 cm', chest: '50 cm', waist: '48 cm' },
      { size: '02', age: '2 anos', height: '82 a 88 cm', chest: '52 cm', waist: '50 cm' },
      { size: '03', age: '3 anos', height: '88 a 98 cm', chest: '54 cm', waist: '52 cm' },
      { size: '04', age: '4 anos', height: '98 a 105 cm', chest: '56 cm', waist: '54 cm' },
      { size: '06', age: '5 a 6 anos', height: '105 a 117 cm', chest: '61 cm', waist: '56 cm' },
      { size: '08', age: '7 a 8 anos', height: '117 a 128 cm', chest: '66 cm', waist: '60 cm' },
      { size: '10', age: '9 a 10 anos', height: '128 a 137 cm', chest: '71 cm', waist: '62 cm' },
    ],
  },
  {
    category: 'Juvenil (12 ao 18 Anos)',
    items: [
      { size: '12', age: '11 a 12 anos', height: '137 a 150 cm', chest: '76 cm', waist: '64 cm' },
      { size: '14', age: '13 a 14 anos', height: '150 a 158 cm', chest: '80 cm', waist: '66 cm' },
      { size: '16', age: '15 a 16 anos', height: '158 a 165 cm', chest: '84 cm', waist: '68 cm' },
      { size: '18', age: '17 a 18 anos', height: '165 a 172 cm', chest: '88 cm', waist: '72 cm' },
    ],
  },
];

export const faqList = [
  {
    q: 'Como funciona o pagamento via PIX?',
    a: 'Ao finalizar a compra, você receberá a nossa Chave PIX oficial (32) 98702-2878 e as instruções de transferência. O seu pedido fica registrado com status "Aguardando pagamento via PIX". Após efetuar o PIX, basta nos enviar o comprovante pelo WhatsApp com o número do seu pedido.',
  },
  {
    q: 'Como funciona o pagamento com Cartão de Crédito via TON?',
    a: 'Ao selecionar o pagamento por Cartão, o pedido é criado com status "Aguardando envio do link TON". Nossa equipe gera imediatamente o link de pagamento criptografado e seguro da máquina TON e envia para você pelo WhatsApp ou E-mail com opções de parcelamento.',
  },
  {
    q: 'Como funciona a Retirada e Entrega em Ubá/MG?',
    a: 'Clientes de Ubá e região podem retirar gratuitamente na loja física no endereço: Av. Elpidia da Silva Fagundes, 409, Térreo, Santa Edwiges, Ubá/MG. Também temos a modalidade de entrega local via motoboy parceiro em Ubá.',
  },
  {
    q: 'Vocês enviam para outras cidades e estados?',
    a: 'Sim! Selecione a opção "Envio a calcular" no carrinho. Como prezamos pela transparência de custos e não embutimos fretes inflacionados nos produtos, nós cotamos a melhor opção (Correios PAC/Sedex ou transportadora Jadlog/Melhor Envio) de acordo com o seu CEP e informamos o valor exato via WhatsApp.',
  },
  {
    q: 'Qual é a política de trocas da Majoca Moda?',
    a: 'Aceitamos trocas em até 7 dias corridos após o recebimento da peça, desde que o produto esteja sem uso, com etiqueta fixada e na embalagem original. Na loja física em Ubá, a troca é realizada na hora.',
  },
];

import { Product, ShopStatus } from './api';

export const mockProducts: Product[] = [
  {
    id: 1,
    name: 'Carottes Bio',
    description: 'Carottes fraîches du potager, cultivées sans pesticides. Croquantes et sucrées.',
    price: 2.50,
    unit: 'kg',
    available: true,
    category: 'Légumes racines',
    image_url: '🥕',
    stock: 25, // Stock élevé
  },
  {
    id: 2,
    name: 'Pommes de Terre',
    description: 'Variété Charlotte, idéales pour les salades et cuissons vapeur.',
    price: 1.80,
    unit: 'kg',
    available: true,
    category: 'Légumes racines',
    image_url: '🥔',
    stock: 50, // Stock très élevé
  },
  {
    id: 3,
    name: 'Poireaux',
    description: 'Poireaux tendres et savoureux, parfaits pour vos soupes et gratins.',
    price: 3.20,
    unit: 'kg',
    available: true,
    category: 'Légumes feuilles',
    image_url: '🧅',
    stock: 15,
  },
  {
    id: 4,
    name: 'Tomates Grappe',
    description: 'Tomates goûteuses cultivées sous serre. Parfaites pour les salades.',
    price: 4.50,
    unit: 'kg',
    available: true,
    category: 'Légumes fruits',
    image_url: '🍅',
    stock: 3, // Stock limité
  },
  {
    id: 5,
    name: 'Courgettes',
    description: 'Courgettes fraîches et croquantes, récoltées à maturité.',
    price: 2.90,
    unit: 'kg',
    available: true,
    category: 'Légumes fruits',
    image_url: '🥒',
    stock: 20,
  },
  {
    id: 6,
    name: 'Salades Mélangées',
    description: 'Mélange de laitues variées: feuille de chêne, batavia, lollo rosso.',
    price: 1.50,
    unit: 'pièce',
    available: true,
    category: 'Légumes feuilles',
    image_url: '🥬',
    stock: 12,
  },
  {
    id: 7,
    name: 'Betteraves Rouges',
    description: 'Betteraves crues, parfaites pour vos salades et jus.',
    price: 2.20,
    unit: 'kg',
    available: true,
    category: 'Légumes racines',
    image_url: '🫚',
    stock: 8,
  },
  {
    id: 8,
    name: 'Oignons Jaunes',
    description: 'Oignons de conservation, indispensables en cuisine.',
    price: 1.90,
    unit: 'kg',
    available: false, // Indisponible
    category: 'Légumes racines',
    image_url: '🧅',
    stock: 0, // Rupture de stock
  },
  {
    id: 9,
    name: 'Haricots Verts',
    description: 'Haricots verts extra-fins, cueillis à la main.',
    price: 5.50,
    unit: 'kg',
    available: true,
    category: 'Légumes fruits',
    image_url: '🫘',
    stock: 2, // Stock très limité
  },
  {
    id: 10,
    name: 'Courge Butternut',
    description: 'Courge sucrée et fondante, idéale pour les soupes et purées.',
    price: 2.80,
    unit: 'kg',
    available: true,
    category: 'Courges',
    image_url: '🎃',
    stock: 30,
  },
];

export const mockShopStatus: ShopStatus = {
  isOpen: true,
  message: 'Vente ouverte du 22 au 28 janvier 2026',
  openingDate: '2026-01-22T00:00:00Z',
  closingDate: '2026-01-28T23:59:59Z',
};

// Alternative closed status for testing
export const mockShopStatusClosed: ShopStatus = {
  isOpen: false,
  message: 'Vente fermée. Prochaine ouverture le 5 février 2026',
  openingDate: '2026-02-05T00:00:00Z',
  closingDate: '2026-02-12T23:59:59Z',
};

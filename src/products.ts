// ============================================================
// DATOS DE PRODUCTOS — Arrecho & Sano
// 5 bowls keto premium para domicilios en San Gil
// ============================================================

import { Product } from '@/types';

export const PRODUCTS: Product[] = [
  {
    id: 'bowl-cesar',
    name: 'Bowl César Premium',
    description:
      'Lechuga romana crujiente, pechuga de pollo a la plancha, crutones de almendras, parmesano rallado y aderezo César casero. Un clásico santandereano con toque keto.',
    price: 18000,
    image: '/dishes/bowl-cesar.png',
    tags: ['Keto', 'Alto Proteína', 'Popular'],
    calories: 420,
    protein: '38g',
    packagingImages: [],
    nameEn: 'Premium Caesar Bowl',
    descriptionEn:
      'Crispy romaine lettuce, grilled chicken breast, almond croutons, grated parmesan, and homemade Caesar dressing. A local classic with a keto twist.',
    tagsEn: ['Keto', 'High Protein', 'Popular'],
  },
  {
    id: 'bowl-salmon-bosque',
    name: 'Bowl Salmón del Bosque',
    description:
      'Salmón grillado sobre espinacas baby, hongos silvestres salteados, nueces tostadas, aguacate en láminas y aderezo de limón y hierbas. Del río a tu mesa.',
    price: 35000,
    image: '/dishes/bowl-salmon-bosque.png',
    tags: ['Premium', 'Omega-3', 'Keto'],
    calories: 510,
    protein: '42g',
    packagingImages: [],
    nameEn: 'Forest Salmon Bowl',
    descriptionEn:
      'Grilled salmon over baby spinach, sautéed wild mushrooms, toasted walnuts, sliced avocado, and a lemon-herb dressing. From the river to your table.',
    tagsEn: ['Premium', 'Omega-3', 'Keto'],
  },
  {
    id: 'bowl-cobb',
    name: 'Keto Cobb Salad',
    description:
      'Huevo duro, pollo grillado, tocineta artesanal, aguacate, tomates cherry, queso azul y mesclun de lechugas. El combo perfecto ¡arrecho de sabor!',
    price: 22000,
    image: '/dishes/bowl-cobb.png',
    tags: ['Keto', 'Sin Gluten', 'Clásico'],
    calories: 480,
    protein: '36g',
    packagingImages: [],
    nameEn: 'Keto Cobb Salad',
    descriptionEn:
      'Hard-boiled egg, grilled chicken, craft bacon, avocado, cherry tomatoes, blue cheese, and mixed salad greens. The perfect combo, bursting with flavor!',
    tagsEn: ['Keto', 'Gluten-Free', 'Classic'],
  },
  {
    id: 'bowl-pesto',
    name: 'Keto Bowl Pollo al Pesto',
    description:
      'Pechuga de pollo jugosa bañada en pesto de albahaca fresca, piñones, tomates cherry asados, parmesano y rúgula. Sabor italiano con alma carchera.',
    price: 24000,
    image: '/dishes/bowl-pesto.png',
    tags: ['Keto', 'Sin Carbos', 'Bajo Calórico'],
    calories: 390,
    protein: '40g',
    packagingImages: [],
    nameEn: 'Keto Pesto Chicken Bowl',
    descriptionEn:
      'Juicy chicken breast tossed in fresh basil pesto, pine nuts, roasted cherry tomatoes, parmesan, and arugula. Italian flavor with a local soul.',
    tagsEn: ['Keto', 'Zero Carbs', 'Low Calorie'],
  },
  {
    id: 'bowl-teriyaki',
    name: 'Bowl Salmón Teriyaki Keto',
    description:
      'Salmón glaseado en salsa teriyaki low-carb, arroz de coliflor, aguacate, pepino en cintas, edamame y semillas de ajonjolí. ¡Qué arrecho!',
    price: 36000,
    image: '/dishes/bowl-teriyaki.png',
    tags: ['Premium', 'Fusión', 'Omega-3', 'Keto'],
    calories: 530,
    protein: '44g',
    packagingImages: [],
    nameEn: 'Keto Teriyaki Salmon Bowl',
    descriptionEn:
      'Glazed salmon in low-carb teriyaki sauce, cauliflower rice, avocado, cucumber ribbons, edamame, and sesame seeds. Simply amazing!',
    tagsEn: ['Premium', 'Fusion', 'Omega-3', 'Keto'],
  },
];

// Número de WhatsApp del negocio (con código de país, sin +)
export const WHATSAPP_NUMBER = '573133417707'; // <-- Cambiar al número real

// PIN del panel de administración
export const ADMIN_PIN = '000178';

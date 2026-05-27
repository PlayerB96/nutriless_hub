export type FoodPreset = { value: string; label: string };

export type FoodGroup = {
  group: string;
  items: FoodPreset[];
};

export const FOOD_GROUPS: FoodGroup[] = [
  {
    group: "Cereales y derivados",
    items: [
      { value: "arroz", label: "Arroz" },
      { value: "pan", label: "Pan" },
      { value: "pasta", label: "Pasta" },
      { value: "avena", label: "Avena" },
      { value: "tortilla", label: "Tortilla" },
      { value: "cereal", label: "Cereal" },
      { value: "galletas", label: "Galletas" },
      { value: "quinoa", label: "Quinoa" },
    ],
  },
  {
    group: "Tubérculos",
    items: [
      { value: "papa", label: "Papa" },
      { value: "camote", label: "Camote" },
      { value: "yuca", label: "Yuca" },
      { value: "zanahoria", label: "Zanahoria" },
      { value: "betabel", label: "Betabel" },
    ],
  },
  {
    group: "Legumbres",
    items: [
      { value: "frijol", label: "Frijol" },
      { value: "lenteja", label: "Lenteja" },
      { value: "garbanzo", label: "Garbanzo" },
      { value: "habas", label: "Habas" },
      { value: "soya", label: "Soya" },
      { value: "chicharo", label: "Chícharo" },
    ],
  },
  {
    group: "Carnes y sustitutos",
    items: [
      { value: "pollo", label: "Pollo" },
      { value: "res", label: "Res" },
      { value: "cerdo", label: "Cerdo" },
      { value: "pescado", label: "Pescado" },
      { value: "atun", label: "Atún" },
      { value: "mariscos", label: "Mariscos" },
      { value: "huevo", label: "Huevo" },
      { value: "tofu", label: "Tofu" },
    ],
  },
  {
    group: "Lácteos",
    items: [
      { value: "leche", label: "Leche" },
      { value: "queso", label: "Queso" },
      { value: "yogur", label: "Yogur" },
      { value: "crema", label: "Crema" },
      { value: "mantequilla", label: "Mantequilla" },
    ],
  },
  {
    group: "Verduras",
    items: [
      { value: "lechuga", label: "Lechuga" },
      { value: "tomate", label: "Tomate" },
      { value: "brocoli", label: "Brócoli" },
      { value: "espinacas", label: "Espinacas" },
      { value: "calabaza", label: "Calabaza" },
      { value: "pepino", label: "Pepino" },
      { value: "cebolla", label: "Cebolla" },
      { value: "nopal", label: "Nopal" },
      { value: "coliflor", label: "Coliflor" },
      { value: "chayote", label: "Chayote" },
    ],
  },
  {
    group: "Frutas",
    items: [
      { value: "manzana", label: "Manzana" },
      { value: "platano", label: "Plátano" },
      { value: "naranja", label: "Naranja" },
      { value: "fresa", label: "Fresa" },
      { value: "mango", label: "Mango" },
      { value: "papaya", label: "Papaya" },
      { value: "piña", label: "Piña" },
      { value: "uva", label: "Uva" },
      { value: "sandia", label: "Sandía" },
      { value: "melon", label: "Melón" },
    ],
  },
  {
    group: "Grasas",
    items: [
      { value: "aguacate", label: "Aguacate" },
      { value: "aceite_oliva", label: "Aceite de oliva" },
      { value: "nueces", label: "Nueces" },
      { value: "almendras", label: "Almendras" },
      { value: "cacahuate", label: "Cacahuate" },
      { value: "semillas", label: "Semillas" },
      { value: "aceite_coco", label: "Aceite de coco" },
    ],
  },
  {
    group: "Azúcares",
    items: [
      { value: "miel", label: "Miel" },
      { value: "azucar", label: "Azúcar" },
      { value: "chocolate", label: "Chocolate" },
      { value: "mermelada", label: "Mermelada" },
      { value: "cajeta", label: "Cajeta" },
      { value: "piloncillo", label: "Piloncillo" },
    ],
  },
];

/** Presets planos (todos los items de todos los grupos) para validación */
export const ALL_FOOD_PRESETS: FoodPreset[] = FOOD_GROUPS.flatMap(
  (g) => g.items,
);

/** Alergias alimentarias comunes (no agrupadas por categoría de alimento) */
export const FOOD_ALLERGY_PRESETS: FoodPreset[] = [
  { value: "cacahuate", label: "Cacahuate" },
  { value: "nueces", label: "Nueces" },
  { value: "leche", label: "Leche" },
  { value: "huevo", label: "Huevo" },
  { value: "trigo", label: "Trigo" },
  { value: "soya", label: "Soya" },
  { value: "mariscos", label: "Mariscos" },
  { value: "pescado", label: "Pescado" },
  { value: "fresas", label: "Fresas" },
  { value: "chocolate", label: "Chocolate" },
  { value: "gluten", label: "Gluten" },
  { value: "lactosa", label: "Lactosa" },
  { value: "sesamo", label: "Sésamo" },
  { value: "apio", label: "Apio" },
];

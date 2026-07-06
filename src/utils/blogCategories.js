export const BLOG_CATEGORIES = [
  "Entrevistas",
  "Artigos",
  "Carreira",
  "Análise de Mercado",
  "Materiais de Ensino",
  "Dicas e Demais",
  "Minissimulado",
];

export const BLOG_SUBCATEGORIES = {
  Artigos: ["Informativos", "Científicos"],
  "Materiais de Ensino": [
    "Civil",
    "Processual Civil",
    "Penal",
    "Processual Penal",
    "Constitucional",
    "Administrativo",
    "Tributário",
    "Empresarial",
    "Justiça Multiportas",
  ],
};

export const BLOG_FILTER_ALL = "Todos";

export const hasBlogSubcategories = (category) =>
  Array.isArray(BLOG_SUBCATEGORIES[category]) && BLOG_SUBCATEGORIES[category].length > 0;

export const getBlogSubcategories = (category) => BLOG_SUBCATEGORIES[category] || [];

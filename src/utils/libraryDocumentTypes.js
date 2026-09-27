/** Tipos de documento da biblioteca (valor = label persistida no backend). */
export const LIBRARY_DOCUMENT_TYPES = [
  "Artigo Científico",
  "Obra Literária",
  "Legislação",
  "Doutrina",
  "Jurisprudência",
  "Manual / Apostila",
  "Outros",
];

export const LIBRARY_DOCUMENT_TYPE_FILTERS = ["Todos", ...LIBRARY_DOCUMENT_TYPES];

export const DEFAULT_LIBRARY_DOCUMENT_TYPE = "Outros";

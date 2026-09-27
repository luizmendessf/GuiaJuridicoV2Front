/**
 * Formata datas do blog no padrão pt-BR (UTC), alinhado às oportunidades.
 */
export function formatBlogDate(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

/**
 * Retorna a data a exibir como publicação (publishedAt com fallback para createdAt).
 * Omite para rascunhos sem publishedAt.
 */
export function resolveBlogPublicationDate(article) {
  if (!article) return null;
  if (article.publishedAt) return article.publishedAt;
  if (article.published === false) return null;
  return article.createdAt || null;
}

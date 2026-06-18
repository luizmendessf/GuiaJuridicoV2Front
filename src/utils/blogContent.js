import DOMPurify from "dompurify";

const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i;

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "a",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "span",
  "div",
  "img",
];

const ALLOWED_ATTR = ["href", "target", "rel", "style", "src", "alt", "title", "width", "height"];

export function isHtmlContent(content) {
  if (!content) return false;
  return HTML_TAG_PATTERN.test(content.trim());
}

export function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function plainTextToHtml(text) {
  if (!text) return "";

  return text
    .split(/\n\s*\n/)
    .map((paragraph) => {
      const trimmed = paragraph.trim();
      if (!trimmed) return "";
      return `<p>${escapeHtml(trimmed).replace(/\n/g, "<br>")}</p>`;
    })
    .filter(Boolean)
    .join("");
}

export function contentForEditor(content) {
  if (!content) return "";
  if (isHtmlContent(content)) return content;
  return plainTextToHtml(content);
}

export function isBlogContentEmpty(content) {
  if (!content || !content.trim()) return true;
  const stripped = content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return !stripped;
}

export function sanitizeBlogHtml(html) {
  if (!html) return "";

  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });

  const doc = new DOMParser().parseFromString(sanitized, "text/html");
  doc.querySelectorAll("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href") || "";
    if (/^https?:\/\//i.test(href)) {
      anchor.setAttribute("target", "_blank");
      anchor.setAttribute("rel", "noopener noreferrer");
    }
  });

  return doc.body.innerHTML;
}

export function prepareBlogContentForDisplay(content) {
  if (!content) return "";
  if (!isHtmlContent(content)) {
    return escapeHtml(content).replace(/\n/g, "<br>");
  }
  return sanitizeBlogHtml(content);
}

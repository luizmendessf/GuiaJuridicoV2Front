import { Link } from "react-router-dom";
import api from "../../services/apiService";
import "./BlogArticleCard.css";

const resolveImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;

  const base = api.defaults?.baseURL || "";
  return `${base}/images/${imagePath}`;
};

export default function BlogArticleCard({ article, onClick, showStatus = false, actions }) {
  const { id, title, subtitle, slug, imagePath, published } = article;

  const to = `/blog/${slug || id}`;
  const imageUrl = resolveImageUrl(imagePath);

  const Wrapper = onClick ? "button" : Link;
  const wrapperProps = onClick
    ? { type: "button", onClick, className: "blog-article-card-link blog-article-card-button", "aria-label": title }
    : { to, className: "blog-article-card-link", "aria-label": title };

  return (
    <Wrapper {...wrapperProps}>
      <div className="card blog-article-card">
        <div className="blog-article-card__image-wrapper">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="blog-article-card__image" />
          ) : (
            <div className="blog-article-card__image-placeholder" />
          )}
          <div className="blog-article-card__image-overlay" />
        </div>
        <div className="card__content blog-article-card__content">
          {showStatus && typeof published === "boolean" && (
            <div className={`blog-article-card__badge ${published ? "is-published" : "is-draft"}`}>
              {published ? "Publicado" : "Rascunho"}
            </div>
          )}
          <h3 className="blog-article-card__title">{title}</h3>
          <p className="blog-article-card__subtitle">{subtitle}</p>
          {actions && <div className="blog-article-card__actions">{actions}</div>}
        </div>
      </div>
    </Wrapper>
  );
}

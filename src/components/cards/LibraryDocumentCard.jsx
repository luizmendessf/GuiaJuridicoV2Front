import { Link } from "react-router-dom";
import api from "../../services/apiService";
import "./LibraryDocumentCard.css";

const resolveImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const base = api.defaults?.baseURL || "";
  return `${base}/images/${imagePath}`;
};

export default function LibraryDocumentCard({ document: doc, onClick, showStatus = false, actions }) {
  const { id, title, description, slug, coverImagePath, published } = doc;
  const to = `/biblioteca/${slug || id}`;
  const imageUrl = resolveImageUrl(coverImagePath);

  const Wrapper = onClick ? "button" : Link;
  const wrapperProps = onClick
    ? {
        type: "button",
        onClick,
        className: "library-doc-card-link library-doc-card-button",
        "aria-label": title,
      }
    : { to, className: "library-doc-card-link", "aria-label": title };

  return (
    <Wrapper {...wrapperProps}>
      <div className="card library-doc-card">
        <div className="library-doc-card__image-wrapper">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="library-doc-card__image" />
          ) : (
            <div className="library-doc-card__image-placeholder" aria-hidden />
          )}
          <div className="library-doc-card__image-overlay" />
        </div>
        <div className="card__content library-doc-card__content">
          {showStatus && typeof published === "boolean" && (
            <div className={`library-doc-card__badge ${published ? "is-published" : "is-draft"}`}>
              {published ? "Publicado" : "Rascunho"}
            </div>
          )}
          <h3 className="library-doc-card__title">{title}</h3>
          <p className="library-doc-card__description">{description}</p>
          {actions && <div className="library-doc-card__actions">{actions}</div>}
        </div>
      </div>
    </Wrapper>
  );
}

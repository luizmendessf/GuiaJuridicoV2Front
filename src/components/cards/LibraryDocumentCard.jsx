import { Link } from "react-router-dom";
import { Download, FileText } from "lucide-react";
import { resolveLibraryCoverUrl, resolvePdfUrl } from "../../services/apiService";
import "./LibraryDocumentCard.css";

export default function LibraryDocumentCard({ document: doc, onClick, showStatus = false, actions }) {
  const { id, title, description, slug, published, pdfFilename } = doc;
  const to = `/biblioteca/${slug || id}`;
  const imageUrl = resolveLibraryCoverUrl(doc);
  const pdfUrl = resolvePdfUrl(pdfFilename);

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
    <article className="library-doc-card-wrap">
      <Wrapper {...wrapperProps}>
        <div className="card library-doc-card">
          <div className="library-doc-card__image-wrapper">
            {imageUrl ? (
              <img src={imageUrl} alt={title} className="library-doc-card__image" loading="lazy" />
            ) : (
              <div className="library-doc-card__image-placeholder" aria-hidden>
                <FileText size={40} strokeWidth={1.5} />
              </div>
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
          </div>
        </div>
      </Wrapper>

      <div className="library-doc-card__footer">
        {pdfUrl && (
          <a
            href={pdfUrl}
            className="library-doc-card__open-btn"
            target="_blank"
            rel="noopener noreferrer"
            download
          >
            <Download size={16} aria-hidden />
            Abrir PDF
          </a>
        )}
        {!onClick && (
          <Link to={to} className="library-doc-card__detail-link">
            Ver detalhes
          </Link>
        )}
        {actions && <div className="library-doc-card__actions">{actions}</div>}
      </div>
    </article>
  );
}

import { useCallback, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Construction, Download, Maximize2, X } from "lucide-react";
import BibliotecaPdfViewer from "../components/library/BibliotecaPdfViewer";
import {
  getLibraryDocumentByIdOrSlug,
  resolvePdfUrl,
} from "../services/apiService";
import "./BlogArticle.css";
import "./BibliotecaDocument.css";

const BIBLIOTECA_EM_BREVE = false;

export default function BibliotecaDocument() {
  const { idOrSlug } = useParams();
  const [doc, setDoc] = useState(null);
  const [status, setStatus] = useState("loading");
  const [isExpanded, setIsExpanded] = useState(false);

  const closeExpanded = useCallback(() => setIsExpanded(false), []);

  useEffect(() => {
    if (BIBLIOTECA_EM_BREVE) return;
    let active = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
    const load = async () => {
      try {
        const { data } = await getLibraryDocumentByIdOrSlug(idOrSlug);
        if (!active) return;
        setDoc(data);
        setStatus("ready");
      } catch {
        if (!active) return;
        setStatus("error");
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [idOrSlug]);

  useEffect(() => {
    if (!isExpanded) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeExpanded();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isExpanded, closeExpanded]);

  if (BIBLIOTECA_EM_BREVE) {
    return (
      <div className="blog-article-page biblioteca-doc-page">
        <div className="container biblioteca-doc-em-breve-layout">
          <div className="biblioteca-doc-em-breve-icon" aria-hidden>
            <Construction size={32} strokeWidth={2} />
          </div>
          <p className="biblioteca-doc-em-breve">Esta página estará disponível em breve.</p>
          <div className="blog-article-back biblioteca-doc-em-breve-back">
            <Link to="/biblioteca" className="blog-article-back-link">
              Voltar para a Biblioteca
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="blog-article-page biblioteca-doc-page">
        <div className="container">
          <div className="blog-article-state">Carregando documento...</div>
        </div>
      </div>
    );
  }

  if (status === "error" || !doc) {
    return (
      <div className="blog-article-page biblioteca-doc-page">
        <div className="container">
          <div className="blog-article-state">Documento não encontrado.</div>
          <div className="blog-article-back">
            <Link to="/biblioteca" className="blog-article-back-link">
              Voltar para a Biblioteca
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const pdfUrl = resolvePdfUrl(doc.pdfFilename);

  return (
    <div className="blog-article-page biblioteca-doc-page">
      <div className="container biblioteca-doc-container">
        <div className="blog-article-back biblioteca-doc-back">
          <Link to="/biblioteca" className="blog-article-back-link">
            ← Voltar para a Biblioteca
          </Link>
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="biblioteca-doc-action-link"
              download
            >
              <Download size={14} aria-hidden />
              <span>Baixar PDF</span>
            </a>
          )}
        </div>

        <article className="biblioteca-doc-article">
          <header className="biblioteca-doc-header">
            <h1 className="biblioteca-doc-title">{doc.title}</h1>
            {doc.description && <p className="biblioteca-doc-subtitle">{doc.description}</p>}
          </header>

          {pdfUrl ? (
            <section className="biblioteca-doc-viewer" aria-label="Visualização do PDF">
              <div className="biblioteca-doc-viewer__toolbar">
                <button
                  type="button"
                  className="biblioteca-doc-viewer__expand-btn"
                  onClick={() => setIsExpanded(true)}
                  aria-label="Expandir visualização do PDF"
                >
                  <Maximize2 size={16} aria-hidden />
                  Expandir
                </button>
              </div>
              <div className="biblioteca-doc-viewer__frame-wrap">
                <BibliotecaPdfViewer pdfUrl={pdfUrl} title={doc.title} variant="compact" />
              </div>
            </section>
          ) : (
            <p className="biblioteca-doc-fallback">PDF indisponível.</p>
          )}
        </article>
      </div>

      {isExpanded && pdfUrl && (
        <div
          className="biblioteca-pdf-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Visualização em tela cheia: ${doc.title}`}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeExpanded();
          }}
        >
          <button
            type="button"
            className="biblioteca-pdf-lightbox__close"
            onClick={closeExpanded}
            aria-label="Fechar visualização expandida"
          >
            <X size={22} strokeWidth={2.5} aria-hidden />
          </button>
          <div className="biblioteca-pdf-lightbox__panel">
            <div className="biblioteca-pdf-lightbox__head">
              <h2 className="biblioteca-pdf-lightbox__title">{doc.title}</h2>
            </div>
            <div className="biblioteca-pdf-lightbox__frame-wrap">
              <BibliotecaPdfViewer pdfUrl={pdfUrl} title={doc.title} variant="expanded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

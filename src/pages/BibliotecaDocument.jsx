import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import api, { getLibraryDocumentByIdOrSlug } from "../services/apiService";
import "./BlogArticle.css";
import "./BibliotecaDocument.css";

const resolveImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const base = api.defaults?.baseURL || "";
  return `${base}/images/${imagePath}`;
};

/** Alinhado com `Biblioteca.jsx`: enquanto `true`, não carrega documento. */
const BIBLIOTECA_EM_BREVE = true;

export default function BibliotecaDocument() {
  const { idOrSlug } = useParams();
  const [doc, setDoc] = useState(null);
  const [status, setStatus] = useState("loading");

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

  if (BIBLIOTECA_EM_BREVE) {
    return (
      <div className="blog-article-page biblioteca-doc-page">
        <div className="container">
          <p className="biblioteca-doc-em-breve">Esta página estará disponível em breve.</p>
          <div className="blog-article-back">
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

  const imageUrl = resolveImageUrl(doc.coverImagePath);
  const previewSrc = doc.drivePreviewUrl;

  return (
    <div className="blog-article-page biblioteca-doc-page">
      <div className="container">
        <div className="blog-article-back biblioteca-doc-back">
          <Link to="/biblioteca" className="blog-article-back-link">
            ← Voltar para a Biblioteca
          </Link>
          {doc.driveViewUrl && (
            <a
              href={doc.driveViewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="biblioteca-drive-link"
              title="Abrir no Google Drive"
            >
              <ExternalLink size={14} aria-hidden />
              <span>Drive</span>
            </a>
          )}
        </div>

        <article className="blog-article biblioteca-doc-article">
          {imageUrl && (
            <div className="biblioteca-doc-header-cover">
              <img src={imageUrl} alt="" className="biblioteca-doc-header-cover__img" />
            </div>
          )}

          <header className="blog-article__header">
            <h1 className="blog-article__title">{doc.title}</h1>
            <p className="blog-article__subtitle biblioteca-doc-desc">{doc.description}</p>
          </header>

          {previewSrc ? (
            <div className="biblioteca-doc-viewer">
              <iframe
                title={doc.title}
                src={previewSrc}
                className="biblioteca-doc-viewer__iframe"
                allow="fullscreen"
              />
            </div>
          ) : (
            doc.driveViewUrl && (
              <p className="biblioteca-doc-fallback">
                Não foi possível montar o visualizador.{" "}
                <a href={doc.driveViewUrl} target="_blank" rel="noopener noreferrer">
                  Abrir no Google Drive
                </a>
              </p>
            )
          )}
        </article>
      </div>
    </div>
  );
}

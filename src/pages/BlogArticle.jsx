import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api, { getBlogArticleByIdOrSlug } from "../services/apiService";
import "./BlogArticle.css";

const resolveImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const base = api.defaults?.baseURL || "";
  return `${base}/images/${imagePath}`;
};

export default function BlogArticle() {
  const { idOrSlug } = useParams();
  const [article, setArticle] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    window.scrollTo({ top: 0, behavior: "smooth" });

    const load = async () => {
      try {
        const { data } = await getBlogArticleByIdOrSlug(idOrSlug);
        if (!active) return;
        setArticle(data);
        setStatus("ready");
      } catch (e) {
        if (!active) return;
        setStatus("error");
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [idOrSlug]);

  if (status === "loading") {
    return (
      <div className="blog-article-page">
        <div className="container">
          <div className="blog-article-state">Carregando artigo...</div>
        </div>
      </div>
    );
  }

  if (status === "error" || !article) {
    return (
      <div className="blog-article-page">
        <div className="container">
          <div className="blog-article-state">Artigo não encontrado.</div>
          <div className="blog-article-back">
            <Link to="/blog" className="blog-article-back-link">Voltar para o Blog</Link>
          </div>
        </div>
      </div>
    );
  }

  const imageUrl = resolveImageUrl(article.imagePath);

  return (
    <div className="blog-article-page">
      <div className="container">
        <div className="blog-article-back">
          <Link to="/blog" className="blog-article-back-link">← Voltar para o Blog</Link>
        </div>

        <article className="blog-article">
          {imageUrl && (
            <div className="blog-article__image-wrapper">
              <img src={imageUrl} alt={article.title} className="blog-article__image" />
              <div className="blog-article__image-overlay" />
            </div>
          )}

          <header className="blog-article__header">
            <h1 className="blog-article__title">{article.title}</h1>
            <p className="blog-article__subtitle">{article.subtitle}</p>
          </header>

          <div className="blog-article__content">
            {article.content}
          </div>
        </article>
      </div>
    </div>
  );
}


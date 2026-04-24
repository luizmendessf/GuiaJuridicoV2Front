import { useEffect, useState } from "react";
import BlogArticleCard from "../components/cards/BlogArticleCard";
import api, {
  createBlogArticle,
  deleteBlogArticle,
  getBlogArticleAdminById,
  getBlogArticles,
  getBlogArticlesAdmin,
  updateBlogArticle,
  uploadImage,
} from "../services/apiService";
import { useAuth } from "../context/AuthContext";
import "./Blog.css";

const resolveImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const base = api.defaults?.baseURL || "";
  return `${base}/images/${imagePath}`;
};

export default function Blog() {
  const { hasAdminOrOrganizerRole, hasAdminRole } = useAuth();
  const canManage = hasAdminOrOrganizerRole();
  const isAdmin = hasAdminRole();

  const [mode, setMode] = useState("public");
  const [manageFilter, setManageFilter] = useState("drafts");

  const [publicArticles, setPublicArticles] = useState([]);
  const [publicStatus, setPublicStatus] = useState("loading");

  const [adminArticles, setAdminArticles] = useState([]);
  const [adminStatus, setAdminStatus] = useState("idle");

  const [pageMessage, setPageMessage] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [savingAdd, setSavingAdd] = useState(false);
  const [modalError, setModalError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    slug: "",
    content: "",
    published: false,
  });

  const resetAddForm = () => {
    setForm({
      title: "",
      subtitle: "",
      slug: "",
      content: "",
      published: false,
    });
    setImageFile(null);
    setPreviewUrl(null);
    setModalError("");
  };

  useEffect(() => {
    let active = true;

    const loadPublic = async () => {
      try {
        const { data } = await getBlogArticles();
        if (!active) return;
        setPublicArticles(Array.isArray(data) ? data : []);
        setPublicStatus("ready");
      } catch (e) {
        if (!active) return;
        setPublicStatus("error");
      }
    };

    loadPublic();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!canManage) return;
    if (mode !== "manage") return;

    let active = true;
    const loadAdmin = async () => {
      setAdminStatus("loading");
      try {
        const { data } = await getBlogArticlesAdmin();
        if (!active) return;
        setAdminArticles(Array.isArray(data) ? data : []);
        setAdminStatus("ready");
      } catch (e) {
        if (!active) return;
        setAdminStatus("error");
      }
    };

    loadAdmin();
    return () => {
      active = false;
    };
  }, [canManage, mode]);

  useEffect(() => {
    if (!isAddOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsAddOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isAddOpen]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleOpenAdd = () => {
    setPageMessage("");
    resetAddForm();
    setIsAddOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    if (savingAdd) return;

    setModalError("");
    setPageMessage("");

    const title = form.title.trim();
    const subtitle = form.subtitle.trim();
    const content = form.content.trim();
    const slug = form.slug.trim();

    if (!title || !subtitle || !content) {
      setModalError("Preencha título, subtítulo e conteúdo.");
      return;
    }

    setSavingAdd(true);
    try {
      let imagePath;
      if (imageFile) {
        try {
          const response = await uploadImage(imageFile);
          imagePath = response.data?.url || response.data;
        } catch {
          setModalError("Falha ao enviar a imagem. Tente novamente.");
          setSavingAdd(false);
          return;
        }
      }

      const payload = {
        title,
        subtitle,
        content,
        published: !!form.published,
        slug: slug ? slug : undefined,
        imagePath: imagePath ? imagePath : undefined,
      };

      const { data } = await createBlogArticle(payload);

      setIsAddOpen(false);
      setPublicStatus("loading");

      try {
        const { data: listData } = await getBlogArticles();
        setPublicArticles(Array.isArray(listData) ? listData : []);
        setPublicStatus("ready");
      } catch {
        setPublicStatus("error");
      }

      if (data && data.published === false) {
        setPageMessage("Artigo criado como rascunho. Ele não aparece na lista pública.");
      } else {
        setPageMessage("Artigo criado com sucesso.");
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) setModalError("Sessão expirada. Faça login novamente.");
      else if (status === 403) setModalError("Sem permissão para criar artigos (apenas ADMIN/ORGANIZADOR).");
      else if (status === 404) setModalError("Endpoint não encontrado. Confira se o backend está rodando com o blog.");
      else setModalError("Não foi possível criar o artigo. Tente novamente.");
    } finally {
      setSavingAdd(false);
    }
  };

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");
  const [editImageFile, setEditImageFile] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    subtitle: "",
    slug: "",
    content: "",
    published: false,
    imagePath: "",
  });

  useEffect(() => {
    if (!isEditOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsEditOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isEditOpen]);

  useEffect(() => {
    if (!editPreviewUrl) return;
    return () => URL.revokeObjectURL(editPreviewUrl);
  }, [editPreviewUrl]);

  const openEdit = async (id) => {
    setPageMessage("");
    setEditError("");
    setEditingId(id);
    setEditImageFile(null);
    setEditPreviewUrl(null);
    setIsEditOpen(true);

    try {
      const { data } = await getBlogArticleAdminById(id);
      setEditForm({
        title: data?.title || "",
        subtitle: data?.subtitle || "",
        slug: data?.slug || "",
        content: data?.content || "",
        published: !!data?.published,
        imagePath: data?.imagePath || "",
      });
    } catch {
      setEditError("Não foi possível carregar o artigo para edição.");
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setEditImageFile(file);
    if (file) {
      setEditPreviewUrl(URL.createObjectURL(file));
    } else {
      setEditPreviewUrl(null);
    }
  };

  const refreshAdminList = async () => {
    try {
      const { data } = await getBlogArticlesAdmin();
      setAdminArticles(Array.isArray(data) ? data : []);
      setAdminStatus("ready");
    } catch {
      setAdminStatus("error");
    }
  };

  const refreshPublicList = async () => {
    try {
      const { data } = await getBlogArticles();
      setPublicArticles(Array.isArray(data) ? data : []);
      setPublicStatus("ready");
    } catch {
      setPublicStatus("error");
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (savingEdit) return;
    if (!editingId) return;

    setEditError("");

    const title = editForm.title.trim();
    const subtitle = editForm.subtitle.trim();
    const content = editForm.content.trim();
    const slug = editForm.slug.trim();

    if (!title || !subtitle || !content) {
      setEditError("Preencha título, subtítulo e conteúdo.");
      return;
    }

    setSavingEdit(true);
    try {
      let imagePath = editForm.imagePath?.trim() || "";
      if (editImageFile) {
        const response = await uploadImage(editImageFile);
        imagePath = response.data?.url || response.data || "";
      }

      const payload = {
        title,
        subtitle,
        content,
        published: !!editForm.published,
        slug: slug ? slug : undefined,
        imagePath: imagePath ? imagePath : undefined,
      };

      await updateBlogArticle(editingId, payload);

      await Promise.all([refreshAdminList(), refreshPublicList()]);
      setIsEditOpen(false);
      setPageMessage(editForm.published ? "Artigo atualizado e publicado." : "Artigo atualizado como rascunho.");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) setEditError("Sessão expirada. Faça login novamente.");
      else if (status === 403) setEditError("Sem permissão para editar/publicar artigos.");
      else setEditError("Não foi possível salvar as alterações.");
    } finally {
      setSavingEdit(false);
    }
  };

  const canDeleteArticle = (article) => {
    if (!article) return false;
    if (article.published) return isAdmin;
    return canManage;
  };

  const handleDeleteArticle = async (article) => {
    if (!article?.id) return;
    const label = article?.title ? `\"${article.title}\"` : "este artigo";
    const confirmed = window.confirm(`Tem certeza que deseja excluir ${label}?`);
    if (!confirmed) return;

    try {
      await deleteBlogArticle(article.id);
      setPageMessage("Artigo excluído com sucesso.");
      await Promise.all([refreshAdminList(), refreshPublicList()]);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 403) setPageMessage("Sem permissão para excluir este artigo.");
      else setPageMessage("Não foi possível excluir o artigo.");
    }
  };

  const visibleArticles = mode === "manage" ? adminArticles : publicArticles;
  const visibleStatus = mode === "manage" ? adminStatus : publicStatus;
  const filteredArticles =
    mode !== "manage"
      ? visibleArticles
      : visibleArticles.filter((a) => {
          if (manageFilter === "drafts") return a.published === false;
          if (manageFilter === "published") return a.published === true;
          return true;
        });

  return (
    <div className="blog-page">
      <div className="container">
        <header className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">Blog</h1>
              <p className="page-subtitle">
                Artigos, dicas e conteúdos para acompanhar o Guia Jurídico.
              </p>
            </div>
            {canManage && (
              <div className="blog-actions">
                <button
                  type="button"
                  className={`blog-manage-btn ${mode === "manage" ? "is-active" : ""}`}
                  onClick={() => {
                    setPageMessage("");
                    if (mode === "manage") setMode("public");
                    else {
                      setMode("manage");
                      setManageFilter("drafts");
                    }
                  }}
                >
                  {mode === "manage" ? "Ver público" : "Ver rascunhos"}
                </button>
                <button type="button" className="blog-add-btn" onClick={handleOpenAdd}>
                  Adicionar artigo
                </button>
              </div>
            )}
          </div>
        </header>

        {pageMessage && <div className="blog-message">{pageMessage}</div>}

        {mode === "manage" && canManage && (
          <div className="blog-manage-filters">
            <button
              type="button"
              className={`blog-filter-btn ${manageFilter === "drafts" ? "is-active" : ""}`}
              onClick={() => setManageFilter("drafts")}
            >
              Rascunhos
            </button>
            <button
              type="button"
              className={`blog-filter-btn ${manageFilter === "published" ? "is-active" : ""}`}
              onClick={() => setManageFilter("published")}
            >
              Publicados
            </button>
            <button
              type="button"
              className={`blog-filter-btn ${manageFilter === "all" ? "is-active" : ""}`}
              onClick={() => setManageFilter("all")}
            >
              Todos
            </button>
          </div>
        )}

        {visibleStatus === "loading" && (
          <div className="blog-state">Carregando artigos...</div>
        )}

        {visibleStatus === "error" && (
          <div className="blog-state">Não foi possível carregar os artigos.</div>
        )}

        {visibleStatus === "ready" && filteredArticles.length === 0 && (
          <div className="blog-state">
            {mode === "manage" ? "Nenhum artigo encontrado para este filtro." : "Nenhum artigo publicado ainda."}
          </div>
        )}

        {visibleStatus === "ready" && filteredArticles.length > 0 && (
          <div className="blog-list">
            {filteredArticles.map((article) => (
              <BlogArticleCard
                key={article.id}
                article={article}
                showStatus={mode === "manage"}
                onClick={
                  mode === "manage" && canManage
                    ? () => {
                        openEdit(article.id);
                      }
                    : undefined
                }
                actions={
                  mode === "manage" && canDeleteArticle(article) ? (
                    <button
                      type="button"
                      className="blog-article-card__action-btn is-danger"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteArticle(article);
                      }}
                    >
                      Excluir
                    </button>
                  ) : null
                }
              />
            ))}
          </div>
        )}
      </div>

      {canManage && isAddOpen && (
        <div
          className="blog-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsAddOpen(false);
          }}
        >
          <div className="blog-modal">
            <div className="blog-modal__header">
              <h2 className="blog-modal__title">Novo artigo</h2>
              <button
                type="button"
                className="blog-modal__close"
                onClick={() => setIsAddOpen(false)}
                disabled={savingAdd}
              >
                ×
              </button>
            </div>

            <form className="blog-modal__body blog-modal-form" onSubmit={handleSubmitAdd}>
              {modalError && <div className="blog-modal__error">{modalError}</div>}

              <div className="form-group">
                <label htmlFor="blog-title">Título *</label>
                <input
                  id="blog-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  disabled={savingAdd}
                />
              </div>

              <div className="form-group">
                <label htmlFor="blog-subtitle">Subtítulo *</label>
                <input
                  id="blog-subtitle"
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                  disabled={savingAdd}
                />
              </div>

              <div className="form-group">
                <label htmlFor="blog-slug">Slug</label>
                <input
                  id="blog-slug"
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="Opcional (se vazio, será gerado pelo título)"
                  disabled={savingAdd}
                />
              </div>

              <div className="form-group">
                <label htmlFor="blog-image">Imagem</label>
                <div className="blog-image-upload">
                  <input
                    id="blog-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={savingAdd}
                  />
                  <div className="blog-image-preview">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Pré-visualização" />
                    ) : (
                      <div className="blog-image-preview__placeholder">Sem imagem selecionada</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="blog-content">Conteúdo *</label>
                <textarea
                  id="blog-content"
                  rows={10}
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                  disabled={savingAdd}
                />
              </div>

              <div className="blog-modal__checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm((prev) => ({ ...prev, published: e.target.checked }))}
                    disabled={savingAdd}
                  />
                  Publicar agora
                </label>
              </div>

              <div className="blog-modal__footer">
                <button
                  type="button"
                  className="blog-modal__btn blog-modal__btn--secondary"
                  onClick={() => setIsAddOpen(false)}
                  disabled={savingAdd}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="blog-modal__btn blog-modal__btn--primary"
                  disabled={savingAdd}
                >
                  {savingAdd ? "Salvando..." : "Criar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {canManage && isEditOpen && (
        <div
          className="blog-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsEditOpen(false);
          }}
        >
          <div className="blog-modal">
            <div className="blog-modal__header">
              <h2 className="blog-modal__title">Editar artigo</h2>
              <button
                type="button"
                className="blog-modal__close"
                onClick={() => setIsEditOpen(false)}
                disabled={savingEdit}
              >
                ×
              </button>
            </div>

            <form className="blog-modal__body blog-modal-form" onSubmit={handleSubmitEdit}>
              {editError && <div className="blog-modal__error">{editError}</div>}

              <div className="form-group">
                <label htmlFor="blog-edit-title">Título *</label>
                <input
                  id="blog-edit-title"
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                  disabled={savingEdit}
                />
              </div>

              <div className="form-group">
                <label htmlFor="blog-edit-subtitle">Subtítulo *</label>
                <input
                  id="blog-edit-subtitle"
                  type="text"
                  value={editForm.subtitle}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                  disabled={savingEdit}
                />
              </div>

              <div className="form-group">
                <label htmlFor="blog-edit-slug">Slug</label>
                <input
                  id="blog-edit-slug"
                  type="text"
                  value={editForm.slug}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="Opcional (se vazio, será gerado pelo título)"
                  disabled={savingEdit}
                />
              </div>

              <div className="form-group">
                <label htmlFor="blog-edit-image">Imagem</label>
                <div className="blog-image-upload">
                  <input
                    id="blog-edit-image"
                    type="file"
                    accept="image/*"
                    onChange={handleEditFileChange}
                    disabled={savingEdit}
                  />
                  <div className="blog-image-preview">
                    {editPreviewUrl ? (
                      <img src={editPreviewUrl} alt="Pré-visualização" />
                    ) : resolveImageUrl(editForm.imagePath) ? (
                      <img src={resolveImageUrl(editForm.imagePath)} alt="Imagem atual" />
                    ) : (
                      <div className="blog-image-preview__placeholder">Sem imagem selecionada</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="blog-edit-content">Conteúdo *</label>
                <textarea
                  id="blog-edit-content"
                  rows={10}
                  value={editForm.content}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, content: e.target.value }))}
                  disabled={savingEdit}
                />
              </div>

              <div className="blog-modal__checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={editForm.published}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, published: e.target.checked }))}
                    disabled={savingEdit}
                  />
                  Publicar agora
                </label>
              </div>

              <div className="blog-modal__footer">
                <button
                  type="button"
                  className="blog-modal__btn blog-modal__btn--secondary"
                  onClick={() => setIsEditOpen(false)}
                  disabled={savingEdit}
                >
                  Cancelar
                </button>
                <button type="submit" className="blog-modal__btn blog-modal__btn--primary" disabled={savingEdit}>
                  {savingEdit ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

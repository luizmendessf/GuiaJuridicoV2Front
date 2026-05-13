import { useEffect, useState } from "react";
import LibraryDocumentCard from "../components/cards/LibraryDocumentCard";
import api, {
  createLibraryDocument,
  deleteLibraryDocument,
  getLibraryDocumentAdminById,
  getLibraryDocuments,
  getLibraryDocumentsAdmin,
  updateLibraryDocument,
  uploadImage,
} from "../services/apiService";
import { useAuth } from "../context/AuthContext";
import "./Blog.css";
import "./Biblioteca.css";

const resolveImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const base = api.defaults?.baseURL || "";
  return `${base}/images/${imagePath}`;
};

export default function Biblioteca() {
  const { hasAdminOrOrganizerRole, hasAdminRole } = useAuth();
  const canManage = hasAdminOrOrganizerRole();
  const isAdmin = hasAdminRole();

  const [mode, setMode] = useState("public");
  const [manageFilter, setManageFilter] = useState("drafts");

  const [publicDocs, setPublicDocs] = useState([]);
  const [publicStatus, setPublicStatus] = useState("loading");

  const [adminDocs, setAdminDocs] = useState([]);
  const [adminStatus, setAdminStatus] = useState("idle");

  const [pageMessage, setPageMessage] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [savingAdd, setSavingAdd] = useState(false);
  const [modalError, setModalError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    slug: "",
    driveLinkOrId: "",
    published: false,
  });

  const resetAddForm = () => {
    setForm({
      title: "",
      description: "",
      slug: "",
      driveLinkOrId: "",
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
        const { data } = await getLibraryDocuments();
        if (!active) return;
        setPublicDocs(Array.isArray(data) ? data : []);
        setPublicStatus("ready");
      } catch {
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
        const { data } = await getLibraryDocumentsAdmin();
        if (!active) return;
        setAdminDocs(Array.isArray(data) ? data : []);
        setAdminStatus("ready");
      } catch {
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
    if (file) setPreviewUrl(URL.createObjectURL(file));
    else setPreviewUrl(null);
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
    const description = form.description.trim();
    const slug = form.slug.trim();
    const driveLinkOrId = form.driveLinkOrId.trim();

    if (!title || !description || !driveLinkOrId) {
      setModalError("Preencha título, descrição e o link ou ID do arquivo no Google Drive.");
      return;
    }

    setSavingAdd(true);
    try {
      let coverImagePath;
      if (imageFile) {
        try {
          const response = await uploadImage(imageFile);
          coverImagePath = response.data?.url || response.data;
        } catch {
          setModalError("Falha ao enviar a capa. Tente novamente.");
          setSavingAdd(false);
          return;
        }
      }

      const payload = {
        title,
        description,
        published: !!form.published,
        slug: slug || undefined,
        driveLinkOrId,
        coverImagePath: coverImagePath || undefined,
      };

      const { data } = await createLibraryDocument(payload);
      setIsAddOpen(false);
      setPublicStatus("loading");
      try {
        const { data: listData } = await getLibraryDocuments();
        setPublicDocs(Array.isArray(listData) ? listData : []);
        setPublicStatus("ready");
      } catch {
        setPublicStatus("error");
      }

      if (data && data.published === false) {
        setPageMessage("Documento criado como rascunho. Ele não aparece na lista pública.");
      } else {
        setPageMessage("Documento criado com sucesso.");
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) setModalError("Sessão expirada. Faça login novamente.");
      else if (status === 403) setModalError("Sem permissão (apenas ADMIN/ORGANIZADOR).");
      else if (status === 400) setModalError("Dados inválidos. Confira o link do Google Drive.");
      else setModalError("Não foi possível criar o documento. Tente novamente.");
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
    description: "",
    slug: "",
    driveLinkOrId: "",
    published: false,
    coverImagePath: "",
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
      const { data } = await getLibraryDocumentAdminById(id);
      setEditForm({
        title: data?.title || "",
        description: data?.description || "",
        slug: data?.slug || "",
        driveLinkOrId: data?.driveViewUrl || data?.driveFileId || "",
        published: !!data?.published,
        coverImagePath: data?.coverImagePath || "",
      });
    } catch {
      setEditError("Não foi possível carregar o documento para edição.");
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setEditImageFile(file);
    if (file) setEditPreviewUrl(URL.createObjectURL(file));
    else setEditPreviewUrl(null);
  };

  const refreshAdminList = async () => {
    try {
      const { data } = await getLibraryDocumentsAdmin();
      setAdminDocs(Array.isArray(data) ? data : []);
      setAdminStatus("ready");
    } catch {
      setAdminStatus("error");
    }
  };

  const refreshPublicList = async () => {
    try {
      const { data } = await getLibraryDocuments();
      setPublicDocs(Array.isArray(data) ? data : []);
      setPublicStatus("ready");
    } catch {
      setPublicStatus("error");
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    if (savingEdit || !editingId) return;
    setEditError("");

    const title = editForm.title.trim();
    const description = editForm.description.trim();
    const slug = editForm.slug.trim();
    const driveLinkOrId = editForm.driveLinkOrId.trim();

    if (!title || !description || !driveLinkOrId) {
      setEditError("Preencha título, descrição e o link ou ID do arquivo no Google Drive.");
      return;
    }

    setSavingEdit(true);
    try {
      let coverImagePath = editForm.coverImagePath?.trim() || "";
      if (editImageFile) {
        const response = await uploadImage(editImageFile);
        coverImagePath = response.data?.url || response.data || "";
      }

      const payload = {
        title,
        description,
        published: !!editForm.published,
        slug: slug || undefined,
        driveLinkOrId,
        coverImagePath: coverImagePath || undefined,
      };

      await updateLibraryDocument(editingId, payload);
      await Promise.all([refreshAdminList(), refreshPublicList()]);
      setIsEditOpen(false);
      setPageMessage(editForm.published ? "Documento atualizado e publicado." : "Documento atualizado como rascunho.");
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) setEditError("Sessão expirada. Faça login novamente.");
      else if (status === 403) setEditError("Sem permissão para editar.");
      else setEditError("Não foi possível salvar as alterações.");
    } finally {
      setSavingEdit(false);
    }
  };

  const canDeleteDoc = (doc) => {
    if (!doc) return false;
    if (doc.published) return isAdmin;
    return canManage;
  };

  const handleDeleteDoc = async (doc) => {
    if (!doc?.id) return;
    const label = doc?.title ? `"${doc.title}"` : "este documento";
    if (!window.confirm(`Tem certeza que deseja excluir ${label}?`)) return;
    try {
      await deleteLibraryDocument(doc.id);
      setPageMessage("Documento excluído com sucesso.");
      await Promise.all([refreshAdminList(), refreshPublicList()]);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 403) setPageMessage("Sem permissão para excluir este documento.");
      else setPageMessage("Não foi possível excluir o documento.");
    }
  };

  const visibleDocs = mode === "manage" ? adminDocs : publicDocs;
  const visibleStatus = mode === "manage" ? adminStatus : publicStatus;
  const filteredDocs =
    mode !== "manage"
      ? visibleDocs
      : visibleDocs.filter((d) => {
          if (manageFilter === "drafts") return d.published === false;
          if (manageFilter === "published") return d.published === true;
          return true;
        });

  return (
    <div className="blog-page biblioteca-page">
      <div className="container">
        <header className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">Biblioteca</h1>
              <p className="page-subtitle">
                PDFs e materiais de consulta. A visualização abre no próprio site quando o arquivo no Google Drive
                permite incorporação.
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
                  Adicionar PDF
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

        {visibleStatus === "loading" && <div className="blog-state">Carregando documentos...</div>}
        {visibleStatus === "error" && <div className="blog-state">Não foi possível carregar a biblioteca.</div>}
        {visibleStatus === "ready" && filteredDocs.length === 0 && (
          <div className="blog-state">
            {mode === "manage" ? "Nenhum documento para este filtro." : "Nenhum documento publicado ainda."}
          </div>
        )}

        {visibleStatus === "ready" && filteredDocs.length > 0 && (
          <div className="blog-list biblioteca-list">
            {filteredDocs.map((doc) => (
              <LibraryDocumentCard
                key={doc.id}
                document={doc}
                showStatus={mode === "manage"}
                onClick={
                  mode === "manage" && canManage
                    ? () => {
                        openEdit(doc.id);
                      }
                    : undefined
                }
                actions={
                  mode === "manage" && canDeleteDoc(doc) ? (
                    <button
                      type="button"
                      className="library-doc-card__action-btn is-danger"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteDoc(doc);
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
              <h2 className="blog-modal__title">Novo documento</h2>
              <button type="button" className="blog-modal__close" onClick={() => setIsAddOpen(false)} disabled={savingAdd}>
                ×
              </button>
            </div>
            <form className="blog-modal__body blog-modal-form" onSubmit={handleSubmitAdd}>
              {modalError && <div className="blog-modal__error">{modalError}</div>}
              <div className="form-group">
                <label htmlFor="lib-title">Título *</label>
                <input
                  id="lib-title"
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  disabled={savingAdd}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lib-desc">Descrição *</label>
                <textarea
                  id="lib-desc"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  disabled={savingAdd}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lib-drive">Link ou ID do Google Drive *</label>
                <input
                  id="lib-drive"
                  type="text"
                  value={form.driveLinkOrId}
                  onChange={(e) => setForm((p) => ({ ...p, driveLinkOrId: e.target.value }))}
                  placeholder="https://drive.google.com/file/d/.../view?usp=sharing"
                  disabled={savingAdd}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lib-slug">Slug</label>
                <input
                  id="lib-slug"
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                  placeholder="Opcional (gerado a partir do título se vazio)"
                  disabled={savingAdd}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lib-cover">Capa (retrato recomendado)</label>
                <div className="blog-image-upload">
                  <input id="lib-cover" type="file" accept="image/*" onChange={handleFileChange} disabled={savingAdd} />
                  <div className="blog-image-preview biblioteca-cover-preview">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Pré-visualização da capa" />
                    ) : (
                      <div className="blog-image-preview__placeholder">Sem imagem</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="blog-modal__checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))}
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
                <button type="submit" className="blog-modal__btn blog-modal__btn--primary" disabled={savingAdd}>
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
              <h2 className="blog-modal__title">Editar documento</h2>
              <button type="button" className="blog-modal__close" onClick={() => setIsEditOpen(false)} disabled={savingEdit}>
                ×
              </button>
            </div>
            <form className="blog-modal__body blog-modal-form" onSubmit={handleSubmitEdit}>
              {editError && <div className="blog-modal__error">{editError}</div>}
              <div className="form-group">
                <label htmlFor="lib-edit-title">Título *</label>
                <input
                  id="lib-edit-title"
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))}
                  disabled={savingEdit}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lib-edit-desc">Descrição *</label>
                <textarea
                  id="lib-edit-desc"
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                  disabled={savingEdit}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lib-edit-drive">Link ou ID do Google Drive *</label>
                <input
                  id="lib-edit-drive"
                  type="text"
                  value={editForm.driveLinkOrId}
                  onChange={(e) => setEditForm((p) => ({ ...p, driveLinkOrId: e.target.value }))}
                  disabled={savingEdit}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lib-edit-slug">Slug</label>
                <input
                  id="lib-edit-slug"
                  type="text"
                  value={editForm.slug}
                  onChange={(e) => setEditForm((p) => ({ ...p, slug: e.target.value }))}
                  disabled={savingEdit}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lib-edit-cover">Capa</label>
                <div className="blog-image-upload">
                  <input id="lib-edit-cover" type="file" accept="image/*" onChange={handleEditFileChange} disabled={savingEdit} />
                  <div className="blog-image-preview biblioteca-cover-preview">
                    {editPreviewUrl ? (
                      <img src={editPreviewUrl} alt="Pré-visualização" />
                    ) : resolveImageUrl(editForm.coverImagePath) ? (
                      <img src={resolveImageUrl(editForm.coverImagePath)} alt="Capa atual" />
                    ) : (
                      <div className="blog-image-preview__placeholder">Sem imagem</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="blog-modal__checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={editForm.published}
                    onChange={(e) => setEditForm((p) => ({ ...p, published: e.target.checked }))}
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

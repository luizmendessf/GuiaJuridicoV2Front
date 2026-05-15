import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Construction } from "lucide-react";
import LibraryDocumentCard from "../components/cards/LibraryDocumentCard";
import {
  createLibraryDocument,
  deleteLibraryDocument,
  getLibraryDocumentAdminById,
  getLibraryDocuments,
  getLibraryDocumentsAdmin,
  resolveImageUrl,
  resolveLibraryCoverUrl,
  updateLibraryDocument,
  uploadImage,
  uploadLibraryPdf,
} from "../services/apiService";
import { useAuth } from "../context/AuthContext";
import "./Blog.css";
import "./Biblioteca.css";

const BIBLIOTECA_EM_BREVE = false;

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
    pdfFilename: "",
    published: false,
  });
  const [pdfUploading, setPdfUploading] = useState(false);
  const [autoCoverPreviewUrl, setAutoCoverPreviewUrl] = useState(null);

  const resetAddForm = () => {
    setForm({
      title: "",
      description: "",
      slug: "",
      pdfFilename: "",
      published: false,
    });
    setImageFile(null);
    setPreviewUrl(null);
    setAutoCoverPreviewUrl(null);
    setPdfUploading(false);
    setModalError("");
  };

  useEffect(() => {
    if (BIBLIOTECA_EM_BREVE) return;
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
    if (BIBLIOTECA_EM_BREVE) return;
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
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setAutoCoverPreviewUrl(null);
    } else {
      setPreviewUrl(null);
      if (form.pdfFilename) {
        setAutoCoverPreviewUrl(resolveLibraryCoverUrl({ pdfFilename: form.pdfFilename }));
      }
    }
  };

  const handlePdfChange = async (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setModalError("Selecione um arquivo PDF.");
      return;
    }
    setModalError("");
    setPdfUploading(true);
    try {
      const { data } = await uploadLibraryPdf(file);
      const filename = data?.filename || data?.url?.split("/pdfs/").pop()?.split("?")[0];
      if (!filename) {
        setModalError("Resposta inválida ao enviar o PDF.");
        return;
      }
      setForm((p) => ({ ...p, pdfFilename: filename }));
      if (!imageFile) {
        setAutoCoverPreviewUrl(resolveLibraryCoverUrl({ pdfFilename: filename }));
      }
    } catch {
      setModalError("Falha ao enviar o PDF. Tente novamente.");
    } finally {
      setPdfUploading(false);
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
    const description = form.description.trim();
    const slug = form.slug.trim();
    const pdfFilename = form.pdfFilename.trim();

    if (!title || !description || !pdfFilename) {
      setModalError("Preencha título, subtítulo e envie o PDF.");
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
        pdfFilename,
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
      else if (status === 400) setModalError(err?.response?.data?.message || "Dados inválidos. Verifique o PDF e os campos.");
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
    pdfFilename: "",
    published: false,
    coverImagePath: "",
  });
  const [editPdfUploading, setEditPdfUploading] = useState(false);
  const [editAutoCoverPreviewUrl, setEditAutoCoverPreviewUrl] = useState(null);

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
        pdfFilename: data?.pdfFilename || "",
        published: !!data?.published,
        coverImagePath: data?.coverImagePath || "",
      });
      setEditAutoCoverPreviewUrl(
        data?.coverImagePath ? null : resolveLibraryCoverUrl({ pdfFilename: data?.pdfFilename })
      );
    } catch {
      setEditError("Não foi possível carregar o documento para edição.");
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setEditImageFile(file);
    if (file) {
      setEditPreviewUrl(URL.createObjectURL(file));
      setEditAutoCoverPreviewUrl(null);
    } else {
      setEditPreviewUrl(null);
      if (editForm.pdfFilename) {
        setEditAutoCoverPreviewUrl(resolveLibraryCoverUrl({ pdfFilename: editForm.pdfFilename }));
      }
    }
  };

  const handleEditPdfChange = async (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      setEditError("Selecione um arquivo PDF.");
      return;
    }
    setEditError("");
    setEditPdfUploading(true);
    try {
      const { data } = await uploadLibraryPdf(file);
      const filename = data?.filename || data?.url?.split("/pdfs/").pop()?.split("?")[0];
      if (!filename) {
        setEditError("Resposta inválida ao enviar o PDF.");
        return;
      }
      setEditForm((p) => ({ ...p, pdfFilename: filename }));
      if (!editImageFile) {
        setEditAutoCoverPreviewUrl(resolveLibraryCoverUrl({ pdfFilename: filename }));
      }
    } catch {
      setEditError("Falha ao enviar o PDF. Tente novamente.");
    } finally {
      setEditPdfUploading(false);
    }
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
    const pdfFilename = editForm.pdfFilename.trim();

    if (!title || !description || !pdfFilename) {
      setEditError("Preencha título, subtítulo e o PDF.");
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
        pdfFilename,
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

  if (BIBLIOTECA_EM_BREVE) {
    return (
      <div className="blog-page biblioteca-page biblioteca-coming">
        <div className="container">
          <div className="biblioteca-coming__icon-wrap" aria-hidden>
            <Construction size={32} strokeWidth={2} />
          </div>
          <h1 className="page-title">Biblioteca</h1>
          <p className="biblioteca-coming__lead">
            Estamos preparando materiais e documentos para vocês. Volte em breve.
          </p>
          <Link to="/" className="biblioteca-coming__link">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-page biblioteca-page">
      <div className="container">
        <header className="page-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">Biblioteca</h1>
              <p className="page-subtitle">
                PDFs e materiais de consulta publicados pela equipe. 
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
                <label htmlFor="lib-desc">Subtítulo *</label>
                <textarea
                  id="lib-desc"
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  disabled={savingAdd}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lib-pdf">PDF *</label>
                <input
                  id="lib-pdf"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handlePdfChange}
                  disabled={savingAdd || pdfUploading}
                />
                {pdfUploading && <p className="biblioteca-upload-hint">Enviando PDF...</p>}
                {form.pdfFilename && !pdfUploading && (
                  <p className="biblioteca-upload-hint biblioteca-upload-hint--ok">
                    PDF carregado: {form.pdfFilename}
                  </p>
                )}
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
                <label htmlFor="lib-cover">Capa opcional (gerada automaticamente a partir do PDF)</label>
                <div className="blog-image-upload">
                  <input id="lib-cover" type="file" accept="image/*" onChange={handleFileChange} disabled={savingAdd} />
                  <div className="blog-image-preview biblioteca-cover-preview">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Prévia da capa" />
                    ) : autoCoverPreviewUrl ? (
                      <img src={autoCoverPreviewUrl} alt="Capa gerada a partir do PDF" />
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
                <label htmlFor="lib-edit-desc">Subtítulo *</label>
                <textarea
                  id="lib-edit-desc"
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                  disabled={savingEdit}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lib-edit-pdf">PDF *</label>
                <input
                  id="lib-edit-pdf"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleEditPdfChange}
                  disabled={savingEdit || editPdfUploading}
                />
                {editPdfUploading && <p className="biblioteca-upload-hint">Enviando PDF...</p>}
                {editForm.pdfFilename && !editPdfUploading && (
                  <p className="biblioteca-upload-hint biblioteca-upload-hint--ok">
                    PDF atual: {editForm.pdfFilename}
                  </p>
                )}
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
                <label htmlFor="lib-edit-cover">Capa opcional (gerada automaticamente a partir do PDF)</label>
                <div className="blog-image-upload">
                  <input id="lib-edit-cover" type="file" accept="image/*" onChange={handleEditFileChange} disabled={savingEdit} />
                  <div className="blog-image-preview biblioteca-cover-preview">
                    {editPreviewUrl ? (
                      <img src={editPreviewUrl} alt="Prévia da capa" />
                    ) : resolveImageUrl(editForm.coverImagePath) ? (
                      <img src={resolveImageUrl(editForm.coverImagePath)} alt="Capa atual" />
                    ) : editAutoCoverPreviewUrl ? (
                      <img src={editAutoCoverPreviewUrl} alt="Capa gerada a partir do PDF" />
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

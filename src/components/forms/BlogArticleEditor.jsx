import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import { contentForEditor } from "../../utils/blogContent";
import { resolveImageUrl, uploadImage } from "../../services/apiService";
import "./BlogArticleEditor.css";

function ToolbarButton({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      className={`blog-editor__btn ${active ? "is-active" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <span className="blog-editor__divider" aria-hidden="true" />;
}

export default function BlogArticleEditor({ id, value, onChange, disabled = false, label = "Conteúdo *" }) {
  const fileInputRef = useRef(null);
  const insertImageRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        defaultProtocol: "https",
        protocols: ["http", "https", "mailto"],
      }),
      TextAlign.configure({
        types: ["heading", "paragraph", "image"],
      }),
      Image.configure({
        HTMLAttributes: {
          class: "blog-editor-image",
        },
        resize: {
          enabled: true,
          directions: ["bottom-right", "bottom-left", "top-right", "top-left"],
          minWidth: 120,
          minHeight: 80,
          alwaysPreserveAspectRatio: true,
        },
      }),
    ],
    [],
  );

  const editor = useEditor({
    extensions,
    content: contentForEditor(value),
    editable: !disabled,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        id,
        class: "blog-editor__content",
        "aria-label": label,
      },
      handleDrop: (view, event) => {
        const file = Array.from(event.dataTransfer?.files || []).find((item) =>
          item.type.startsWith("image/"),
        );
        if (!file) return false;

        event.preventDefault();
        void insertImageRef.current?.(file);
        return true;
      },
      handlePaste: (view, event) => {
        const file = Array.from(event.clipboardData?.items || [])
          .find((item) => item.type.startsWith("image/"))
          ?.getAsFile();
        if (!file) return false;

        event.preventDefault();
        void insertImageRef.current?.(file);
        return true;
      },
    },
  });

  const insertImageFromFile = useCallback(
    async (file) => {
      if (!editor || !file || !file.type.startsWith("image/")) return;

      setUploadingImage(true);
      try {
        const { data } = await uploadImage(file);
        const src = resolveImageUrl(data?.url || data?.filename || data);
        if (!src) {
          window.alert("Não foi possível obter a URL da imagem enviada.");
          return;
        }

        const alt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
        editor.chain().focus().setImage({ src, alt: alt || "Imagem do artigo" }).run();
      } catch {
        window.alert("Não foi possível enviar a imagem. Tente novamente.");
      } finally {
        setUploadingImage(false);
      }
    },
    [editor],
  );

  insertImageRef.current = insertImageFromFile;

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (!editor) return;

    const normalizedValue = contentForEditor(value);
    const currentHtml = editor.getHTML();

    if (normalizedValue === currentHtml) return;
    if (editor.isFocused) return;

    editor.commands.setContent(normalizedValue, false);
  }, [editor, value]);

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes("link").href || "";
    const url = window.prompt("URL do link:", previousUrl);

    if (url === null) return;

    const trimmed = url.trim();
    if (!trimmed) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    const href = /^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }, [editor]);

  const handlePickImage = () => {
    if (disabled || uploadingImage) return;
    fileInputRef.current?.click();
  };

  const handleImageSelected = (event) => {
    const file = event.target.files?.[0];
    if (file) void insertImageFromFile(file);
    event.target.value = "";
  };

  const imageSelected = editor?.isActive("image");

  if (!editor) {
    return (
      <div className="form-group">
        <label htmlFor={id}>{label}</label>
        <div className="blog-editor blog-editor--loading">Carregando editor...</div>
      </div>
    );
  }

  return (
    <div className="form-group">
      <label htmlFor={id}>{label}</label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="blog-editor__file-input"
        onChange={handleImageSelected}
        tabIndex={-1}
        aria-hidden="true"
      />
      <div className={`blog-editor ${disabled ? "is-disabled" : ""}`}>
        <div className="blog-editor__toolbar" role="toolbar" aria-label="Formatação do conteúdo">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            disabled={disabled}
            title="Negrito"
          >
            <strong>B</strong>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            disabled={disabled}
            title="Itálico"
          >
            <em>I</em>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive("underline")}
            disabled={disabled}
            title="Sublinhado"
          >
            <span className="blog-editor__underline">U</span>
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            disabled={disabled}
            title="Tachado"
          >
            <span className="blog-editor__strike">S</span>
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            disabled={disabled}
            title="Título H2"
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            disabled={disabled}
            title="Título H3"
          >
            H3
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            disabled={disabled}
            title="Lista com marcadores"
          >
            • Lista
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            disabled={disabled}
            title="Lista numerada"
          >
            1. Lista
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            disabled={disabled}
            title="Citação"
          >
            “ ”
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={handlePickImage}
            active={false}
            disabled={disabled || uploadingImage}
            title="Inserir imagem (ou arraste/cole no texto)"
          >
            {uploadingImage ? "..." : "Img"}
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            active={editor.isActive({ textAlign: "left" })}
            disabled={disabled}
            title="Alinhar à esquerda"
          >
            Esq
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            active={editor.isActive({ textAlign: "center" })}
            disabled={disabled}
            title="Centralizar"
          >
            Centro
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            active={editor.isActive({ textAlign: "right" })}
            disabled={disabled}
            title="Alinhar à direita"
          >
            Dir
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            active={editor.isActive({ textAlign: "justify" })}
            disabled={disabled || imageSelected}
            title="Justificar"
          >
            Just
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={setLink}
            active={editor.isActive("link")}
            disabled={disabled}
            title="Inserir ou editar link"
          >
            🔗
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().unsetLink().run()}
            active={false}
            disabled={disabled || !editor.isActive("link")}
            title="Remover link"
          >
            ✕ Link
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            active={false}
            disabled={disabled || !editor.can().undo()}
            title="Desfazer"
          >
            ↶
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            active={false}
            disabled={disabled || !editor.can().redo()}
            title="Refazer"
          >
            ↷
          </ToolbarButton>
        </div>

        <p className="blog-editor__hint">
          Imagens: use o botão <strong>Img</strong>, ou arraste/cole no texto. Selecione a imagem para redimensionar (cantos) ou alinhar.
        </p>

        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

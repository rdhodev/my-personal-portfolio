"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import { Icon } from "@iconify/react";
import {
  useEffect,
  useRef,
  useCallback,
  useState,
  useLayoutEffect,
} from "react";
import { createClient } from "@/utils/supabase/client";

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

// ─── Toolbar Button ──────────────────────────────────────────────────────────
function ToolBtn({
  onClick,
  active,
  title,
  icon,
  label,
  disabled,
}: {
  onClick: () => void;
  active?: boolean;
  title: string;
  icon?: string;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        if (!disabled) onClick();
      }}
      title={title}
      disabled={disabled}
      className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm transition-all duration-150 select-none ${
        active
          ? "bg-pine-500/20 text-pine-400"
          : "text-mist hover:bg-coal-800 hover:text-bone"
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {icon ? <Icon icon={icon} className="text-base" /> : label}
    </button>
  );
}

// ─── Bubble Menu (custom, position tracked via selection) ─────────────────────
function CustomBubbleMenu({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const setLink = useCallback(() => {
    if (!editor) return;
    const prevUrl = editor.getAttributes("link").href;
    const url = window.prompt("Masukkan URL:", prevUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  useLayoutEffect(() => {
    if (!editor) return;

    const updatePosition = () => {
      const { from, to, empty } = editor.state.selection;
      if (empty) {
        setPos(null);
        return;
      }

      const editorDom = editor.view.dom;
      const editorRect = editorDom.getBoundingClientRect();
      const editorParent = editorDom.parentElement?.getBoundingClientRect();
      if (!editorParent) return;

      try {
        const fromCoords = editor.view.coordsAtPos(from);
        const toCoords = editor.view.coordsAtPos(to);
        const midLeft = (fromCoords.left + toCoords.right) / 2;

        setPos({
          top: fromCoords.top - editorParent.top - 50,
          left: midLeft - editorParent.left,
        });
      } catch {
        setPos(null);
      }
    };

    editor.on("selectionUpdate", updatePosition);
    editor.on("transaction", updatePosition);
    return () => {
      editor.off("selectionUpdate", updatePosition);
      editor.off("transaction", updatePosition);
    };
  }, [editor]);

  if (!editor || !pos) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 flex items-center gap-0.5 bg-coal-900 border border-coal-700 shadow-2xl shadow-black/60 rounded-xl px-2 py-1.5 pointer-events-auto animate-[bubbleIn_0.15s_ease-out]"
      style={{
        top: `${Math.max(4, pos.top)}px`,
        left: `${pos.left}px`,
        transform: "translateX(-50%)",
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold (Ctrl+B)"
        icon="solar:text-bold-linear"
      />
      <ToolBtn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic (Ctrl+I)"
        icon="solar:text-italic-linear"
      />
      <ToolBtn
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title="Underline"
        icon="solar:text-underline-linear"
      />
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        active={editor.isActive("highlight")}
        title="Highlight"
        icon="solar:pen-2-linear"
      />
      <div className="w-px h-4 bg-coal-700 mx-0.5" />
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
        label="H2"
      />
      <ToolBtn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
        label="H3"
      />
      <div className="w-px h-4 bg-coal-700 mx-0.5" />
      <ToolBtn
        onClick={setLink}
        active={editor.isActive("link")}
        title="Insert Link"
        icon="solar:link-linear"
      />
      <ToolBtn
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Blockquote"
        icon="solar:quote-linear"
      />
      <ToolBtn
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="Inline Code"
        icon="solar:code-linear"
      />
    </div>
  );
}

// ─── Floating Menu (shows on empty lines) ─────────────────────────────────────
function CustomFloatingMenu({
  editor,
  onImageClick,
}: {
  editor: ReturnType<typeof useEditor>;
  onImageClick: () => void;
}) {
  const [pos, setPos] = useState<{ top: number } | null>(null);

  useLayoutEffect(() => {
    if (!editor) return;

    const updatePosition = () => {
      const { $from, empty } = editor.state.selection;
      if (!empty) {
        setPos(null);
        return;
      }

      const node = $from.node();
      const isEmpty = node.textContent === "" && node.childCount === 0;
      const isTopLevel = $from.depth === 1;

      if (!isEmpty || !isTopLevel) {
        setPos(null);
        return;
      }

      try {
        const coords = editor.view.coordsAtPos($from.pos);
        const parentRect = editor.view.dom.parentElement?.getBoundingClientRect();
        if (!parentRect) return;

        setPos({ top: coords.top - parentRect.top - 2 });
      } catch {
        setPos(null);
      }
    };

    editor.on("selectionUpdate", updatePosition);
    editor.on("transaction", updatePosition);
    editor.on("focus", updatePosition);
    editor.on("blur", () => setPos(null));

    return () => {
      editor.off("selectionUpdate", updatePosition);
      editor.off("transaction", updatePosition);
      editor.off("focus", updatePosition);
    };
  }, [editor]);

  if (!editor || !pos) return null;

  return (
    <div
      className="absolute z-40 flex items-center gap-1 bg-coal-900/95 backdrop-blur border border-coal-700 shadow-xl shadow-black/40 rounded-xl px-2 py-1.5 pointer-events-auto animate-[bubbleIn_0.15s_ease-out]"
      style={{
        top: `${pos.top}px`,
        left: "-8px",
        transform: "translateX(-100%)",
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          onImageClick();
        }}
        title="Sisipkan Gambar"
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-mist hover:bg-coal-800 hover:text-bone transition"
      >
        <Icon icon="solar:gallery-add-linear" className="text-base text-pine-400" />
        Gambar
      </button>
      <div className="w-px h-4 bg-coal-700" />
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleCodeBlock().run();
        }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-mist hover:bg-coal-800 hover:text-bone transition"
      >
        <Icon icon="solar:code-square-linear" className="text-base text-pine-400" />
        Code
      </button>
      <div className="w-px h-4 bg-coal-700" />
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().toggleBlockquote().run();
        }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-mist hover:bg-coal-800 hover:text-bone transition"
      >
        <Icon icon="solar:quote-linear" className="text-base text-pine-400" />
        Quote
      </button>
      <div className="w-px h-4 bg-coal-700" />
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault();
          editor.chain().focus().setHorizontalRule().run();
        }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-mist hover:bg-coal-800 hover:text-bone transition"
      >
        <Icon icon="solar:minus-linear" className="text-base text-pine-400" />
        Divider
      </button>
    </div>
  );
}

// ─── Main Editor ─────────────────────────────────────────────────────────────
export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Mulai menulis cerita Anda...",
}: RichTextEditorProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadToast, setUploadToast] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-xl max-w-full mx-auto my-4 shadow-lg border border-coal-800",
        },
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-pine-400 underline underline-offset-2 hover:text-pine-300 transition",
          rel: "noopener noreferrer",
          target: "_blank",
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      Highlight.configure({
        HTMLAttributes: {
          class: "bg-pine-500/20 text-pine-300 rounded px-0.5",
        },
      }),
      CharacterCount,
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
      setWordCount(editor.storage.characterCount.words());
    },
    editorProps: {
      attributes: {
        class:
          "tiptap min-h-[420px] focus:outline-none px-4 py-5 leading-relaxed",
      },
    },
    immediatelyRender: false,
  });

  // Sync external content (e.g. on load from DB)
  useEffect(() => {
    if (!editor) return;
    if (content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // ─── Image Upload ─────────────────────────────────────────────────────
  const handleImageUpload = useCallback(
    async (file: File) => {
      if (file.size > 5 * 1024 * 1024) {
        setUploadToast("❌ File melebihi batas 5MB");
        setTimeout(() => setUploadToast(null), 3000);
        return;
      }
      setUploading(true);
      setUploadToast("⏳ Mengunggah gambar...");

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      try {
        let finalUrl = "";

        const { data, error } = await supabase.storage
          .from("portfolio-assets")
          .upload(filePath, file, { cacheControl: "3600", upsert: true });

        if (error) {
          const { data: fbData, error: fbError } = await supabase.storage
            .from("blog-assets")
            .upload(filePath, file, { cacheControl: "3600", upsert: true });
          if (fbError) throw fbError;
          const { data: urlData } = supabase.storage
            .from("blog-assets")
            .getPublicUrl(filePath);
          finalUrl = urlData.publicUrl;
        } else if (data) {
          const { data: urlData } = supabase.storage
            .from("portfolio-assets")
            .getPublicUrl(filePath);
          finalUrl = urlData.publicUrl;
        }

        if (finalUrl && editor) {
          editor
            .chain()
            .focus()
            .setImage({ src: finalUrl, alt: file.name })
            .run();
          setUploadToast("✅ Gambar berhasil disisipkan!");
        }
      } catch (err: any) {
        setUploadToast("❌ Gagal upload: " + err.message);
      } finally {
        setUploading(false);
        setTimeout(() => setUploadToast(null), 3000);
      }
    },
    [editor, supabase]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = "";
  };

  // Drag & Drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        e.preventDefault();
        handleImageUpload(file);
      }
    },
    [handleImageUpload]
  );

  // Add link
  const setLink = useCallback(() => {
    if (!editor) return;
    const prevUrl = editor.getAttributes("link").href;
    const url = window.prompt("Masukkan URL:", prevUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="relative">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Upload toast */}
      {uploadToast && (
        <div className="absolute -top-10 left-0 z-50 text-xs px-3 py-1.5 rounded-lg bg-coal-800 border border-coal-700 text-bone shadow-lg">
          {uploadToast}
        </div>
      )}

      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 flex-wrap px-3 py-2 border border-coal-700 rounded-t-xl bg-coal-900 border-b-0">
        {/* Headings */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
          label="H1"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
          label="H2"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          title="Heading 3"
          label="H3"
        />

        <div className="w-px h-5 bg-coal-700 mx-1" />

        {/* Formatting */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
          icon="solar:text-bold-linear"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
          icon="solar:text-italic-linear"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline (Ctrl+U)"
          icon="solar:text-underline-linear"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
          title="Strikethrough"
          icon="solar:text-cross-linear"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive("highlight")}
          title="Highlight"
          icon="solar:pen-2-linear"
        />

        <div className="w-px h-5 bg-coal-700 mx-1" />

        {/* Blocks */}
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Blockquote"
          icon="solar:quote-linear"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
          title="Inline Code"
          icon="solar:code-linear"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code Block"
          icon="solar:code-square-linear"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet List"
          icon="solar:list-linear"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Ordered List"
          icon="solar:list-arrow-down-minimalistic-linear"
        />

        <div className="w-px h-5 bg-coal-700 mx-1" />

        {/* Link & Image */}
        <ToolBtn
          onClick={setLink}
          active={editor.isActive("link")}
          title="Insert Link"
          icon="solar:link-linear"
        />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            fileInputRef.current?.click();
          }}
          title="Insert Image"
          disabled={uploading}
          className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm transition-all duration-150 ${
            uploading
              ? "text-pine-400"
              : "text-mist hover:bg-coal-800 hover:text-bone"
          } disabled:opacity-40`}
        >
          <Icon
            icon={uploading ? "solar:refresh-bold" : "solar:gallery-add-linear"}
            className={`text-base ${uploading ? "animate-spin" : ""}`}
          />
        </button>

        <div className="w-px h-5 bg-coal-700 mx-1" />

        {/* Divider, Undo, Redo */}
        <ToolBtn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Divider"
          icon="solar:minus-linear"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
          icon="solar:undo-left-linear"
        />
        <ToolBtn
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo (Ctrl+Y)"
          icon="solar:undo-right-linear"
        />

        {/* Word count */}
        <div className="ml-auto text-[10px] text-coal-600 font-mono pr-1">
          {wordCount} kata
        </div>
      </div>

      {/* ── Editor wrapper (relative for menu positioning) ────────────── */}
      <div
        ref={editorWrapperRef}
        className="relative border border-coal-700 rounded-b-xl bg-coal-950 focus-within:border-pine-500/50 focus-within:ring-2 focus-within:ring-pine-500/10 transition-all overflow-visible"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {/* Bubble Menu */}
        <CustomBubbleMenu editor={editor} />

        {/* Floating Menu */}
        <CustomFloatingMenu
          editor={editor}
          onImageClick={() => fileInputRef.current?.click()}
        />

        {/* Editor Content */}
        <EditorContent editor={editor} />
      </div>

      {/* Hint */}
      <p className="mt-1.5 text-[10px] text-coal-600 font-mono text-right">
        Seret gambar ke area editor · Pilih teks untuk format · Klik baris kosong untuk insert
      </p>
    </div>
  );
}

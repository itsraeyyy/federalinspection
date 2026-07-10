"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { 
  IconBold, 
  IconItalic, 
  IconUnderline, 
  IconList, 
  IconListNumbers, 
  IconLink,
  IconUnlink,
  IconFileUpload,
  IconLoader2,
  IconFileText,
  IconX
} from '@tabler/icons-react';
import { useRef, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export interface RichTextValue {
  html: string;
  attachment_url: string | null;
  attachment_name: string | null;
}

interface RichTextEditorProps {
  value: RichTextValue | string | null;
  onChange: (val: RichTextValue) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function RichTextEditor({ value, onChange, placeholder = "እዚህ ይፃፉ...", disabled = false }: RichTextEditorProps) {
  // Normalize value
  const isLegacy = typeof value === 'string';
  const initialHtml = isLegacy ? value : (value?.html || "");
  const initialUrl = isLegacy ? null : (value?.attachment_url || null);
  const initialName = isLegacy ? null : (value?.attachment_name || null);

  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(initialUrl);
  const [attachmentName, setAttachmentName] = useState<string | null>(initialName);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-sync props if they change externally
  useEffect(() => {
    setAttachmentUrl(initialUrl);
    setAttachmentName(initialName);
  }, [initialUrl, initialName]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: initialHtml,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange({
        html: editor.getHTML(),
        attachment_url: attachmentUrl,
        attachment_name: attachmentName
      });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-4 text-sm',
      },
    },
  });

  // Re-sync editor content if the external html string completely changes (e.g., switching tabs)
  useEffect(() => {
    if (editor && editor.getHTML() !== initialHtml) {
      editor.commands.setContent(initialHtml);
    }
  }, [initialHtml, editor]);

  // Sync state changes back to parent
  const notifyChange = (url: string | null, name: string | null) => {
    onChange({
      html: editor?.getHTML() || "",
      attachment_url: url,
      attachment_name: name
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 50 * 1024 * 1024) {
        setError("የፋይሉ መጠን ከ50MB መብለጥ የለበትም");
        return;
      }
      setError(null);
      setIsUploading(true);

      try {
        const fileExt = selectedFile.name.split('.').pop() || '';
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const storagePath = `feedback_attachments/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('report_attachments')
          .upload(storagePath, selectedFile, { upsert: true });

        if (uploadError) throw new Error(uploadError.message);

        const { data: publicData } = supabase.storage
          .from('report_attachments')
          .getPublicUrl(storagePath);

        const url = publicData.publicUrl;
        const name = selectedFile.name;
        
        setAttachmentUrl(url);
        setAttachmentName(name);
        notifyChange(url, name);

      } catch (err: any) {
        setError(`ፋይል ማያያዝ አልተቻለም: ${err.message}`);
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const clearFile = () => {
    setAttachmentName(null);
    setAttachmentUrl(null);
    notifyChange(null, null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleLink = () => {
    if (!editor) return;
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run();
    } else {
      const url = window.prompt('URL ያስገቡ');
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
  };

  if (!editor) return null;

  return (
    <div className="flex flex-col border border-border-medium rounded-xl overflow-hidden bg-surface-primary">
      {/* Toolbar */}
      {!disabled && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border-light bg-surface-secondary/50">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bold') ? 'bg-brand-blue/10 text-brand-blue' : 'text-text-secondary hover:bg-border-light/50 hover:text-text-primary'}`}
            title="Bold"
          >
            <IconBold size={18} stroke={2.5} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('italic') ? 'bg-brand-blue/10 text-brand-blue' : 'text-text-secondary hover:bg-border-light/50 hover:text-text-primary'}`}
            title="Italic"
          >
            <IconItalic size={18} stroke={2.5} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('underline') ? 'bg-brand-blue/10 text-brand-blue' : 'text-text-secondary hover:bg-border-light/50 hover:text-text-primary'}`}
            title="Underline"
          >
            <IconUnderline size={18} stroke={2.5} />
          </button>
          
          <div className="w-px h-5 bg-border-medium mx-1" />
          
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('bulletList') ? 'bg-brand-blue/10 text-brand-blue' : 'text-text-secondary hover:bg-border-light/50 hover:text-text-primary'}`}
            title="Bullet List"
          >
            <IconList size={18} stroke={2} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('orderedList') ? 'bg-brand-blue/10 text-brand-blue' : 'text-text-secondary hover:bg-border-light/50 hover:text-text-primary'}`}
            title="Numbered List"
          >
            <IconListNumbers size={18} stroke={2} />
          </button>
          
          <div className="w-px h-5 bg-border-medium mx-1" />
          
          <button
            type="button"
            onClick={toggleLink}
            className={`p-1.5 rounded-lg transition-colors ${editor.isActive('link') ? 'bg-brand-blue/10 text-brand-blue' : 'text-text-secondary hover:bg-border-light/50 hover:text-text-primary'}`}
            title={editor.isActive('link') ? "Remove Link" : "Add Link"}
          >
            {editor.isActive('link') ? <IconUnlink size={18} stroke={2} /> : <IconLink size={18} stroke={2} />}
          </button>

          <div className="flex-1" />

          {/* Attachment Toolbar Button */}
          {!attachmentUrl && (
            <button
              type="button"
              onClick={() => !isUploading && fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-brand-blue hover:bg-brand-blue/10 bg-brand-blue/5 border border-brand-blue/10 disabled:opacity-50"
            >
              {isUploading ? <IconLoader2 size={16} className="animate-spin" /> : <IconFileUpload size={16} />}
              {isUploading ? 'በመጫን ላይ...' : 'ፋይል አያይዝ'}
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="px-4 py-2 bg-status-error/10 text-status-error text-xs font-medium border-b border-status-error/20">
          {error}
        </div>
      )}

      {/* Editor Content */}
      <EditorContent editor={editor} className={editor.isEmpty ? 'before:content-[attr(data-placeholder)] before:text-text-muted before:absolute before:p-4 before:pointer-events-none relative' : ''} data-placeholder={placeholder} />

      {/* Attachment Display */}
      {attachmentUrl && (
        <div className="m-3 p-3 bg-brand-blue/5 border border-brand-blue/20 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
              <IconFileText size={16} className="text-brand-blue" />
            </div>
            <p className="text-sm font-medium text-text-primary truncate">{attachmentName || "Attached File"}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!disabled && (
              <button 
                type="button"
                onClick={clearFile}
                className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white text-text-secondary hover:text-status-error transition-all shadow-sm bg-transparent"
              >
                <IconX size={14} />
              </button>
            )}
          </div>
        </div>
      )}
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        disabled={disabled || isUploading}
      />
    </div>
  );
}

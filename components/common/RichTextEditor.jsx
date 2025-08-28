import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { useEffect, useState } from 'react';

export default function RichTextEditor({ value, onChange, placeholder, className, error }) {
  const [content, setContent] = useState(value || '');
  
  useEffect(() => {
    if (value !== content) {
      setContent(value || '');
    }
  }, [value]);

  const handleChange = (newContent) => {
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  return (
    <div className={`custom-rich-editor ${className || ''} ${error ? 'error' : ''}`}>
      <SimpleEditor 
        content={content}
        onChange={handleChange}
        placeholder={placeholder || 'Start typing...'}
        className="property-description-editor"
      />
      <style jsx>{`
        .custom-rich-editor {
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          margin-bottom: 20px;
          border: 1px solid #e5e5e5;
        }
        
        .custom-rich-editor.error {
          border: 1px solid #ff3b30;
        }
        
        .custom-rich-editor :global(.property-description-editor) {
          min-height: 250px;
        }
        
        /* Override SimpleEditor styles to match the website theme */
        .custom-rich-editor :global(.ProseMirror) {
          font-family: inherit;
          padding: 16px;
          color: #333;
        }

        .custom-rich-editor :global(.simple-editor-wrapper) {
          background-color: #fff;
        }

        .custom-rich-editor :global(.tiptap-toolbar) {
          background-color: #f9f9f9;
          border-bottom: 1px solid #e5e5e5;
        }

        .custom-rich-editor :global(.tiptap-button) {
          color: #666;
        }

        .custom-rich-editor :global(.tiptap-button[data-active=true]) {
          background-color: #e0e0e0;
          color: #1c1c1c;
        }

        .custom-rich-editor :global(.tiptap-button:hover) {
          background-color: #eaeaea;
        }

        .custom-rich-editor :global(.ProseMirror p) {
          margin-bottom: 1em;
        }

        .custom-rich-editor :global(.ProseMirror h1) {
          font-size: 1.8em;
          margin-top: 1em;
          margin-bottom: 0.5em;
          font-weight: 700;
        }

        .custom-rich-editor :global(.ProseMirror h2) {
          font-size: 1.5em;
          margin-top: 1em;
          margin-bottom: 0.5em;
          font-weight: 600;
        }

        .custom-rich-editor :global(.ProseMirror h3) {
          font-size: 1.3em;
          margin-top: 1em;
          margin-bottom: 0.5em;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
import React from 'react';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';

function RichTextEditor({ value, onChange, placeholder, error }) {
  return (
    <div className="rich-text-editor-container">
      <SimpleEditor 
        content={value} 
        onChange={onChange} 
        placeholder={placeholder || "Start typing..."} 
        className={error ? "has-error" : ""}
      />
    </div>
  )
}

export default RichTextEditor
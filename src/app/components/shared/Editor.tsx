'use client';

import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const Editor = ({ value, onChange }: EditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      const quill = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: {
            container: [
              [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              [{ 'script': 'sub'}, { 'script': 'super' }],
              [{ 'indent': '-1'}, { 'indent': '+1' }],
              [{ 'direction': 'rtl' }],
              [{ 'size': ['small', false, 'large', 'huge'] }],
              [{ 'color': [] }, { 'background': [] }],
              [{ 'font': [] }],
              [{ 'align': [] }],
              ['clean'],
              ['link', 'image', 'video']
            ],
            handlers: {
              image: () => {
                const input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*, image/webp');
                input.click();

                input.onchange = async () => {
                  if (input.files) {
                    const file = input.files[0];
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('prefix', 'editor');

                    try {
                      const res = await fetch('/api/image/upload', {
                        method: 'POST',
                        body: formData,
                      });

                      if (res.ok) {
                        const { url } = await res.json();
                        const range = quill.getSelection();
                        if (range) {
                          quill.insertEmbed(range.index, 'image', url);
                        }
                      } else {
                        console.error('Image upload failed');
                      }
                    } catch (error) {
                      console.error('Error uploading image:', error);
                    }
                  }
                };
              }
            }
          }
        }
      });
      quillRef.current = quill;

      quill.on('text-change', (delta, oldDelta, source) => {
        if (source === 'user') {
          onChange(quill.root.innerHTML);
        }
      });
    }
  }, [onChange]);

  useEffect(() => {
    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.clipboard.dangerouslyPasteHTML(value);
    }
  }, [value]);

  return <div ref={editorRef} style={{ height: '400px' }} />;
};

export default Editor;

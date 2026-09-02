'use client';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  Autoformat,
  Bold,
  ClassicEditor,
  Essentials,
  Heading,
  Italic,
  Link,
  List,
  Paragraph,
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';

import { cn } from '@/lib/utils';

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  className?: string;
};

export function RichTextEditorImpl({
  value,
  onChange,
  disabled,
  className,
}: RichTextEditorProps) {
  return (
    <div
      className={cn(
        'rich-text-editor min-w-0 max-w-full rounded-md border border-input [&_.ck-toolbar]:rounded-t-md [&_.ck-toolbar]:border-0 [&_.ck-toolbar]:border-b [&_.ck-toolbar]:border-input',
        className,
      )}
    >
      <CKEditor
        editor={ClassicEditor}
        disabled={disabled}
        data={value}
        config={{
          licenseKey: 'GPL',
          plugins: [
            Essentials,
            Paragraph,
            Heading,
            Bold,
            Italic,
            Link,
            List,
            Autoformat,
          ],
          toolbar: [
            'heading',
            '|',
            'bold',
            'italic',
            'link',
            '|',
            'bulletedList',
            'numberedList',
            '|',
            'undo',
            'redo',
          ],
        }}
        onChange={(_event, editor) => onChange(editor.getData())}
      />
    </div>
  );
}

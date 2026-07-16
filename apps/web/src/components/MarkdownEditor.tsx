import { useId, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger, Textarea } from '@/components/ui'
import { MarkdownContent } from './MarkdownContent'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minRows?: number
  id?: string
  'aria-invalid'?: boolean
}

/** GitHub-style write/preview markdown editor — plain textarea in, sanitized markdown out. */
export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  minRows = 6,
  id,
  ...aria
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<'write' | 'preview'>('write')
  const generatedId = useId()
  const textareaId = id ?? generatedId

  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as 'write' | 'preview')}>
      <TabsList>
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="write" className="mt-2">
        <Textarea
          id={textareaId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ minHeight: `${minRows * 1.6}rem` }}
          aria-invalid={aria['aria-invalid']}
        />
        <p className="mt-1 text-xs text-muted-foreground">Markdown supported.</p>
      </TabsContent>
      <TabsContent
        value="preview"
        className="mt-2 min-h-24 rounded-md border border-border p-3"
      >
        {value.trim() ? (
          <MarkdownContent content={value} />
        ) : (
          <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
        )}
      </TabsContent>
    </Tabs>
  )
}

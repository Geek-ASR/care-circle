import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { cn } from '@/utils/cn'

interface MarkdownContentProps {
  content: string
  className?: string
}

/**
 * The only place user-authored post/comment markdown gets rendered to HTML. Always goes
 * through rehype-sanitize — never render user content with dangerouslySetInnerHTML.
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        'max-w-none wrap-break-word text-sm leading-relaxed text-foreground',
        '[&_p]:my-2 first:[&_p]:mt-0 last:[&_p]:mb-0',
        '[&_h1]:mt-4 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold',
        '[&_h3]:mt-3 [&_h3]:text-sm [&_h3]:font-semibold',
        '[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5',
        '[&_li]:my-0.5',
        '[&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline',
        '[&_strong]:font-semibold [&_strong]:text-foreground',
        '[&_code]:rounded [&_code]:bg-surface-hover [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs',
        '[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-surface-hover [&_pre]:p-3',
        '[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border',
        '[&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground',
        '[&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-md',
        '[&_hr]:my-4 [&_hr]:border-border',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}

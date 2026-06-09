import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'

interface ServiceContentProps { markdown: string }

export default function ServiceContent({ markdown }: ServiceContentProps) {
  if (!markdown || !markdown.trim()) return null
  return (
    <section className="max-w-5xl mx-auto px-6 py-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-gray-600 text-base leading-relaxed">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks]}
          components={{
            h1: ({ children }) => <h2 className="text-2xl font-semibold text-plum-900 mt-2 mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{children}</h2>,
            h2: ({ children }) => <h3 className="text-xl font-semibold text-plum-900 mt-6 mb-3" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>{children}</h3>,
            h3: ({ children }) => <h4 className="text-base font-semibold text-gray-900 mt-5 mb-2">{children}</h4>,
            p: ({ children }) => <p className="mb-4">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
            em: ({ children }) => <em className="italic">{children}</em>,
            a: ({ href, children }) => <a href={href} className="text-brand-600 underline hover:text-brand-700" target="_blank" rel="noopener noreferrer">{children}</a>,
            ul: ({ children }) => <ul className="space-y-2 mb-4 pl-0 list-none">{children}</ul>,
            ol: ({ children }) => <ol className="space-y-2 mb-4 list-decimal list-inside">{children}</ol>,
            li: ({ children, className }) => {
              const isTask = className?.includes('task-list-item')
              return (
                <li className="flex gap-2 items-start">
                  {!isTask && <span className="text-brand-500 shrink-0 mt-1.5 text-xs">&#9679;</span>}
                  <span className="flex-1">{children}</span>
                </li>
              )
            },
            blockquote: ({ children }) => <blockquote className="border-l-4 border-brand-200 pl-4 italic text-gray-500 my-4">{children}</blockquote>,
            hr: () => <hr className="border-gray-200 my-6" />,
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </section>
  )
}

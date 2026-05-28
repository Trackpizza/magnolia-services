interface AlsoKnownAsProps { terms: string[] }
export default function AlsoKnownAs({ terms }: AlsoKnownAsProps) {
  if (!terms || terms.length === 0) return null
  return (
    <section className="max-w-5xl mx-auto px-6 py-4">
      <div className="px-6 py-5 rounded-2xl border border-gray-100 bg-white">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Also known as</p>
        <div className="flex flex-wrap gap-2">
          {terms.map(term => (
            <span key={term} className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-full">{term}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

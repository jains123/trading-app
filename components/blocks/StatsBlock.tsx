export default function StatsBlock({
  items,
}: {
  items: { value: string; label: string }[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {items.map((item, i) => (
          <div key={i} className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-[#58a6ff] font-mono">
              {item.value}
            </p>
            <p className="text-sm text-[#8b949e] mt-2">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

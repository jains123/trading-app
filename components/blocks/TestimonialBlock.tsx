export default function TestimonialBlock({
  quote,
  author,
  role,
}: {
  quote: string;
  author: string;
  role?: string;
}) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <blockquote className="text-lg md:text-xl text-[#e6edf3] italic leading-relaxed">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <div className="mt-6">
          <p className="text-sm font-semibold text-[#e6edf3]">{author}</p>
          {role && <p className="text-xs text-[#8b949e] mt-1">{role}</p>}
        </div>
      </div>
    </section>
  );
}

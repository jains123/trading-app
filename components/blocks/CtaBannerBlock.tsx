import Link from 'next/link';

export default function CtaBannerBlock({
  heading,
  description,
  buttonText,
  buttonLink,
}: {
  heading: string;
  description?: string;
  buttonText: string;
  buttonLink: string;
}) {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto bg-[#161b22] border border-[#30363d] rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-[#e6edf3]">{heading}</h2>
        {description && (
          <p className="text-[#8b949e] mt-4 max-w-2xl mx-auto">{description}</p>
        )}
        <Link
          href={buttonLink}
          className="inline-block mt-8 px-8 py-3 bg-[#58a6ff] text-[#0d1117] font-semibold rounded-lg hover:bg-[#79b8ff] transition-colors"
        >
          {buttonText}
        </Link>
      </div>
    </section>
  );
}

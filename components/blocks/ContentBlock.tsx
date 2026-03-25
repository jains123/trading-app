import { RichText } from '@payloadcms/richtext-lexical/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ContentBlock({ richText }: { richText: any }) {
  if (!richText) return null;

  return (
    <section className="py-16 px-4">
      <div className="max-w-3xl mx-auto prose prose-invert prose-sm">
        <RichText data={richText} />
      </div>
    </section>
  );
}

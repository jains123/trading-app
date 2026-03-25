import StatsBlock from './StatsBlock';
import TestimonialBlock from './TestimonialBlock';
import ContentBlock from './ContentBlock';
import CtaBannerBlock from './CtaBannerBlock';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function RenderBlock({ block }: { block: any }) {
  switch (block.blockType) {
    case 'stats':
      return <StatsBlock items={block.items ?? []} />;
    case 'testimonial':
      return (
        <TestimonialBlock
          quote={block.quote}
          author={block.author}
          role={block.role}
        />
      );
    case 'content':
      return <ContentBlock richText={block.richText} />;
    case 'cta-banner':
      return (
        <CtaBannerBlock
          heading={block.heading}
          description={block.description}
          buttonText={block.buttonText}
          buttonLink={block.buttonLink}
        />
      );
    default:
      return null;
  }
}

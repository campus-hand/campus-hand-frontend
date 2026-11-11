import { parseRichText } from '../models/rich-text';

/** Renders **bold** and ==highlight== markers as <strong> and <mark>. */
export function RichTextView({ text }: { text: string }) {
  return (
    <>
      {parseRichText(text).map((segment, i) => {
        if (segment.kind === 'bold') return <strong key={i}>{segment.text}</strong>;
        if (segment.kind === 'highlight') {
          return (
            <mark key={i} className="highlight">
              {segment.text}
            </mark>
          );
        }
        return <span key={i}>{segment.text}</span>;
      })}
    </>
  );
}

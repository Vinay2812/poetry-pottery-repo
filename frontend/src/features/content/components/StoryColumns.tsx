export interface StoryColumnsProps {
  paragraphs: string[];
}

// Text flows down the first column and on into the second, so it reads in order.
export function StoryColumns({ paragraphs }: StoryColumnsProps) {
  return (
    <div className="gap-16 text-[15px] leading-relaxed md:columns-2 md:text-base">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-5 max-w-prose break-inside-avoid">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

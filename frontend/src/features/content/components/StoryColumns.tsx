export interface StoryColumnsProps {
  paragraphs: string[];
}

export function StoryColumns({ paragraphs }: StoryColumnsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-16">
      {paragraphs.map((paragraph) => (
        <p
          key={paragraph}
          className="max-w-prose text-[15px] leading-relaxed md:text-base"
        >
          {paragraph}
        </p>
      ))}
    </div>
  );
}

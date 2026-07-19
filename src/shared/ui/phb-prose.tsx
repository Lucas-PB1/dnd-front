import { parsePhbText } from "@/shared/lib/parse-phb-text";
import { cn } from "@/shared/lib/utils";

type PhbProseProps = {
  text: string;
  className?: string;
};

export function PhbProse({ text, className }: PhbProseProps) {
  const blocks = parsePhbText(text);

  if (!blocks.length) return null;

  return (
    <div
      className={cn(
        "space-y-3 text-sm leading-relaxed text-muted-foreground",
        className,
      )}
    >
      {blocks.map((block, index) => {
        if (block.type === "list") {
          return (
            <ul
              key={`list-${index}`}
              className="list-disc space-y-1.5 pl-5 marker:text-primary"
            >
              {block.items.map((item, itemIndex) => (
                <li
                  key={`${index}-${itemIndex}`}
                  className="pl-1 text-foreground/90"
                >
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`p-${index}`} className="text-pretty">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

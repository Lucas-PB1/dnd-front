import type { FeatBenefit } from "@/entities/feat/types";

type FeatBenefitsProps = {
  benefits: FeatBenefit[];
  prerequisite?: string | null;
};

export function FeatBenefits({ benefits, prerequisite }: FeatBenefitsProps) {
  if (!prerequisite && benefits.length === 0) return null;

  return (
    <div className="mt-2 space-y-2 text-xs text-muted-foreground">
      {prerequisite ? (
        <p>
          <span className="font-medium text-foreground">Pré-requisito:</span>{" "}
          {prerequisite}
        </p>
      ) : null}
      {benefits.length > 0 ? (
        <ul className="space-y-1.5">
          {benefits.map((benefit, index) => (
            <li key={`${benefit.name ?? "benefit"}-${index}`}>
              {benefit.name ? (
                <span className="font-medium text-foreground">
                  {benefit.name}
                  {benefit.description ? ": " : ""}
                </span>
              ) : null}
              {benefit.description}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

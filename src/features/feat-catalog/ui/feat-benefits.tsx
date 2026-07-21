import type { FeatBenefit } from "@/entities/feat/types";
import { PhbProse } from "@/shared/ui/phb-prose";

type FeatBenefitsProps = {
  benefits: FeatBenefit[];
  prerequisite?: string | null;
};

export function FeatBenefits({ benefits, prerequisite }: FeatBenefitsProps) {
  if (!prerequisite && benefits.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Sem descrição cadastrada.</p>
    );
  }

  return (
    <div className="space-y-3">
      {prerequisite ? (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Pré-requisito:</span>{" "}
          {prerequisite}
        </p>
      ) : null}
      {benefits.map((benefit, index) => {
        const key = `${benefit.name ?? "benefit"}-${index}`;
        if (benefit.name && benefit.description) {
          return (
            <div key={key} className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {benefit.name}
              </p>
              <PhbProse text={benefit.description} />
            </div>
          );
        }
        if (benefit.description) {
          return <PhbProse key={key} text={benefit.description} />;
        }
        if (benefit.name) {
          return (
            <p key={key} className="text-sm text-foreground">
              {benefit.name}
            </p>
          );
        }
        return null;
      })}
    </div>
  );
}

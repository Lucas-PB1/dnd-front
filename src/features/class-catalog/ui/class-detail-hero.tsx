import type { ClassSummary } from "@/entities/class/types";
import { CatalogDetailHero } from "@/shared/ui/catalog-detail-hero";

type ClassDetailHeroProps = {
  cls: ClassSummary;
  backHref: string;
};

export function ClassDetailHero({ cls, backHref }: ClassDetailHeroProps) {
  const stats: { label: string; value: string }[] = [
    { label: "Dado de vida", value: cls.hitDie },
  ];
  if (cls.primaryAbilityLabel) {
    stats.push({ label: "Atributo", value: cls.primaryAbilityLabel });
  }
  if (cls.hpLevel1DieValue != null) {
    stats.push({ label: "PV nível 1", value: `${cls.hpLevel1DieValue} + CON` });
  }
  if (cls.hpFixedPerLevel != null) {
    stats.push({
      label: "PV por nível",
      value: `+${cls.hpFixedPerLevel} + CON`,
    });
  }
  if (cls.skillChoiceCount != null) {
    stats.push({
      label: "Perícias",
      value: `${cls.skillChoiceCount} à escolha${cls.skillChoiceFrom === "any" ? " (qualquer)" : ""}`,
    });
  }
  if (cls.savingThrowNames?.length) {
    stats.push({
      label: "Salvaguardas",
      value: cls.savingThrowNames.join(", "),
    });
  }

  return (
    <CatalogDetailHero
      backHref={backHref}
      backLabel="Classes"
      title={cls.name}
      titleExtra={
        <span className="font-mono text-sm tracking-wide text-secondary">
          {cls.hitDie}
        </span>
      }
      eyebrow={cls.tagline}
      summary={cls.summary}
      stats={stats}
    >
      {(cls.armorTrainingNames?.length || cls.weaponProficiencyNames?.length) ? (
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          {cls.armorTrainingNames?.length ? (
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Armaduras
              </dt>
              <dd>{cls.armorTrainingNames.join(", ")}</dd>
            </div>
          ) : null}
          {cls.weaponProficiencyNames?.length ? (
            <div>
              <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Armas
              </dt>
              <dd>{cls.weaponProficiencyNames.join(", ")}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </CatalogDetailHero>
  );
}

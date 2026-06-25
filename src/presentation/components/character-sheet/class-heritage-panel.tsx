import {
  findCharacterClass,
  findSubclassName,
} from "@/domain/character-sheet/classes";
import type { ClassDetail } from "@/domain/character-sheet/class-details";
import {
  findSubclassDetail,
  SUBCLASS_UNLOCK_LEVEL,
} from "@/domain/character-sheet/class-details";

type ClassHeritagePanelProps = {
  classDetails: ClassDetail;
  className: string;
  subclassId?: string;
  subclassUnlocked: boolean;
};

function HeritageItem({
  title,
  children,
}: {
  title: string;
  children: string;
}) {
  return (
    <li>
      <strong className="block text-sm font-semibold text-foreground">
        {title}
      </strong>
      <span className="text-sm text-muted-foreground">{children}</span>
    </li>
  );
}

export function ClassMetaStrip({
  classDetails,
}: {
  classDetails: ClassDetail;
}) {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Resumo da classe">
      <span className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground">
        PV {classDetails.hitDie}
      </span>
      <span className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground">
        {classDetails.primaryAbility}
      </span>
      <span className="rounded-full border border-border bg-muted/40 px-2.5 py-0.5 text-[11px] text-muted-foreground">
        Salv. {classDetails.savingThrows}
      </span>
    </div>
  );
}

export function ClassHeritagePanel({
  classDetails,
  className,
  subclassId,
  subclassUnlocked,
}: ClassHeritagePanelProps) {
  const classDefinition = findCharacterClass(classDetails.id);
  const selectedSubclass = subclassId
    ? findSubclassDetail(classDetails.id, subclassId)
    : undefined;
  const selectedSubclassName =
    subclassId && classDefinition
      ? findSubclassName(classDetails.id, subclassId)
      : undefined;

  return (
    <aside className="rounded-xl border border-primary/20 bg-muted/30 p-4 lg:max-w-sm">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
        {className}
      </p>
      <p className="mb-3 text-sm italic text-muted-foreground">
        {classDetails.tagline}
      </p>
      <p className="mb-4 text-sm text-foreground">{classDetails.summary}</p>

      {selectedSubclass && selectedSubclassName ? (
        <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-3">
          <h4 className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
            {classDefinition?.subclassLabel ?? "Subclasse"}
          </h4>
          <p className="text-sm font-semibold text-foreground">
            {selectedSubclassName}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedSubclass.summary}
          </p>
        </div>
      ) : null}

      {!subclassUnlocked ? (
        <p className="mb-4 text-xs text-amber-600 dark:text-amber-400">
          A subclasse é escolhida no nível {SUBCLASS_UNLOCK_LEVEL}. Personagens
          de nível 1 ou 2 ainda não adquirem especialização.
        </p>
      ) : null}

      <h4 className="mb-3 border-b border-border pb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {subclassId
          ? `Outras ${classDefinition?.subclassLabel.toLowerCase() ?? "subclasses"}`
          : `${classDefinition?.subclassLabel ?? "Subclasses"} disponíveis`}
      </h4>
      <ul className="flex flex-col gap-3">
        {classDetails.subclasses
          .filter((entry) => entry.id !== subclassId)
          .map((entry) => {
            const name =
              classDefinition?.subclasses.find(
                (subclass) => subclass.id === entry.id,
              )?.name ?? entry.id;

            return (
              <HeritageItem key={entry.id} title={name}>
                {entry.summary}
              </HeritageItem>
            );
          })}
      </ul>
    </aside>
  );
}

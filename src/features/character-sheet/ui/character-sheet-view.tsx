"use client";

import Link from "next/link";
import { useCallback, useState, type ReactNode } from "react";

import { useCharacterDetail } from "@/features/characters/api/use-character-detail";
import { useCharacterCatalogLabels } from "@/features/character-sheet/api/use-character-catalog-labels";
import { BeyondAbilityRow } from "@/features/character-sheet/ui/beyond/beyond-ability-row";
import { BeyondCombatHub } from "@/features/character-sheet/ui/beyond/beyond-combat-hub";
import { BeyondLeftColumn } from "@/features/character-sheet/ui/beyond/beyond-left-column";
import {
  BeyondMainTabs,
  type BeyondTabId,
} from "@/features/character-sheet/ui/beyond/beyond-main-tabs";
import { BeyondPanel } from "@/features/character-sheet/ui/beyond/beyond-panel";
import { BeyondSkillsColumn } from "@/features/character-sheet/ui/beyond/beyond-skills-column";
import { DeleteCharacterButton } from "@/features/character-sheet/ui/delete-character-button";
import {
  EditAbilitiesForm,
  EditClassSkillsForm,
  EditBackgroundToolForm,
  EditCombatForm,
  EditEquipmentForm,
  EditFeatsForm,
  EditIdentityForm,
  EditLanguagesForm,
  EditSpeciesChoicesForm,
  EditSpellsForm,
  EditSubclassOptionsForm,
} from "@/features/character-sheet/ui/sheet-edit-forms";
import {
  BackgroundTraitsSection,
  ClassFeaturesSection,
  EquipmentSection,
  FeatsSection,
  LanguagesSection,
  SpeciesChoicesSection,
  SpellsSection,
  SubclassMechanicsSection,
  SubclassOptionsSection,
} from "@/features/character-sheet/ui/sheet-read-sections";
import { InventorySection } from "@/features/character-sheet/ui/inventory-section";
import { LevelUpSection } from "@/features/character-sheet/ui/level-up-section";
import { SheetChip } from "@/features/character-sheet/ui/sheet-ui";
import { TableStateSection } from "@/features/character-sheet/ui/table-state-section";
import { useSkills } from "@/features/reference-catalog/api/use-reference";
import { BackLink } from "@/shared/ui/back-link";
import { buttonVariants } from "@/shared/ui/button";
import { motion } from "@/shared/lib/motion";
import { cn } from "@/shared/lib/utils";

type SheetEditId =
  | "identity"
  | "background-tool"
  | "combat"
  | "abilities"
  | "skills"
  | "species"
  | "subclass"
  | "spells"
  | "equipment"
  | "feats"
  | "languages"
  | null;

type CharacterSheetViewProps = {
  id: string;
};

function TabSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

export function CharacterSheetView({ id }: CharacterSheetViewProps) {
  const { data, isPending, isError, error } = useCharacterDetail(id);
  const labels = useCharacterCatalogLabels(data);
  const skillsQuery = useSkills();
  const [editing, setEditing] = useState<SheetEditId>(null);

  const closeEdit = useCallback(() => setEditing(null), []);

  if (isPending) {
    return <p className="text-sm text-muted-foreground">Carregando ficha…</p>;
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Ficha não encontrada"}
        </p>
        <Link
          href="/characters"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Voltar
        </Link>
      </div>
    );
  }

  const sectionProps = { character: data, labels };
  const languageNames = data.languageSlugs.map((slug) =>
    labels.resolveLanguage(slug),
  );

  const editButton = (editId: NonNullable<SheetEditId>, label = "Editar") => (
    <button
      type="button"
      onClick={() => setEditing(editId)}
      className="text-[0.65rem] font-medium tracking-wide text-primary uppercase hover:underline"
    >
      {label}
    </button>
  );

  if (editing) {
    const editors: Record<Exclude<SheetEditId, null>, ReactNode> = {
      identity: <EditIdentityForm character={data} onSuccess={closeEdit} />,
      "background-tool": (
        <EditBackgroundToolForm character={data} onSuccess={closeEdit} />
      ),
      combat: <EditCombatForm character={data} onSuccess={closeEdit} />,
      abilities: <EditAbilitiesForm character={data} onSuccess={closeEdit} />,
      skills: <EditClassSkillsForm character={data} onSuccess={closeEdit} />,
      species: (
        <EditSpeciesChoicesForm character={data} onSuccess={closeEdit} />
      ),
      subclass: (
        <EditSubclassOptionsForm character={data} onSuccess={closeEdit} />
      ),
      spells: <EditSpellsForm character={data} onSuccess={closeEdit} />,
      equipment: <EditEquipmentForm character={data} onSuccess={closeEdit} />,
      feats: <EditFeatsForm character={data} onSuccess={closeEdit} />,
      languages: <EditLanguagesForm character={data} onSuccess={closeEdit} />,
    };

    return (
      <div className={cn("mx-auto w-full max-w-3xl space-y-4", motion.enter)}>
        <BackLink href={`/characters/${id}`}>Voltar à ficha</BackLink>
        <BeyondPanel
          title="Editar ficha"
          headerRight={
            <button
              type="button"
              onClick={closeEdit}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
          }
        >
          {editors[editing]}
        </BeyondPanel>
      </div>
    );
  }

  const tabPanels: Record<BeyondTabId, ReactNode> = {
    actions: (
      <div className="space-y-5">
        <TabSection title="Equipado agora">
          <InventorySection characterId={id} equippedOnly />
        </TabSection>
        <TabSection
          title="Pacote inicial"
          action={editButton("equipment")}
        >
          <EquipmentSection {...sectionProps} />
        </TabSection>
      </div>
    ),
    spells: (
      <TabSection
        title="Magias conhecidas / preparadas"
        action={editButton("spells")}
      >
        <SpellsSection {...sectionProps} />
      </TabSection>
    ),
    inventory: (
      <TabSection title="Inventário de jogo">
        <InventorySection characterId={id} />
      </TabSection>
    ),
    features: (
      <div className="space-y-5">
        <TabSection title="Características de classe">
          <ClassFeaturesSection {...sectionProps} />
        </TabSection>
        <TabSection title="Espécie" action={editButton("species")}>
          <SpeciesChoicesSection {...sectionProps} />
        </TabSection>
        <TabSection title="Subclasse" action={editButton("subclass")}>
          <div className="space-y-4">
            <SubclassOptionsSection {...sectionProps} />
            <SubclassMechanicsSection {...sectionProps} />
          </div>
        </TabSection>
        <TabSection title="Talentos" action={editButton("feats")}>
          <FeatsSection {...sectionProps} />
        </TabSection>
        <TabSection title="Antecedente">
          <BackgroundTraitsSection
            {...sectionProps}
            onEditTool={() => setEditing("background-tool")}
          />
        </TabSection>
      </div>
    ),
    table: (
      <div className="space-y-4">
        <TabSection title="Estado ao vivo">
          <TableStateSection
            characterId={id}
            character={data}
            labels={labels}
          />
        </TabSection>
        <TabSection title="Subir de nível">
          <LevelUpSection characterId={id} character={data} />
        </TabSection>
      </div>
    ),
    notes: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Escolha o que deseja alterar na ficha.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ["identity", "Identidade"],
              ["abilities", "Atributos"],
              ["skills", "Perícias"],
              ["combat", "PV máximos"],
              ["spells", "Magias"],
              ["equipment", "Equipamento inicial"],
              ["feats", "Talentos"],
              ["languages", "Idiomas"],
              ["species", "Espécie"],
              ["subclass", "Subclasse"],
            ] as const
          ).map(([key, label]) => (
            <li key={key}>
              <button
                type="button"
                onClick={() => setEditing(key)}
                className="w-full rounded-lg border border-border/70 bg-background/40 px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
        <TabSection title="Idiomas" action={editButton("languages")}>
          <LanguagesSection {...sectionProps} />
        </TabSection>
      </div>
    ),
  };

  return (
    <div className={cn("space-y-3 pb-8 sm:space-y-4", motion.enter)}>
      <header className="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <BackLink href="/characters">Minhas fichas</BackLink>
          <div className="flex flex-wrap items-end gap-3">
            <div
              aria-hidden
              className="flex size-12 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/12 font-heading text-lg font-semibold text-primary sm:size-14 sm:text-xl"
            >
              {data.name.trim().charAt(0).toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                {data.name}
              </h1>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <SheetChip active>Nv. {data.level}</SheetChip>
                {labels.identity.speciesName ? (
                  <SheetChip>{labels.identity.speciesName}</SheetChip>
                ) : null}
                {labels.identity.className ? (
                  <SheetChip>{labels.identity.className}</SheetChip>
                ) : null}
                {labels.identity.subclassName ? (
                  <SheetChip>{labels.identity.subclassName}</SheetChip>
                ) : null}
                {labels.identity.backgroundName ? (
                  <SheetChip>{labels.identity.backgroundName}</SheetChip>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => setEditing("identity")}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Identidade
          </button>
          <DeleteCharacterButton characterId={id} characterName={data.name} />
        </div>
      </header>

      <BeyondAbilityRow
        scores={data.abilityScores}
        onEdit={() => setEditing("abilities")}
      />

      {/*
        Mobile order: combate → perícias → proffs
        Desktop: proffs | perícias | combate+abas
      */}
      <div
        className={cn(
          "grid gap-3",
          "grid-cols-1",
          "lg:grid-cols-[13.5rem_minmax(14rem,18rem)_minmax(0,1fr)]",
          "xl:grid-cols-[14rem_16rem_minmax(0,1fr)]",
        )}
      >
        <div className="order-3 lg:order-1">
          <BeyondLeftColumn character={data} languageNames={languageNames} />
        </div>

        <div className="order-2 lg:order-2">
          {skillsQuery.isPending ? (
            <BeyondPanel title="Perícias">
              <p className="text-sm text-muted-foreground">Carregando…</p>
            </BeyondPanel>
          ) : (
            <BeyondSkillsColumn
              character={data}
              skills={skillsQuery.data?.data ?? []}
              onEdit={() => setEditing("skills")}
            />
          )}
        </div>

        <div className="order-1 flex min-w-0 flex-col gap-3 lg:order-3">
          <div className="lg:sticky lg:top-3 lg:z-10">
            <BeyondCombatHub characterId={id} character={data} />
          </div>
          <BeyondMainTabs panels={tabPanels} />
        </div>
      </div>
    </div>
  );
}

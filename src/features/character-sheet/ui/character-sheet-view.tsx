"use client";

import Link from "next/link";
import { useCallback, useState, type ReactNode } from "react";

import { useCharacterDetail } from "@/features/characters/api/use-character-detail";
import { useCharacterCatalogLabels } from "@/features/character-sheet/api/use-character-catalog-labels";
import {
  BeyondCharacterStatsBar,
  BeyondRestActions,
} from "@/features/character-sheet/ui/beyond/beyond-ability-row";
import { BeyondCombatHub } from "@/features/character-sheet/ui/beyond/beyond-combat-hub";
import { BeyondLeftColumn } from "@/features/character-sheet/ui/beyond/beyond-left-column";
import {
  BeyondMainTabs,
  type BeyondTabId,
} from "@/features/character-sheet/ui/beyond/beyond-main-tabs";
import { BeyondPanel } from "@/features/character-sheet/ui/beyond/beyond-panel";
import { BeyondSkillsColumn } from "@/features/character-sheet/ui/beyond/beyond-skills-column";
import { BeyondActionsTab } from "@/features/character-sheet/ui/beyond/beyond-actions-tab";
import { BeyondInventoryTab } from "@/features/character-sheet/ui/beyond/beyond-inventory-tab";
import { BeyondTraitsTab } from "@/features/character-sheet/ui/beyond/beyond-traits-tab";
import { BeyondSpellsTab } from "@/features/character-sheet/ui/beyond/beyond-spells-tab";
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
  SheetEditDialog,
  type SheetEditDialogConfig,
} from "@/features/character-sheet/ui/sheet-edit-dialog";
import { LanguagesSection } from "@/features/character-sheet/ui/sheet-read-sections";
import { LevelUpSection } from "@/features/character-sheet/ui/level-up-section";
import { SheetChip } from "@/features/character-sheet/ui/sheet-ui";
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

  const editForms = {
    character: data,
    onSuccess: closeEdit,
    onCancel: closeEdit,
  };
  const editDialogs: Record<NonNullable<SheetEditId>, SheetEditDialogConfig> = {
    identity: {
      title: "Identidade",
      description: "Nome, nível, classe, espécie, antecedente e alinhamento.",
      width: "md",
      content: <EditIdentityForm {...editForms} />,
    },
    "background-tool": {
      title: "Ferramenta do antecedente",
      description: "Escolha a ferramenta concedida pelo antecedente.",
      width: "sm",
      content: <EditBackgroundToolForm {...editForms} />,
    },
    combat: {
      title: "Pontos de vida",
      description: "Ajuste os PV máximos e atuais da ficha.",
      width: "sm",
      content: <EditCombatForm {...editForms} />,
    },
    abilities: {
      title: "Atributos",
      description:
        "Edite os valores base; a API recalcula os finais ao salvar.",
      width: "md",
      content: <EditAbilitiesForm {...editForms} />,
    },
    skills: {
      title: "Perícias",
      description: "Escolha as perícias concedidas pela classe.",
      width: "md",
      content: <EditClassSkillsForm {...editForms} />,
    },
    species: {
      title: "Espécie",
      description: "Ajuste as escolhas abertas pela espécie.",
      width: "md",
      content: <EditSpeciesChoicesForm {...editForms} />,
    },
    subclass: {
      title: "Subclasse",
      description: "Ajuste as opções abertas pela subclasse.",
      width: "md",
      content: <EditSubclassOptionsForm {...editForms} />,
    },
    spells: {
      title: "Magias",
      description: "Escolha truques e magias respeitando as cotas da classe.",
      width: "lg",
      content: <EditSpellsForm {...editForms} />,
    },
    equipment: {
      title: "Equipamento inicial",
      description: "Pacotes escolhidos na criação — viram itens no inventário.",
      width: "lg",
      content: <EditEquipmentForm {...editForms} />,
    },
    feats: {
      title: "Talentos",
      description: "Adicione, remova e configure as opções dos talentos.",
      width: "lg",
      content: <EditFeatsForm {...editForms} />,
    },
    languages: {
      title: "Idiomas",
      description: "Selecione os idiomas que o personagem conhece.",
      width: "md",
      content: <EditLanguagesForm {...editForms} />,
    },
  };
  const activeEdit = editing ? editDialogs[editing] : null;

  const tabPanels: Record<BeyondTabId, ReactNode> = {
    actions: <BeyondActionsTab character={data} />,
    spells: (
      <BeyondSpellsTab
        characterId={id}
        character={data}
        labels={labels}
        onEdit={() => setEditing("spells")}
      />
    ),
    inventory: <BeyondInventoryTab characterId={id} />,
    features: (
      <BeyondTraitsTab
        character={data}
        labels={labels}
        onEdit={(section) => {
          if (section === "background") setEditing("background-tool");
          else setEditing(section);
        }}
      />
    ),
    settings: (
      <div className="space-y-5">
        <TabSection title="Subir de nível">
          <LevelUpSection characterId={id} character={data} />
        </TabSection>
        <TabSection title="Idiomas" action={editButton("languages")}>
          <LanguagesSection {...sectionProps} />
        </TabSection>
      </div>
    ),
  };

  return (
    <div className={cn("flex flex-col gap-2.5 pb-6 sm:gap-3 sm:pb-8", motion.enter)}>
      <header className="flex shrink-0 flex-col gap-2 border-b border-border/60 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <BackLink href="/characters">Minhas fichas</BackLink>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div
              aria-hidden
              className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/12 font-heading text-sm font-semibold text-primary"
            >
              {data.name.trim().charAt(0).toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <h1 className="font-heading truncate text-lg font-semibold tracking-tight sm:text-xl">
                {data.name}
              </h1>
              <div className="mt-0.5 flex flex-wrap gap-1">
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
          <BeyondRestActions characterId={id} />
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

      <div className="shrink-0">
        <BeyondCharacterStatsBar
          characterId={id}
          character={data}
          onEditAbilities={() => setEditing("abilities")}
        />
      </div>

      {/*
        Mobile order: combate → perícias → proffs
        Desktop: salvaguardas | perícias | combate+abas
        A página pode crescer além da viewport (scroll externo).
      */}
      <div
        className={cn(
          "grid gap-3",
          "grid-cols-1",
          "lg:grid-cols-[minmax(12rem,0.9fr)_minmax(17rem,1fr)_minmax(26rem,2.15fr)]",
          "xl:grid-cols-[14rem_20rem_minmax(0,1fr)]",
        )}
      >
        <div className="order-3 min-w-0 lg:order-1">
          <BeyondLeftColumn character={data} languageNames={languageNames} />
        </div>

        <div className="order-2 min-w-0 lg:order-2">
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

        <div className="order-1 flex min-w-0 flex-col gap-2.5 lg:order-3">
          <BeyondCombatHub characterId={id} character={data} />
          <BeyondMainTabs panels={tabPanels} />
        </div>
      </div>

      {activeEdit ? (
        <SheetEditDialog
          onClose={closeEdit}
          title={activeEdit.title}
          description={activeEdit.description}
          width={activeEdit.width}
        >
          {activeEdit.content}
        </SheetEditDialog>
      ) : null}
    </div>
  );
}

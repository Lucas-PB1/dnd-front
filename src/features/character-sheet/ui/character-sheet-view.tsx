"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { useCharacterDetail } from "@/features/characters/api/use-character-detail";
import { useCharacterCatalogLabels } from "@/features/character-sheet/api/use-character-catalog-labels";
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
  AbilitiesSection,
  BackgroundTraitsSection,
  ClassFeaturesSection,
  CombatSection,
  SavingThrowsSection,
  EquipmentSection,
  FeatsSection,
  LanguagesSection,
  SkillsSection,
  SpeciesChoicesSection,
  SpellsSection,
  SubclassMechanicsSection,
  SubclassOptionsSection,
} from "@/features/character-sheet/ui/sheet-read-sections";
import { InventorySection } from "@/features/character-sheet/ui/inventory-section";
import { LevelUpSection } from "@/features/character-sheet/ui/level-up-section";
import { SheetSection } from "@/features/character-sheet/ui/sheet-section";
import { TableStateSection } from "@/features/character-sheet/ui/table-state-section";
import { useSkills } from "@/features/reference-catalog/api/use-reference";
import {
  CharacterSheetLayout,
  type SheetNavGroup,
} from "@/widgets/character-sheet-layout";
import { buttonVariants } from "@/shared/ui/button";
import { BackLink } from "@/shared/ui/back-link";
import { cn } from "@/shared/lib/utils";

type SheetSectionId =
  | "identity"
  | "background-tool"
  | "combat"
  | "abilities"
  | "skills"
  | "class-features"
  | "species"
  | "subclass"
  | "spells"
  | "equipment"
  | "feats"
  | "languages";

type CharacterSheetViewProps = {
  id: string;
};

export function CharacterSheetView({ id }: CharacterSheetViewProps) {
  const { data, isPending, isError, error } = useCharacterDetail(id);
  const labels = useCharacterCatalogLabels(data);
  const skillsQuery = useSkills();
  const [editing, setEditing] = useState<SheetSectionId | null>(null);

  const closeEdit = useCallback(() => setEditing(null), []);

  const nav = useMemo<SheetNavGroup[]>(
    () => [
      {
        label: "Resumo",
        items: [
          { id: "identity", label: "Identidade" },
          { id: "combat", label: "Combate" },
          { id: "abilities", label: "Atributos" },
          { id: "skills", label: "Perícias" },
        ],
      },
      {
        label: "Mesa",
        items: [
          { id: "table", label: "Estado ao vivo" },
          { id: "inventory", label: "Inventário" },
          { id: "level-up", label: "Level-up" },
        ],
      },
      {
        label: "Personagem",
        items: [
          { id: "class-features", label: "Classe" },
          { id: "species", label: "Espécie" },
          { id: "subclass", label: "Subclasse" },
          { id: "spells", label: "Magias" },
          { id: "equipment", label: "Equipamento" },
          { id: "feats", label: "Talentos" },
          { id: "languages", label: "Idiomas" },
        ],
      },
    ],
    [],
  );

  if (isPending || labels.isLoading) {
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

  const identityParts = [
    labels.identity.speciesName,
    labels.identity.className,
    labels.identity.backgroundName,
  ].filter(Boolean);

  const sectionProps = { character: data, labels };

  return (
    <CharacterSheetLayout
      nav={nav}
      header={
        <div className="space-y-2">
          <BackLink href="/characters">Minhas fichas</BackLink>
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {data.name}
          </h1>
          <p className="text-base text-muted-foreground">
            Nv. {data.level}
            {identityParts.length > 0
              ? ` · ${identityParts.join(" · ")}`
              : null}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {labels.identity.subclassName ? (
              <p>
                Subclasse:{" "}
                <span className="text-foreground">
                  {labels.identity.subclassName}
                </span>
              </p>
            ) : null}
            {labels.identity.alignmentName ? (
              <p>
                Alinhamento:{" "}
                <span className="text-foreground">
                  {labels.identity.alignmentName}
                </span>
              </p>
            ) : null}
          </div>
        </div>
      }
      actions={
        <DeleteCharacterButton characterId={id} characterName={data.name} />
      }
    >
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Resumo
      </p>

      <SheetSection
        id="identity"
        title="Identidade"
        description="Nome, nível, classe, espécie e antecedente."
        isEditing={editing === "identity" || editing === "background-tool"}
        onEdit={() => setEditing("identity")}
        onCancel={closeEdit}
        editContent={
          editing === "background-tool" ? (
            <EditBackgroundToolForm character={data} onSuccess={closeEdit} />
          ) : (
            <EditIdentityForm character={data} onSuccess={closeEdit} />
          )
        }
      >
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground uppercase">Nome</dt>
            <dd className="font-medium">{data.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground uppercase">Nível</dt>
            <dd className="font-medium">{data.level}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground uppercase">Classe</dt>
            <dd className="font-medium">{labels.identity.className}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground uppercase">Espécie</dt>
            <dd className="font-medium">{labels.identity.speciesName}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground uppercase">
              Antecedente
            </dt>
            <dd className="font-medium">{labels.identity.backgroundName}</dd>
          </div>
          {labels.identity.subclassName ? (
            <div>
              <dt className="text-xs text-muted-foreground uppercase">
                Subclasse
              </dt>
              <dd className="font-medium">{labels.identity.subclassName}</dd>
            </div>
          ) : null}
        </dl>
        <div className="mt-6 border-t border-border pt-4">
          <h3 className="mb-3 text-sm font-semibold">Traços do antecedente</h3>
          <BackgroundTraitsSection
            {...sectionProps}
            onEditTool={() => setEditing("background-tool")}
          />
        </div>
      </SheetSection>

      <SheetSection
        id="combat"
        title="Combate"
        description="PV, CA, proficiência e percepção — o essencial em jogo."
        isEditing={editing === "combat"}
        onEdit={() => setEditing("combat")}
        onCancel={closeEdit}
        editContent={<EditCombatForm character={data} onSuccess={closeEdit} />}
      >
        <CombatSection {...sectionProps} />
      </SheetSection>

      <SheetSection
        id="saving-throws"
        title="Salvaguardas e treinos"
        description="Proficiências da classe — no estilo Beyond."
      >
        <SavingThrowsSection {...sectionProps} />
      </SheetSection>

      <SheetSection
        id="abilities"
        title="Atributos"
        isEditing={editing === "abilities"}
        onEdit={() => setEditing("abilities")}
        onCancel={closeEdit}
        editContent={
          <EditAbilitiesForm character={data} onSuccess={closeEdit} />
        }
      >
        <AbilitiesSection {...sectionProps} />
      </SheetSection>

      <SheetSection
        id="skills"
        title="Perícias"
        description="Bônus = modificador do atributo + bônus de proficiência."
        isEditing={editing === "skills"}
        onEdit={() => setEditing("skills")}
        onCancel={closeEdit}
        editContent={
          <EditClassSkillsForm character={data} onSuccess={closeEdit} />
        }
      >
        {skillsQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Carregando perícias…</p>
        ) : (
          <SkillsSection
            {...sectionProps}
            skills={skillsQuery.data?.data ?? []}
          />
        )}
      </SheetSection>

      <p className="pt-2 text-xs font-medium tracking-wide text-primary uppercase">
        Mesa de jogo
      </p>

      <SheetSection
        id="table"
        title="Estado ao vivo"
        description="PV temporários, slots, concentração, condições e descansos."
        variant="table"
      >
        <TableStateSection characterId={id} character={data} labels={labels} />
      </SheetSection>

      <SheetSection
        id="inventory"
        title="Inventário"
        description="Mochila e itens equipados em jogo."
        variant="table"
        collapsible
        defaultOpen={false}
      >
        <InventorySection characterId={id} />
      </SheetSection>

      <SheetSection
        id="level-up"
        title="Subir de nível"
        description="Preview e aplicação do próximo nível via API."
        variant="table"
        collapsible
        defaultOpen={false}
      >
        <LevelUpSection characterId={id} character={data} />
      </SheetSection>

      <p className="pt-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Personagem (PHB)
      </p>

      <SheetSection
        id="class-features"
        title="Características de classe"
        description="Features da classe até o nível atual."
        collapsible
        defaultOpen={false}
      >
        <ClassFeaturesSection {...sectionProps} />
      </SheetSection>

      <SheetSection
        id="species"
        title="Traços de espécie"
        isEditing={editing === "species"}
        onEdit={() => setEditing("species")}
        onCancel={closeEdit}
        editContent={
          <EditSpeciesChoicesForm character={data} onSuccess={closeEdit} />
        }
        collapsible
        defaultOpen={false}
      >
        <SpeciesChoicesSection {...sectionProps} />
      </SheetSection>

      <SheetSection
        id="subclass"
        title="Subclasse"
        description="Opções escolhidas e mecânicas até o nível atual."
        isEditing={editing === "subclass"}
        onEdit={() => setEditing("subclass")}
        onCancel={closeEdit}
        editContent={
          <EditSubclassOptionsForm character={data} onSuccess={closeEdit} />
        }
        collapsible
        defaultOpen={false}
      >
        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold">Opções escolhidas</h3>
            <SubclassOptionsSection {...sectionProps} />
          </div>
          <div className="border-t border-border pt-4">
            <h3 className="mb-3 text-sm font-semibold">Mecânicas</h3>
            <SubclassMechanicsSection {...sectionProps} />
          </div>
        </div>
      </SheetSection>

      <SheetSection
        id="spells"
        title="Magias"
        isEditing={editing === "spells"}
        onEdit={() => setEditing("spells")}
        onCancel={closeEdit}
        editContent={<EditSpellsForm character={data} onSuccess={closeEdit} />}
        collapsible
        defaultOpen={false}
      >
        <SpellsSection {...sectionProps} />
      </SheetSection>

      <SheetSection
        id="equipment"
        title="Equipamento inicial"
        description="Escolhas de criação — distinto do inventário de jogo."
        isEditing={editing === "equipment"}
        onEdit={() => setEditing("equipment")}
        onCancel={closeEdit}
        editContent={
          <EditEquipmentForm character={data} onSuccess={closeEdit} />
        }
        collapsible
        defaultOpen={false}
      >
        <EquipmentSection {...sectionProps} />
      </SheetSection>

      <SheetSection
        id="feats"
        title="Talentos"
        isEditing={editing === "feats"}
        onEdit={() => setEditing("feats")}
        onCancel={closeEdit}
        editContent={<EditFeatsForm character={data} onSuccess={closeEdit} />}
        collapsible
        defaultOpen={false}
      >
        <FeatsSection {...sectionProps} />
      </SheetSection>

      <SheetSection
        id="languages"
        title="Idiomas"
        isEditing={editing === "languages"}
        onEdit={() => setEditing("languages")}
        onCancel={closeEdit}
        editContent={
          <EditLanguagesForm character={data} onSuccess={closeEdit} />
        }
        collapsible
        defaultOpen={false}
      >
        <LanguagesSection {...sectionProps} />
      </SheetSection>
    </CharacterSheetLayout>
  );
}

"use client";

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
} from "@/features/character/character-sheet/ui/edit/sheet-edit-forms";
import type { SheetEditDialogConfig } from "@/features/character/character-sheet/ui/edit/sheet-edit-dialog";
import type { SheetEditId } from "@/features/character/character-sheet/lib/edit/sheet-edit-types";

type EditFormProps = {
  character: NonNullable<
    Parameters<typeof EditIdentityForm>[0]["character"]
  >;
  onSuccess: () => void;
  onCancel: () => void;
};

export function buildSheetEditDialogs(
  editForms: EditFormProps,
): Record<NonNullable<SheetEditId>, SheetEditDialogConfig> {
  return {
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
}

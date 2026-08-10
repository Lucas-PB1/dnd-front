import type {
  CharacterEquipment,
  CharacterSpell,
  CharacterSheetInput,
  SpeciesChoice,
  SubclassOption,
  ClassOption,
  FeatOption,
  CharacterFeat,
} from "@/entities/character/sheet-types";

export type {
  CharacterEquipment,
  CharacterSpell,
  CharacterSheetInput,
  SpeciesChoice,
  SubclassOption,
  ClassOption,
  FeatOption,
  CharacterFeat,
} from "@/entities/character/sheet-types";
export type AbilityScores = {
  forca: number;
  destreza: number;
  constituicao: number;
  inteligencia: number;
  sabedoria: number;
  carisma: number;
};

export type CoinPurse = {
  copper: number;
  silver: number;
  electrum: number;
  gold: number;
  platinum: number;
};

export type CharacterCampaignRef = {
  id: string;
  name: string;
  allowPlayerSkipPayment: boolean;
  myRole: "dm" | "player" | "assistant" | null;
};

/** Espelha CharacterResponseDto da dnd-api */
export type CharacterDetail = {
  id: string;
  name: string;
  level: number;
  classSlug: string;
  speciesSlug: string;
  backgroundSlug: string;
  subclassSlug: string | null;
  alignmentSlug: string | null;
  abilityScores: AbilityScores;
  /** Atributos após aumentos permanentes de classe (nível 20). Use na ficha. */
  effectiveAbilityScores?: AbilityScores;
  hitPointsMax: number | null;
  hitPointsCurrent: number | null;
  proficiencyBonus: number;
  classSkillSlugs: string[];
  backgroundSkillSlugs: string[];
  speciesChoices: SpeciesChoice[];
  subclassOptions: SubclassOption[];
  classOptions: ClassOption[];
  characterFeats: CharacterFeat[];
  featOptions: FeatOption[];
  characterSpells: CharacterSpell[];
  equipment: CharacterEquipment[];
  languageSlugs: string[];
  abilityGenerationMethodSlug: string | null;
  backgroundAbilityBoostMode: "plus2plus1" | "plus1x3";
  backgroundAbilityBoostPlus2Slug: string | null;
  backgroundAbilityBoostPlus1Slug: string | null;
  backgroundAbilityBoostPlus1Slugs: string[] | null;
  backgroundToolItemSlug: string | null;
  abilityModifiers: AbilityScores;
  passivePerception: number;
  armorClass: number;
  armorClassNote: string;
  weaponAttacks: WeaponAttackSummary[];
  equipmentWarnings?: EquipmentWarning[];
  cannotCastSpellsInArmor?: boolean;
  speedPenaltyMeters?: 0 | 3;
  itemSpeedBonusMeters?: number;
  classCombatNotes?: string[];
  attacksPerAction?: number;
  /** Bônus de salvaguarda de auras (API). Front não recalcula. */
  savingThrowAuraBonus?: number;
  spellcastingAbilitySlug?: string | null;
  spellSaveDc?: number | null;
  spellAttackBonus?: number | null;
  campaigns: CharacterCampaignRef[];
  /** Saldo das 5 moedas (PC/PP/PE/PO/PL). */
  coins: CoinPurse;
  createdAt: string;
  updatedAt: string;
};

export type WeaponAttackSummary = {
  itemSlug: string;
  itemName: string;
  mode: "melee" | "ranged";
  attackBonus: number;
  abilitySlug: "forca" | "destreza";
  proficient: boolean;
  damageDice: string;
  damageBonus: number;
  damageType: string | null;
  attackNote: string;
  damageNote: string;
  role?: "main" | "light_bonus" | "dual_bonus";
  attackDisadvantage?: boolean;
  omitsAbilityDamage?: boolean;
  greatWeaponFighting?: boolean;
  masteryActive?: boolean;
  masterySlug?: string | null;
  masteryName?: string | null;
  nickUsesAttackAction?: boolean;
  grazeOnMissDamage?: number | null;
  isFirearm?: boolean;
  critThreshold?: number;
  overkillExtraDice?: string | null;
  reloadCapacity?: number | null;
  hasRecoil?: boolean;
  rageDamageBonus?: number;
  brutalStrikeDice?: string | null;
  divineFuryDice?: string | null;
  sneakAttackEligible?: boolean;
  martialArtsDie?: string | null;
  attachedCharmSlug?: string | null;
  attachedCharmName?: string | null;
};

export type EquipmentWarning = {
  code: string;
  message: string;
  itemSlug?: string;
};

/** Lista resumida (mesmos campos base do detail + nomes do catálogo) */
export type CharacterSummary = Pick<
  CharacterDetail,
  | "id"
  | "name"
  | "level"
  | "classSlug"
  | "speciesSlug"
  | "backgroundSlug"
  | "subclassSlug"
  | "campaigns"
  | "createdAt"
  | "updatedAt"
> & {
  className: string;
  speciesName: string;
  subclassName: string | null;
};

/** Payload para POST /characters — espelha CreateCharacterDto */
export type CreateCharacterPayload = {
  name: string;
  classSlug: string;
  speciesSlug: string;
  backgroundSlug: string;
  level?: number;
  subclassSlug?: string;
  alignmentSlug?: string;
  abilityScores?: AbilityScores;
  backgroundAbilityBoostMode?: "plus2plus1" | "plus1x3";
  backgroundAbilityBoostPlus2Slug?: string;
  backgroundAbilityBoostPlus1Slug?: string;
  backgroundAbilityBoostPlus1Slugs?: string[];
  backgroundToolItemSlug?: string;
  hitPointsMax?: number;
  hitPointsCurrent?: number;
} & CharacterSheetInput;

/** Payload para PATCH /characters/:id — espelha UpdateCharacterDto */
export type UpdateCharacterPayload = Partial<CreateCharacterPayload>;

export { abilityModifier } from "@/entities/character/lib/ability";

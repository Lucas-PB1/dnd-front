import type {
  CharacterEquipment,
  CharacterSpell,
  CharacterSheetInput,
  CharacterTransformation,
  SpeciesChoice,
  SubclassOption,
  ClassOption,
  FeatOption,
  CharacterFeat,
} from "@/entities/character/sheet-types";
import type { CharacterThreadBundle } from "@/entities/character-thread/types";

export type {
  CharacterEquipment,
  CharacterSpell,
  CharacterSheetInput,
  CharacterTransformation,
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

export type CharacterDetail = {
  id: string;
  name: string;
  level: number;
  classSlug: string;
  speciesSlug: string | null;
  heritageSlug?: string | null;
  backgroundSlug: string;
  subclassSlug: string | null;
  alignmentSlug: string | null;
  abilityScores: AbilityScores;
  effectiveAbilityScores?: AbilityScores;
  hitPointsMax: number | null;
  hitPointsCurrent: number | null;
  portraitUrl?: string | null;
  proficiencyBonus: number;
  classSkillSlugs: string[];
  backgroundSkillSlugs: string[];
  speciesChoices: SpeciesChoice[];
  heritageChoices?: SpeciesChoice[];
  transformation?: CharacterTransformation | null;
  aggregatedHeritageTraits?: Array<{
    traitSlug: string;
    traitName: string;
    takeCount: number;
    slotIndexes: number[];
    activeBenefits: string[];
  }>;
  subclassOptions: SubclassOption[];
  classOptions: ClassOption[];
  characterFeats: CharacterFeat[];
  featOptions: FeatOption[];
  characterSpells: CharacterSpell[];
  equipment: CharacterEquipment[];
  languageSlugs: string[];
  jackOfAllTrades?: boolean;
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
  featAcBonus?: number;
  featAcBonusSources?: { featSlug: string; bonus: number }[];
  featEffectFlags?: {
    inspirationRefundOnFail: boolean;
    damageDieFloor: boolean;
    damageDieFlip: boolean;
    damageDieExplode: boolean;
    improveCritical: boolean;
    slotElevate: boolean;
    slotReduce: boolean;
    wieldTwoHandedOneHand: boolean;
    versatileOneHandFullDamage: boolean;
  };
  weaponAttacks: WeaponAttackSummary[];
  equipmentWarnings?: EquipmentWarning[];
  cannotCastSpellsInArmor?: boolean;
  speedPenaltyMeters?: 0 | 3;
  itemSpeedBonusMeters?: number;
  classCombatNotes?: string[];
  attacksPerAction?: number;
  savingThrowAuraBonus?: number;
  spellcastingAbilitySlug?: string | null;
  spellSaveDc?: number | null;
  spellAttackBonus?: number | null;
  campaigns: CharacterCampaignRef[];
  coins: CoinPurse;
  thread?: CharacterThreadBundle | null;
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

export type CharacterSummary = Pick<
  CharacterDetail,
  | "id"
  | "name"
  | "level"
  | "classSlug"
  | "speciesSlug"
  | "backgroundSlug"
  | "subclassSlug"
  | "portraitUrl"
  | "campaigns"
  | "createdAt"
  | "updatedAt"
> & {
  className: string;
  speciesName: string;
  subclassName: string | null;
};

export type CreateCharacterPayload = {
  name: string;
  classSlug: string;
  speciesSlug?: string;
  heritageSlug?: string;
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
  portraitUrl?: string | null;
} & CharacterSheetInput;

export type UpdateCharacterPayload = Partial<CreateCharacterPayload>;

export { abilityModifier } from "@/entities/character/lib/ability";

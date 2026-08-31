export type SubclassOptionPick = {
  optionKey: string;
  valueId: string;
};

export type CompanionProfile = {
  profileId: string;
  subclassSlug: string;
  minLevel: number;
  resolveTemplateSlug: (
    options: readonly SubclassOptionPick[],
  ) => string | null;
  resolveVariantLabel: (
    options: readonly SubclassOptionPick[],
  ) => string | null;
};

const BEAST_MASTER_ENV_LABELS: Record<string, string> = {
  earth: "Terra",
  sky: "Céu",
  sea: "Mar",
};

const PRIMAL_SPIRIT_STAT_LABELS: Record<string, string> = {
  "primal-guardian": "Guardião Primal",
  "primal-striker": "Atacante Primal",
};

const PRIMAL_SPIRIT_ENV_LABELS: Record<string, string> = {
  land: "Terra",
  sea: "Mar",
  sky: "Céu",
};

export const BEAST_MASTER_COMPANION_PROFILE: CompanionProfile = {
  profileId: "beast-master-primal",
  subclassSlug: "beast-master",
  minLevel: 3,
  resolveTemplateSlug(options) {
    const environment = readOption(options, "primalCompanion");
    if (!environment || !BEAST_MASTER_ENV_LABELS[environment]) return null;
    return `primal-companion-${environment}`;
  },
  resolveVariantLabel(options) {
    const environment = readOption(options, "primalCompanion");
    return environment ? (BEAST_MASTER_ENV_LABELS[environment] ?? null) : null;
  },
};

export const PRIMAL_SPIRIT_COMPANION_PROFILE: CompanionProfile = {
  profileId: "primal-spirit",
  subclassSlug: "pathofthe-primal-spirit",
  minLevel: 3,
  resolveTemplateSlug(options) {
    const statBlock = readOption(options, "primalCompanionStatBlock");
    const environment = readOption(options, "primalCompanionEnvironment");
    if (!statBlock || !environment) return null;
    const statShort = statBlock.replace(/^primal-/, "");
    if (!["guardian", "striker"].includes(statShort)) return null;
    if (!PRIMAL_SPIRIT_ENV_LABELS[environment]) return null;
    return `primal-companion-${statShort}-${environment}`;
  },
  resolveVariantLabel(options) {
    const statBlock = readOption(options, "primalCompanionStatBlock");
    const environment = readOption(options, "primalCompanionEnvironment");
    if (!statBlock || !environment) return null;
    const statLabel = PRIMAL_SPIRIT_STAT_LABELS[statBlock];
    const envLabel = PRIMAL_SPIRIT_ENV_LABELS[environment];
    if (!statLabel || !envLabel) return null;
    return `${statLabel} · ${envLabel}`;
  },
};

export const COMPANION_PROFILES: readonly CompanionProfile[] = [
  BEAST_MASTER_COMPANION_PROFILE,
  PRIMAL_SPIRIT_COMPANION_PROFILE,
];

export function findCompanionProfile(
  subclassSlug: string | null | undefined,
): CompanionProfile | null {
  if (!subclassSlug) return null;
  return (
    COMPANION_PROFILES.find((profile) => profile.subclassSlug === subclassSlug) ??
    null
  );
}

export function resolveCompanionConfig(
  subclassSlug: string | null | undefined,
  subclassOptions: readonly SubclassOptionPick[] | undefined,
) {
  const profile = findCompanionProfile(subclassSlug);
  if (!profile) return null;
  const templateSlug = profile.resolveTemplateSlug(subclassOptions ?? []);
  if (!templateSlug) return null;
  const variantLabel =
    profile.resolveVariantLabel(subclassOptions ?? []) ?? templateSlug;
  return { profile, templateSlug, variantLabel };
}

function readOption(
  options: readonly SubclassOptionPick[],
  optionKey: string,
): string | null {
  return options.find((option) => option.optionKey === optionKey)?.valueId ?? null;
}

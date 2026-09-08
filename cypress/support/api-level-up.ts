import {
  PHB_CLASS_SLUG,
  PHB_PREFERRED_SUBCLASS,
  WIZARD_SCHOLAR_SKILLS,
  type PhbClassName,
} from "./phb-classes";

type SheetOption = { optionKey: string; valueId: string };

type CharacterSheet = {
  id: string;
  level: number;
  classSlug: string;
  subclassSlug: string | null;
  classSkillSlugs: string[];
  backgroundSkillSlugs: string[];
  classOptions: SheetOption[];
  subclassOptions: SheetOption[];
  speciesChoices?: unknown[];
};

type LevelUpPreview = {
  currentLevel: number;
  nextLevel: number;
  subclassRequired: boolean;
  newClassExpertiseSlots: { optionKey: string; unlockLevel: number }[];
  newWeaponMasterySlots: { optionKey: string; unlockLevel: number }[];
  newSubclassOptionSlots: { optionKey: string; label: string; unlockLevel: number }[];
};

type OptionGroup = {
  optionKey: string;
  unlockLevel: number;
  valueType?: string;
  spellMaxLevel?: number | null;
  spellSchoolSlugs?: string[] | null;
  values: { valueId: string; label: string }[];
};

type LevelUpBody = {
  subclassSlug?: string;
  classOptions?: SheetOption[];
  classSkillSlugs?: string[];
  speciesChoices?: unknown[];
  subclassOptions?: SheetOption[];
};

function apiBase(): string {
  const url = (Cypress.env("apiUrl") as string | undefined)?.replace(/\/$/, "");
  expect(url, "Cypress.env('apiUrl')").to.be.a("string").and.not.be.empty;
  return url!;
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function requestAccessToken(): Cypress.Chainable<string> {
  const email = Cypress.env("loginEmail") as string;
  const password = Cypress.env("loginPassword") as string;
  const supabaseUrl = Cypress.env("supabaseUrl") as string;
  const supabaseKey = Cypress.env("supabaseKey") as string;

  return cy
    .request({
      method: "POST",
      url: `${supabaseUrl}/auth/v1/token?grant_type=password`,
      body: { email, password },
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })
    .then((response) => {
      expect(response.status).to.eq(200);
      const token = (response.body as { access_token?: string }).access_token;
      expect(token, "access_token").to.be.a("string").and.not.be.empty;
      return token!;
    });
}

function getCharacter(
  token: string,
  characterId: string,
): Cypress.Chainable<CharacterSheet> {
  return cy
    .request({
      method: "GET",
      url: `${apiBase()}/characters/${characterId}`,
      headers: authHeaders(token),
    })
    .then((response) => {
      expect(response.status).to.eq(200);
      return response.body as CharacterSheet;
    });
}

function getPreview(
  token: string,
  characterId: string,
): Cypress.Chainable<LevelUpPreview> {
  return cy
    .request({
      method: "GET",
      url: `${apiBase()}/characters/${characterId}/level-up/preview`,
      headers: authHeaders(token),
    })
    .then((response) => {
      expect(response.status).to.eq(200);
      return response.body as LevelUpPreview;
    });
}

function getSubclassOptionGroups(
  token: string,
  subclassSlug: string,
  level: number,
): Cypress.Chainable<OptionGroup[]> {
  return cy
    .request({
      method: "GET",
      url: `${apiBase()}/subclasses/${subclassSlug}/options?level=${level}&limit=100`,
      headers: authHeaders(token),
      failOnStatusCode: false,
    })
    .then((response) => {
      if (response.status === 404) return [] as OptionGroup[];
      expect(response.status).to.eq(200);
      return ((response.body as { data?: OptionGroup[] }).data ??
        []) as OptionGroup[];
    });
}

function isExpertiseKey(optionKey: string) {
  return /^expertiseSkill\d+$/.test(optionKey);
}

function proficientSkillSlugs(character: CharacterSheet): string[] {
  let slugs = [
    ...new Set([
      ...(character.classSkillSlugs ?? []),
      ...(character.backgroundSkillSlugs ?? []),
    ]),
  ];
  if (character.classSlug === "wizard") {
    const allowed = new Set<string>(WIZARD_SCHOLAR_SKILLS);
    slugs = slugs.filter((slug) => allowed.has(slug));
  }
  return slugs;
}

function pickExpertiseOptions(
  character: CharacterSheet,
  newSlots: { optionKey: string }[],
): SheetOption[] {
  const taken = new Set(
    (character.classOptions ?? [])
      .filter((option) => isExpertiseKey(option.optionKey))
      .map((option) => option.valueId),
  );
  const available = proficientSkillSlugs(character).filter(
    (slug) => !taken.has(slug),
  );
  expect(
    available.length,
    `perícias para expertise (classe=${character.classSlug})`,
  ).to.be.at.least(newSlots.length);

  return newSlots.map((slot, index) => {
    const valueId = available[index];
    expect(valueId, `expertise ${slot.optionKey}`).to.be.a("string");
    taken.add(valueId);
    return { optionKey: slot.optionKey, valueId };
  });
}

type ClassDetail = {
  slug: string;
  skillChoiceCount: number | null;
  weaponMasteryEligibility: "any" | "melee" | "ranged" | null;
  weaponProficiencySlugs: string[];
  fightingStyleSlugs: string[];
};

function getClassDetail(
  token: string,
  classSlug: string,
): Cypress.Chainable<ClassDetail> {
  return cy
    .request({
      method: "GET",
      url: `${apiBase()}/classes/${classSlug}`,
      headers: authHeaders(token),
    })
    .then((response) => {
      expect(response.status).to.eq(200);
      return response.body as ClassDetail;
    });
}

type WeaponRow = {
  slug: string;
  name: string;
  category: string;
  mastery?: unknown;
  propertyDetails?: { slug: string }[];
};

function matchesMasteryEligibility(
  propertySlugs: string[],
  eligibility: ClassDetail["weaponMasteryEligibility"],
): boolean {
  if (eligibility === "melee") {
    return !(
      propertySlugs.includes("ammunition") && !propertySlugs.includes("thrown")
    );
  }
  if (eligibility === "ranged") {
    return propertySlugs.includes("ammunition");
  }
  return true;
}

function isProficientWeapon(
  weapon: WeaponRow,
  weaponProficiencySlugs: string[],
): boolean {
  if (
    weaponProficiencySlugs.includes("armas-marciais") &&
    weapon.category === "martial"
  ) {
    return true;
  }
  if (
    weaponProficiencySlugs.includes("armas-simples") &&
    weapon.category === "simple"
  ) {
    return true;
  }
  const props = (weapon.propertyDetails ?? []).map((item) => item.slug);
  if (
    weaponProficiencySlugs.includes("armas-marciais-acuidade-ou-leves") &&
    weapon.category === "martial" &&
    (props.includes("finesse") || props.includes("light"))
  ) {
    return true;
  }
  return false;
}

function getMasteryWeaponCandidates(
  token: string,
  classSlug: string,
): Cypress.Chainable<{ slug: string; name: string }[]> {
  return getClassDetail(token, classSlug).then((classDetail) =>
    cy
      .request({
        method: "GET",
        url: `${apiBase()}/weapons?limit=100`,
        headers: authHeaders(token),
      })
      .then((response) => {
        expect(response.status).to.eq(200);
        const rows =
          (response.body as { data?: WeaponRow[] }).data ?? [];
        return rows
          .filter((weapon) => Boolean(weapon.mastery))
          .filter((weapon) =>
            matchesMasteryEligibility(
              (weapon.propertyDetails ?? []).map((item) => item.slug),
              classDetail.weaponMasteryEligibility,
            ),
          )
          .filter((weapon) =>
            isProficientWeapon(weapon, classDetail.weaponProficiencySlugs ?? []),
          )
          .map((weapon) => ({ slug: weapon.slug, name: weapon.name }));
      }),
  );
}

function pickMasteryOptions(
  weapons: { slug: string; name: string }[],
  character: CharacterSheet,
  newSlots: { optionKey: string }[],
): SheetOption[] {
  const taken = new Set(
    (character.classOptions ?? [])
      .filter((option) => option.optionKey.startsWith("masteryWeapon"))
      .map((option) => option.valueId),
  );

  const available = weapons.filter((weapon) => !taken.has(weapon.slug));
  expect(
    available.length,
    `armas com maestria livres (classe=${character.classSlug})`,
  ).to.be.at.least(newSlots.length);

  return newSlots.map((slot, index) => {
    const weapon = available[index];
    expect(weapon, `arma para ${slot.optionKey}`).to.exist;
    taken.add(weapon.slug);
    return { optionKey: slot.optionKey, valueId: weapon.slug };
  });
}

function pickSubclassOptions(
  token: string,
  character: CharacterSheet,
  groups: OptionGroup[],
  slots: { optionKey: string }[],
): Cypress.Chainable<SheetOption[]> {
  const takenKeys = new Set(
    (character.subclassOptions ?? []).map((option) => option.optionKey),
  );
  const pending = slots.filter((slot) => !takenKeys.has(slot.optionKey));
  const usedSpellSlugs = new Set(
    (character.subclassOptions ?? [])
      .filter((option) => option.valueId)
      .map((option) => option.valueId),
  );

  const pickOne = (
    index: number,
    acc: SheetOption[],
  ): Cypress.Chainable<SheetOption[]> => {
    if (index >= pending.length) {
      return cy.wrap(acc, { log: false });
    }
    const slot = pending[index];
    const group = groups.find((item) => item.optionKey === slot.optionKey);
    expect(group, `catálogo subclass opt ${slot.optionKey}`).to.exist;

    const staticPick = (group!.values ?? []).find(
      (value) => value.valueId && !usedSpellSlugs.has(value.valueId),
    );
    if (staticPick) {
      usedSpellSlugs.add(staticPick.valueId);
      return pickOne(index + 1, [
        ...acc,
        { optionKey: slot.optionKey, valueId: staticPick.valueId },
      ]);
    }

    expect(
      group!.valueType,
      `valueType para ${slot.optionKey}`,
    ).to.eq("spell");

    const maxLevel = group!.spellMaxLevel ?? 9;
    const schools = new Set(group!.spellSchoolSlugs ?? []);

    return cy
      .request({
        method: "GET",
        url: `${apiBase()}/classes/${character.classSlug}/spells?maxLevel=${maxLevel}&limit=100`,
        headers: authHeaders(token),
      })
      .then((response) => {
        expect(response.status).to.eq(200);
        const spells =
          (
            response.body as {
              data?: { slug: string; level: number; schoolSlug?: string }[];
            }
          ).data ?? [];
        // Escola do mago (ex. Versado): níveis 1..max. Cantrip: maxLevel 0.
        const minLevel = maxLevel === 0 ? 0 : 1;
        const spell = spells.find(
          (row) =>
            row.slug &&
            row.level >= minLevel &&
            row.level <= maxLevel &&
            !usedSpellSlugs.has(row.slug) &&
            (schools.size === 0 ||
              (row.schoolSlug != null && schools.has(row.schoolSlug))),
        );
        expect(spell, `magia para ${slot.optionKey}`).to.exist;
        usedSpellSlugs.add(spell!.slug);
        return pickOne(index + 1, [
          ...acc,
          { optionKey: slot.optionKey, valueId: spell!.slug },
        ]);
      });
  };

  return pickOne(0, []);
}

function buildLevelUpBody(
  token: string,
  character: CharacterSheet,
  preview: LevelUpPreview,
  preferredSubclassSlug: string,
): Cypress.Chainable<LevelUpBody> {
  const body: LevelUpBody = {};
  if (preview.subclassRequired) {
    body.subclassSlug = preferredSubclassSlug;
  }
  if (character.speciesChoices?.length) {
    body.speciesChoices = character.speciesChoices;
  }
  if (character.classSkillSlugs?.length) {
    body.classSkillSlugs = character.classSkillSlugs;
  }

  const nextSubclassSlug =
    body.subclassSlug ?? character.subclassSlug ?? preferredSubclassSlug;

  const needsClassOptions =
    (preview.newClassExpertiseSlots?.length ?? 0) > 0 ||
    (preview.newWeaponMasterySlots?.length ?? 0) > 0;

  const withClassOptions = (): Cypress.Chainable<LevelUpBody> => {
    if (!needsClassOptions) {
      return cy.wrap(body, { log: false });
    }

    const needsMastery = (preview.newWeaponMasterySlots?.length ?? 0) > 0;
    const weaponsChain = needsMastery
      ? getMasteryWeaponCandidates(token, character.classSlug)
      : cy.wrap([] as { slug: string; name: string }[], { log: false });

    return weaponsChain.then((weapons): LevelUpBody => {
      const additions: SheetOption[] = [
        ...pickExpertiseOptions(
          character,
          preview.newClassExpertiseSlots ?? [],
        ),
        ...pickMasteryOptions(
          weapons,
          character,
          preview.newWeaponMasterySlots ?? [],
        ),
      ];
      const next: LevelUpBody = {
        ...body,
        classOptions: [...(character.classOptions ?? []), ...additions],
        classSkillSlugs: character.classSkillSlugs,
      };
      if (character.speciesChoices) {
        next.speciesChoices = character.speciesChoices;
      }
      return next;
    }) as unknown as Cypress.Chainable<LevelUpBody>;
  };

  const chain = withClassOptions().then((partial) => {
    const previewSlots = preview.newSubclassOptionSlots ?? [];

    const resolveSlots = (): Cypress.Chainable<
      { optionKey: string; unlockLevel: number }[]
    > => {
      if (previewSlots.length > 0) {
        return cy.wrap(
          previewSlots.map((slot) => ({
            optionKey: slot.optionKey,
            unlockLevel: slot.unlockLevel,
          })),
          { log: false },
        );
      }
      if (!preview.subclassRequired || !nextSubclassSlug) {
        return cy.wrap(
          [] as { optionKey: string; unlockLevel: number }[],
          { log: false },
        );
      }
      return getSubclassOptionGroups(
        token,
        nextSubclassSlug,
        preview.nextLevel,
      ).then((groups) =>
        groups
          .filter((group) => group.unlockLevel === preview.nextLevel)
          .map((group) => ({
            optionKey: group.optionKey,
            unlockLevel: group.unlockLevel,
          })),
      );
    };

    return resolveSlots().then((slots) => {
      if (slots.length === 0) {
        return cy.wrap(partial, { log: false });
      }

      return getSubclassOptionGroups(
        token,
        nextSubclassSlug,
        preview.nextLevel,
      ).then((groups) =>
        pickSubclassOptions(token, character, groups, slots).then(
          (additions) =>
            ({
              ...partial,
              subclassOptions: [
                ...(character.subclassOptions ?? []),
                ...additions,
              ],
            }) satisfies LevelUpBody,
        ),
      );
    });
  });

  return chain as unknown as Cypress.Chainable<LevelUpBody>;
}

function postLevelUp(
  token: string,
  characterId: string,
  body: LevelUpBody,
  expectedLevel: number,
): Cypress.Chainable<CharacterSheet> {
  return cy
    .request({
      method: "POST",
      url: `${apiBase()}/characters/${characterId}/level-up`,
      headers: authHeaders(token),
      body,
      failOnStatusCode: false,
    })
    .then((response) => {
      expect(
        response.status,
        `POST level-up →${expectedLevel} body=${JSON.stringify(response.body)}`,
      ).to.be.oneOf([200, 201]);
      const updated = response.body as CharacterSheet;
      expect(updated.level, "nível após up").to.eq(expectedLevel);
      return updated;
    });
}

/**
 * Sobe o personagem até `targetLevel` via GET preview + POST level-up.
 * Preenche só o que a API exige (subclasse, expertise, maestria, opções).
 */
export function levelUpCharacterViaApiTo(
  characterId: string,
  targetLevel: number,
  className: PhbClassName,
): Cypress.Chainable<CharacterSheet> {
  const preferredSubclass = PHB_PREFERRED_SUBCLASS[className];
  expect(preferredSubclass, `subclass para ${className}`).to.be.a("string");

  return requestAccessToken().then((token) => {
    const climb = (
      current: CharacterSheet,
    ): Cypress.Chainable<CharacterSheet> => {
      if (current.level >= targetLevel) {
        return cy.wrap(current);
      }

      return getPreview(token, characterId).then((preview) => {
        expect(preview.currentLevel).to.eq(current.level);
        expect(preview.nextLevel).to.eq(current.level + 1);

        return buildLevelUpBody(
          token,
          current,
          preview,
          preferredSubclass,
        ).then((body) =>
          postLevelUp(token, characterId, body, preview.nextLevel).then(
            (updated) => climb(updated),
          ),
        );
      });
    };

    return getCharacter(token, characterId).then((character) =>
      climb(character),
    );
  });
}

const FARMER_BACKGROUND_SKILLS = new Set(["animal-handling", "nature"]);

function getClassSkillPool(
  token: string,
  classSlug: string,
): Cypress.Chainable<{ slug: string }[]> {
  return cy
    .request({
      method: "GET",
      url: `${apiBase()}/classes/${classSlug}/skills?limit=50`,
      headers: authHeaders(token),
    })
    .then((response) => {
      expect(response.status).to.eq(200);
      return ((response.body as { data?: { slug: string }[] }).data ?? []).filter(
        (row) => Boolean(row.slug),
      );
    });
}

function getClassFeatureOptionsAtLevel(
  token: string,
  classSlug: string,
  level: number,
): Cypress.Chainable<OptionGroup[]> {
  return cy
    .request({
      method: "GET",
      url: `${apiBase()}/classes/${classSlug}/options?level=${level}&limit=50`,
      headers: authHeaders(token),
      failOnStatusCode: false,
    })
    .then((response) => {
      if (response.status === 404) return [] as OptionGroup[];
      expect(response.status).to.eq(200);
      return ((response.body as { data?: OptionGroup[] }).data ??
        []) as OptionGroup[];
    });
}

function getWeaponMasteryCountAtLevel(
  token: string,
  classSlug: string,
  level: number,
): Cypress.Chainable<number> {
  return cy
    .request({
      method: "GET",
      url: `${apiBase()}/classes/${classSlug}/progression?limit=20`,
      headers: authHeaders(token),
    })
    .then((response) => {
      expect(response.status).to.eq(200);
      const rows =
        (
          response.body as {
            data?: { level: number; weaponMastery?: number | null }[];
          }
        ).data ?? [];
      const row = rows.find((item) => item.level === level);
      return row?.weaponMastery ?? 0;
    });
}

function pickClassSkills(
  pool: { slug: string }[],
  count: number,
): string[] {
  const picks = pool
    .map((row) => row.slug)
    .filter((slug) => !FARMER_BACKGROUND_SKILLS.has(slug))
    .slice(0, count);
  expect(picks.length, "perícias de classe sem overlap do Fazendeiro").to.eq(
    count,
  );
  return picks;
}

function pickFeatureOptions(groups: OptionGroup[]): SheetOption[] {
  return groups.map((group) => {
    const pick = (group.values ?? []).find((value) => value.valueId);
    expect(pick, `valor para feature ${group.optionKey}`).to.exist;
    return { optionKey: group.optionKey, valueId: pick!.valueId };
  });
}

/**
 * Cria personagem NV1 via API (Anão + Fazendeiro) — estável para smoke 1→20.
 */
export function createLevel1CharacterViaApi(
  className: PhbClassName,
): Cypress.Chainable<string> {
  const classSlug = PHB_CLASS_SLUG[className];
  const name = `E2E ${className} ${Date.now().toString(36)}`;

  return requestAccessToken().then((token) =>
    getClassDetail(token, classSlug).then((detail) =>
      getClassSkillPool(token, classSlug).then((pool) =>
        getClassFeatureOptionsAtLevel(token, classSlug, 1).then(
          (featureGroups) =>
            getWeaponMasteryCountAtLevel(token, classSlug, 1).then(
              (masteryCount) => {
                const skillCount = detail.skillChoiceCount ?? 0;
                const classSkillSlugs = pickClassSkills(pool, skillCount);
                const featureOptions = pickFeatureOptions(featureGroups);

                const expertiseSlots =
                  classSlug === "rogue"
                    ? [
                        { optionKey: "expertiseSkill1" },
                        { optionKey: "expertiseSkill2" },
                      ]
                    : [];

                const masterySlots = Array.from(
                  { length: masteryCount },
                  (_, index) => ({
                    optionKey: `masteryWeapon${index + 1}`,
                  }),
                );

                const needsMastery = masterySlots.length > 0;
                const weaponsChain = needsMastery
                  ? getMasteryWeaponCandidates(token, classSlug)
                  : cy.wrap([] as { slug: string; name: string }[], {
                      log: false,
                    });

                return weaponsChain.then((weapons) => {
                  const stub: CharacterSheet = {
                    id: "pending",
                    level: 1,
                    classSlug,
                    subclassSlug: null,
                    classSkillSlugs,
                    backgroundSkillSlugs: [...FARMER_BACKGROUND_SKILLS],
                    classOptions: [],
                    subclassOptions: [],
                  };

                  const classOptions: SheetOption[] = [
                    ...featureOptions,
                    ...pickExpertiseOptions(stub, expertiseSlots),
                    ...pickMasteryOptions(weapons, stub, masterySlots),
                  ];

                  const languageSlugs = [
                    "common",
                    "dwarvish",
                    "elvish",
                    ...(classSlug === "druid" ? ["druidic"] : []),
                    ...(classSlug === "rogue"
                      ? ["thieves-cant", "giant"]
                      : []),
                  ];

                  const body: Record<string, unknown> = {
                    name,
                    classSlug,
                    speciesSlug: "dwarf",
                    backgroundSlug: "farmer",
                    level: 1,
                    classSkillSlugs,
                    languageSlugs,
                    backgroundAbilityBoostMode: "plus2plus1",
                    backgroundAbilityBoostPlus2Slug: "constituicao",
                    backgroundAbilityBoostPlus1Slug: "forca",
                    speciesChoices: [
                      { choiceKind: "dwarf_culture", choiceSlug: "phb" },
                    ],
                    classOptions,
                  };

                  if (classSlug === "fighter") {
                    const style =
                      detail.fightingStyleSlugs.find(
                        (slug) => slug === "defense",
                      ) ?? detail.fightingStyleSlugs[0];
                    expect(style, "fighting style do Guerreiro").to.be.a(
                      "string",
                    );
                    body.characterFeats = [
                      { featSlug: style, instanceIndex: 0 },
                    ];
                  }

                  return cy
                    .request({
                      method: "POST",
                      url: `${apiBase()}/characters`,
                      headers: authHeaders(token),
                      body,
                      failOnStatusCode: false,
                    })
                    .then((response) => {
                      expect(
                        response.status,
                        `POST /characters ${className} body=${JSON.stringify(response.body)}`,
                      ).to.be.oneOf([200, 201]);
                      const id = (response.body as { id?: string }).id;
                      expect(id, "character id").to.be.a("string").and.not.be
                        .empty;
                      return id!;
                    });
                });
              },
            ),
        ),
      ),
    ),
  );
}

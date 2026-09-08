/// <reference types="cypress" />

import { levelUpCharacterViaApiTo } from "./api-level-up";
import type { PhbClassName } from "./phb-classes";

declare global {
  namespace Cypress {
    interface Chainable {
      loginAsDevUser(): Chainable<void>;
      loginViaUi(options?: {
        email?: string;
        password?: string;
        nextPath?: string;
      }): Chainable<void>;
      selectSearchable(
        triggerCyOrSelector: string,
        optionLabel: string | RegExp,
      ): Chainable<void>;
      wizardContinue(expectedNextStep?: string): Chainable<void>;
      fillLevel1Identity(
        className: string,
        characterName: string,
      ): Chainable<void>;
      fillStandardArrayAbilities(): Chainable<void>;
      pickEnabledCheckboxes(selector: string, count?: number): Chainable<void>;
      fillWeaponMasteries(): Chainable<void>;
      fillExpertiseIfPresent(): Chainable<void>;
      fillFightingStyleIfPresent(): Chainable<void>;
      fillEquipmentPackages(): Chainable<void>;
      fillWarlockInvocationIfPresent(): Chainable<void>;
      fillLanguageQuota(): Chainable<void>;
      fillSpeciesChoicesIfPresent(): Chainable<void>;
      fillClassFeatureOptionsIfPresent(): Chainable<void>;
      advanceWizardUntilReview(depth?: number): Chainable<void>;
      createLevel1Character(className: string): Chainable<void>;
      openCharacterSheetById(characterId: string): Chainable<void>;
      openSheetSettings(): Chainable<void>;
      fillLevelUpExpertiseIfPresent(): Chainable<void>;
      fillLevelUpSubclassIfPresent(
        subclassLabel: string | RegExp,
      ): Chainable<void>;
      submitLevelUp(nextLevel: number): Chainable<void>;
      levelUpCharacterTo(
        nextLevel: number,
        options?: { subclassLabel?: string | RegExp },
      ): Chainable<void>;
      createLevel1AndLevelUpTo2(className: string): Chainable<void>;
      createLevel1AndUnlockSubclass(
        className: string,
        subclassLabel: string | RegExp,
      ): Chainable<void>;
      createCampaign(name: string): Chainable<void>;
      editCampaignDescription(description: string): Chainable<void>;
      linkCharacterToCampaign(characterName: string): Chainable<void>;
      levelUpCharacterViaApiTo(
        characterId: string,
        targetLevel: number,
        className: string,
      ): Chainable<void>;
    }
  }
}

Cypress.Commands.add("loginAsDevUser", () => {
  const email = Cypress.env("loginEmail") as string;
  const password = Cypress.env("loginPassword") as string;
  const supabaseUrl = Cypress.env("supabaseUrl") as string;
  const supabaseKey = Cypress.env("supabaseKey") as string;

  expect(email, "Cypress.env('loginEmail')").to.be.a("string").and.not.be
    .empty;
  expect(password, "Cypress.env('loginPassword')").to.be.a("string").and.not.be
    .empty;
  expect(supabaseUrl, "Cypress.env('supabaseUrl')").to.be.a("string").and.not
    .be.empty;
  expect(supabaseKey, "Cypress.env('supabaseKey')").to.be.a("string").and.not
    .be.empty;

  cy.session(`dev-login:${email}`, () => {
    cy.request({
      method: "POST",
      url: `${supabaseUrl}/auth/v1/token?grant_type=password`,
      body: { email, password },
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      const { access_token, refresh_token } = response.body as {
        access_token: string;
        refresh_token: string;
      };
      expect(access_token).to.be.a("string").and.not.be.empty;
      expect(refresh_token).to.be.a("string").and.not.be.empty;

      cy.visit("/login", {
        onBeforeLoad(win) {
          // Injeta tokens antes do app montar o cliente Supabase SSR.
          win.localStorage.setItem(
            "cypress.supabase.session",
            JSON.stringify({ access_token, refresh_token }),
          );
        },
      });

      cy.window().then(async (win) => {
        const { createBrowserClient } = await import("@supabase/ssr");
        const client = createBrowserClient(supabaseUrl, supabaseKey);
        const { error } = await client.auth.setSession({
          access_token,
          refresh_token,
        });
        if (error) {
          throw error;
        }
      });

      cy.visit("/");
      cy.location("pathname", { timeout: 20000 }).should("not.eq", "/login");
    });
  });
});

/** Login pelo formulário da UI (teste do fluxo real, sem token inject). */
Cypress.Commands.add(
  "loginViaUi",
  (options?: { email?: string; password?: string; nextPath?: string }) => {
    const email = options?.email ?? (Cypress.env("loginEmail") as string);
    const password =
      options?.password ?? (Cypress.env("loginPassword") as string);
    const nextPath = options?.nextPath;

    expect(email, "login email").to.be.a("string").and.not.be.empty;
    expect(password, "login password").to.be.a("string").and.not.be.empty;

    const loginUrl = nextPath
      ? `/login?next=${encodeURIComponent(nextPath)}`
      : "/login";

    cy.visit(loginUrl);
    cy.get("[data-cy=login-form]", { timeout: 15000 }).should(
      "have.attr",
      "data-hydrated",
      "true",
    );
    cy.get("[data-cy=login-email]").clear().type(email);
    cy.get("[data-cy=login-password]").clear().type(password, { log: false });
    cy.get("[data-cy=login-submit]").should("not.be.disabled").click();
  },
);

Cypress.Commands.add(
  "selectSearchable",
  (triggerCyOrSelector: string, optionLabel: string | RegExp) => {
    const trigger = triggerCyOrSelector.startsWith("[")
      ? triggerCyOrSelector
      : `[data-cy=${triggerCyOrSelector}]`;

    cy.get(trigger, { timeout: 30000 })
      .should("not.be.disabled")
      .and(($el) => {
        expect($el.text()).to.not.include("Carregando");
      });

    cy.get(trigger).click({ force: true });

    if (typeof optionLabel === "string") {
      cy.get('input[placeholder="Buscar…"]')
        .filter(":visible")
        .last()
        .type(`{selectAll}{backspace}${optionLabel}`, { delay: 0 });
    }

    cy.contains('[role="option"]', optionLabel, {
      matchCase: false,
      timeout: 15000,
    }).click({ force: true });

    cy.get(trigger, { timeout: 10000 }).should(($el) => {
      const text = $el.text();
      if (typeof optionLabel === "string") {
        expect(text).to.include(optionLabel);
      } else {
        expect(text).to.match(optionLabel);
      }
    });
  },
);

Cypress.Commands.add("wizardContinue", (expectedNextStep?: string) => {
  cy.get("[data-cy=wizard-continue]").click();
  if (expectedNextStep) {
    cy.get("[data-cy=wizard-step-title]", { timeout: 15000 }).should(
      "contain",
      expectedNextStep,
    );
  }
});

Cypress.Commands.add(
  "fillLevel1Identity",
  (className: string, characterName: string) => {
    cy.get("[data-cy=character-name]").clear().type(characterName);
    cy.selectSearchable("classSlug", className);
    // Preferir Anão PHB (label exato) — evita variantes com "Anão" no nome.
    cy.selectSearchable("originSlug", /^Anão$/);
    cy.selectSearchable("backgroundSlug", "Fazendeiro");
  },
);

const STANDARD_ARRAY_ASSIGNMENT: Array<{ ability: string; score: string }> = [
  { ability: "Força", score: "15" },
  { ability: "Destreza", score: "14" },
  { ability: "Constituição", score: "13" },
  { ability: "Inteligência", score: "12" },
  { ability: "Sabedoria", score: "10" },
  { ability: "Carisma", score: "8" },
];

Cypress.Commands.add("fillStandardArrayAbilities", () => {
  for (const { ability, score } of STANDARD_ARRAY_ASSIGNMENT) {
    cy.get(`[aria-label="${ability}"]`).click();
    cy.contains('[role="option"]', new RegExp(`^${score}(\\s|$)`))
      .filter(":visible")
      .first()
      .click();
  }

  cy.selectSearchable("background-boost-plus2", "Constituição");
  cy.selectSearchable("background-boost-plus1", "Força");
});

Cypress.Commands.add(
  "pickEnabledCheckboxes",
  (selector: string, count?: number) => {
    cy.get(selector, { timeout: 15000 }).should("have.length.at.least", 1);
    cy.get(`${selector}:enabled`).then(($boxes) => {
      const unchecked = [...$boxes].filter(
        (el) => !(el as HTMLInputElement).checked,
      );
      const limit = count ?? unchecked.length;
      const toPick = Math.min(limit, unchecked.length);
      for (let i = 0; i < toPick; i += 1) {
        cy.wrap(unchecked[i]).check({ force: true });
      }
    });
  },
);

Cypress.Commands.add("fillWeaponMasteries", () => {
  fillOptionSelectsByPrefix("masteryWeapon");
});

Cypress.Commands.add("fillExpertiseIfPresent", () => {
  fillOptionSelectsByPrefix("expertise");
});

function isSelectPlaceholderText(text: string) {
  const trimmed = text.replace(/\s+/g, " ").trim();
  return (
    !trimmed ||
    trimmed === "Selecione" ||
    trimmed.startsWith("Escolher") ||
    trimmed.startsWith("Selecionar") ||
    trimmed.startsWith("Carregando")
  );
}

/** Preenche SearchableSelects cujo data-cy começa com o prefixo. */
function fillOptionSelectsByPrefix(prefix: string) {
  const usedLabels = new Set<string>();

  cy.get("body").then(($body) => {
    const ids = [
      ...new Set(
        [...$body.find(`[data-cy^="${prefix}"]`)]
          .map((el) => el.getAttribute("data-cy"))
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    if (ids.length === 0) return;

    cy.wrap(ids).each((id: string) => {
      cy.get(`[data-cy="${id}"]`)
        .scrollIntoView()
        .should("not.be.disabled")
        .then(($trigger) => {
          if (!isSelectPlaceholderText($trigger.text())) {
            usedLabels.add($trigger.text().replace(/\s+/g, " ").trim());
            return;
          }

          cy.wrap($trigger).click({ force: true });
          cy.get('[role="option"]', { timeout: 15000 })
            .filter(":visible")
            .should(($options) => {
              const real = [...$options].filter(
                (el) => !isSelectPlaceholderText(el.textContent ?? ""),
              );
              expect(real.length, `opções reais para ${id}`).to.be.at.least(1);
            })
            .then(($options) => {
              const real = [...$options].filter(
                (el) => !isSelectPlaceholderText(el.textContent ?? ""),
              );
              const unused = real.find((el) => {
                const label = (el.textContent ?? "").replace(/\s+/g, " ").trim();
                return label && !usedLabels.has(label);
              });
              const pick = unused ?? real[0];
              usedLabels.add(
                (pick.textContent ?? "").replace(/\s+/g, " ").trim(),
              );
              cy.wrap(pick).click({ force: true });
            });

          cy.get(`[data-cy="${id}"]`, { timeout: 15000 }).should(($el) => {
            expect(
              isSelectPlaceholderText($el.text()),
              `${id} ainda no placeholder`,
            ).to.eq(false);
          });
        });
    });
  });
}

Cypress.Commands.add("fillFightingStyleIfPresent", () => {
  cy.get("body").then(($body) => {
    if ($body.find("[data-cy=fighting-style-feat]").length === 0) return;
    cy.get("[data-cy=fighting-style-feat]").click();
    cy.get('[role="option"]')
      .filter(":visible")
      .not(':contains("Escolha")')
      .first()
      .click();
  });
});

Cypress.Commands.add("fillEquipmentPackages", () => {
  cy.contains("Carregando equipamento…").should("not.exist");
  cy.get('[data-cy="class-equipment-package-card"]', { timeout: 15000 })
    .should("have.length.at.least", 1)
    .then(($cards) => {
      const gold = $cards.filter(':contains("Só ouro")');
      cy.wrap(gold.length > 0 ? gold.first() : $cards.first()).click({
        force: true,
      });
    });

  cy.get("body").then(($body) => {
    const cards = $body.find('[data-cy="background-equipment-package-card"]');
    if (cards.length === 0) return;
    const gold = cards.filter(':contains("Só ouro")');
    cy.wrap(gold.length > 0 ? gold.first() : cards.first()).click({
      force: true,
    });
  });

  cy.get("body").then(($body) => {
    if (!$body.text().includes("Complete as escolhas deste pacote")) return;

    cy.contains("Complete as escolhas deste pacote")
      .parent()
      .find("[data-cy]")
      .each(($select) => {
        cy.wrap($select).click({ force: true });
        cy.get('[role="option"]')
          .filter(":visible")
          .not(':contains("Selecionar")')
          .first()
          .click({ force: true });
      });
  });
});

Cypress.Commands.add("fillWarlockInvocationIfPresent", () => {
  cy.contains(/Carregando catálogo/).should("not.exist");
  cy.get("[data-cy=eldritch-invocation-draft]", { timeout: 15000 })
    .should("be.visible")
    .click({ force: true });
  cy.contains('[role="option"]', /Pacto/i, { timeout: 15000 })
    .first()
    .click({ force: true });
  cy.get("[data-cy=eldritch-invocation-add]")
    .should("not.be.disabled")
    .click();
  cy.contains("Nenhuma invocação").should("not.exist");
});

Cypress.Commands.add("fillClassFeatureOptionsIfPresent", () => {
  cy.contains("Carregando…").should("not.exist");
  cy.get('[data-cy^="class-opt-"]', { timeout: 15000 }).then(($triggers) => {
    const ids = [...$triggers]
      .map((el) => el.getAttribute("data-cy"))
      .filter((id): id is string => Boolean(id));

    cy.wrap(ids).each((id: string) => {
      cy.get(`[data-cy="${id}"]`)
        .should("not.be.disabled")
        .click({ force: true });
      cy.get('[role="option"]', { timeout: 15000 })
        .filter(":visible")
        .should("have.length.at.least", 2);
      cy.get('[role="option"]')
        .filter(":visible")
        .then(($options) => {
          const pick = [...$options].find((el) => {
            const text = (el.textContent ?? "").trim();
            return text && text !== "Selecione" && !text.startsWith("Escolher");
          });
          expect(pick, `class option for ${id}`).to.exist;
          cy.wrap(pick!).click({ force: true });
        });
      cy.get(`[data-cy="${id}"]`).should(($el) => {
        expect($el.text()).to.not.match(/Selecione|Escolher/);
      });
    });
  });
});

Cypress.Commands.add("fillSpeciesChoicesIfPresent", () => {
  cy.get("body").then(($body) => {
    const radios = $body.find('[data-cy^="species-choice-"]:not(:checked)');
    if (radios.length === 0) return;

    const names = new Set<string>();
    radios.each((_, el) => {
      const name = el.getAttribute("name");
      if (name) names.add(name);
    });

    names.forEach((name) => {
      cy.get(`input[name="${name}"]`).first().check({ force: true });
    });
  });
});

Cypress.Commands.add("fillLanguageQuota", () => {
  cy.contains("Carregando…").should("not.exist");

  cy.get("body").then(($body) => {
    const text = $body.text();
    if (text.includes("Nenhuma escolha extra")) return;

    const match = text.match(/Extras escolhidos:\s*(\d+)\s*\/\s*(\d+)/);
    if (!match) {
      // Ainda carregando cota — tenta de novo após checkboxes existirem.
      if ($body.find('[data-cy^="language-"]').length === 0) return;
    }

    const need = match
      ? Math.max(0, Number(match[2]) - Number(match[1]))
      : $body.find('[data-cy^="language-"]:enabled').length;

    if (need <= 0) return;

    cy.get('[data-cy^="language-"]', { timeout: 15000 }).should(
      "have.length.at.least",
      1,
    );
    cy.pickEnabledCheckboxes('[data-cy^="language-"]', need);
  });

  cy.get("body").should(($body) => {
    const text = $body.text();
    if (text.includes("Nenhuma escolha extra")) return;
    const match = text.match(/Extras escolhidos:\s*(\d+)\s*\/\s*(\d+)/);
    if (!match) return;
    expect(
      Number(match[1]),
      "language extras filled",
    ).to.eq(Number(match[2]));
  });
});

Cypress.Commands.add("advanceWizardUntilReview", (depth = 0) => {
  expect(depth, "wizard steps").to.be.lessThan(20);

  cy.get("[data-cy=wizard-step-title]").then(($title) => {
    const title = $title.text();
    if (title.includes("Revisão")) return;

    if (/Espécie|Variante/.test(title)) {
      cy.fillSpeciesChoicesIfPresent();
    } else if (/Perícias/.test(title)) {
      cy.contains("Carregando perícias…").should("not.exist");
      cy.pickEnabledCheckboxes('[data-cy^="class-skill-"]');
      cy.fillExpertiseIfPresent();
      cy.fillWeaponMasteries();
    } else if (/^Classe|\bClasse\d/.test(title) || title.startsWith("Classe")) {
      cy.fillClassFeatureOptionsIfPresent();
    } else if (/Talentos/.test(title)) {
      cy.fillFightingStyleIfPresent();
    } else if (/Equipamento/.test(title)) {
      cy.fillEquipmentPackages();
    } else if (/Invocações/.test(title)) {
      cy.fillWarlockInvocationIfPresent();
    } else if (/Idiomas/.test(title)) {
      cy.fillLanguageQuota();
    }

    cy.get("[data-cy=wizard-continue]").click();
    cy.get("[data-cy=wizard-step-title]", { timeout: 15000 }).should(
      ($next) => {
        expect(
          $next.text(),
          "wizard should advance after Continuar",
        ).to.not.eq(title);
      },
    );
    cy.advanceWizardUntilReview(depth + 1);
  });
});

Cypress.Commands.add("createLevel1Character", (className: string) => {
  const stamp = Date.now().toString(36);
  const characterName = `E2E ${className} ${stamp}`;

  cy.intercept("POST", "**/characters").as("createCharacter");

  cy.intercept("GET", "**/classes?*").as("classesCatalog");
  cy.intercept("GET", "**/species*").as("speciesCatalog");
  cy.intercept("GET", "**/backgrounds*").as("backgroundsCatalog");
  cy.visit("/characters/new");
  cy.get("[data-cy=wizard-step-title]").should("contain", "Identidade");
  cy.wait(["@classesCatalog", "@speciesCatalog", "@backgroundsCatalog"], {
    timeout: 30000,
  });

  cy.fillLevel1Identity(className, characterName);
  cy.wizardContinue("Atributos");

  cy.fillStandardArrayAbilities();
  cy.wizardContinue("Perícias");

  cy.contains("Carregando perícias…").should("not.exist");
  cy.pickEnabledCheckboxes('[data-cy^="class-skill-"]');
  cy.fillExpertiseIfPresent();
  cy.fillWeaponMasteries();
  cy.get("[data-cy=wizard-continue]").click();
  cy.get("[data-cy=wizard-step-title]").should("contain", "Antecedente");

  cy.advanceWizardUntilReview();

  cy.get("[data-cy=wizard-step-title]").should("contain", "Revisão");
  cy.get("[data-cy=wizard-submit]").click();
  cy.wait("@createCharacter").then((interception) => {
    const status = interception.response?.statusCode;
    const body = interception.response?.body as { id?: string };
    expect(
      status,
      `POST /characters body=${JSON.stringify(body)}`,
    ).to.be.oneOf([200, 201]);
    expect(body?.id, "character id").to.be.a("string").and.not.be.empty;
    cy.wrap(body.id).as("characterId");
    cy.wrap(characterName).as("characterName");
  });
  cy.location("pathname", { timeout: 20000 }).should("eq", "/characters");
  cy.get("@characterName").then((name) => {
    cy.contains(String(name)).should("be.visible");
  });
});

Cypress.Commands.add("openCharacterSheetById", (characterId: string) => {
  cy.visit(`/characters/${characterId}`);
  cy.get("[data-cy=sheet-settings]", { timeout: 20000 }).should("be.visible");
  cy.get("[data-cy=sheet-level]").should("be.visible");
});

Cypress.Commands.add("openSheetSettings", () => {
  cy.get("[data-cy=sheet-settings]").click();
  cy.get("[data-cy=sheet-settings-dialog]", { timeout: 10000 }).should(
    "be.visible",
  );
  cy.contains("Subir de nível").should("be.visible");
});

Cypress.Commands.add("fillLevelUpExpertiseIfPresent", () => {
  fillOptionSelectsByPrefix("level-up-expertise");
});

Cypress.Commands.add(
  "fillLevelUpSubclassIfPresent",
  (subclassLabel: string | RegExp) => {
    cy.get("[data-cy=level-up-subclass]", { timeout: 20000 })
      .scrollIntoView()
      .should("exist")
      .and("not.be.disabled");
    cy.selectSearchable("level-up-subclass", subclassLabel);

    cy.get("[data-cy=level-up-subclass-options-loading]").should("not.exist");
    // Ou há opções a preencher, ou o submit já libera (trilha sem escolhas).
    cy.get("[data-cy=level-up-submit]", { timeout: 25000 }).should(($btn) => {
      const hasOpts = Cypress.$('[data-cy^="subclass-opt"]').length > 0;
      if (hasOpts) return;
      expect($btn, "submit liberado sem opções").to.not.be.disabled;
    });

    cy.get("body").then(($body) => {
      if ($body.find('[data-cy^="subclass-opt"]').length === 0) return;
      fillOptionSelectsByPrefix("subclass-opt");
    });
  },
);

Cypress.Commands.add("submitLevelUp", (nextLevel: number) => {
  cy.intercept("POST", "**/level-up").as("applyLevelUp");

  cy.contains("Carregando preview…").should("not.exist");
  cy.get("[data-cy=level-up-submit]", { timeout: 20000 })
    .scrollIntoView()
    .should("contain", `Subir para nível ${nextLevel}`)
    .and("not.be.disabled")
    .click({ force: true });

  cy.wait("@applyLevelUp").then((interception) => {
    const status = interception.response?.statusCode;
    const body = interception.response?.body;
    expect(
      status,
      `POST level-up body=${JSON.stringify(body)}`,
    ).to.be.oneOf([200, 201]);
  });
  cy.get("[data-cy=level-up-success]", { timeout: 15000 })
    .scrollIntoView()
    .should("be.visible");
});

Cypress.Commands.add(
  "levelUpCharacterTo",
  (nextLevel: number, options?: { subclassLabel?: string | RegExp }) => {
    cy.openSheetSettings();
    // Preview e editores (expertise/maestria/subclasse) só após o GET.
    cy.contains("Carregando preview…").should("not.exist");
    cy.get("[data-cy=level-up-submit]", { timeout: 20000 })
      .scrollIntoView()
      .should("exist");
    cy.fillLevelUpExpertiseIfPresent();
    fillOptionSelectsByPrefix("level-up-masteryWeapon");
    if (options?.subclassLabel) {
      cy.fillLevelUpSubclassIfPresent(options.subclassLabel);
    }
    cy.submitLevelUp(nextLevel);
    cy.get("body").type("{esc}");
    cy.get("[data-cy=sheet-settings-dialog]").should("not.exist");
    cy.get("[data-cy=sheet-level]").should("contain", `Nv. ${nextLevel}`);
  },
);

Cypress.Commands.add("createLevel1AndLevelUpTo2", (className: string) => {
  cy.createLevel1Character(className);
  cy.get<string>("@characterId").then((characterId) => {
    cy.openCharacterSheetById(characterId);
  });
  cy.get("[data-cy=sheet-level]").should("contain", "Nv. 1");
  cy.levelUpCharacterTo(2);
});

Cypress.Commands.add(
  "createLevel1AndUnlockSubclass",
  (className: string, subclassLabel: string | RegExp) => {
    cy.createLevel1AndLevelUpTo2(className);
    cy.levelUpCharacterTo(3, { subclassLabel });
    cy.get("[data-cy=sheet-subclass]", { timeout: 15000 }).should(($el) => {
      const text = $el.text();
      if (typeof subclassLabel === "string") {
        expect(text).to.include(subclassLabel);
      } else {
        expect(text).to.match(subclassLabel);
      }
    });
  },
);

Cypress.Commands.add("createCampaign", (name: string) => {
  cy.intercept("POST", "**/campaigns").as("createCampaign");
  cy.visit("/campaigns");
  cy.get("[data-cy=campaign-create-form]", { timeout: 20000 }).should(
    "be.visible",
  );
  cy.get("[data-cy=campaign-create-name]").clear().type(name);
  cy.get("[data-cy=campaign-create-submit]")
    .should("not.be.disabled")
    .click();

  cy.wait("@createCampaign").then((interception) => {
    const status = interception.response?.statusCode;
    const body = interception.response?.body as { id?: string };
    expect(status, `POST /campaigns body=${JSON.stringify(body)}`).to.be.oneOf([
      200, 201,
    ]);
    expect(body?.id, "campaign id").to.be.a("string").and.not.be.empty;
    cy.wrap(body.id).as("campaignId");
    cy.wrap(name).as("campaignName");
  });

  cy.location("pathname", { timeout: 20000 }).should(
    "match",
    /\/campaigns\/[0-9a-f-]{36}$/i,
  );
  cy.get("[data-cy=campaign-detail]", { timeout: 20000 }).should("be.visible");
  cy.get("[data-cy=campaign-title]").should("contain", name);
});

Cypress.Commands.add("editCampaignDescription", (description: string) => {
  cy.get("[data-cy=campaign-edit]").click();
  cy.get("[data-cy=campaign-edit-form]").should("be.visible");
  cy.get("[data-cy=campaign-edit-description]").clear().type(description);
  cy.intercept("PATCH", "**/campaigns/**").as("patchCampaign");
  cy.get("[data-cy=campaign-edit-save]").click();
  cy.wait("@patchCampaign").its("response.statusCode").should("be.oneOf", [
    200, 201,
  ]);
  cy.get("[data-cy=campaign-description]", { timeout: 15000 }).should(
    "contain",
    description,
  );
});

Cypress.Commands.add("linkCharacterToCampaign", (characterName: string) => {
  cy.get("[data-cy=campaign-link-character-form]", { timeout: 20000 }).should(
    "be.visible",
  );
  cy.selectSearchable("campaign-link-character", characterName);
  cy.intercept("POST", "**/campaigns/**/characters").as("linkCharacter");
  cy.get("[data-cy=campaign-link-submit]")
    .should("not.be.disabled")
    .click();
  cy.wait("@linkCharacter").its("response.statusCode").should("be.oneOf", [
    200, 201,
  ]);
  cy.get("[data-cy=campaign-characters-list]")
    .contains("[data-cy=campaign-character-name]", characterName)
    .should("be.visible");
});

Cypress.Commands.add(
  "levelUpCharacterViaApiTo",
  (characterId: string, targetLevel: number, className: string) => {
    levelUpCharacterViaApiTo(
      characterId,
      targetLevel,
      className as PhbClassName,
    );
  },
);

export {};

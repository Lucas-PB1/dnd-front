/// <reference types="cypress" />

import "./commands";

// Benign browser warning raised by Radix popovers/comboboxes on resize; not an app failure.
Cypress.on("uncaught:exception", (err) => !err.message.includes("ResizeObserver loop"));

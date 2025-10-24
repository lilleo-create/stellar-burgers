// --- DnD helper (react-dnd совместим) ---
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable {
    dnd(source: string, target: string): Chainable<Element>;
  }
}

Cypress.Commands.add(
  'dnd',
  (sourceSelector: string, targetSelector: string) => {
    const dataTransfer = new DataTransfer();
    cy.get(sourceSelector).trigger('dragstart', { dataTransfer });
    cy.get(targetSelector).trigger('drop', { dataTransfer });
    cy.get(sourceSelector).trigger('dragend');
  }
);

/// <reference types="cypress" />
export {};

declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      addIngredientByName(name: string): Chainable<void>;
      clickPlaceOrder(): Chainable<void>;
      closeAnyModal(): Chainable<void>;
      assertConstructorCleared(): Chainable<void>;
      login(): Chainable<void>;
      dnd(source: string, target: string): Chainable<void>;
    }
  }
}

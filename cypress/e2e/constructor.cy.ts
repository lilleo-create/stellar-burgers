/// <reference types="cypress" />
import { SEL } from '../support/selectors';

const BUN_R2D3 = 'Флюоресцентная булка R2-D3';
const FILLING_PROTOS = 'Мясо бессмертных моллюсков Protostomia';
const SAUCE_SPICYX = 'Соус Spicy-X';

describe('Burger Constructor — best practices', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/ingredients', { fixture: 'ingredients.json' }).as('getIngredients');
    cy.intercept('GET', '**/api/auth/user', { fixture: 'user.json' }).as('getUser');
    cy.intercept('POST', '**/api/orders', { fixture: 'order.json' }).as('createOrder');

    cy.login();
    cy.visit('/');
    cy.wait('@getIngredients');

    cy.contains('button', 'Добавить', { matchCase: false, timeout: 10000 }).should('exist');
    cy.contains(BUN_R2D3, { timeout: 10000 }).should('exist');
  });

  it('добавляет булку и начинку', () => {
    cy.addIngredientByName(BUN_R2D3);
    cy.get(SEL.constructorBuns).should('contain.text', BUN_R2D3);

    cy.addIngredientByName(FILLING_PROTOS);
    cy.get(SEL.constructorFillings).should('contain.text', FILLING_PROTOS);
  });

  it('открывает деталку и закрывает модалку', () => {
    cy.contains(SEL.ingredientCard, SAUCE_SPICYX, { timeout: 10000 })
      .scrollIntoView()
      .within(() => {
        cy.get('a').first().click({ force: true });
      });

    cy.get('body').then(($body) => {
      if ($body.find(SEL.modal).length) {
        cy.get(SEL.modal).should('contain.text', SAUCE_SPICYX);
        cy.closeAnyModal();
        cy.get(SEL.modal).should('not.exist');
      } else {
        cy.location('pathname').should('match', /\/ingredients\/[a-z0-9_-]+/i);
        cy.contains(SAUCE_SPICYX).should('be.visible');
        cy.go('back');
      }
    });
  });

  it('создаёт заказ, показывает номер и очищает конструктор', () => {
    cy.addIngredientByName(BUN_R2D3);
    cy.get(SEL.constructorBuns).should('contain.text', BUN_R2D3);

    cy.addIngredientByName(FILLING_PROTOS);
    cy.get(SEL.constructorFillings).should('contain.text', FILLING_PROTOS);

    cy.get(SEL.placeOrderBtn).first().should(($btn) => {
      expect($btn).not.to.have.attr('disabled');
    });
    cy.clickPlaceOrder();

    cy.wait('@createOrder');
    cy.get(SEL.modal, { timeout: 20000 }).should('exist');

    cy.contains(/Оформляем заказ|[0-9]{3,}/, { timeout: 20000 }).should('exist');

    cy.closeAnyModal();
    cy.assertConstructorCleared();
  });
});

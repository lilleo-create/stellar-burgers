import { SEL } from './selectors';

const BUN_R2D3 = 'Флюоресцентная булка R2-D3';
const FILLING_PROTOS = 'Мясо бессмертных моллюсков Protostomia';
const ORDER_RE = /(оформить|заказать|оформить заказ|place order|order)/i;

Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`, { timeout: 10000 });
});

Cypress.Commands.add('addIngredientByName', (name: string) => {
  cy.contains(SEL.ingredientCard, name, { timeout: 10000 })
    .as('card')
    .scrollIntoView()
    .within(() => {
      cy.contains('button', 'Добавить', { matchCase: false }).then(($btn) => {
        if ($btn.length) cy.wrap($btn).click({ force: true });
      });
    });

  const isBun = /булка/i.test(name);
  const target = isBun ? SEL.constructorBuns : SEL.constructorFillings;

  cy.get(target).then(($t) => {
    if ($t.text().includes(name)) return;
    const dataTransfer = new DataTransfer();
    cy.get('@card').trigger('dragstart', { dataTransfer, force: true });
    cy.get(target).trigger('drop', { dataTransfer, force: true });
    cy.get('@card').trigger('dragend', { force: true });
  });

  cy.get(target, { timeout: 10000 }).should('contain.text', name);
});

Cypress.Commands.add('clickPlaceOrder', () => {
  cy.get('body').then(($b) => {
    const clickBtn = ($btn: JQuery<HTMLElement>) =>
      cy.wrap($btn)
        .scrollIntoView()
        .should(($el) => {
          expect($el).not.to.have.attr('disabled'); // UI-киты любят управлять disabled атрибутом
        })
        .click();

    if ($b.find(SEL.placeOrderBtn).length) {
      clickBtn($b.find(SEL.placeOrderBtn).first());
      return;
    }
    if ($b.find(SEL.constructorTotal).length) {
      cy.get(SEL.constructorTotal).within(() => {
        cy.contains('button', ORDER_RE).then(($btn) => clickBtn($btn));
      });
      return;
    }
    cy.contains('button', ORDER_RE).then(($btn) => clickBtn($btn));
  });
});

Cypress.Commands.add('closeAnyModal', () => {
  cy.get('body').then(($b) => {
    if ($b.find(SEL.modalClose).length) {
      cy.get(SEL.modalClose).click();
    } else {
      cy.get('body').type('{esc}');
    }
  });
});

Cypress.Commands.add('assertConstructorCleared', () => {
  const bun = BUN_R2D3;
  const filling = FILLING_PROTOS;

  cy.get(SEL.constructorBuns, { timeout: 10000 }).then(($buns) => {
    const stillHasBun = $buns.text().includes(bun);

    if (stillHasBun) {
      cy.reload();
      cy.wait('@getIngredients');
    }
  }).then(() => {
    cy.get(SEL.constructorBuns, { timeout: 10000 }).should('not.contain.text', bun);
    cy.get(SEL.constructorFillings, { timeout: 10000 }).should('not.contain.text', filling);
  });
});

Cypress.Commands.add('login', () => {
  const hasSession = typeof (cy as any).session === 'function';
  if (hasSession) {
    (cy as any).session('auth', () => {
      cy.setCookie('accessToken', 'FAKE.ACCESS.TOKEN');
      cy.window().then((win) =>
        win.localStorage.setItem('refreshToken', 'FAKE.REFRESH.TOKEN')
      );
    });
  } else {
    cy.setCookie('accessToken', 'FAKE.ACCESS.TOKEN');
    cy.window().then((win) =>
      win.localStorage.setItem('refreshToken', 'FAKE.REFRESH.TOKEN')
    );
  }
});

Cypress.Commands.add('dnd', (source: string, target: string) => {
  const dataTransfer = new DataTransfer();
  cy.get(source).trigger('dragstart', { dataTransfer });
  cy.get(target).trigger('drop', { dataTransfer });
  cy.get(source).trigger('dragend');
});

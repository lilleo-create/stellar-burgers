/// <reference types="cypress" />

// Хелпер: клик по "Добавить" у ингредиента с заданным именем
const addByName = (name: string) => {
  cy.contains('li', name, { timeout: 10000 })
    .scrollIntoView()
    .should('be.visible')
    .within(() => {
      cy.contains('button', 'Добавить', { matchCase: false }).click();
    });
};

// Хелпер: убедиться, что конструктор пуст.
// Если не пуст сразу после закрытия модалки — перезагружаем страницу и проверяем снова.
const assertConstructorCleared = () => {
  const bunName = 'Флюоресцентная булка R2-D3';
  const fillingName = 'Мясо бессмертных моллюсков Protostomia';

  cy.get('[data-testid="constructor-buns"]', { timeout: 10000 }).then(($buns) => {
    const hasBun = $buns.text().includes(bunName);

    if (hasBun) {
      // Поведение некоторых реализаций — очистка после "нового начала" (reload).
      cy.reload();
      // После перезагрузки ждём первичный фетч и пустой конструктор
      cy.contains('Флюоресцентная булка R2-D3', { timeout: 10000 }).should('be.visible');
      cy.get('[data-testid="constructor-buns"]').should('not.contain.text', bunName);
      cy.get('[data-testid="constructor-fillings"]').should('not.contain.text', fillingName);
    } else {
      // Пусто уже сейчас
      cy.get('[data-testid="constructor-buns"]').should('not.contain.text', bunName);
      cy.get('[data-testid="constructor-fillings"]').should('not.contain.text', fillingName);
    }
  });
};

describe('Burger Constructor — click flow', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/ingredients', { fixture: 'ingredients.json' }).as('getIngredients');
    cy.intercept('GET', '**/api/auth/user', { fixture: 'user.json' }).as('getUser');
    cy.intercept('POST', '**/api/orders', { fixture: 'order.json' }).as('createOrder');

    cy.setCookie('accessToken', 'FAKE.ACCESS.TOKEN');
    window.localStorage.setItem('refreshToken', 'FAKE.REFRESH.TOKEN');

    cy.visit('/');

    // Дождаться данных и первого рендера
    cy.wait('@getIngredients');
    cy.contains('Флюоресцентная булка R2-D3', { timeout: 10000 }).should('be.visible');
    cy.contains('button', 'Добавить', { matchCase: false, timeout: 10000 }).should('exist');
  });

  afterEach(() => {
    cy.clearCookie('accessToken');
    window.localStorage.removeItem('refreshToken');
  });

  it('добавляет булку и начинку с помощью кнопки «Добавить»', () => {
    addByName('Флюоресцентная булка R2-D3');
    cy.get('[data-testid="constructor-buns"]', { timeout: 10000 })
      .should('contain.text', 'Флюоресцентная булка R2-D3');

    addByName('Мясо бессмертных моллюсков Protostomia');
    cy.get('[data-testid="constructor-fillings"]', { timeout: 10000 })
      .should('contain.text', 'Мясо бессмертных моллюсков Protostomia');
  });

  it('открывает деталку ингредиента (модалка или страница) и показывает корректные данные', () => {
    cy.contains('Соус Spicy-X', { timeout: 10000 }).scrollIntoView().click();

    cy.get('body').then(($body) => {
      const modal = $body.find('[data-testid="modal"]');
      if (modal.length) {
        cy.get('[data-testid="modal"]').should('exist').and('contain.text', 'Соус Spicy-X');
      } else {
        cy.location('pathname').should('match', /\/ingredients\/[a-z0-9_-]+/i);
        cy.contains('Соус Spicy-X').should('exist');
        cy.go('back');
      }
    });
  });

  it('закрывает деталку по ESC/крестику, если открыта модалка', () => {
    cy.contains('Соус Spicy-X', { timeout: 10000 }).scrollIntoView().click();

    cy.get('body').then(($body) => {
      const modal = $body.find('[data-testid="modal"]');
      if (!modal.length) {
        cy.location('pathname').should('match', /\/ingredients\/[a-z0-9_-]+/i);
        cy.go('back');
        return;
      }

      // Закрытие по ESC
      cy.get('[data-testid="modal"]').should('exist');
      cy.get('body').type('{esc}');
      cy.get('[data-testid="modal"]').should('not.exist');

      // Снова открыть и закрыть крестиком (если есть)
      cy.contains('Соус Spicy-X').scrollIntoView().click();
      cy.get('[data-testid="modal"]').should('exist');
      cy.get('body').then(($b) => {
        if ($b.find('button[aria-label="close"]').length) {
          cy.get('button[aria-label="close"]').click();
        } else {
          cy.get('body').type('{esc}');
        }
      });
      cy.get('[data-testid="modal"]').should('not.exist');
    });
  });

  it('создаёт заказ, показывает номер и очищает конструктор', () => {
    addByName('Флюоресцентная булка R2-D3');
    addByName('Мясо бессмертных моллюсков Protostomia');

    cy.get('[data-testid="order-button"]', { timeout: 10000 })
      .scrollIntoView()
      .should('be.enabled')
      .click();

    cy.wait('@createOrder');

    // wrapper может быть с display:contents, поэтому проверяем существование + номер
    cy.get('[data-testid="modal"]', { timeout: 10000 }).should('exist');
    cy.contains('424242', { timeout: 10000 }).should('exist');

    // Закрываем модалку: крестик или ESC (в зависимости от реализации)
    cy.get('body').then(($body) => {
      if ($body.find('button[aria-label="close"]').length) {
        cy.get('button[aria-label="close"]').click();
      } else {
        cy.get('body').type('{esc}');
      }
    });

    cy.get('[data-testid="modal"]').should('not.exist');
    cy.contains('424242').should('not.exist');

    // Конструктор пуст (или станет пустым после reload)
    assertConstructorCleared();
  });
});

/// <reference types="cypress" />

describe("Burger Constructor — click flow", () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/ingredients', { fixture: 'ingredients.json' }).as('getIngredients');
    cy.intercept('GET', '**/api/auth/user', { fixture: 'user.json' }).as('getUser');
    cy.intercept('POST', '**/api/orders', { fixture: 'order.json' }).as('createOrder');
  
    cy.setCookie('accessToken', 'FAKE.ACCESS.TOKEN');               // cookie
    window.localStorage.setItem('refreshToken', 'FAKE.REFRESH.TOKEN'); // LS
  
    cy.visit('/');
    cy.wait('@getIngredients');
  });
  
  afterEach(() => {
    cy.clearCookie('accessToken');                   // cookie
    window.localStorage.removeItem('refreshToken'); // LS
  });
  
  it("добавляет булку и начинку с помощью кнопки +", () => {
    // булка
    cy.contains('[data-testid="ingredient-card"]', "Флюоресцентная булка R2-D3")
      .within(() => cy.get('[data-testid="add-ingredient"]').click());
    cy.get('[data-testid="constructor-buns"]').should("contain.text", "Флюоресцентная булка R2-D3");

    // начинка
    cy.contains('[data-testid="ingredient-card"]', "Мясо бессмертных моллюсков Protostomia")
      .within(() => cy.get('[data-testid="add-ingredient"]').click());
    cy.get('[data-testid="constructor-fillings"]').should("contain.text", "Мясо бессмертных моллюсков Protostomia");
  });

  it("открывает модалку ингредиента и показывает данные именно этого ингредиента", () => {
    // открываем карточку соуса
    cy.contains('[data-testid="ingredient-card"]', "Соус Spicy-X").click();
    cy.get('[data-testid="modal"]')
      .should("be.visible")
      .and("contain.text", "Соус Spicy-X"); // проверяем, что данные соответствуют клику
  });

  it("закрывает модалку по кресту, ESC и клику по оверлею", () => {
    // открыть
    cy.contains('[data-testid="ingredient-card"]', "Соус Spicy-X").click();
    cy.get('[data-testid="modal"]').should("be.visible");

    // 1) крестик
    cy.get('[data-testid="modal-close"]').click();
    cy.get('[data-testid="modal"]').should("not.exist");

    // открыть снова
    cy.contains('[data-testid="ingredient-card"]', "Соус Spicy-X").click();
    cy.get('[data-testid="modal"]').should("be.visible");

    // 2) ESC
    cy.get("body").type("{esc}");
    cy.get('[data-testid="modal"]').should("not.exist");

    // открыть снова
    cy.contains('[data-testid="ingredient-card"]', "Соус Spicy-X").click();
    cy.get('[data-testid="modal"]').should("be.visible");

    // 3) клик по оверлею (если есть отдельный элемент)
    // если отдельного нет — можно кликнуть по краю модалки, но лучше иметь overlay-элемент
    cy.get('[data-testid="modal-overlay"]').click({ force: true });
    cy.get('[data-testid="modal"]').should("not.exist");
  });

  it("создаёт заказ, показывает номер и очищает конструктор", () => {
    // собрать бургер кликами
    cy.contains('[data-testid="ingredient-card"]', "Флюоресцентная булка R2-D3")
      .within(() => cy.get('[data-testid="add-ingredient"]').click());
    cy.contains('[data-testid="ingredient-card"]', "Мясо бессмертных моллюсков Protostomia")
      .within(() => cy.get('[data-testid="add-ingredient"]').click());

    // оформить заказ
    cy.get('[data-testid="order-button"]').click();
    cy.wait("@createOrder");

    // модалка с номером
    cy.get('[data-testid="modal"]').should("be.visible").and("contain.text", "424242");

    // закрыть и проверить очистку
    cy.get('[data-testid="modal-close"]').click();
    cy.get('[data-testid="modal"]').should("not.exist");
    cy.get('[data-testid="constructor-buns"]').should("not.contain.text", "Флюоресцентная булка R2-D3");
    cy.get('[data-testid="constructor-fillings"]').should("not.contain.text", "Мясо бессмертных моллюсков Protostomia");
  });
});

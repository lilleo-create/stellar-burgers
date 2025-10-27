export const SEL = {
  constructorBuns:     '[data-testid="constructor-buns"]',
  constructorFillings: '[data-testid="constructor-fillings"]',
  constructorTotal:    '[data-testid="constructor-total"]',

  // поддержка двух вариантов data-testid у кнопки
  placeOrderBtn:       '[data-testid="order-button"], [data-testid="place-order"]',

  ingredientCard:      '[data-testid="ingredient-card"]',
  ingredientName:      '[data-testid="ingredient-name"]',
  ingredientCounter:   '[data-testid="ingredient-counter"]',

  // Общая модалка
  modal:               '[data-testid="modal"]',
  ingredientModal:     '[data-testid="ingredient-modal"]',

  // Кнопка закрытия модалки (универсальная)
  modalClose:          '[data-testid="modal-close"]',

  // Оставлено для обратной совместимости
  ingredientModalClose:'[data-testid="modal-close"]',

  tabBuns:             '[data-testid="tab-buns"]',
  tabSauces:           '[data-testid="tab-sauces"]',
  tabMains:            '[data-testid="tab-mains"]',

  orderModal:          '[data-testid="order-modal"]',
  orderNumber:         '[data-testid="order-number"]',
} as const;

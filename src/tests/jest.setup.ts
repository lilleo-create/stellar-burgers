// mock nanoid/uuid если генеришь clientId в конструкторе
jest.mock('nanoid', () => ({ nanoid: () => 'test-nanoid' }));

// Иногда слайсы дергают fetch внутри thunk — подменим на заглушку по умолчанию.
global.fetch = jest.fn() as any;

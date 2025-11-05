import reducer, {
  initialState as constructorInitial,
  setBun,
  addIngredient,
  removeIngredient,
  moveIngredient,
  clearConstructor
} from './constructorSlice';

jest.mock('@reduxjs/toolkit', () => {
  const actual = jest.requireActual('@reduxjs/toolkit');
  return { ...actual, nanoid: () => 'test-uuid' };
});

const bun = {
  _id: 'bun1',
  type: 'bun',
  name: 'Булка светлая',
  price: 100
} as any;

const s1 = {
  _id: 's1',
  type: 'sauce',
  name: 'Соус A',
  price: 10
} as any;

const s2 = {
  _id: 's2',
  type: 'main',
  name: 'Катлетка',
  price: 50
} as any;

describe('burgerConstructorSlice', () => {
  it('возвращает initial state по умолчанию', () => {
    const state = reducer(undefined, { type: 'unknown' });
    expect(state).toEqual(constructorInitial);
  });

  it('setBun: устанавливает булку', () => {
    const next = reducer(undefined, setBun(bun));
    expect(next.bun).toEqual(bun);
  });

  it('addIngredient: добавляет ингредиент и проставляет uuid через prepare', () => {
    const next = reducer(undefined, addIngredient(s1));
    expect(next.ingredients).toHaveLength(1);
    expect(next.ingredients[0]).toMatchObject({ _id: 's1', uuid: 'test-uuid' });
  });

  it('removeIngredient: удаляет по uuid', () => {
    const withOne = reducer(undefined, addIngredient(s1));
    const uuid = withOne.ingredients[0].uuid;
    const next = reducer(withOne, removeIngredient(uuid));
    expect(next.ingredients).toHaveLength(0);
  });

  it('moveIngredient: меняет порядок по индексам', () => {
    let state = reducer(undefined, addIngredient(s1)); // [s1]
    state = reducer(state, addIngredient(s2)); // [s1, s2]
    const moved = reducer(state, moveIngredient({ fromIndex: 0, toIndex: 1 }));
    expect(moved.ingredients.map((i) => i._id)).toEqual(['s2', 's1']);
  });

  it('moveIngredient: ничего не делает при неверных индексах', () => {
    let state = reducer(undefined, addIngredient(s1));
    state = reducer(state, addIngredient(s2));
    const before = state.ingredients.map((i) => i._id);

    const neg = reducer(state, moveIngredient({ fromIndex: -1, toIndex: 0 }));
    expect(neg.ingredients.map((i) => i._id)).toEqual(before);

    const oob = reducer(state, moveIngredient({ fromIndex: 0, toIndex: 5 }));
    expect(oob.ingredients.map((i) => i._id)).toEqual(before);
  });

  it('clearConstructor: очищает булку и ингредиенты', () => {
    let state = reducer(undefined, setBun(bun));
    state = reducer(state, addIngredient(s1));
    const cleared = reducer(state, clearConstructor());
    expect(cleared).toEqual(constructorInitial);
  });
});

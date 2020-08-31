import {create} from './util.js';
import {type} from './types.js';

let Env = {
  [type]: Symbol('paidia/env'),
  empty: () => create(Env, {}),
  create: (env, bindings) => create(env, bindings),
  set (env, key, value) {
    env[key] = value;
    return env;
  },
  get (key) { return this[key] },
  has (key) { return key in this }
};

let base = Env.create(Env.empty(), {
  '+': (x, y) => x + y,
  '-': (x, y) => x - y,
  '*': (x, y) => x * y,
  '/': (x, y) => y === 0 ? undefined : Math.round(x/y),
});

export {Env, base};

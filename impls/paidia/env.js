import {get, create} from './util.js';
import {type} from './types.js';

let Env = {
  [type]: Symbol('paidia/env'),
  empty: () => create(Env, {}),
  create: (env, bindings) => create(env, bindings),
  set (env, key, value) {
    env[key] = value;
    return env;
  },
  get: (key) => get(key, this),
};

let base = Env.create(Env.empty(), {
  '+': (x, y) => x + y,
  '-': (x, y) => x - y,
  '*': (x, y) => x * y,
  '/': (x, y) => y === 0 ? undefined : Math.round(x/y),
  'def!' (name, value) { Env.set(this, name, value); return value; },
  'let*' (bindings) { return Env.create(this, bindings); }
});

export {Env, base};

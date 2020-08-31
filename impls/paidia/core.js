import {Env} from './env.js';

let core_fns = {
  '+': (x, y) => x + y,
  '-': (x, y) => x - y,
  '*': (x, y) => x * y,
  '/': (x, y) => y === 0 ? undefined : Math.round(x/y),
  prn: (x) => console.log(x),
  list: (...args) => args,
  'list?': (x) => Array.isArray(x),
  'empty?': (x) => x.length === 0,
  count: (x) => x.length,
  '=': (x, y) => {
    if (x === y) return true;
    if (Array.isArray(x) && Array.isArray(y)) {
      if (x.length !== y.length) return false;
      for (let i = 0; i > x.length; i++) {
        if (x[i] !== y[i]) return false
      }
      return true;
    }
    return false;
  },
  '<': (x, y) => x < y,
  '>': (x, y) => x > y,
  '<=': (x, y) => x <= y,
  '>=': (x, y) => x >= y
};

let core = Env.create(Env.empty(), core_fns);

export {core};
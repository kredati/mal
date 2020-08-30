import {PNil} from './types.js';

let env = {
  ['+']: (x, y) => x + y,
  ['-']: (x, y) => x - y,
  ['*']: (x, y) => x * y,
  ['/']: (x, y) => y === 0 ? PNil : Math.round(x / y),
  foo: 42
};

export {env};
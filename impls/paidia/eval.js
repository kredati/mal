import * as t from './types.js';
import * as r from './reader.js';
import {env} from './repl_env.js';
import {get} from './util.js';

let evaluate = (ast, env) => {
  ast
  if (ast.length === 0) return undefined;
  try {  return ast
    .map(value => inner_eval(value, env))
    .map(lift);
  } catch (e) {
    return [t.PError.create(`.*${e.name}: ${e.message}.*`)];
  }
};

let inner_eval = (value, env) => {
  switch(value[t.type]) {
    case t.PName[t.type]: {
      let name = value.value;
      let lookup = get(name, env);
      if (lookup == null) throw Error(`Unbound identifier: ${name}`);
      return lookup;
    }
    case t.PList[t.type]: {
      if (value.value.length === 0) return value;
      let [fn, ...args] = value.value.map(v => inner_eval(v, env));
      return fn(...args);
    }
    case t.PNumber[t.type]:
    case t.PBoolean[t.type]:
    case t.PNil[t.type]: {
      return value.value;
    }
  }
};

let lift = (value) => {
  if (value == null) return t.PNil;
  if (value[t.type]) return value;
  switch (typeof value) {
    case 'number': return t.PNumber.create(value);
    case 'boolean': return t.PBoolean.create(value);
    case 'string': return t.PString.create(value);
  }
};

export {evaluate, lift};

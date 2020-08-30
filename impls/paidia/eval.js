import * as t from './types.js';
import {Env} from './env.js';
import {get, chunk} from './util.js';

let evaluate = (ast, env) => {
  if (ast.length === 0) return undefined;
  try {  return ast
    .map(value => inner_eval(value, env))
    .map(lift);
  } catch (e) {
    return [t.PError.create(`${e.name}: ${e.message}`)];
  }
};

let inner_eval = (value, env) => {
  switch(value[t.type]) {
    case t.PName[t.type]: {
      let name = value.value;
      let lookup = get(name, env);
      if (lookup == null) throw Error(`'${name}' not found`);
      return lookup;
    }
    case t.PList[t.type]: {
      if (value.value.length === 0) return value;
      let [first, ...rest] = value.value;
      let fn = inner_eval(first, env);
      switch(fn.name) {
        case 'let*': return eval_let(rest, env);
        case 'def!': return eval_def(rest, env);
        default: {
          let args = rest.map(v => inner_eval(v, env));
          return fn(...args);
        };
      }
    }
    case t.PNumber[t.type]:
    case t.PBoolean[t.type]:
    case t.PNil[t.type]: {
      return value.value;
    }
  }
};

let eval_let = ([raw_bindings, ...exprs], env) => {
  if (raw_bindings[t.type] !== t.PList[t.type])
    throw Error(`let* bindings must be a list; you gave me ${raw_bindings.show()}::${raw_bindings[t.type].description}.`);
  raw_bindings = raw_bindings.value;
  if (raw_bindings.length % 2 !== 0)
    throw Error('let* bindings must have an even number of entries.');
  let bindings = chunk(raw_bindings);
  let let_env = Env.create(env, {});
  for (let [raw_name, raw_value] of bindings) {
    if (raw_name[t.type] !== t.PName[t.type])
      throw Error(`I can only bind values to valid names.`);
    let name = raw_name.value;
    let value = inner_eval(raw_value, let_env);
    Env.set(let_env, name, value);
  }
  let evaled = exprs.map((expr) => inner_eval(expr, let_env));
  return evaled[evaled.length - 1];
};

let eval_def = ([name, expr], env) => {
  if (name[t.type] !== t.PName[t.type])
    throw Error('I can only bind names');
  let value = inner_eval(expr, env);
  Env.set(env, name.value, value);
  return value;
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
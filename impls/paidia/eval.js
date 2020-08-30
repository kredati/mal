import * as t from './types.js';
import {Env, base} from './env.js';
import {get, chunk, interleave, last} from './util.js';

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
      switch(first.value) {
        case 'let*': return eval_let(rest, env);
        case 'def!': return eval_def(rest, env);
        case 'fn*': return eval_fn(rest, env);
        default: {
          let fn = inner_eval(first, env);
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
  for (let [name, value] of bindings) {
    if (name[t.type] !== t.PName[t.type])
      throw Error(`I can only bind values to valid names.`);
    name = name.value;
    value = inner_eval(value, let_env);
    Env.set(let_env, name, value);
  }
  let evaled = exprs.map((expr) => inner_eval(expr, let_env));
  return last(evaled);
};

let eval_def = ([name, expr], env) => {
  if (name[t.type] !== t.PName[t.type])
    throw Error('I can only bind names');
  let value = inner_eval(expr, env);
  Env.set(env, name.value, value);
  return value;
};

let eval_fn = ([raw_params, ...exprs], env) => {
  if (raw_params[t.type] !== t.PList[t.type])
    throw Error(`Parameters must be a list`);
  raw_params = raw_params.value;
  if (!raw_params.every(p => p[t.type] === t.PName[t.type]))
    throw Error(`Parameters must all be names`);
  let params = raw_params.map(n => n.value);
  let fn = (...args) => {
    if (args.length !== raw_params.length)
      throw Error(`Arity mismatch: expected ${params.length}; received ${args.length}.`);
    let bindings = chunk(interleave(params, args));
    let fn_env = Env.create(env, {});
    for (let [name, value] of bindings) {
      Env.set(fn_env, name, value);
    }
    let evaled = exprs.map(expr => inner_eval(expr, fn_env));
    return last(evaled);
  };
  return fn;
};

let lift = (value) => {
  if (value == null) return t.PNil;
  if (value[t.type]) return value;
  switch (typeof value) {
    case 'number': return t.PNumber.create(value);
    case 'boolean': return t.PBoolean.create(value);
    case 'string': return t.PString.create(value);
    case 'function': return t.PFunction.create(value);
  }
};

export {evaluate, lift};

import * as r from './reader.js';

evaluate(r.read('(def! id (fn* (a) a)) (id 42'), base) //?
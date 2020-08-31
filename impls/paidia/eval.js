import * as t from './types.js';
import {Env} from './env.js';
import {chunk, interleave, last} from './util.js';
import {core} from './core.js';

// evaluate :: [PValue] -> Env -> [PValue]
// evaluates the output of the reader, which is an array of
// PValues, against an Env (which may be modified by such evaluation)
// returns an array of PValues for printing
// it pushes the array of values through `inner_eval`, 
// getting an array of values
// then it pushes them through `lift`, getting PValues
// it handles both the empty case and any errors
let evaluate = (ast, env) => {
  env.has //?
  if (ast.length === 0) return undefined;
  if (ast[0][t.type] === t.PError[t.type])
    return ast;
  try {  return ast
    .map(value => inner_eval(value, env))
    .map(lift);
  } catch (e) {
    return [t.PError.create(`${e.name}: ${e.message}`)];
  }
};

// inner_eval :: PValue -> Env -> any
let inner_eval = (value, env) => {
  switch(value[t.type]) {
    case t.PName[t.type]: {
      let name = value.value;
      if (!env.has(name)) throw Error(`'${name}' not found`);
      return env.get(name);
    }
    case t.PList[t.type]: {
      // this is the line that's giving me grief
      // this line returns a PValue, not a value
      // see note on lift
      if (value.value.length === 0) return []; 
      let [first, ...rest] = value.value;
      switch(first.value) {
        case 'let*': return eval_let(rest, env);
        case 'def!': return eval_def(rest, env);
        case 'fn*': return eval_fn(rest, env);
        case 'if': return eval_if(rest, env);
        case 'do': return eval_do(rest, env);
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

// eval_let :: [PList, ...PValue] -> Env -> value
// evaluates a let* form
// the first PValue must be a PList of alternating names and exprs
// in the list of bindings, later bindings can depend on earlier ones
// the remaining PValues are evaluated in order with the bindings
// the result of evaluating the last expression is returned
let eval_let = (forms, env) => {
  let [raw_bindings, ...exprs] = forms;
  if (raw_bindings == null)
    throw Error('Too few arguments to let*.')
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

// eval_def :: [PName, PValue] -> Env -> value
// evaluates a def! form
// takes an array of two PValues, a PName and an expression
// it evaluates the expression, then
// it **modifies the environment**, binding the value of the expression
// to the name
// it returns the value of the expression
let eval_def = ([name, expr], env) => {
  if (name == null)
    throw Error('Too few arguments to def!.');
  if (name[t.type] !== t.PName[t.type])
    throw Error('I can only bind names');
  let value = expr == null 
    ? null
    : inner_eval(expr, env);
  Env.set(env, name.value, value);
  return value;
};

// eval_fn :: [PList, ...PValue] -> Env -> Function
// evaluates an fn* form
let eval_fn = ([raw_params, ...exprs], env) => {
  if (raw_params == null)
    throw Error('Too few arguments to fn*.');
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

let eval_if = ([condition, if_true, if_false], env) => {
  condition = inner_eval(condition, env);
  if (if_true == null) throw Error('Too few arguments to if.');
  if (condition === false || condition == null) {
    return if_false == null 
      ? null
      : inner_eval(if_false, env);
  }

  return inner_eval(if_true, env);
};

let eval_do = (exprs, env) => {
  let evaled = exprs.map(expr => inner_eval(expr, env));
  return last(evaled);
};

// lift :: value -> PValue
// lift takes js values and pulls them into PValues
// the mapping between JS and Paidia types isn't one-to-one
let lift = (value) => {
  if (value == null) return t.PNil.create();
  // try only to pass JS values; no Paidia values
  //if (value[t.type]) return value;
  switch (typeof value) {
    case 'number': return t.PNumber.create(value);
    case 'boolean': return t.PBoolean.create(value);
    case 'string': return t.PString.create(value);
    case 'function': return t.PFunction.create(value);
  }
  // the hard case is objects
  // in principle, there are three Paidia values that have no obvious
  // mapping to JS values: lists, vectors, and hashmaps
  // because I haven't yet implemented vectors and hashmaps yet,
  // we can do this naïve thing: arrays are just PLists
  if (Array.isArray(value))
    return t.PList.create(value.map(lift));
  throw TypeError(`No Paidia mapping for value: ${value.toString()}.`)
};

export {evaluate, lift};

import * as r from './reader.js';

evaluate(r.read('(list 1 2 3)'), core) //?
import * as r from './reader.js';
import * as p from './printer.js';
import * as e from './eval.js';
import * as t from './types.js';
import * as u from './util.js';
import {env} from './repl_env.js';

let rep = u.pipe_some(
  r.read,
  ast => e.evaluate(ast, env),
);

e.evaluate(r.read('42'), env) //?
import * as reader from './reader.js';
import * as printer from './printer.js';
import * as evaluate from './eval.js';
import {base} from './env.js'
import {pipe_some} from './util.js';

let stdin = Deno.iter(Deno.stdin);

let dec = new TextDecoder();
let enc = new TextEncoder();

let read_line = (chunk) => {
  return dec.decode(chunk);
};

let print_out = (string) => {
  Deno.stdout.write(enc.encode(string + '\n'));
};

let prompt = () => {
  Deno.stdout.write(enc.encode("user> "));
};

let loop = pipe_some(
  read_line,
  reader.read,
  (ast) => evaluate.evaluate(ast, base),
  printer.print,
  print_out
);

///// do the thing

console.log('Welcome to Paidia!');
prompt();

for await (let chunk of stdin) {
  loop(chunk);
  prompt();
};
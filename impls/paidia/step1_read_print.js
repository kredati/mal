import * as reader from './reader.js';
import * as printer from './printer.js';
import {pipe_some} from './util.js';

let stdin = Deno.iter(Deno.stdin);

let dec = new TextDecoder();
let enc = new TextEncoder();

let read_line = (chunk) => {
  return dec.decode(chunk);
};

let evaluate = (input) => input;

let print_out = (string) => {
  Deno.stdout.write(enc.encode(string + '\n'));
};

let prompt = () => {
  Deno.stdout.write(enc.encode("user> "));
};

let loop = pipe_some(
  read_line,
  reader.read,
  evaluate,
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
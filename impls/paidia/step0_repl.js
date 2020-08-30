let stdin = Deno.iter(Deno.stdin);

let dec = new TextDecoder();
let enc = new TextEncoder();

let read = (chunk) => {
  return dec.decode(chunk);
};

let evaluate = (string) => string;

let print = (string) => {
  console.log(string);
};

let prompt = () => {
  Deno.stdout.write(enc.encode("\nuser> "));
};

console.log('Welcome to Paidia!');
prompt();

for await (let chunk of stdin) {
  let line = read(chunk).trim();
  let result = evaluate(line);
  print(result);
  prompt();
};
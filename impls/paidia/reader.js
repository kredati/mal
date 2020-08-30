import {create} from './util.js';
import {PNumber, PBoolean, PNil, PName, PList, PError, PString, type} from './types.js';

let Reader = {
  create: (tokens, position = 0, level = 0) => 
    create(Reader, {tokens, position, level}),
  next () { return Reader.create(this.tokens, this.position + 1, this.level); },
  peek () { return this.tokens[this.position]; },
  push () { return Reader.create(this.tokens, this.position, this.level + 1); },
  pop () { return Reader.create(this.tokens, this.position, this.level - 1); }
};

let read_form = (reader, forms = []) => {
  reader.peek() //?
  forms
  switch(reader.peek()) {
    case(undefined):
      return [forms, reader];
    case(')'):
      return [PList.create(forms), reader.next().pop()];
    case('('):{
      let [form, next_reader] = read_list(reader.next().push());
      forms.push(form);
      reader = next_reader;
      break;}
    default: {
      let [form, next_reader] = read_atom(reader);
      forms.push(form);
      reader = next_reader;
    }
  }
  return read_form(reader, forms);
};

let read_list = (reader) => read_form(reader);

let parse_atom = (atom) => {
  switch (atom) {
    case 'nil': return PNil.create();
    case 'true': return PBoolean.create(true);
    case 'false': return PBoolean.create(false);
    default:
      let maybe_number = Number(atom);
      if (!isNaN(maybe_number)) return PNumber.create(maybe_number);
      // here's where string would go, but it's complicated, matching quotes
      return PName.create(atom);
  }
};

let read_atom = (reader) => {
  let atom = reader.peek();
  let value = parse_atom(atom);
  return [value, reader.next()];
};

let tokenize = (str) => {
  var re = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
  var results = [];
  let match;
  while ((match = re.exec(str)[1]) != '') {
      if (match[0] === ';') { continue; }
      results.push(match);
  }
  return results;
};

let read = (str) => {
  let reader = Reader.create(tokenize(str));
  let [form, last_reader] = read_form(reader);
  last_reader.level //?
  if (last_reader.level !== 0) {
    return PError.create('.*(EOF|end of input|unbalanced).*');
  }
  return form;
};

export {read};
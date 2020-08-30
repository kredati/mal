import {create} from './util.js';

let type = Symbol('paidia/type');

let PList = {
  [type]: Symbol('paidia/list'),
  create: (value) => create(PList, {value}),
  show () { return `(${this.value.map(v => v.show()).join(' ')})`}
};

let PNil = {
  [type]: Symbol('paidia/nil'),
  create: () => PNil,
  show: () => 'nil',
  value: null
};

let PBoolean = {
  [type]: Symbol('paidia/boolean'),
  create: (value) => create(PBoolean, {value}),
  show () { return this.value.toString(); }
};

let PNumber = {
  [type]: Symbol('paidia/number'),
  create: (value) => create(PNumber, {value}),
  show () { return this.value.toString(); }
};

let PString = {
  [type]: Symbol('paidia/string'),
  create: (value) => create(PString, {value}),
  show () { return this.value; }
};

let PName = {
  [type]: Symbol('paidia/name'),
  create: (value) => create(PName, {value}),
  show () { return this.value; }
}

export {type, PNil, PBoolean, PNumber, PString, PName, PList};
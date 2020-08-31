import {create} from './util.js';

let type = Symbol('paidia/type');

let PList = {
  get constructor() { return {name: 'PList'}; },
  [type]: Symbol('paidia/list'),
  create: (value) => create(PList, {value}),
  show () { return `(${this.value.map(v => v.show()).join(' ')})`}
};

let PNil = {
  get constructor() { return {name: 'PNil'}; },
  [type]: Symbol('paidia/nil'),
  create: () => PNil.nil,
  show: () => 'nil',
  value: null
};

PNil.nil = create(PNil);

let PBoolean = {
  get constructor() { return {name: 'PBoolean'}; },
  [type]: Symbol('paidia/boolean'),
  create: (value) => create(PBoolean, {value}),
  show () { return this.value.toString(); }
};

let PNumber = {
  get constructor() { return {name: 'PNumber'}; },
  [type]: Symbol('paidia/number'),
  create: (value) => create(PNumber, {value}),
  show () { return this.value.toString(); }
};

let PString = {
  get constructor() { return {name: 'PString'}; },
  [type]: Symbol('paidia/string'),
  create: (value) => create(PString, {value}),
  show () { return this.value; }
};

let PName = {
  get constructor() { return {name: 'PName'}; },
  [type]: Symbol('paidia/name'),
  create: (value) => create(PName, {value}),
  show () { return this.value; }
};

let PError = {
  get constructor() { return {name: 'PError'}; },
  [type]: Symbol('paidia/error'),
  create: (value) => create(PError, {value}),
  show () { return this.value; }
};

let PFunction = {
  get constructor() { return {name: 'PFunction'}; },
  [type]: Symbol('paidia/function'),
  create: (value, name = 'function') => create(PFunction, {value, name}),
  show () { return `#<${this.name}>`}
};

export {type, PNil, PBoolean, PNumber, PString, PName, PList, PError, PFunction};
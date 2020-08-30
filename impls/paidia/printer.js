import {type, PList} from './types.js';

let print = (result) => `${result.map(x => x.show()).join(' ')}`;

export {print};
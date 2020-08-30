const create = (proto, attrs) => Object.assign(Object.create(proto), attrs);

const rename = (name, fn) => typeof fn != 'function'
  ? fn
  : Object.defineProperty(fn, 'name', {value: name});

const get = (...args) => {
  const [key, obj] = args;
  const key_name = typeof key === 'symbol'
    ? `$${key.description}`
    : key

  switch(args.length) {
    case 1:
      return rename(`get ${key_name}`, (obj) => get(key, obj));
    case 2:
    default:
      if (obj == null) return undefined;
      return obj[key];
  }
};

const pipe = (...fns) => (x) => {
  for (let fn of fns) {
    try {
      x = fn(x);
    } catch (e) {
      console.error('Error caught in function pipeline.');
      console.error(`While calling ${fn.name} with ${x.toString()}.`);
      throw e;
    }
  }
  return x;
};

const pipe_some = (...fns) => (x) => {
  for (let fn of fns) {
    try {
      x = fn(x);
      if (x == null) return undefined;
    } catch (e) {
      console.error('Error caught in function pipeline.');
      console.error(`While calling ${fn.name} with ${x.toString()}.`);
      throw e;
    }
  }
};

export {create, get, pipe, pipe_some};
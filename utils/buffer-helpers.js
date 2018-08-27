// create a base64 encoded string from a node buffer.
const btoa = (str) => {
  let buffer;

  if (str instanceof Buffer) {
    buffer = str;
  } else {
    buffer = Buffer.from(str.toString(), 'binary');
  }

  return buffer.toString('base64');
};

// create a node buffer from a base64 encoded string
const atob = (str) => {
  return Buffer.from(str, 'base64');
};

module.exports = {
  btoa,
  atob,
};

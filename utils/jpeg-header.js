const HEADER = 'data:image/jpeg;base64,';
const HEADER_LENGTH = 417;

const strip = dataUrl => dataUrl.replace(HEADER, '');
const prepend = dataUrl => `${HEADER}${dataUrl}`;
const detectHeaderSize = (data) => {
  for (var i = 0, l = data.length; i < l; i++) {
    if (i === 0) console.log(data[i] == 0xff)
    if (data[i] == 0xFF && data[i+1] == 0xDA) {
      return i + 2;
    }
  }

  return HEADER_LENGTH;
};

module.exports = {
  strip,
  prepend,
  detectHeaderSize,
};

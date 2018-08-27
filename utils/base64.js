const base64Set = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
/**
 * Used to get the base64 character that corresponds to the character code
 * of a valid ASCII character.
 * 
 * For example:
 * If we evaluate `'h'.charCodeAt(0)`, we get the character code 104
 * Shifting off the last two bits gives us 26, which corresponds to
 * 'a' in the lookup table
 * 
*/
// this prevents us from calling `charAt` on the string, and gives us a
// lookup with no overhead
const base64Lookup = base64Set.split('');

// When decoding base64, we need to find the index corresponding to the
// current base64 letter. To avoid calling indexOf a bunch of times,
// we just make a lookup
const base64Map = base64Lookup.reduce((memo, letter, index) => ({ [letter]: index, ...memo }), {});

const base64Encoder = (bytes, { allowInvalid = false } = {}) => {
  if (/([^\u000-\u00ff])/.test(bytes) && !allowInvalid) {
    throw new Error('Non-ASCII characters cannot be base64 encoded');
  }

  const output = [];
  let i = 0;
  let currentByte;
  let currentWord
  let previousWord;
  
  while (i < bytes.length) {
    /**
     * Use modulo here to consitantly keep the value of currentByte between
     * 0 and 2 without needing if statements. I'm not sure if this is going to wind
     * up being prohibitively slow, but I guess it makes the code a little clearer?
     *
     * Using modulo is an easy way to show the cyclical nature of the values we
     * want to set currentByte to.
     */
    currentByte = i % 3;

    // `byte` may either be a string or an array of integers.
    // Maybe add an object to handle this?
    currentWord = bytes.charCodeAt ? bytes.charCodeAt(i) : bytes[i];

    // Encode groups of 3 8-bit words (24 bits) into 4 6-bit words
    switch(currentByte) {
      case 0:
        // Shift off the last 2 bits, preserving only the first 6 bits
        const first6Bits = currentWord >> 2;
        output.push(base64Lookup[first6Bits]);

        break;
      case 1:
        /**
         * Compare the first word to 00000011.
         * This will grab the two least significant bits
         * in the first word, which were the two bits shifted away
         * in the first case.
         * 
         * Then, combine them with the first 4 bits
         * in the second word in the sequence.
         * 
         * This will give a new 6 bit word with the last 2 bits
         * of the first word, and the first 4 bits of the second
         */
        const second6Bits = (previousWord & 3) << 4 | (currentWord >> 4); 
        output.push(base64Lookup[second6Bits]);
        break;
      case 2:
        /**
         * The last two 6-bit words have to be grabbed at the same time.
         * If they aren't, the final 6-bit word will always be cut off.
         * 
         * Alternatively, we could have a 3rd case and do `previous & 0x3f`
         * to grab the last 6 bits from the final word, but this saves us
         * 1 loop iteration 
        **/

        /**
         * Compare the previous word to 00001111 to get the last 4 bits,
         * and combine them with the first 2 bits of the current word.
         */
        const third6Bits = (previousWord & 0x0f) << 2 | (currentWord >> 6); 
        output.push(base64Lookup[third6Bits]);

        /**
         * Compare the currentWord word with 00111111 to take the
         * last six bits (ignoring the first two), the final
         * remaining bits in this group of 24.
         */
        const fourth6Bits = currentWord & 0x3f;
        output.push(base64Lookup[fourth6Bits]);

        // If we are at the last word, leave currentByte set to the same value.
        // This way, we won't try and pad the base64 string unnecessarily.
        // If the value of currentByte ends on 0 or 1, we know we need to pad
        // the output with the appropriate number of '=' characters

        break;
      default:
        // no-op
        break;
    }

    previousWord = currentWord;
    i += 1;
  }

  if (currentByte === 0) {
    output.push(base64Lookup[(previousWord & 3) << 4]);
    output.push('==');
  } else if (currentByte === 1){
    output.push(base64Lookup[(previousWord & 0x0f) << 2]);
    output.push('=');
  }

  return output.join('');
}

const base64Decoder = (base64String, { allowInvalid = false, offset } = { offset: 0 }) => {
  // spaces are not recognized by base64, so remove them
  let safeText = base64String.replace(/\s/g, '');

  // // if a base64 string isnt divisible by 4, it can't be valid base64, since it
  // // won't map correctly into an even number of 8-bit words
  if (!allowInvalid) {
    if(!(/^[a-z0-9\+\/\s]+\={0,2}$/i.test(safeText)) || safeText.length % 4 > 0){
      throw new Error('Not a base64-encoded string.');
    }
  }

  // now that we know the string is valid base64, remove the padding, if any
  safeText = safeText.replace(/=/g, '');

  const output = [];

  let i = offset;
  let currentWord;
  let previousWord;
  let currentByte;

  while (i < safeText.length) {
    currentByte = i % 4;

    // These are each 6-bit words!
    currentWord = base64Map[safeText.charAt(i)];

    switch (currentByte) {
      case 0:
        // this is a no-op, since we dont have a previous word yet
        // TODO: why not go to string length - 1 and do currentWord and nextWord?
        // that should skip this useless 0 case.
        break;
      case 1:
        /**
         * Take all six bits in the first word, and shift them over 2 bits.
         * Next, combine with the 2 most significant bits in the second word,
         * shifting off the last 4 bits.
         */
        output.push(previousWord << 2 | currentWord >> 4);
        break;
      case 2:
        /**
         * Compare the second 6-bit word with 00001111 to get the 4 least significant bits,
         * then shift them over by 4 places.
         * Combine with the 4 most significant bits in the third 6-bit word
         */
        output.push((previousWord & 0x0f) << 4 | currentWord >> 2);
        break;
      case 3:
        // Finally, take the last 2 bits from the third 6-bit word, shift them over six bits,
        // and combine them with all the bits from the 4th 6-bit word
        output.push((previousWord & 3) << 6 | currentWord);
        break;
    }

    previousWord = currentWord;
    i += 1;
  }

  return output;
};

// test
// const sixfour = base64Encoder('hats');
// console.log(sixfour);
// console.log(base64Decoder(sixfour));

module.exports = {
  base64Encoder,
  base64Decoder,
};

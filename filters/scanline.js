/**
 * 
 * @param {*} imageData 
 * @param {*} scanlineSize - this param controls how large the scanline appears
 */
module.exports = (imageData, scanlineSize = 4) => {
  const { data: pixels, width, height } = imageData;

  const scanlineLength = width * 4;
  const targetHeight = height;

  for (let i = 0; i < targetHeight; i += 3) {
    var offset = scanlineLength * i;
    var scanlineEnd = scanlineLength + offset;

    for (let ii = offset; ii < scanlineEnd; ii += scanlineSize) {
      if ((ii + 4) > scanlineEnd) {
        break;
      }

      pixels[ii] = pixels[ii] - pixels[ii + 4];
      pixels[ii+1] = pixels[ii+1] - pixels[ii + 5];
      pixels[ii+2] = pixels[ii +2] - pixels[ii + 6];
    }
  }

  return imageData;
}
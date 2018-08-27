const { atob, btoa } = require('../utils/buffer-helpers');
const random = require('../utils/random');
const jpegHeader = require('../utils/jpeg-header');

function glitch(dataUrl, Image, glitchSize = 10) {
  const byteArray = atob(jpegHeader.strip(dataUrl))
  const headerSize = 417; //jpegHeader.detectHeaderSize(byteArray);
  const iterations = 21;
  const glitchAmount = 15 / 100 //random(1, 80) / 100;
  const glitchSeed = 23 / 100 //random(0, 25) / 100;
  
  function glitchJpegBytes(bytes) {
    const maxIndex = bytes.length - headerSize - 4;
    const pixelIndex = (random(headerSize, maxIndex) * glitchSeed) | 0

    for (let i = 0; i < iterations; i++) {
      const minPixelIndex = (maxIndex / iterations * i) | 0;
      const maxPixelIndex = (maxIndex / iterations * (i + 1 )) | 0;
      const delta = maxPixelIndex - minPixelIndex;

      let pixelIndex = ~~(headerSize + (minPixelIndex + delta * glitchSeed) | 0);

      if (pixelIndex > maxIndex) {
        pixelIndex = maxIndex;
      }

      bytes[pixelIndex] = ~~(glitchAmount * 256);
    }
  }

  return new Promise((resolve, reject) => {
    const glitchCopy = byteArray.slice();
    const img = new Image();

    glitchJpegBytes(glitchCopy);
    
    img.onload = () => resolve(img);
    //img.onerror = err => console.log('jpeg error!',  err);

    img.src = jpegHeader.prepend(btoa(glitchCopy));
  });
}

module.exports = glitch;

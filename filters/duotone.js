const randomNumber = require('../utils/random');
const grayscale = require('./grayscale');
const Canvas = require('canvas');
const chroma = require('chroma-js');

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
 } : null;
}

function generateGradientArray(colorA, colorB) {
  return Array.apply(null, { length: 255 }).map(function(_, index) {
    const ratio = index / 255;
    const r = (colorA.r * ratio + colorB.r * (1 - ratio)) | 0;
    const g = (colorA.g * ratio + colorB.g * (1 - ratio)) | 0;
    const b = (colorA.b * ratio + colorB.b * (1 - ratio)) | 0;

    return [ r, g, b ]
  });
}
const baseBlack = [0, 25, 60];
const CONTRAST_RATIO = 4.5;
const MAX_ATTEMPTS = 10;

module.exports = (imageData) => {
  const grayscaleData = grayscale(imageData);
  let hasHighContrast = false;
  let base = chroma.random().darken(2);
  let contrastColor;
  let attempts = 0;


  // If the contrast isn't high enough, we end up with a super dark color against
  // black, which looks bad
  while (!hasHighContrast) {
    if (attempts === MAX_ATTEMPTS) {
      // we only want to try so mnay iterations for contrast
      break;
    }

    contrastColor = chroma.random().brighten(2);
    const contrast = chroma.contrast(base, contrastColor);
    
    hasHighContrast = contrast >= CONTRAST_RATIO;
    attempts += 1;
  }

  const gradient = generateGradientArray(hexToRgb(contrastColor), hexToRgb(base));
  const { data: pixels } = grayscaleData;

  for (let i = 0; i < pixels.length; i += 4) {
    const color = gradient[pixels[i]];

    if (!color) continue;
    
    const [ r, g, b ] = color;
    pixels[i] = r;
    pixels[i + 1] = g;
    pixels[i + 2] = b;
  }

  return grayscaleData;
};

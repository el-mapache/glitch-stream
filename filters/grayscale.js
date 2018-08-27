module.exports = (imageData) => {
  const { data: pixels } = imageData;
  let i = 0;
  let r,g,b;
  let max = 0;
  let min = 255;

  while(i < pixels.length) {
    if (pixels[i] > max) {
      max = pixels[i];
    }
    
    if (pixels[i] < min) {
      min = pixels[i];
    }

    r = pixels[i];
    g = pixels[i + 1];
    b = pixels[i + 2];
    
    pixels[i] = pixels[i + 1] = pixels[i + 2] = (0.299 * r + 0.587 * g + 0.114 * b) | 0;
    
    i += 4;
  }

  for (let i = 0; i < pixels.length; i += 4) {
    // Normalize each pixel to scale 0-255
    const value = (pixels[i] - min) * 255 / (max - min);
    pixels[i] = pixels[i+1] = pixels[i+2] = value;
  }

  return imageData;
};

module.exports = (imageData) => {
  const { data: pixels } = imageData;
  var l = pixels.length;

  let ii = -4;
  let r,g,b;

  while (l > 0) {
    ii = l
    l = l - 4;
    
    let counter = ii;
    
    r = pixels[counter];
    g = pixels[counter+1];
    b = pixels[counter+2];

    pixels[ii] =   r ^ (pixels[ii << 1] || 255);
    pixels[ii+1] = g ^ (pixels[ii - 10] || 255);
    pixels[ii+2] = b ^ (pixels[ii << 1] || 255);
  }

  return imageData;
};
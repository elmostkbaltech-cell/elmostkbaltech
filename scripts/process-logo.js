const fs = require('fs');
const jpeg = require('jpeg-js');
const { PNG } = require('pngjs');

const raw = fs.readFileSync('C:/Users/Owner/.gemini/antigravity/brain/635d0a8b-f818-400a-ac9c-7606c7dc47f4/.user_uploaded/media_1789323881200.jpg');
const decoded = jpeg.decode(raw, { useTArray: true });
console.log('Dimensions:', decoded.width, 'x', decoded.height);

const png = new PNG({ width: decoded.width, height: decoded.height });

for (let y = 0; y < decoded.height; y++) {
  for (let x = 0; x < decoded.width; x++) {
    const idx = (y * decoded.width + x) * 4;
    const r = decoded.data[idx];
    const g = decoded.data[idx + 1];
    const b = decoded.data[idx + 2];

    // Check if pixel is part of the grey/white checkerboard pattern
    // The checkerboard has pixels where r, g, b are very close to each other (saturation ~ 0)
    // and lightness is high (e.g. >= 170 for grey squares and >= 240 for white squares)
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    const isNeutral = diff < 20; // low color saturation

    // The logo colors are:
    // Brown text: r ~ 100, g ~ 70, b ~ 35 (diff is ~ 65)
    // Dark red bird: r ~ 140, g ~ 30, b ~ 45 (diff is ~ 110)
    // Golden oval: r ~ 230, g ~ 170, b ~ 40 (diff is ~ 190)
    // Background checkerboard squares are either white (~255, 255, 255) or grey (~200, 200, 200)
    const isBackground = isNeutral && (min > 170);

    png.data[idx] = r;
    png.data[idx + 1] = g;
    png.data[idx + 2] = b;
    png.data[idx + 3] = isBackground ? 0 : 255;
  }
}

// Write transparent PNG to public/images/logo.png
const buffer = PNG.sync.write(png);
fs.writeFileSync('public/images/logo.png', buffer);
console.log('Successfully written transparent logo to public/images/logo.png, size:', buffer.length);

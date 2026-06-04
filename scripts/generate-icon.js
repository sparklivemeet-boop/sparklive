const fs = require('fs');
const path = require('path');
const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}
const width = 16;
const height = 16;
const pixels = width * height;
const imageSize = pixels * 4;
const maskSize = (width * height) / 8;
const imageOffset = 6 + 16;
const totalSize = 40 + imageSize + maskSize;
const buf = Buffer.alloc(imageOffset + totalSize);
// ICONDIR
buf.writeUInt16LE(0, 0);
buf.writeUInt16LE(1, 2);
buf.writeUInt16LE(1, 4);
// ICONDIRENTRY
buf.writeUInt8(width, 6);
buf.writeUInt8(height, 7);
buf.writeUInt8(0, 8);
buf.writeUInt8(0, 9);
buf.writeUInt16LE(1, 10);
buf.writeUInt16LE(32, 12);
buf.writeUInt32LE(totalSize, 14);
buf.writeUInt32LE(imageOffset, 18);
// BITMAPINFOHEADER
const headerStart = imageOffset;
buf.writeUInt32LE(40, headerStart);
buf.writeInt32LE(width, headerStart + 4);
buf.writeInt32LE(height * 2, headerStart + 8);
buf.writeUInt16LE(1, headerStart + 12);
buf.writeUInt16LE(32, headerStart + 14);
buf.writeUInt32LE(0, headerStart + 16);
buf.writeUInt32LE(imageSize, headerStart + 20);
buf.writeInt32LE(0, headerStart + 24);
buf.writeInt32LE(0, headerStart + 28);
buf.writeUInt32LE(0, headerStart + 32);
buf.writeUInt32LE(0, headerStart + 36);
// Pixel data
const pixelStart = headerStart + 40;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const idx = pixelStart + (y * width + x) * 4;
    buf[idx] = 0;
    buf[idx + 1] = 0;
    buf[idx + 2] = 255;
    buf[idx + 3] = 255;
  }
}
// AND mask
const maskStart = pixelStart + imageSize;
for (let i = 0; i < maskSize; i++) {
  buf[maskStart + i] = 0;
}
fs.writeFileSync(path.join(assetsDir, 'icon.ico'), buf);
console.log('Generated assets/icon.ico');

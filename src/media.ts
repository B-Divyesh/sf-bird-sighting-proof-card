// Exported image files are byte-preserving except for metadata containers.  Removing
// EXIF/XMP/text chunks avoids leaking GPS in a portable backup without re-encoding a
// birder's evidence pixels.
const concat = (parts: Uint8Array[]) => {
  const output = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  for (const part of parts) { output.set(part, offset); offset += part.length; }
  return output;
};

const ascii = (bytes: Uint8Array, offset: number, length: number) => String.fromCharCode(...bytes.slice(offset, offset + length));

function stripJpegMetadata(bytes: Uint8Array) {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('This JPEG could not be safely prepared for export.');
  const parts = [bytes.slice(0, 2)];
  let offset = 2;
  while (offset < bytes.length) {
    const start = offset;
    if (bytes[offset] !== 0xff) throw new Error('This JPEG could not be safely prepared for export.');
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0xd9) { parts.push(bytes.slice(start, offset)); break; }
    if (marker === 0xda) { parts.push(bytes.slice(start)); break; }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { parts.push(bytes.slice(start, offset)); continue; }
    if (offset + 2 > bytes.length) throw new Error('This JPEG could not be safely prepared for export.');
    const length = (bytes[offset] << 8) | bytes[offset + 1];
    const end = offset + length;
    if (length < 2 || end > bytes.length) throw new Error('This JPEG could not be safely prepared for export.');
    // Application and comment segments can all carry location-bearing text.
    if (!(marker >= 0xe1 && marker <= 0xef) && marker !== 0xfe) parts.push(bytes.slice(start, end));
    offset = end;
  }
  return concat(parts);
}

function stripPngMetadata(bytes: Uint8Array) {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (!signature.every((value, index) => bytes[index] === value)) throw new Error('This PNG could not be safely prepared for export.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const parts = [bytes.slice(0, 8)];
  let offset = 8;
  let ended = false;
  while (offset + 12 <= bytes.length) {
    const length = view.getUint32(offset);
    const end = offset + 12 + length;
    if (end > bytes.length) throw new Error('This PNG could not be safely prepared for export.');
    const type = ascii(bytes, offset + 4, 4);
    if (!['eXIf', 'tEXt', 'zTXt', 'iTXt'].includes(type)) parts.push(bytes.slice(offset, end));
    offset = end;
    if (type === 'IEND') { ended = true; break; }
  }
  if (!ended) throw new Error('This PNG could not be safely prepared for export.');
  return concat(parts);
}

function stripWebpMetadata(bytes: Uint8Array) {
  if (bytes.length < 12 || ascii(bytes, 0, 4) !== 'RIFF' || ascii(bytes, 8, 4) !== 'WEBP') throw new Error('This WebP could not be safely prepared for export.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const parts = [bytes.slice(0, 12)];
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const length = view.getUint32(offset + 4, true);
    const end = offset + 8 + length + (length % 2);
    if (end > bytes.length) throw new Error('This WebP could not be safely prepared for export.');
    const type = ascii(bytes, offset, 4);
    if (type === 'VP8X' && length >= 10) {
      const chunk = bytes.slice(offset, end);
      chunk[8] &= ~(0x20 | 0x08 | 0x04);
      parts.push(chunk);
    } else if (!['EXIF', 'XMP ', 'ICCP'].includes(type)) parts.push(bytes.slice(offset, end));
    offset = end;
  }
  if (offset !== bytes.length) throw new Error('This WebP could not be safely prepared for export.');
  const output = concat(parts);
  new DataView(output.buffer).setUint32(4, output.length - 8, true);
  return output;
}

function stripWavMetadata(bytes: Uint8Array) {
  if (bytes.length < 12 || ascii(bytes, 0, 4) !== 'RIFF' || ascii(bytes, 8, 4) !== 'WAVE') throw new Error('This WAV file could not be safely prepared for export.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const parts = [bytes.slice(0, 12)];
  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const length = view.getUint32(offset + 4, true);
    const end = offset + 8 + length + (length % 2);
    if (end > bytes.length) throw new Error('This WAV file could not be safely prepared for export.');
    const type = ascii(bytes, offset, 4);
    if (['fmt ', 'data', 'fact'].includes(type)) parts.push(bytes.slice(offset, end));
    offset = end;
  }
  const output = concat(parts);
  new DataView(output.buffer).setUint32(4, output.length - 8, true);
  return output;
}

function stripMp3Metadata(bytes: Uint8Array) {
  let start = 0;
  if (bytes.length >= 10 && ascii(bytes, 0, 3) === 'ID3') {
    const size = ((bytes[6] & 0x7f) << 21) | ((bytes[7] & 0x7f) << 14) | ((bytes[8] & 0x7f) << 7) | (bytes[9] & 0x7f);
    start = Math.min(bytes.length, 10 + size + ((bytes[5] & 0x10) ? 10 : 0));
  }
  let end = bytes.length;
  if (end - start >= 128 && ascii(bytes, end - 128, 3) === 'TAG') end -= 128;
  return bytes.slice(start, end);
}

export async function metadataSafeBlob(blob: Blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const clean = /jpeg/i.test(blob.type) ? stripJpegMetadata(bytes)
    : /png/i.test(blob.type) ? stripPngMetadata(bytes)
    : /webp/i.test(blob.type) ? stripWebpMetadata(bytes)
    : /wav/i.test(blob.type) ? stripWavMetadata(bytes)
    : /mpeg/i.test(blob.type) ? stripMp3Metadata(bytes)
    : (() => { throw new Error('M4A files cannot be included in a safe default JSON export. Remove them or use PDF.'); })();
  return new Blob([clean], { type: blob.type });
}

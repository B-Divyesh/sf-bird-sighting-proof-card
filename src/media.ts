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
    // APP1 carries EXIF/XMP and APP13 commonly carries IPTC/Photoshop location data.
    if (marker !== 0xe1 && marker !== 0xed) parts.push(bytes.slice(start, end));
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
    if (type !== 'EXIF' && type !== 'XMP ') parts.push(bytes.slice(offset, end));
    offset = end;
  }
  if (offset !== bytes.length) throw new Error('This WebP could not be safely prepared for export.');
  const output = concat(parts);
  new DataView(output.buffer).setUint32(4, output.length - 8, true);
  return output;
}

export async function metadataSafeBlob(blob: Blob) {
  if (!/^image\/(jpeg|png|webp)$/i.test(blob.type)) return blob;
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const clean = /jpeg/i.test(blob.type) ? stripJpegMetadata(bytes) : /png/i.test(blob.type) ? stripPngMetadata(bytes) : stripWebpMetadata(bytes);
  return new Blob([clean], { type: blob.type });
}

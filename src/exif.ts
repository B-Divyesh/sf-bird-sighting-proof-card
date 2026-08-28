// Reads the uncompressed EXIF DateTimeOriginal tag from ordinary JPEG files.
export async function jpegCapturedAt(file: File): Promise<string | undefined> {
  if (!/jpe?g/i.test(file.type) && !/\.jpe?g$/i.test(file.name)) return;
  const buffer = await file.slice(0, 256 * 1024).arrayBuffer();
  const view = new DataView(buffer);
  if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return;
  let offset = 2;
  while (offset + 4 < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) break;
    const marker = view.getUint8(offset + 1);
    const length = view.getUint16(offset + 2);
    if (marker === 0xe1 && offset + 10 < view.byteLength && readAscii(view, offset + 4, 4) === 'Exif') {
      return parseTiff(view, offset + 10, Math.min(offset + 2 + length, view.byteLength));
    }
    offset += 2 + length;
  }
}

const readAscii = (view: DataView, offset: number, length: number) => Array.from({ length }, (_, index) => String.fromCharCode(view.getUint8(offset + index))).join('');

function parseTiff(view: DataView, base: number, end: number): string | undefined {
  const little = view.getUint16(base) === 0x4949;
  const u16 = (at: number) => view.getUint16(at, little);
  const u32 = (at: number) => view.getUint32(at, little);
  const scan = (ifdOffset: number, target: number): number | undefined => {
    const start = base + ifdOffset;
    if (start + 2 > end) return;
    const count = u16(start);
    for (let i = 0; i < count; i++) {
      const entry = start + 2 + i * 12;
      if (entry + 12 > end) break;
      if (u16(entry) === target) return u32(entry + 8);
    }
  };
  const first = u32(base + 4);
  const exifIfd = scan(first, 0x8769);
  if (exifIfd === undefined) return;
  const dateOffset = scan(exifIfd, 0x9003) ?? scan(exifIfd, 0x0132);
  if (dateOffset === undefined || base + dateOffset + 19 > end) return;
  const raw = readAscii(view, base + dateOffset, 19);
  const match = raw.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})$/);
  if (!match) return;
  return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}`;
}

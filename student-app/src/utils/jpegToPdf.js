import {Buffer} from 'buffer';

/**
 * Build a 1-page PDF that embeds a JPEG at exact pixel size.
 * Page MediaBox = image size, so no extra white margins.
 */
export const createPdfFromJpegBase64 = (jpegBase64, width, height) => {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const jpeg = Buffer.from(jpegBase64, 'base64');
  const contentStream = `q\n${w} 0 0 ${h} 0 0 cm\n/Im0 Do\nQ\n`;

  const encoder = new ByteEncoder();
  const offsets = [0];

  const writeObject = (index, body, binaryTail) => {
    offsets[index] = encoder.length;
    encoder.write(`${index} 0 obj\n`);
    encoder.write(body);
    if (binaryTail) {
      encoder.write(binaryTail);
    }
    encoder.write('\nendobj\n');
  };

  encoder.write('%PDF-1.4\n');
  writeObject(1, '<< /Type /Catalog /Pages 2 0 R >>');
  writeObject(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  writeObject(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Contents 4 0 R /Resources << /XObject << /Im0 5 0 R >> >> >>`,
  );
  writeObject(
    4,
    `<< /Length ${Buffer.byteLength(contentStream, 'utf8')} >>\nstream\n${contentStream}endstream`,
  );

  offsets[5] = encoder.length;
  encoder.write('5 0 obj\n');
  encoder.write(
    `<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
  );
  encoder.write(jpeg);
  encoder.write('\nendstream\nendobj\n');

  const xrefStart = encoder.length;
  encoder.write('xref\n0 6\n');
  encoder.write('0000000000 65535 f \n');
  for (let i = 1; i <= 5; i++) {
    encoder.write(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  }
  encoder.write(
    `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`,
  );

  return encoder.toBase64();
};

class ByteEncoder {
  constructor() {
    this.chunks = [];
    this.length = 0;
  }

  write(data) {
    const buf = Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'utf8');
    this.chunks.push(buf);
    this.length += buf.length;
  }

  toBase64() {
    return Buffer.concat(this.chunks).toString('base64');
  }
}

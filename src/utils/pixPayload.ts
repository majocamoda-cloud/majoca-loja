import QRCode from 'qrcode';

/**
 * Normalizes strings to ASCII (removes accents and special characters)
 * to comply with Brazilian Central Bank EMV Pix specifications.
 */
function normalizeAscii(str: string, maxLength: number): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .toUpperCase()
    .trim()
    .slice(0, maxLength);
}

/**
 * Formats an EMV TLV (Tag-Length-Value) field
 */
function formatEmvField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

/**
 * Computes CRC16-CCITT (0x1021) with initial value 0xFFFF
 */
function calculateCRC16(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ polynomial;
      } else {
        crc = crc << 1;
      }
      crc &= 0xffff; // keep 16-bit
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export interface PixPayloadParams {
  pixKey: string;
  merchantName: string;
  merchantCity?: string;
  amount?: number;
  txId?: string;
  description?: string;
}

/**
 * Generates official Pix "Copia e Cola" EMV string (BR Code)
 */
export function generatePixPayload({
  pixKey,
  merchantName,
  merchantCity = 'UBA',
  amount,
  txId = '***',
  description,
}: PixPayloadParams): string {
  const cleanKey = pixKey.trim();
  const cleanName = normalizeAscii(merchantName || 'MAJOCA MODA', 25);
  const cleanCity = normalizeAscii(merchantCity || 'UBA', 15);
  const cleanTxId = (txId || '***').replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) || '***';

  // 1. Merchant Account Information (Tag 26)
  const guiField = formatEmvField('00', 'br.gov.bcb.pix');
  const keyField = formatEmvField('01', cleanKey);
  const descField = description ? formatEmvField('02', normalizeAscii(description, 25)) : '';
  const merchantAccountInfo = formatEmvField('26', `${guiField}${keyField}${descField}`);

  // 2. Base Fields
  const payloadFormat = formatEmvField('00', '01');
  const pointOfInitiation = formatEmvField('01', '12'); // Dynamic/recurring with specific amount
  const merchantCategory = formatEmvField('52', '0000');
  const transactionCurrency = formatEmvField('53', '986'); // BRL
  const transactionAmount = amount && amount > 0 ? formatEmvField('54', amount.toFixed(2)) : '';
  const countryCode = formatEmvField('58', 'BR');
  const merchantNameField = formatEmvField('59', cleanName || 'MAJOCA MODA');
  const merchantCityField = formatEmvField('60', cleanCity || 'UBA');

  // 3. Additional Data Field Template (Tag 62)
  const referenceLabel = formatEmvField('05', cleanTxId);
  const additionalDataField = formatEmvField('62', referenceLabel);

  // 4. Assemble Payload before CRC
  const rawPayloadWithoutCRC =
    `${payloadFormat}` +
    `${pointOfInitiation}` +
    `${merchantAccountInfo}` +
    `${merchantCategory}` +
    `${transactionCurrency}` +
    `${transactionAmount}` +
    `${countryCode}` +
    `${merchantNameField}` +
    `${merchantCityField}` +
    `${additionalDataField}` +
    `6304`;

  // 5. Compute CRC16 and append
  const crc = calculateCRC16(rawPayloadWithoutCRC);
  return `${rawPayloadWithoutCRC}${crc}`;
}

/**
 * Generates a base64 Data URL of the Pix QR Code
 */
export async function generatePixQRCodeDataURL(
  params: PixPayloadParams,
  size = 280
): Promise<{ qrCodeDataUrl: string; pixCopiaECola: string }> {
  const pixCopiaECola = generatePixPayload(params);
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(pixCopiaECola, {
      width: size,
      margin: 1.5,
      color: {
        dark: '#2B1B12',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
    return { qrCodeDataUrl, pixCopiaECola };
  } catch (err) {
    console.error('Failed to render Pix QR Code', err);
    return { qrCodeDataUrl: '', pixCopiaECola };
  }
}

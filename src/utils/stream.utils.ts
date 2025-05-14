export const buildSocketMessageFrameHeader = (event: string, payloadLength: number): Uint8Array => {
  const headerObj = { event, length: payloadLength };
  const headerJson = JSON.stringify(headerObj);
  const headerBytes = new TextEncoder().encode(headerJson);

  // 4-byte little-endian header length
  const headerLength = new Uint32Array([headerBytes.length]);
  const headerLengthBytes = new Uint8Array(headerLength.buffer);

  // Combine: [4 bytes length][header JSON]
  const result = new Uint8Array(4 + headerBytes.length);
  result.set(headerLengthBytes, 0);
  result.set(headerBytes, 4);

  return result;
}

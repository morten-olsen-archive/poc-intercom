const uInt32 = (value: number) => {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value);
  return buffer;
};

export const pkg = (data: Buffer[]) => {
  let result = Buffer.alloc(0);
  for (let item of data) {
    result = Buffer.concat([
      result,
      uInt32(item.byteLength),
      item,
    ]);
  }
  return result;
};

export const unpkg = (data: Buffer): Buffer[] => {
  let position = 0;
  const result: Buffer[] = [];
  while (position < data.byteLength) {
    const size = data.readUInt32BE(position);
    position += 4;
    result.push(data.slice(position, position + size));
    position += size;
  }
  return result;
};

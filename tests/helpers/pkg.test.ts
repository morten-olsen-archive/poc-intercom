import { pkg, unpkg } from '../../src/helpers/pkgs';

const testData = [
  Buffer.from('Hello'),
  Buffer.from('World'),
  Buffer.from('foo'),
  Buffer.from('bar'),
];

describe('helpers/pkgs', () => {
  it('should be able to serialize and deserialize data', () => {
    const pkged = pkg(testData);
    const unpkged = unpkg(pkged);
    expect(unpkged).toEqual(testData);
  });
});

import assert from 'assert';
import disDat from 'dis-dat';

describe('exports .ts', () => {
  it('default', () => {
    assert.equal(typeof disDat, 'function');
  });
});

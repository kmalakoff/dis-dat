import assert from 'assert';
import disDat from 'dis-dat';

describe('exports .mjs', () => {
  it('default', () => {
    assert.equal(typeof disDat, 'function');
  });
});

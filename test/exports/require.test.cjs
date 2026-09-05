const assert = require('assert');
const disDat = require('dis-dat');

describe('exports .cjs', () => {
  it('default', () => {
    assert.equal(typeof disDat, 'function');
  });
});

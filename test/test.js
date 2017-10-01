var assert = require('assert');

describe('Array', function() {
  describe('#indexOf()', function() {
    it('should return -1 when teh value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});
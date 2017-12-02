/* eslint-env mocha */
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { assemble } from './pull'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('Pull command', function () {
  describe('Data assembling', function () {
    const data = [
      { values: [['key1'], ['key2'], ['key3']] },
      { values: [['val1'], ['val2'], ['val3']] }
    ]

    it('assembles Sheet data to a flat json object', function () {
      const expected = {
        'key1': 'val1',
        'key2': 'val2',
        'key3': 'val3'
      }
      return expect(
        assemble(data)
      ).to.eventually.be.deep.equal(expected)
    })
  })
})

/* eslint-env mocha */
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {
  assemble,
  deflat
} from './pull'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('Pull command', function () {
  describe('Data assembling', function () {
    it('assembles Sheet data to a flat json object', function () {
      const data = [
        { values: [['key1'], ['key2'], ['key3']] },
        { values: [['val1'], ['val2'], ['val3']] }
      ]
      const expected = {
        'key1': 'val1',
        'key2': 'val2',
        'key3': 'val3'
      }
      return expect(
        assemble(data)
      ).to.eventually.be.deep.equal(expected)
    })

    it('sets empty string value for empty Sheet column', function () {
      const data = [
        { values: [['key1'], ['key2'], ['key3']] },
        { undefined }
      ]
      const expected = {
        'key1': '',
        'key2': '',
        'key3': ''
      }
      return expect(
        assemble(data)
      ).to.eventually.be.deep.equal(expected)
    })

    it('sets empty string for empty Sheet cell at the end', function () {
      const data = [
        { values: [['key1'], ['key2'], ['key3']] },
        { values: [['val1'], ['val2']] }
      ]
      const expected = {
        'key1': 'val1',
        'key2': 'val2',
        'key3': ''
      }
      return expect(
        assemble(data)
      ).to.eventually.be.deep.equal(expected)
    })

    it('sets empty string for empty Sheet cell at the beginning', function () {
      const data = [
        { values: [['key1'], ['key2'], ['key3']] },
        { values: [[], ['val2'], ['val3']] }
      ]
      const expected = {
        'key1': '',
        'key2': 'val2',
        'key3': 'val3'
      }
      return expect(
        assemble(data)
      ).to.eventually.be.deep.equal(expected)
    })
  })

  describe('Deflat', function () {
    it('retains numeric key as object', function () {
      const flatJson = {
        'abc.def.0': 'text1',
        'abc.def.1': 'text2'
      }
      const expected = {
        abc: {
          def: {
            0: 'text1',
            1: 'text2'
          }
        }
      }
      return expect(
        deflat(flatJson)
      ).to.eventually.be.deep.equal(expected)
    })
  })
})

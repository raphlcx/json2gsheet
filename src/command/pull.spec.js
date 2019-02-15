/* eslint-env mocha */
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {
  assemble,
  filterEmptyValue,
  deepSortByKey
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

  describe('Empty value filtering', function () {
    it('filters out entry with empty value', function () {
      const json = {
        'key.a': 'somestring',
        'key.b': '',
        'key.c': 'anotherstring'
      }
      const expected = {
        'key.a': 'somestring',
        'key.c': 'anotherstring'
      }
      return expect(
        filterEmptyValue(json)
      ).to.eventually.be.deep.equal(expected)
    })
  })

  describe('Sorting', function () {
    it('sorts JSON fields alphabetically based on key', function () {
      const json = {
        'key3': 'c',
        'key1': 'a',
        'key2': 'b'
      }

      const expectedOrder = ['key1', 'key2', 'key3']

      const result =
        deepSortByKey(json)
          .then(json => Object.keys(json))

      return expect(
        result
      ).to.eventually.be.ordered.members(expectedOrder)
    })

    it('deeps sorts JSON fields', function () {
      const json = {
        'key3': 'c',
        'key4': {
          'key43': 'dc',
          'key41': 'da'
        },
        'key2': 'b',
        'key1': {
          'key12': 'ab',
          'key13': {
            'key131': 'aca',
            'key133': 'acc',
            'key132': 'acb'
          },
          'key11': 'aa'
        }
      }

      const expectedOrder = [
        ['key11', 'key12', ['key131', 'key132', 'key133']],
        'key2',
        'key3',
        ['key41', 'key43']
      ]

      const fetchObjectKeys = obj =>
        Object.keys(obj).map(k =>
          typeof obj[k] === 'object' ? fetchObjectKeys(obj[k]) : k
        )

      const result =
        deepSortByKey(json)
          .then(json => fetchObjectKeys(json))

      return expect(
        result
      ).to.eventually.be.deep.ordered.members(expectedOrder)
    })
  })
})

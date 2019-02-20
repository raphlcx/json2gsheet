/* eslint-env mocha */
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import {
  assemble,
  compact,
  deepSortByKey,
  ensureEOL
} from './pull'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('Pull command', function () {
  describe('Data assembling', function () {
    it('assembles sheet data to a flat json object', function () {
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
        assemble({ data }).then(res => res.json)
      ).to.eventually.be.deep.equal(expected)
    })

    it('sets empty string value for empty sheet column', function () {
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
        assemble({ data }).then(res => res.json)
      ).to.eventually.be.deep.equal(expected)
    })

    it('sets empty string for empty sheet cell at the end', function () {
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
        assemble({ data }).then(res => res.json)
      ).to.eventually.be.deep.equal(expected)
    })

    it('sets empty string for empty sheet cell at the beginning', function () {
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
        assemble({ data }).then(res => res.json)
      ).to.eventually.be.deep.equal(expected)
    })
  })

  describe('Empty value filtering', function () {
    it('filters out entry with empty value', function () {
      const config = {
        app: {
          command: {
            pull: {
              skipEmptyValue: true
            }
          }
        }
      }
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
        compact({ config, json }).then(res => res.json)
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
        deepSortByKey({ json })
          .then(res => Object.keys(res.json))

      return expect(
        result
      ).to.eventually.be.ordered.members(expectedOrder)
    })

    it('deep sorts JSON fields', function () {
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
        deepSortByKey({ json })
          .then(res => fetchObjectKeys(res.json))

      return expect(
        result
      ).to.eventually.be.deep.ordered.members(expectedOrder)
    })

    it('does not attempt to sort array', function () {
      const json = {
        'key2': 'b',
        'key1': ['value1', 'value2']
      }
      const expected = ['value1', 'value2']

      return expect(
        deepSortByKey({ json }).then(res => res.json.key1)
      ).to.eventually.be.deep.ordered.members(expected)
    })
  })

  describe('End of line character', function () {
    it('ensures end of line is added to the end of stringified JSON', function () {
      const data = '{"key1": "a"}'

      return expect(
        ensureEOL({ data }).then(res => res.data)
      ).to.eventually.match(/\r?\n$/)
    })
  })
})

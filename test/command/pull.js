import assert from 'node:assert/strict'
import { t } from '../../src/command/pull.js'
const {
  assemble,
  compact,
  deepSortByKey,
  ensureEOL
} = t

describe('Pull command', function () {
  describe('Data assembling', function () {
    it('assembles sheet data to a flat json object', function () {
      const data = [
        { values: [['key1'], ['key2'], ['key3']] },
        { values: [['val1'], ['val2'], ['val3']] }
      ]
      const expected = {
        key1: 'val1',
        key2: 'val2',
        key3: 'val3'
      }
      return assert.doesNotReject(
        assemble({ data })
          .then(res => assert.deepEqual(res.json, expected))
      )
    })

    it('sets empty string value for empty sheet column', function () {
      const data = [
        { values: [['key1'], ['key2'], ['key3']] },
        { undefined }
      ]
      const expected = {
        key1: '',
        key2: '',
        key3: ''
      }
      return assert.doesNotReject(
        assemble({ data })
          .then(res => assert.deepEqual(res.json, expected))
      )
    })

    it('sets empty string for empty sheet cell at the end', function () {
      const data = [
        { values: [['key1'], ['key2'], ['key3']] },
        { values: [['val1'], ['val2']] }
      ]
      const expected = {
        key1: 'val1',
        key2: 'val2',
        key3: ''
      }
      return assert.doesNotReject(
        assemble({ data })
          .then(res => assert.deepEqual(res.json, expected))
      )
    })

    it('sets empty string for empty sheet cell at the beginning', function () {
      const data = [
        { values: [['key1'], ['key2'], ['key3']] },
        { values: [[], ['val2'], ['val3']] }
      ]
      const expected = {
        key1: '',
        key2: 'val2',
        key3: 'val3'
      }
      return assert.doesNotReject(
        assemble({ data })
          .then(res => assert.deepEqual(res.json, expected))
      )
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
      return assert.doesNotReject(
        compact({ config, json })
          .then(res => assert.deepEqual(res.json, expected))
      )
    })
  })

  describe('Sorting', function () {
    it('sorts JSON fields alphabetically based on key', function () {
      const json = {
        key3: 'c',
        key1: 'a',
        key2: 'b'
      }

      const expectedOrder = ['key1', 'key2', 'key3']

      return assert.doesNotReject(
        deepSortByKey({ json })
          .then(res => Object.keys(res.json))
          .then(actual => assert.deepEqual(actual, expectedOrder))
      )
    })

    it('deep sorts JSON fields', function () {
      const json = {
        key3: 'c',
        key4: {
          key43: 'dc',
          key41: 'da'
        },
        key2: 'b',
        key1: {
          key12: 'ab',
          key13: {
            key131: 'aca',
            key133: 'acc',
            key132: 'acb'
          },
          key11: 'aa'
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

      return assert.doesNotReject(
        deepSortByKey({ json })
          .then(res => fetchObjectKeys(res.json))
          .then(actual => assert.deepEqual(actual, expectedOrder))
      )
    })

    it('does not attempt to sort array', function () {
      const json = {
        key2: 'b',
        key1: ['value1', 'value2']
      }
      const expected = ['value1', 'value2']

      return assert.doesNotReject(
        deepSortByKey({ json })
          .then(res => res.json.key1)
          .then(actual => assert.deepEqual(actual, expected))
      )
    })
  })

  describe('End of line character', function () {
    it('ensures end of line is added to the end of stringified JSON', function () {
      const data = '{"key1": "a"}'

      return assert.doesNotReject(
        ensureEOL({ data })
          .then(res => assert.match(res.data, /\r?\n$/))
      )
    })
  })
})

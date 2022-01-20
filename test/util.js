import { strict as assert } from 'node:assert'
import {
  deepGetObject,
  makeA1Notation,
  getColumnById,
  getJSONFileName
} from '../src/util.js'

describe('util', function () {
  describe('makeA1Notation', function () {
    it('creates with A1 notation defined syntax', function () {
      assert.equal(
        makeA1Notation('Sheet1', 'A', 'B'),
        "'Sheet1'!A:B"
      )
    })

    it('quotes around sheet name with space', function () {
      assert.equal(
        makeA1Notation('Sheet 1', 'A', 'B'),
        "'Sheet 1'!A:B"
      )
    })
  })

  describe('getColumnById', function () {
    const columns = [
      { i: 0, id: 'en' },
      { i: 1, id: 'de' },
      { i: 2, id: 'en' }
    ]

    it('returns a single column on ID match', function () {
      assert.deepEqual(
        getColumnById(columns, 'en'),
        columns[0]
      )
    })

    it('raises error on no ID match', function () {
      assert.throws(
        () => getColumnById(columns, 'nonexistent')
      )
    })
  })

  describe('deepGetObject', function () {
    const obj = {
      a: {
        b: {
          c: 1
        }
      }
    }

    it('returns value if key is found', function () {
      assert.equal(
        deepGetObject(obj, ['a', 'b', 'c']),
        1
      )
    })

    it('returns null if key is not found', function () {
      assert.strictEqual(
        deepGetObject(obj, ['a', 'b', 'nonExistent']),
        null
      )
    })
  })

  describe('getJSONFileName', function () {
    it('returns replaces the ID placeholder with supplied ID', function () {
      assert.equal(
        getJSONFileName('test.$id.html', '123abc'),
        'test.123abc.html'
      )
    })
  })
})

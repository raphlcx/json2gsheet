/* eslint-env mocha */
import { expect } from 'chai'
import {
  makeA1Notation,
  getColumnById
} from './index'

describe('util', function () {
  describe('makeA1Notation', function () {
    it('creates with A1 notation defined syntax', function () {
      expect(
        makeA1Notation('Sheet1', 'A', 'B')
      ).to.equal("'Sheet1'!A:B")
    })

    it('quotes around sheet name with space', function () {
      expect(
        makeA1Notation('Sheet 1', 'A', 'B')
      ).to.equal("'Sheet 1'!A:B")
    })
  })

  describe('getColumnById', function () {
    const columns = [
      { i: 0, id: 'en' },
      { i: 1, id: 'de' },
      { i: 2, id: 'en' }
    ]

    it('returns a single column on ID match', function () {
      expect(
        getColumnById(columns, 'en')
      ).to.equal(
        columns[0]
      )
    })

    it('raises error on no ID match', function () {
      expect(
        () => getColumnById(columns, 'nonexistent')
      ).to.throw()
    })
  })
})

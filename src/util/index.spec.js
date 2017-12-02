/* eslint-env mocha */
import { expect } from 'chai'
import {
  makeA1Notation,
  getColumnByLocaleCode
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

  describe('getColumnByLocaleCode', function () {
    const columns = [
      { i: 0, localeCode: 'en' },
      { i: 1, localeCode: 'de' },
      { i: 2, localeCode: 'en' }
    ]

    it('returns a single column on locale code match', function () {
      expect(
        getColumnByLocaleCode(columns, 'en')
      ).to.equal(
        columns[0]
      )
    })

    it('raises error on no locale code match', function () {
      expect(
        () => getColumnByLocaleCode(columns, 'nonexistent')
      ).to.throw()
    })
  })
})

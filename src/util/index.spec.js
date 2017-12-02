/* eslint-env mocha */
import { expect } from 'chai'
import {
  makeA1Notation,
  getColumnByCommand
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

  describe('getColumnByCommand', function () {
    const columns = [
      { i: 0, command: 'en' },
      { i: 1, command: 'de' },
      { i: 2, command: 'en' }
    ]

    it('returns a single column on command match', function () {
      expect(
        getColumnByCommand(columns, 'en')
      ).to.equal(
        columns[0]
      )
    })

    it('raises error on no command', function () {
      expect(
        () => getColumnByCommand(columns, 'nonexistent')
      ).to.throw()
    })
  })
})

import fs from 'fs'
import { promisify } from 'util'
import { unflatten } from 'flat'
import google from 'googleapis'
import config from '../../config/sheets.json'
import {
  makeA1Notation,
  getColumnByLocaleCode
} from '../util'
import { authorize } from '../auth'

export const pull = (localeCode) => {
  const column = getColumnByLocaleCode(config.translationColumns, localeCode)
  return readSheetToJson(column)
    .then(assemble)
    .then(deflat)
    .then(stringify)
    .then(data => write(`locale.${localeCode}.json`, data))
    .catch(err => console.log('Error on pull:', err))
}

const readSheetToJson = (column) => {
  return authorize()
    .then(auth => {
      const service = google.sheets('v4')
      return new Promise((resolve, reject) => {
        service.spreadsheets.values.batchGet({
          spreadsheetId: config.spreadsheetId,
          auth: auth,
          ranges: [
            makeA1Notation(
              config.sheetName,
              config.keyColumn.cellStart,
              config.keyColumn.column
            ),
            makeA1Notation(
              config.sheetName,
              column.cellStart,
              column.column
            )
          ]
        }, (err, result) => {
          if (err) reject(err)
          resolve(result.valueRanges)
        })
      })
    })
}

export const assemble = data => {
  const [key, value] = data
  return new Promise((resolve) => {
    resolve(
      key.values
        .map((k, i) => [k[0], value.values[i][0]]) // a zip function
        .reduce((acc, cur) => {
          acc[cur[0]] = cur[1]
          return acc
        }, {})
    )
  })
}

const deflat = json =>
  new Promise((resolve) => resolve(unflatten(json)))

const stringify = json =>
  new Promise((resolve) => resolve(JSON.stringify(json, null, 2)))

const write = (fileName, data) =>
  promisify(fs.writeFile)(fileName, data, 'utf-8')

import fs from 'fs'
import { promisify } from 'util'
import flatten from 'flat'
import google from 'googleapis'
import config from '../../config/sheets.json'
import {
  makeA1Notation,
  getColumnByCommand
} from '../util'

export const push = (command, auth) => {
  const column = getColumnByCommand(config.translationColumns, command)
  return read(`locale.${command}.json`)
    .then(parse)
    .then(flat)
    .then(json => writeJsonToSheet(json, column, auth))
    .catch(err => console.log('Error on push:', err))
}

const read = fileName =>
  promisify(fs.readFile)(fileName, 'utf-8')

const parse = data =>
  new Promise((resolve) => resolve(JSON.parse(data)))

const flat = json =>
  new Promise((resolve) => resolve(flatten(json)))

const writeJsonToSheet = (json, column, auth) => {
  const service = google.sheets('v4')
  return new Promise((resolve, reject) => {
    service.spreadsheets.values.batchUpdate({
      spreadsheetId: config.spreadsheetId,
      auth: auth,
      resource: {
        data: [
          {
            range: makeA1Notation(
              config.sheetName,
              config.keyColumn.cellStart,
              config.keyColumn.column
            ),
            values: Object.keys(json).map(key => [key])
          },
          {
            range: makeA1Notation(
              config.sheetName,
              column.cellStart,
              column.column
            ),
            values: Object.values(json).map(val => [val])
          }
        ],
        valueInputOption: 'RAW'
      }
    }, (err, result) => {
      if (err) reject(err)
      resolve(result)
    })
  })
}

import fs from 'fs'
import { promisify } from 'util'
import flatten from 'flat'
import google from 'googleapis'
import { getConfig } from '../config'
import {
  makeA1Notation,
  getColumnById,
  getFileName
} from '../util'
import { authorize } from '../auth'

export const push = (id) => {
  const config = getConfig()
  const column = getColumnById(config.sheets.valueColumns, id)
  return read(getFileName(config.app.jsonFileName, id))
    .then(parse)
    .then(flat)
    .then(json => writeJsonToSheet(config, json, column))
    .catch(err => console.log('Error on push:', err))
}

const read = fileName =>
  promisify(fs.readFile)(fileName, 'utf-8')

const parse = data =>
  new Promise((resolve) => resolve(JSON.parse(data)))

const flat = json =>
  new Promise((resolve) => resolve(flatten(json)))

const writeJsonToSheet = (config, json, column) => {
  return authorize()
    .then(auth => {
      const service = google.sheets('v4')
      return new Promise((resolve, reject) => {
        service.spreadsheets.values.batchUpdate({
          spreadsheetId: config.sheets.spreadsheetId,
          auth: auth,
          resource: {
            data: [
              {
                range: makeA1Notation(
                  config.sheets.sheetName,
                  config.sheets.keyColumn.cellStart,
                  config.sheets.keyColumn.column
                ),
                values: Object.keys(json).map(key => [key])
              },
              {
                range: makeA1Notation(
                  config.sheets.sheetName,
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
    })
}

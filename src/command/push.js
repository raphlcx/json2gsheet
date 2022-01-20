import fs from 'node:fs'
import { promisify } from 'node:util'
import flatten from 'flat'
import { google } from 'googleapis'
import {
  makeA1Notation,
  getColumnById,
  getJSONFileName
} from '../util.js'
import { authorize } from '../auth.js'

export const push = (config, id) =>
  read({ config, id })
    .then(parse)
    .then(flat)
    .then(writeJsonToSheet)
    .catch(err => console.error('Error on push:', err))

const read = ({ config, id }) => {
  const fileName = getJSONFileName(config.app.jsonFileName, id)

  return promisify(fs.readFile)(fileName, 'utf-8')
    .then(data => {
      return { config, id, data }
    })
}

const parse = ({ config, id, data }) =>
  new Promise((resolve) => resolve({
    config,
    id,
    json: JSON.parse(data)
  }))

const flat = ({ config, id, json }) =>
  new Promise((resolve) => resolve({
    config,
    id,
    json: flatten(json)
  }))

const writeJsonToSheet = ({ config, id, json }) => {
  const column = getColumnById(config.sheets.valueColumns, id)

  return authorize()
    .then(auth =>
      new Promise((resolve, reject) =>
        google.sheets('v4').spreadsheets.values.batchUpdate({
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
      )
    )
}

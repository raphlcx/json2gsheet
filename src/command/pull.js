import fs from 'fs'
import os from 'os'
import { promisify } from 'util'
import { unflatten } from 'flat'
import { google } from 'googleapis'
import {
  deepGetObject,
  makeA1Notation,
  getColumnById,
  getJSONFileName
} from '../util'
import { authorize } from '../auth'

const pull = (config, id) =>
  readSheetToJson({ config, id })
    .then(assemble)
    .then(compact)
    .then(deflat)
    .then(deepSortByKey)
    .then(stringify)
    .then(ensureEOL)
    .then(write)
    .catch(err => console.error('Error on pull:', err))

const readSheetToJson = ({ config, id }) => {
  const column = getColumnById(config.sheets.valueColumns, id)

  return authorize()
    .then(auth =>
      new Promise((resolve, reject) =>
        google.sheets('v4').spreadsheets.values.batchGet({
          spreadsheetId: config.sheets.spreadsheetId,
          auth: auth,
          ranges: [
            makeA1Notation(
              config.sheets.sheetName,
              config.sheets.keyColumn.cellStart,
              config.sheets.keyColumn.column
            ),
            makeA1Notation(
              config.sheets.sheetName,
              column.cellStart,
              column.column
            )
          ]
        }, (err, result) => {
          if (err) reject(err)

          resolve({
            config,
            id,
            data: result.data.valueRanges
          })
        })
      )
    )
}

const assemble = ({ config, id, data }) => {
  const [keyCol, valueCol] = data

  const json =
    keyCol.values.map((k, i) =>
      // a zip function
      [k[0], _getColumnValue(valueCol, i)]
    ).reduce((acc, cur) => {
      acc[cur[0]] = cur[1]
      return acc
    }, {})

  return new Promise((resolve) => resolve({
    config,
    id,
    json
  }))
}

const _getColumnValue = (col, rowIndex) => {
  if (col.values === undefined) {
    // The whole column is empty
    return ''
  } else if (col.values[rowIndex] === undefined) {
    // The specific row in the column is empty
    return ''
  } else if (col.values[rowIndex].length === 0) {
    // First row empty, second row is non-empty.
    // In this case, the first row will be empty array, instead of undefined.
    return ''
  }

  return col.values[rowIndex][0]
}

const compact = ({ config, id, json }) => {
  const skipEmptyValue = deepGetObject(
    config,
    ['app', 'command', 'pull', 'skipEmptyValue']
  )

  var result

  if (skipEmptyValue === true) {
    result =
      Object.keys(json).reduce((acc, key) => {
        if (json[key] !== '') acc[key] = json[key]
        return acc
      }, {})
  } else {
    result = json
  }

  return new Promise((resolve) => resolve({
    config,
    id,
    json: result
  }))
}

const deflat = ({ config, id, json }) =>
  new Promise((resolve) => resolve({
    config,
    id,
    json: unflatten(json)
  }))

const deepSortByKey = ({ config, id, json }) =>
  new Promise((resolve) => resolve({
    config,
    id,
    json: _deepSortByKey(json)
  }))

const _deepSortByKey = json =>
  Object.keys(json).sort().reduce((acc, key) => {
    Object.prototype.toString.call(json[key]) === '[object Object]'
      ? acc[key] = _deepSortByKey(json[key])
      : acc[key] = json[key]

    return acc
  }, {})

const stringify = ({ config, id, json }) =>
  new Promise((resolve) => resolve({
    config,
    id,
    data: JSON.stringify(json, null, 2)
  }))

const ensureEOL = ({ config, id, data }) =>
  new Promise((resolve) => resolve({
    config,
    id,
    data: data + os.EOL
  }))

const write = ({ config, id, data }) => {
  const fileName = getJSONFileName(config.app.jsonFileName, id)

  return promisify(fs.writeFile)(fileName, data, 'utf-8')
}

module.exports = {
  pull,
  assemble,
  compact,
  deepSortByKey,
  ensureEOL
}

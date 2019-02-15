import fs from 'fs'
import { promisify } from 'util'
import { unflatten } from 'flat'
import google from 'googleapis'
import { getConfig } from '../config'
import {
  makeA1Notation,
  getColumnById,
  getDeepObject,
  getFileName
} from '../util'
import { authorize } from '../auth'

export const pull = (id) => {
  const config = getConfig()
  const configSkipEmptyValue = getDeepObject(
    ['app', 'command', 'pull', 'skipEmptyValue'],
    config
  )

  const column = getColumnById(config.sheets.valueColumns, id)
  return readSheetToJson(config, column)
    .then(assemble)
    .then(data => {
      if (configSkipEmptyValue === true) {
        return filterEmptyValue(data)
      }
      return data
    })
    .then(deflat)
    .then(deepSortByKey)
    .then(stringify)
    .then(data => write(
      getFileName(config.app.jsonFileName, id), data
    ))
    .catch(err => console.log('Error on pull:', err))
}

const readSheetToJson = (config, column) => {
  return authorize()
    .then(auth => {
      const service = google.sheets('v4')
      return new Promise((resolve, reject) => {
        service.spreadsheets.values.batchGet({
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
          resolve(result.valueRanges)
        })
      })
    })
}

export const assemble = data => {
  const [keyCol, valueCol] = data
  return new Promise((resolve) => {
    resolve(
      keyCol.values
        .map((k, i) => [
          k[0],
          getColumnValue(valueCol, i)
        ]) // a zip function
        .reduce((acc, cur) => {
          acc[cur[0]] = cur[1]
          return acc
        }, {})
    )
  })
}

export const filterEmptyValue = json =>
  new Promise((resolve) => {
    resolve(
      Object.keys(json).reduce((acc, key) => {
        if (json[key] !== '') acc[key] = json[key]
        return acc
      }, {})
    )
  })

const getColumnValue = (col, rowIndex) => {
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

const deflat = json =>
  new Promise((resolve) => resolve(unflatten(json)))

const _deepSortByKey = json =>
  Object.keys(json).sort().reduce((acc, key) => {
    typeof json[key] === 'object' && json[key] !== null
      ? acc[key] = _deepSortByKey(json[key])
      : acc[key] = json[key]

    return acc
  }, {})

export const deepSortByKey = json =>
  new Promise((resolve) => resolve(_deepSortByKey(json)))

const stringify = json =>
  new Promise((resolve) => resolve(JSON.stringify(json, null, 2)))

const write = (fileName, data) =>
  promisify(fs.writeFile)(fileName, data, 'utf-8')

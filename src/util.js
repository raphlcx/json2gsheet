const makeA1Notation = (sheetName, rangeA, rangeB) =>
  `'${sheetName}'!${rangeA}:${rangeB}`

const getColumnById = (columns, id) => {
  const column = columns.filter(column => column.id === id)
  if (column.length > 0) {
    return column[0]
  }
  throw new Error(
    'ID does not exist. Add it in the configuration file.'
  )
}

const deepGetObject = (object, keys) =>
  keys.reduce((acc, key) => (acc && acc[key]) ? acc[key] : null, object)

const getJSONFileName = (fileNameTemplate, id) =>
  fileNameTemplate.replace('$id', id)

module.exports = {
  deepGetObject,
  getColumnById,
  getJSONFileName,
  makeA1Notation
}

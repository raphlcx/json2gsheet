export const makeA1Notation = (sheetName, rangeA, rangeB) =>
  `'${sheetName}'!${rangeA}:${rangeB}`

export const getColumnById = (columns, id) => {
  const column = columns.filter(column => column.id === id)
  if (column.length > 0) {
    return column[0]
  }
  throw new Error(
    'ID does not exist. Add it in the config/config.json.'
  )
}

export const getFileName = (fileNameTemplate, id) =>
  fileNameTemplate.replace('$id', id)

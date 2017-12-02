export const makeA1Notation = (sheetName, rangeA, rangeB) =>
  `'${sheetName}'!${rangeA}:${rangeB}`

export const getColumnByCommand = (columns, command) => {
  const column = columns.filter(column => column.command === command)
  if (column.length > 0) {
    return column[0]
  }
  throw new Error('Command does not exist. Add it in the config/sheets.json.')
}

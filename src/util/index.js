export const makeA1Notation = (sheetName, rangeA, rangeB) =>
  `'${sheetName}'!${rangeA}:${rangeB}`

export const getColumnByLocaleCode = (columns, localeCode) => {
  const column = columns.filter(column => column.localeCode === localeCode)
  if (column.length > 0) {
    return column[0]
  }
  throw new Error(
    'Locale code does not exist. Add it in the config/sheets.json.'
  )
}

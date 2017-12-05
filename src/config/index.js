import fs from 'fs'

export const getConfig = () =>
  parse(read())

const read = () =>
  fs.readFileSync('json2gsheet.config.json', 'utf-8')

const parse = (data) => JSON.parse(data)

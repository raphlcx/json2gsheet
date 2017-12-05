import fs from 'fs'

export const getConfig = () =>
  parse(read())

const read = () =>
  fs.readFileSync('config/json2gsheet.json', 'utf-8')

const parse = (data) => JSON.parse(data)

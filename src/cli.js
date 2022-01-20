#!/usr/bin/env node

import * as json2gsheet from './index.js'

const cli = () => {
  const help = `
  json2gsheet - Serializes JSON data to Google Sheets, and vice versa.

  Usage: json2gsheet <push|pull> <id>

  Subcommands:

    push - Push local JSON data to Google Sheets
    pull - Pull Google Sheets data to local JSON file

  Arguments:

    id - An ID for identifying which JSON file to read or write
`

  if (process.argv.length < 4) {
    console.log('Too few arguments.')
    console.log(help)
    process.exit(0)
  }

  const subcommand = process.argv[2]
  const id = process.argv[3]
  const config = json2gsheet.getConfig()

  switch (subcommand) {
    case 'push':
      json2gsheet.push(config, id)
      break
    case 'pull':
      json2gsheet.pull(config, id)
      break
    default:
      console.log('Invalid subcommand.')
      console.log(help)
      process.exit(0)
  }
}

cli()

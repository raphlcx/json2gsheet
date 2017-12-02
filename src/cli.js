import command from './command'

export const main = () => {
  const help = `
  json2gsheet - Serializes JSON data to Google Sheet, and vice versa.

  Usage: node index.js <push|pull> <locale_code>

  Subcommands:

    push - Push local JSON data to Google Sheet
    pull - Pull Google Sheet data to local JSON file

  Arguments:

    locale_code - A short two-letter code for locating the JSON file, named
                  with the format 'locale.<locale_code>.json'
`

  if (process.argv.length < 4) {
    console.log('Too few arguments.')
    console.log(help)
    process.exit(0)
  }

  const subcommand = process.argv[2]
  const localeCode = process.argv[3]

  switch (subcommand) {
    case 'push':
      command.push(localeCode)
      break
    case 'pull':
      command.pull(localeCode)
      break
    default:
      console.log('Invalid subcommand.')
      console.log(help)
      process.exit(0)
  }
}

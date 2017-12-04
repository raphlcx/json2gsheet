import command from './command'

export const main = () => {
  const help = `
  json2gsheet - Serializes JSON data to Google Sheet, and vice versa.

  Usage: json2gsheet <push|pull> <id>

  Subcommands:

    push - Push local JSON data to Google Sheet
    pull - Pull Google Sheet data to local JSON file

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

  switch (subcommand) {
    case 'push':
      command.push(id)
      break
    case 'pull':
      command.pull(id)
      break
    default:
      console.log('Invalid subcommand.')
      console.log(help)
      process.exit(0)
  }
}

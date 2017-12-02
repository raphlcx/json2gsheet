import command from './command'

command.push('en')
  .catch(err => {
    console.log('Error occured: ' + err)
  })

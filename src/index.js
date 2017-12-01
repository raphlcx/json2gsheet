import fs from 'fs'
import { promisify } from 'util'
import { authorize } from './auth'

// Load client secrets from a local file.
promisify(fs.readFile)('config/client_secret.json')
  .then(content => {
    return authorize(JSON.parse(content))
  })
  .then(auth => {
    console.log(auth)
  })
  .catch(err => {
    console.log('Error occured: ' + err)
  })

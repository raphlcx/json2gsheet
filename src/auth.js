import fs from 'fs'
import readline from 'readline'
import { promisify } from 'util'
import { OAuth2Client } from 'google-auth-library'

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const TOKEN_DIR = (
  process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE
) + '/.credentials/'
const TOKEN_PATH = TOKEN_DIR + 'sheets.googleapis.json2gsheet.json'

/**
 * Authorize to get an OAuth2 client with client secret.
 *
 * @async
 * @returns {OAuth2Client} The OAuth2 client.
 */
export const authorize = () =>
  promisify(fs.readFile)('client_secret.json')
    .then(content => {
      return createAuthClient(JSON.parse(content))
    })

/**
 * Create an OAuth2 client with the given credentials.
 *
 * @async
 * @param {Object} credentials The authorization client credentials.
 * @returns {OAuth2Client} The created OAuth2 client.
 */
const createAuthClient = (credentials) => {
  const oauth2Client = new OAuth2Client(
    credentials.installed.client_id,
    credentials.installed.client_secret,
    credentials.installed.redirect_uris[0]
  )

  // Check if we have previously stored a token.
  return promisify(fs.readFile)(TOKEN_PATH)
    .then(token => {
      oauth2Client.setCredentials(JSON.parse(token))
      return oauth2Client
    })
    .catch(() => {
      return getNewToken(oauth2Client)
    })
}

/**
 * Get and store new token after prompting for user authorization.
 *
 * @async
 * @param {OAuth2Client} oauth2Client The OAuth2 client to get token for.
 * @returns {OAuth2Client} The OAuth2 client with token attached.
 */
const getNewToken = (oauth2Client) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  })
  console.log('Authorize this app by visiting this url: ', authUrl)
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  return new Promise((resolve) => {
    rl.question('Enter the code from that page here: ', code => {
      rl.close()
      resolve(code)
    })
  })
    .then(code => {
      return new Promise((resolve) => {
        oauth2Client.getToken(code, (err, token) => {
          if (err) throw err
          resolve(token)
        })
      })
    })
    .then(token => {
      storeToken(token)
      return token
    })
    .then(token => {
      oauth2Client.setCredentials(token)
      return oauth2Client
    })
    .catch(err => {
      console.log('Error in getting new token:', err)
    })
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
const storeToken = (token) => {
  try {
    fs.mkdirSync(TOKEN_DIR)
  } catch (err) {
    if (err.code !== 'EEXIST') {
      throw err
    }
  }
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token))
  console.log('Token stored to ' + TOKEN_PATH)
}

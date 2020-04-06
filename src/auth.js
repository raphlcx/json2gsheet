import { GoogleAuth } from 'google-auth-library'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

/**
 * Authorize to get a Google Auth client with client secret.
 *
 * @async
 * @returns The Google Auth client.
 */
async function authorize () {
  const auth = new GoogleAuth({
    scopes: SCOPES,
    keyFile: 'client_secret.json'
  })
  const client = await auth.getClient()
  console.log(client)
  return client
}

module.exports = {
  authorize
}

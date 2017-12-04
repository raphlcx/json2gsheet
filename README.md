# json2gsheet

Serializes JSON data to Google Sheet, and vice versa.


## Installation

Install as project dependency:

    yarn add json2gsheet


## Concept

`json2gsheet` was started out to always push keys to the same column, and varying values from different files to its respective column. The current structure of the configuration file for the application is reflected on this use case.

It uses an identifying attribute, the `id`, to correlate the JSON file and the sheet column it is pushed to.

Conceptually:

```
    JsonFile <--> ID <--> GoogleSheetColumn
```

`id` identifies the JSON file, at the same time it identifies which column to push the JSON values to. It is a one-to-one mapping.

Files are identified through the use of file name template. For instance, given the file name template `file.$id.json`, and the `id` supplied is `123`, the JSON file `file.123.json` will be loaded.

Which column the JSON values is pushed to is specified in the configuration file.


## Usage

In your working directory, create a directory named `config`, with two files inside:

 - `config.json`, the application configuration

 - `client_secret.json`, your OAuth2 client credential for authorizing with Google

### Pushing JSON to Google Sheet

    json2gsheet push <id>

Loads JSON file identified by `id`, flattens it to have a single level key-value pairs, and pushes its list of keys and values to their respective Google Sheet column specified in the configuration file.

### Pulling JSON from Google Sheet

    json2gsheet pull <id>

Pulls data from Google Sheet, unflattens the data, and saves the JSON to a file identified by `id`. Basically the reverse of the `push` subcommand.


## Configuration

This project is heavily driven by configurations. You can find a copy of [sample configuration](config/config.json) in this repository.

**References**

 - **app.jsonFileName**

    The file name template for the JSON file.

 - **sheets.spreadsheetId**

    The Google Sheet ID.

 - **sheets.sheetName**

    The name of the sheet to read or write to.

 - **sheets.keyColumn**

    The column to push JSON keys to. It is an object containing:

    `label` for column label, `column` to push to, `cellStart` on which cell to start writing from.

 - **sheets.valueColumns**

    The column to push JSON values to.

    This is an array of `valueColumn`. Each object contains:

    `label` for column label, `id` for file-to-column mapping, `column` to push to, `cellStart` on which cell to start writing from.


## Development

Run a watcher for source transpilation:

    yarn run build:w

Run the tests:

    yarn test


## License

[MIT](LICENSE)

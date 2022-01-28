# json2gsheet

[![npm](https://img.shields.io/npm/v/json2gsheet.svg?style=flat-square)](https://www.npmjs.com/package/json2gsheet)

Serializes JSON data to Google Sheets, and vice versa.

## Installation

```
npm install json2gsheet
```

## Concept

`json2gsheet` pushes JSON keys to a column, and values to another column, and more values for the same key to subsequent columns.

`json2gsheet` uses a token, which is called an `id` in this context, to relate the JSON file and the sheet column where values are pushed to.

For example, given these JSON files, with `id` as the file name without the `.json` suffix:

```
// person1.json
{
  "name": "John",
  "likes": "puppy"
}

// person2.json
{
  "name": "Jane",
  "likes": "cat"
}

// person3.json
{
  "name": "Russell",
  "likes": "bear"
}
```

When pushed to the sheet, this is the result:

```
 Key  | person1 | person2 | person3
-----------------------------------
name  | John    | Jane    | Russell
likes | puppy   | cat     | bear
```

For nested JSON object, it is first flattened when pushed to the sheet. For example:

```
// someCol.json
{
  "parent": {
    "child": "some value",

    "childtwo": {
      "grandchild": "more value"
    }
  }
}
```

becomes:

```
           Key             |  someCol
---------------------------------------
parent.child               | some value
parent.childtwo.grandchild | more value
```

When pulled from the sheet, it is de-flattened to restore the initial nested structure.

## Scope

`json2gsheet` only works with JSON strings, objects, and arrays.

## Usage

### Preparation

In a working directory, prepare these files:

  - `json2gsheet.config.json`

    Configuration file for this application.

  - `client_secret.json`

    Google API credential in JSON format.

To get your `client_secret.json`:

  1. On a Google Cloud Platform project, enable Google Sheets API.
  1. Create a service account, note its email address.
  1. Download the JSON credential file and name it as `client_secret.json`.

On your sheet, grant Editor access to the service account, via its email address.

### Pushing JSON to sheet

```
json2gsheet push <id>
```

What it does:

  1. Read the JSON file identified by `id`
  1. Flatten it to have a single level key-value pairs
  1. Push the list of keys and values to their respective sheet column as specified in the configuration file

### Pulling from sheet to JSON

```
json2gsheet pull <id>
```

What it does:

  1. Pull data from the sheet
  1. De-flatten the data
  1. Write the JSON to a file identified by `id`

Basically the opposite of `push` subcommand.

## Configuration

`json2gsheet` is heavily driven by configurations. You can find a copy of [sample configuration](json2gsheet.config.json) in this repository.

### App configurations

  - `app.jsonFileName`

    The file name template for the JSON file. This is where the position of `id` token is specified, using the placeholder `$id`.

  - `app.command.pull.skipEmptyValue`

    For `pull` subcommand only. If set to `true`, when a cell is empty, the key-value pair represented by this cell will not be inserted in the resulting JSON object.

### Sheets configurations

  - `sheets.spreadsheetId`

    The Google Sheets ID.

  - `sheets.sheetName`

    The name of the sheet to read from or write to. Note, this is not the spreadsheet's file name, but the name of an individual sheet in the spreadsheet file.

 - `sheets.keyColumn`

    The column to push JSON keys to. It is an object containing:

      - `label` for column header label
      - `column` to push to
      - `cellStart` on which cell to start writing from

 - `sheets.valueColumns`

    The columns to push JSON values to.

    This is an array of `valueColumn`. Each object contains:

      - `id` to identify the JSON file
      - `label` for column header label
      - `column` to push to
      - `cellStart` on which cell to start writing from

## Development

Run the tests:

```
npm test
```

To prepare for a new version:

  1. Create a new branch.
  1. Update version on `package.json` and `package-lock.json`.
  1. Make a commit.
  1. Merge the branch.
  1. Create an annotated tag.
  1. Push the tag.

To publish the new version:

```
npm pack
npm publish
```

## License

[MIT](LICENSE)

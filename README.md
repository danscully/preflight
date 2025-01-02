# Preflight

Preflight is an application for the quality control of media files before they are moved to media server playback systems.  Users create "rules", which are applied against each file, and the results reported.  End-users can also write "user functions", to generate additional data to be proofed above-and-beyond the information available in MediaInfo.  For example, a user-written script could split a name into sections based on a naming convention, and then those naming conventions checked in a rule.

Look in "src/main/rules.json" and "src/main/showspecific.js" for the format of rules and user functions.  To update the app, currently you can drop a ".json" file onto the dropzone of the checker to update the rules, and a ".js" file to update the user functions.  

### Rules Setup
Rules have the following properties:
| property | description |
| -------- | ----------- |
| "name" | a user-convenience name.  Not used by the app. |
| "precondition" | a test that is run to see if the rule should be applied.  If the precondition test fails, the rule is not applied to the file|
| "test" | the test to run against the file.  Results are reported in the app|
| "message" | the error message to be shown to the user if the test fails|
| "severity" | the severity of the error.  "Error", "Warning", and "Info" are currently supported, and affect how the error is shown in the UI|

Rules are evaluated using the Filtrex.js library.  You can see more about the syntax and operators for tests at https://github.com/cshaa/filtrex.

One known "gotcha".  When supplying string values in rules, you must escape the quotation marks like: type == \"MOV\".  Filtrex (and json) only support double quotation marks.

<img src="docs/Screenshot.png" align="right" width="500px" />

## Project Setup

### Install

```bash
$ npm install
```

### Development

```bash
$ npm run dev
```

### Build

```bash
# For windows
$ npm run build:win

# For macOS
$ npm run build:mac

# For Linux
$ npm run build:linux
```

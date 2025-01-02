# Preflight

Preflight is an application for the quality control of media files before they are moved to media server playback systems.  Users create "rules", which are applied against each file, and the results reported.  End-users can also write "user functions", to generate additional data to be proofed above-and-beyond the information available in MediaInfo.  For example, a user-written script could split a name into sections based on a naming convention, and then those naming conventions checked in a rule.

Look in "src/main/rules.json" and "src/main/showspecific.js" for the format of rules and user functions.  To update the app, currently you can drop a ".json" file onto the dropzone of the checker to update the rules, and a ".js" file to update the user functions.  



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

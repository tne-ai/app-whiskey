# TNE.ai V2 Frontend

This is the NaturalUI Template for V2 of the TNE.ai system. It uses Whiskey as
the demo set, but you can easily change text boxes and so forth. You connect
this to the running V2 system by hitting the right port of a running OpenWebUI
instance

## Installation

Make sure that you have `brew install node`

```sh
make install
# both work
npm install
```

### App configuration

In order to configure with the system it needs to have MODEL\_:

- Copy .env.example to .env
- If you use 1Password, then you should make sure to create
  WEBUI_SECRET_KEY in 1Password and use the 1Password integration to get it out
  of the database
- Alternatively Add your local open-webui API key to .env or you can set this
  dynamically so which `make run.docker`, `make run.dev`, and `make run` handle
  MODEL_API_URL=http://localhost:3000/api/chat/completions and changes the port
  numbers

### Restore the model into a fresh open-webui instance

The app calls open webui locally and has a specific model name. It post against
open-webui at 3000 if you are using docker, for the development version it needs
to post again 5174.

- Restore demo_docs/models-export-1740216815231.json into an open-webui
  installation. This should be in Settings > Admin Settings > Database > Import
  Config from JSON File. Alternatively this is already in the Google Drive in
  ./app/open-webui-data/demo builds, so you can copy that webui.db to get it.
- The app calls a model in the Open-Webui database so make sure there is a model
  called `wastex-document---json`.

### Creating the Model in an existing OpenWebui system

Instead of a complete restore, you can just add the model needed as follows:

1. In OpenWebui, on the left side, click on Workspace > Model and choose + to
   add a new model
1. The Model Name is `Wastex Document -> JSON`
1. Check that this create the model id `wastex-document---json` and it must be
   exactly that string for the user interface to find the model.
1. The Base Model is `anthropic/claude-3.5-sonnet` so make sure that you have
   the Anthropic function loaded
1. The System prompt you can copy from wastex-document---json.txt in the Demo
   Docs file
1. This is lots of context so make sure in the Advanced Parameters to set
   Context Length to 200K or 204800, Max Tokens to Predict to 8192 and Tokens
   to Keep on Context refresh to 16384

## Get an API Key from OpenWebui user

Now you need a MODEL_API_KEY from your OpenWebui user:

1. Login to OpenWebui
1. Go to Settings > Account > API Keys and create one
1. Put this into 1Password. If you are using the Demo OpenUI this is already set
   in 1Password in Dev Ops to use in `OPen WebUI Local API Key`

## Running

In order to run this, you an use the standard installer `make naturalui`

```sh
npm run dev -- --open
# to run against dockerized open-webui
make run.docker
# to run against vanilla open-webui
make run
# to run against our development system
make run.dev
```

## Demonstration Script

The user selects a source file from the client using a drag and drop/file
picker interface.

Use the file `Demo_docs/delivery document sample.csv` is a sample delivery document
for extraction.

A preview of the file content is shown in the file picker.

When the user clicks "Upload File", the app sends the file content to a model.
The model analyzes the passed content (including OCR if necessary) and extracts
data from it. The model returns a JSON object containing metadata about the
document and its ingestion, data about the document, and data about the
materials described in the document. The app parses the returned JSON object and
displays it in two tables, one for the document and one for the materials. The
app also displays raw and parsed variations of the model response payload.

## Potential issues

If you get a 404

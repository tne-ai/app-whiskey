# Whiskey Application V1 for Local and Cloud Installation

This is for the v1 demonstration and has the latest data files. This is the old
v0 version this does not document that

The current repositories are:

1. [app-whiskey](https://github.com/tne-ai/app-whiskey). This has the V1 data
   and demonstration backing files. It also has the prompt information and
   things that needed to be loaded into OpenWebUI.
1. [whiskey-app](https://github.com/tne-app-content/tree/main/blob/whiskey-app).
   This is the front-end svelte user interface. It has the user interface
   scaffolding and let's you upload four different document types

## The Cloud demonstration

Here is the demonstration script:

1. login to [Open Web](https://open-webui.dev.tne.ai) with `admin@tne.ai` and the
   password is in describe
1. Make sure that you can run Wastex -> JSON Documents from Workspace at the
   upper right. This confirms that the model is working. You will need access to
   Claude/Sonnet-3 for this to work via. These are the sanity checks that the
1.

## Installation and running locally

This is the NaturalUI Template for V2 of the TNE.ai system. It uses Whiskey as
the demo set, but you can easily change text boxes and so forth. You connect
this to the running Development V2 system by hitting the right port of a running OpenWebUI
instance. This assumes you have Development V2 installed using the Eli demo script and the
monorepo at ./src. See
[README.md](https://github.com/tne-ai/src/blob/main/README.md)

```sh
# start the backend
cd ~/ws/git/src
make ai.dev
open localhost:5174

# start the web frontend
cd ~/ws/git/src/app/tne-app-content/whiskey-app
brew install node
npm install
npm run dev
# you need to configure your supabase database
open localhost:5173
```

## Local Common Problems

Here is a list of common Problems

1. The Web frontend doesn't work? Make sure you have done a git pull in
   tne-app-content
1. The Backend doesn't work? Go to the local installation and you should see the
   Workspace > Model > Wastex Document -> JSON, start a new chat and just say
   hello world, it should return a JSON object. If it says "model not found", make
   sure that Claude Sonnet 3.5 is enabled. Go to New Chat and look for that name.
1. The google key is required and should be the

## Building the Cloud

## Installation of Custom Function into OPen WebUI

1. In OWUI, click on icon in top right -> Admin Panel -> Function -> Import
   Functions
2. Import the function at
   `app-whiskey/WebUI/function-wastex_extraction-export-1741657569760.json`

Note that you can use the optional Google Drive interface but it is not
recommended you should just import from your desktop. But if you want this,
Click on the newly imported function, go to line 388, and fill in google api
key (using the env wasn't working for some reason and this is throw away code
anyways... :)

Note Model importing does not currently work as of March 17, so you need to hand
install the model

## Where is the Test data?

The four documents being used for the demo can be found at
`app-whiskey/Data. They include a clean csv, messy csv, pdf, and
image.

## Creating the Model in an existing OpenWebui system

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
   Context Length to 200K or 204800, Max Tokens to Predict to 8192 and Tokens to
   Keep on Context refresh to 16384

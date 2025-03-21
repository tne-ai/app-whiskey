# Whiskey Application V1 for Local and Cloud Installation

This is for the v1 demonstration and has the latest data files. This does not
document the old v0 whiskey demonstration of just uploading.

This repositories are [app-whiskey](https://github.com/tne-ai/app-whiskey). This
has the V1 data and demonstration backing files. It also has the prompt
information and things that needed to be loaded into OpenWebUI.

## The Cloud demonstration

Here is the demonstration script:

1. login to [Open Web](https://open-webui.dev.tne.ai) with `admin@tne.ai` and
   the password is in describe
1. Make sure that you can run Wastex -> JSON Documents from Workspace at the
   upper right. This confirms that the model is working. You will need access to
   Claude/Sonnet-3 for this to work via. These are the sanity checks that the 1.

## Current Status of the Cloud Demo and Local Demo

Here is what is working now

1. Image recognition works
1. Clean CSV times out
1. Dirty CSV times out
1. PDF Time out

We will assess the local demo when it is working

1. Image recognition works
1. Clean CSV
1. Dirty CSV
1. PDF

## Configure the Supabase for the FrontEnd needs direnv and 1Password

Make sure that you have asdf and direnv loaed to get the right variables. The
credentials and configuration are stored in 1Password and are access through
.envrc. Make sure to brew install direnv to make this work. You can also
manually source ./FrontEnd/.envrc if you want

The repository currently only requires Node to run and runs on Node 22 or 23, so
there is no .tool-versions or asdf pinning.

Make sure that in .FrontEnd, the following are configured

Add these assignments to your .env file. These are in the TNE.ai 1Password
account in the DevOps vault if you want to set manually:

```sh
VITE_DB_HOST=
VITE_DB_NAME=
VITE_DB_USER=
VITE_DB_PASSWORD=
VITE_DB_PORT=
VITE_DB_SSL=
```

## Installation and running locally

Here are the installation instructions

```sh
# bootstrap the Studio V2
mkdir -p ~/ws/git
git clone git@github.com:tne-ai/src
git submodule update --init --remote --recursive bin lib

# run the front end and open webui ouir development release
make install
make run
# to open browser windows
make open
# to start all over
make kill
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

## Importing the custom function into Open Webui

1. In OWUI, click on icon in top right -> Admin Panel -> Function -> Import Functions
2. Import the function at `OpenWebUI/function-wastex_extraction-export-1742661446105.json`
3. Click on the Valve icon next to the function in Admin Settings > Function >
   wastex_extraction > Gear icon ⚙️. and fill in the google api
   key. MODEL ID IS MEANINGLESS, just leave it blank
5. Click on Workspace -> Models -> Import Models
6. Import the model at `OpenWebUI/wastex-document---json-1741657611445.json` if this import
   doesn't work, then you can create it manually by going to Workspace > Models > Plus sign
7. Choose the newly imported `wastex_extraction` as the base model, system prompt doesnt matter, open advanced params
8. Set `context_length=200000`, `max_tokens=16384`, `num_keep=16384`
9. Ensure that the newly imported `wastex_extraction` model is chosen under
   'Base Model'
10. Go to icon in top right -> Admin Panel -> Settings, Click on Connections in the left sidebar, and ensure the `https://api.openai.com/v1` connection is on and API key is set

## Building the Cloud

Same instructions as above

Note Model importing does not currently work as of March 17, so you need to hand
install the model

## Where is the Test data?

The four documents being used for the demo can be found at `app-whiskey/Data.
They include a clean csv, messy csv, pdf, and image.



```

```

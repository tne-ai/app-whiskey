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

These are set in `./src/.envrc` so make sure to use asdf .direnv and run from
this mono repo to set or source this.

Add these assignments to your .env file. These are in the TNE.ai 1Password
account in the DevOps vault if you want to set manually, but make sure these are
set:

```sh
printenv VITE_DB_HOST
printenv VITE_DB_NAME
printenv VITE_DB_USER
printenv VITE_DB_PASSWORD
printenv VITE_DB_PORT
printenv VITE_DB_SSL
printenv VITE_PORT
```

## Installation and running locally

Here are the installation instructions

```sh
# bootstrap the Studio V2
mkdir -p ~/ws/git
cd ~/ws/git/src
git clone git@github.com:tne-ai/src
git submodule update --init --remote --recursive bin lib

# come back to this directory
cd -
make install
# starts open-webui backend and the whiskey frontend ui
make run
# to open browser windows
make open
# to start all over
make kill
# To start or stop just the frontend
make frontend
make frontend.kill
# to start or stop just the openwebui backend
make backend
make backend.kill
```

## Local Common Problems

Here is a list of common Problems

1. The Web frontend doesn't work? Make sure you have done a git pull in
   tne-app-content
1. The Backend doesn't work? Ensure that your local `wastex_extraction` function is up to date. See below for how to reinstall.
   Also, go to the local installation and you should see the
   Workspace > Model > Wastex Document -> JSON, start a new chat and just say
   hello world, it should return a JSON object. If it says "model not found", make
   sure that you have wastex_extraction in your Functions and you have the openai api set in your connections
1. The google key is required and should be set in the Functions tab as a valve for the wastex_extraction function

## Importing the custom function into Open Webui and set Google Gemini Key

Note that the model import is currently broken (for the deployed version), so you have to manually recreate
the function and the model:

1. In OWUI, click on icon in top right -> Admin Panel -> Function -> Import Functions
1. Import the function at `OpenWebUI/function-wastex_extraction-export-1742661446105.json`
1. Click on the Valve icon next to the function in Admin Settings > Function >
   wastex_extraction > Gear icon ⚙️. and fill in the google api
   key. MODEL ID IS MEANINGLESS, just leave it blank.

## Currently Broken: Automatic Model Import

1. Click on Workspace -> Models -> Import Models (This is currently broken)
   Import the model at `OpenWebUI/wastex-document---json-1741657611445.json`
   (this might work locally)

## Manual import of Function and Model and Enable OpenAI

1. can create it manually by going to
   Workspace > Models > Plus sign and copy and pasting the model parameters in
1. Choose the newly imported `wastex_extraction` as the base model. The system
   prompt doesnt matter. Then open advanced params
1. Set `context_length=204000`, `max_tokens=16384`, `num_keep=16384`
1. Go to icon in top right -> Admin Panel -> Settings, Click on Connections in
   the left sidebar, and ensure the `https://api.openai.com/v1` connection is on
   and API key is set and test this by running a model "gpt-4o" from the chat.

## Building the Cloud

Same instructions as above

Note Model importing does not currently work as of March 17, so you need to hand
install the model

## Where is the Test data?

The four documents being used for the demo can be found at `app-whiskey/Data.
They include a clean csv, messy csv, pdf, and image.

## Where are the logs?

LOCALLY:
The logs are in two places, whereever your webui.db is you will find an
audit.log and these also go to the standard output where you started open-webui
and then the browser will show you the errors in the front end in the
Javascript console.

IN THE CLOUD:
Try clicking this link: https://us-west-2.console.aws.amazon.com/cloudwatch/home?region=us-west-2#dashboards/dashboard/Whiskey, or:
1. Go to AWS access portal (I sign in through here: https://nedra.awsapps.com/start/)
2. Go to cloudwatch
3. click on dashboards in the left side panel
4. Click on Whiskey
5. There you will see both the Node js frontend logs and the open webui backend logs

## SSL Certification Verification problems

We have an [issue](https://github.com/open-webui/open-webui/discussions/3702)
with native pipx running

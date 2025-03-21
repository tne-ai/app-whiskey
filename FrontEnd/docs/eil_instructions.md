- Our four demo document inputs can be found at app-whiskey/Data/test.v1/ - we have clean csv, messy csv, pdf, and image

As for merging the work from the ui repo into the rest of your whiskey frontend work, here are the files to look at:
- src/routes/api/upload/+server.ts: formats our messages array to talk to the backend
- src/lib/utils/pdfUtils.ts: converts an inputted pdf into a list of images
- src/lib/components/FileUpload.svelte: deals with file upload, only change is integrating this pdf upload stuff
- src/lib/components/ModelResponse.svelte: formats the processed line items in a pretty way

These are the main changes from what was in whiskey-0. Hope this helps.

For the OWUI backend stuff:
app-whiskey/WebUI/function-wastex_extraction-export-1741657569760.json: the function with the custom pipe
app-whiskey/WebUI/wastex-document---json-1741657611445.json: the model to upload in the Workspace tab

More in depth instructions for how to get the OWUI stuff set up are in the app-whiskey README

Hope this helps, lmk if you have questions
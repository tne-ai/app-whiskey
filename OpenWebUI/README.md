# Model Export from Open WebUI

This is where the custom models (agents) we are doing live. You should go to
custom models in Workspace > Models to see them and you cna read and import them
here.

This includes custom models but they are scattered amongst the generic ones, so
search for Whiskey to find the custom agents we have for them.

# FUNCTION SCHEMA MATCH

you can run this by uploading it into your local openwebui by going to openwebui -> your username in the bottom left -> admin panel -> functions -> import function.

Once you have done that ensure that the following are set in your environemnt:

- GOOGLE_API_KEY
- VITE_DB_USER
- VITE_DB_PASSWORD

find your openwebui API jwt which is in your user on the bottom left -> settings -> account

Then once that is set up, assuming you are running this locally on your machine, you can post to it by doing:

```
curl -X POST http://localhost:3000/api/chat/completions \
-H "Authorization: Bearer YOUR_API_KEY" \
-H "Content-Type: application/json" \
-d '{
      "model": "schema-match",
      "messages": [
        {
          "role": "user",
          "content": "<THE DATA>"
        }
      ],
      "config": {
        "site_id": "<SITE ID>",
        "entry_type": "materials",
        "arrival_doc_id": "<ARRIVAL DOC ID>"
      }
    }'
```

the entry type is for future support if we are taking in different sheets that are like transportation invoices and such.

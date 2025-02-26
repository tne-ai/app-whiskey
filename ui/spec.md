# Introduction and goal
- Whiskey-0 is a demo app for the Whiskey project.
- Core feature: Extract delivery data from PDFs, images (PNG/JPG), and CSV files.

## Technical Specifications
### Platform
- SvelteKit with Svelte 5 Runes
- TailwindCSS + Flowbite components
- Server-mediated API calls
- File size limit: 10MB
- Supported formats: PDF, PNG, JPG, CSV

### Data Flow
1. User uploads file via drag-drop or picker
2. File sent to SvelteKit server endpoint
3. Server forwards to external API with:
   - Authorization: Bearer {API_KEY}
   - Content-Type: multipart/form-data
4. API returns JSON array with uniform keys
5. Frontend displays data in sortable table
6. Status bar shows upload progress/errors

### UI Requirements
- File upload component with preview
- Error toast notifications
- Persistent status bar
- Responsive data table
- Column sorting
- CSV export button

Platform:
- Typescript
- Sveltekit https://svelte.dev/docs/kit/introduction
- Svelte 5 in Runes mode https://svelte.dev/docs/svelte/overview
- TailwindCSS https://tailwindcss.com/
- Flowbite - https://flowbite.com/
- flowbite-svelte https://flowbite-svelte.com/


Operation:
- From the user's view, the operation of this front-end app is for a user to upload a PDF, image or CSV file and see the delivery data contained in the uploaded file.
- The uploaded file can be selected via a drop target or a file picker
- The uploaded file will be sent to a backend API external to this app
- The backend  will be called via an OpenAI-compatible API
- The backend API will extract the delivery data from the file and return it to the front-end app.
- The return value will be a JSON object with the delivery data.
- The front-end app will display the delivery data in a table.
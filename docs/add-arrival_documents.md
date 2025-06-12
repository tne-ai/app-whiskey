I want to add an /arrival_documents page to this app.

# Collection view:
At /arrival_documents, there should be a table of arrival documents with these columns:

	Site
	Name
	Arrival date
	Validated column, which shows 
		- a green checkbox badge if all entries linked to the arrival document in the i_materials table are is_valid = true
		- a red x badge otherwise


Filterable by site, from a populated select
Sortable by all visible columns

Each row should have an action button called "View" at the right end with the column header Actions. The View button in each row should be linked to the /arrival_documents/[id] page.

Should have a Create Arrival Document button

# Item view
At /arrival_documents/[id], three main elements are presented in a tabular arrangement with two rows:

	- The top row is divided into two columns
		- The first, left column in the top row is a representation of the arrival document. For now this will just be a large, bolded rendering of the name of the arrival_document.
		- The second, right column in the top row is a list of the attributes of the arrival document, as listed in the arrival_documents schema
		This document attribute cell (upper right) should have an editable field for "valid" and a link to a new edit page that allows editing of the document attributes
	- The lower row is a single column that has a table similar to the one currently at /materials, with key attributes listed, including a Valid button and View and Edit action buttons. These follow links as in the /materials page.
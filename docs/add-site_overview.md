Site-based navigation

We need to add some navigation to the site.

For most users, the site will be the unit of recordkeeping. So let's make a Site-major navigation drawer on the left of the page.

In the drawer, there will be a list of collapsible site menu items. The set of sites, the top-level menu items, will be the result of a database query that will initially be all of the rows of the i_sites table, but at a later time will be filtered based on the permissions of the user.

When a site entry itself is selected, the site overview page will be presented. For now, just make a dummmy page with "<site_name> Overview" for that.

When the site entry is expanded, it will have these sub-items:

	- Deliveries
	- Removals
	- Logistics
	- Machine operation
	- Reports

When the Deliveries sub-item under a site is clicked, it will show the list of arrival_documents associated with that site in a table very similar to the one in the current arrrival_documents page. From that page, the same linked pages should be avaialble.

In a similar way, we will have overveiw pages for removals, logistics, and machine operation. The corresponding database tables are:

	Removals - i_resource_removal
	Logistics - i_logistics
	Machine operation - i_machine_usage

Reports will start as links to external pages.

Please review the specs for this new navigation system based on sites in the database and ask any questions you have. When we are clear on the path forward, I will release you to make the changes in to code.


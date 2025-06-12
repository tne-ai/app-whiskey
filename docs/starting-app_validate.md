Making app-validate

I want to make a simple editor in this Svelte 5 Runes app for the content of a single table in my database.
The table is a PostgreSQL table reachable by direct database access and also via REST using PostgREST.

I want to have a paginated tabular view that shows a subset of the fields in the table, and an edit view that show all of the fields and allows editing and saving.

It should be possible to filter the table view, and to use selects loaded with existing values to choose the content of referece fields using a value in the releated table.

The table is called materials. Its schema is:

create table public.i_materials
(
    material_entry_id     uuid    default gen_random_uuid() not null
        primary key,
    site_id               uuid                              not null
        references public.i_sites,
    submaterial_id        uuid
        references public.l_submaterials,
    quantity              numeric(12, 2)                    not null,
    unit_id               uuid
        references public.l_units,
    weight_kg             numeric(12, 2),
    volume_m3             numeric(12, 2),
    cost_per_unit         numeric(12, 2),
    total_cost            numeric(12, 2),
    supplier_id           uuid
        references public.l_suppliers,
    delivery_date         date,
    stage_id              uuid,
    notes                 text,
    item_id               uuid,
    arrival_doc_item_name varchar,
    arrival_doc_id        uuid,
    is_valid              boolean default false,
    default_waste_pct     numeric(5, 2)
)

I would like it to have sensible REST-style routing, so maybe these pages will be materials and materials/[id], materials/[id]/edit 

Please use the nice styling of tailwind and DaisyUI to make it pretty.

In the first version, put all of the fields in the tabular view, and I will delete the needless ones.

Please put the database credentials in a .env file.

Can you make a task list first, and then we can go ahead?

Even before we make the task list, please review the request, ask any questions you have, then  rephrase it concisely in a structured form so we can be sure we agree on the direction.

I willl let you write files, but please only do what I ask and stop now and then for me to review your progress and direction.1. We are in a new app with Tailwind and DaisyUI installed. We are at /Users/paul/ws/git/src/app/app-validate. Please asdd  the editor pages to this app.
2. We can connect to the database via PostgREST if you prefer. That seems easiest. I don't think we would make a new interface, right?
3. Foreign key identifiers: 
site_id => site_name
submaterial -> submaterial_name
unit_id => unit_name
supplier_id => supplier_name
stage_id => stage_name
4. The Postgres uses bearer authorization
5. No validation beyond database accepability at this point.
6. A faceted search with selects above the header would be a great start.

Oh, it should be possible to create a new material record in this interface.

If you would like to review the full schema of the database that i_materials comes from (it is 33K), you can see it in schema.sql.


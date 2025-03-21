create table public.material_densities
(
    density_id    serial
        primary key,
    material      text    not null,
    sub_material  text,
    density_kg_m3 numeric not null,
    unique (material, sub_material)
)
    using ???;

alter table public.material_densities
    owner to postgres;

grant select, update, usage on sequence public.material_densities_density_id_seq to anon;

grant select, update, usage on sequence public.material_densities_density_id_seq to authenticated;

grant select, update, usage on sequence public.material_densities_density_id_seq to service_role;

create index idx_material_densities_lookup
    on public.material_densities using ??? (material, sub_material);

grant delete, insert, references, select, trigger, truncate, update on public.material_densities to anon;

grant delete, insert, references, select, trigger, truncate, update on public.material_densities to authenticated;

grant delete, insert, references, select, trigger, truncate, update on public.material_densities to service_role;

create table public.emission_factors
(
    factor_id    serial
        primary key,
    category     text    not null,
    subcategory  text    not null,
    unit         text    not null,
    factor_value numeric not null,
    valid_from   date    not null,
    valid_to     date,
    source       text,
    unique (category, subcategory, valid_from)
)
    using ???;

alter table public.emission_factors
    owner to postgres;

grant select, update, usage on sequence public.emission_factors_factor_id_seq to anon;

grant select, update, usage on sequence public.emission_factors_factor_id_seq to authenticated;

grant select, update, usage on sequence public.emission_factors_factor_id_seq to service_role;

grant delete, insert, references, select, trigger, truncate, update on public.emission_factors to anon;

grant delete, insert, references, select, trigger, truncate, update on public.emission_factors to authenticated;

grant delete, insert, references, select, trigger, truncate, update on public.emission_factors to service_role;

create table public.vehicle_types
(
    vehicle_type_id   serial
        primary key,
    name              text not null,
    category          text not null,
    max_load_kg       numeric,
    fuel_type         text not null,
    emission_category text not null,
    notes             text
)
    using ???;

alter table public.vehicle_types
    owner to postgres;

grant select, update, usage on sequence public.vehicle_types_vehicle_type_id_seq to anon;

grant select, update, usage on sequence public.vehicle_types_vehicle_type_id_seq to authenticated;

grant select, update, usage on sequence public.vehicle_types_vehicle_type_id_seq to service_role;

grant delete, insert, references, select, trigger, truncate, update on public.vehicle_types to anon;

grant delete, insert, references, select, trigger, truncate, update on public.vehicle_types to authenticated;

grant delete, insert, references, select, trigger, truncate, update on public.vehicle_types to service_role;

create table public.projects
(
    project_id                  serial
        primary key,
    company_id                  integer not null,
    site_name                   text    not null,
    project_name                text    not null,
    site_type                   text
        constraint projects_site_type_check
            check (site_type = ANY (ARRAY ['Construction'::text, 'Deconstruction'::text, 'Commercial'::text])),
    site_address                text    not null,
    land_use                    text    not null,
    build_type                  text
        constraint projects_build_type_check
            check (build_type = ANY
                   (ARRAY ['Single Residential'::text, 'Development'::text, 'Commercial Build'::text, 'Infrastructure'::text, 'Renovation'::text])),
    construction_floor_area_sqm numeric not null,
    estimated_project_value     numeric not null,
    stories                     integer,
    site_start_date             date    not null,
    site_finish_date            date    not null,
    building_owner              text,
    description                 text,
    created_by_name             text,
    created_by_email            text
)
    using ???;

alter table public.projects
    owner to postgres;

grant select, update, usage on sequence public.projects_project_id_seq to anon;

grant select, update, usage on sequence public.projects_project_id_seq to authenticated;

grant select, update, usage on sequence public.projects_project_id_seq to service_role;

grant delete, insert, references, select, trigger, truncate, update on public.projects to anon;

grant delete, insert, references, select, trigger, truncate, update on public.projects to authenticated;

grant delete, insert, references, select, trigger, truncate, update on public.projects to service_role;

create table public.project_stages
(
    stage_id    serial
        primary key,
    project_id  integer not null
        references public.projects,
    stage_name  text    not null,
    start_date  date    not null,
    finish_date date    not null,
    unique (project_id, stage_name)
)
    using ???;

alter table public.project_stages
    owner to postgres;

grant select, update, usage on sequence public.project_stages_stage_id_seq to anon;

grant select, update, usage on sequence public.project_stages_stage_id_seq to authenticated;

grant select, update, usage on sequence public.project_stages_stage_id_seq to service_role;

create index idx_project_stages_dates
    on public.project_stages using ??? (project_id, start_date, finish_date);

grant delete, insert, references, select, trigger, truncate, update on public.project_stages to anon;

grant delete, insert, references, select, trigger, truncate, update on public.project_stages to authenticated;

grant delete, insert, references, select, trigger, truncate, update on public.project_stages to service_role;

create table public.resource_managers
(
    manager_id   serial
        primary key,
    project_id   integer not null
        references public.projects,
    company_name text    not null,
    manager_name text    not null,
    email        text,
    role         text,
    mobile       text
)
    using ???;

alter table public.resource_managers
    owner to postgres;

grant select, update, usage on sequence public.resource_managers_manager_id_seq to anon;

grant select, update, usage on sequence public.resource_managers_manager_id_seq to authenticated;

grant select, update, usage on sequence public.resource_managers_manager_id_seq to service_role;

grant delete, insert, references, select, trigger, truncate, update on public.resource_managers to anon;

grant delete, insert, references, select, trigger, truncate, update on public.resource_managers to authenticated;

grant delete, insert, references, select, trigger, truncate, update on public.resource_managers to service_role;

create table public.ordered_items
(
    order_id               serial
        primary key,
    project_id             integer               not null
        references public.projects,
    delivery_date          date                  not null,
    stage                  text                  not null,
    trade_provider         text                  not null,
    item_name              text                  not null,
    material               text                  not null,
    sub_material           text,
    excess_percentage      numeric               not null,
    density                numeric               not null,
    cubic_m3               numeric               not null,
    weight_per_unit        numeric               not null,
    total_material_weight  numeric               not null,
    waste_weight           numeric               not null,
    waste_value            numeric               not null,
    unit_quantities        integer               not null,
    unit_measure           text                  not null,
    price_per_unit         numeric               not null,
    purchase_cost_total    numeric               not null,
    includes               boolean default true,
    excludes               boolean default false,
    estimated_removal_cost numeric,
    open                   boolean default true,
    waste_plan             boolean default false,
    landfill               boolean default false not null,
    cleanfill              boolean default false not null,
    recycle                boolean default false not null,
    reuse                  boolean default false not null,
    estimated_destination  text,
    created_by_name        text,
    created_by_email       text,
    foreign key (material, sub_material) references public.material_densities (material, sub_material)
)
    using ???;

alter table public.ordered_items
    owner to postgres;

grant select, update, usage on sequence public.ordered_items_order_id_seq to anon;

grant select, update, usage on sequence public.ordered_items_order_id_seq to authenticated;

grant select, update, usage on sequence public.ordered_items_order_id_seq to service_role;

create index idx_ordered_items_material
    on public.ordered_items using ??? (material, sub_material);

create index idx_ordered_items_stage
    on public.ordered_items using ??? (project_id, stage);

create index idx_ordered_items_dates
    on public.ordered_items using ??? (delivery_date);

grant delete, insert, references, select, trigger, truncate, update on public.ordered_items to anon;

grant delete, insert, references, select, trigger, truncate, update on public.ordered_items to authenticated;

grant delete, insert, references, select, trigger, truncate, update on public.ordered_items to service_role;

create table public.waste_providers
(
    provider_id    serial
        primary key,
    name           text    not null,
    location       text    not null,
    material_type  text    not null,
    removal_method text    not null
        constraint waste_providers_removal_method_check
            check (removal_method = ANY (ARRAY ['Landfill'::text, 'Cleanfill'::text, 'Recycle'::text, 'Reuse'::text])),
    provider_rate  numeric not null,
    rate_unit      text    not null,
    diversion_rate numeric,
    unique (name, location, material_type)
)
    using ???;

alter table public.waste_providers
    owner to postgres;

grant select, update, usage on sequence public.waste_providers_provider_id_seq to anon;

grant select, update, usage on sequence public.waste_providers_provider_id_seq to authenticated;

grant select, update, usage on sequence public.waste_providers_provider_id_seq to service_role;

create index idx_waste_providers_material
    on public.waste_providers using ??? (material_type, removal_method);

grant delete, insert, references, select, trigger, truncate, update on public.waste_providers to anon;

grant delete, insert, references, select, trigger, truncate, update on public.waste_providers to authenticated;

grant delete, insert, references, select, trigger, truncate, update on public.waste_providers to service_role;

create table public.material_carbon_factors
(
    factor_id     serial
        primary key,
    material      text    not null,
    sub_material  text,
    carbon_factor numeric not null,
    source        text,
    valid_from    date    not null,
    valid_to      date,
    unique (material, sub_material, valid_from)
)
    using ???;

alter table public.material_carbon_factors
    owner to postgres;

grant select, update, usage on sequence public.material_carbon_factors_factor_id_seq to anon;

grant select, update, usage on sequence public.material_carbon_factors_factor_id_seq to authenticated;

grant select, update, usage on sequence public.material_carbon_factors_factor_id_seq to service_role;

grant delete, insert, references, select, trigger, truncate, update on public.material_carbon_factors to anon;

grant delete, insert, references, select, trigger, truncate, update on public.material_carbon_factors to authenticated;

grant delete, insert, references, select, trigger, truncate, update on public.material_carbon_factors to service_role;

create table public.material_diversion_targets
(
    target_id                   serial
        primary key,
    project_id                  integer not null
        references public.projects,
    material                    text    not null,
    diversion_target_percentage numeric not null,
    target_date                 date    not null
)
    using ???;

alter table public.material_diversion_targets
    owner to postgres;

grant select, update, usage on sequence public.material_diversion_targets_target_id_seq to anon;

grant select, update, usage on sequence public.material_diversion_targets_target_id_seq to authenticated;

grant select, update, usage on sequence public.material_diversion_targets_target_id_seq to service_role;

grant delete, insert, references, select, trigger, truncate, update on public.material_diversion_targets to anon;

grant delete, insert, references, select, trigger, truncate, update on public.material_diversion_targets to authenticated;

grant delete, insert, references, select, trigger, truncate, update on public.material_diversion_targets to service_role;

create table public.logistics_emissions
(
    emission_id     serial
        primary key,
    project_id      integer not null
        references public.projects,
    date            date    not null,
    vehicle_type    text    not null,
    fuel_type       text    not null,
    distance_km     numeric not null,
    load_weight_kg  numeric,
    emission_factor numeric not null,
    total_emissions numeric not null,
    notes           text
)
    using ???;

alter table public.logistics_emissions
    owner to postgres;

grant select, update, usage on sequence public.logistics_emissions_emission_id_seq to anon;

grant select, update, usage on sequence public.logistics_emissions_emission_id_seq to authenticated;

grant select, update, usage on sequence public.logistics_emissions_emission_id_seq to service_role;

grant delete, insert, references, select, trigger, truncate, update on public.logistics_emissions to anon;

grant delete, insert, references, select, trigger, truncate, update on public.logistics_emissions to authenticated;

grant delete, insert, references, select, trigger, truncate, update on public.logistics_emissions to service_role;

create table public.water_usage
(
    usage_id              serial
        primary key,
    project_id            integer not null
        references public.projects,
    date                  date    not null,
    source_type           text
        constraint water_usage_source_type_check
            check (source_type = ANY (ARRAY ['mains'::text, 'recycled'::text, 'transported'::text, 'harvested'::text])),
    volume_m3             numeric not null,
    transport_distance_km numeric,
    notes                 text
)
    using ???;

alter table public.water_usage
    owner to postgres;

grant select, update, usage on sequence public.water_usage_usage_id_seq to anon;

grant select, update, usage on sequence public.water_usage_usage_id_seq to authenticated;

grant select, update, usage on sequence public.water_usage_usage_id_seq to service_role;

grant delete, insert, references, select, trigger, truncate, update on public.water_usage to anon;

grant delete, insert, references, select, trigger, truncate, update on public.water_usage to authenticated;

grant delete, insert, references, select, trigger, truncate, update on public.water_usage to service_role;

create table public.electricity_usage
(
    usage_id   serial
        primary key,
    project_id integer not null
        references public.projects,
    date       date    not null,
    usage_kwh  numeric not null,
    source     text
        constraint electricity_usage_source_check
            check (source = ANY (ARRAY ['mains_grid'::text, 'solar'::text, 'generator'::text, 'other'::text])),
    notes      text
)
    using ???;

alter table public.electricity_usage
    owner to postgres;

grant select, update, usage on sequence public.electricity_usage_usage_id_seq to anon;

grant select, update, usage on sequence public.electricity_usage_usage_id_seq to authenticated;

grant select, update, usage on sequence public.electricity_usage_usage_id_seq to service_role;

grant delete, insert, references, select, trigger, truncate, update on public.electricity_usage to anon;

grant delete, insert, references, select, trigger, truncate, update on public.electricity_usage to authenticated;

grant delete, insert, references, select, trigger, truncate, update on public.electricity_usage to service_role;

create table public.contractor_companies
(
    company_id      serial
        primary key,
    company_name    text not null
        unique,
    company_address text,
    email_domain    text
)
    using ???;

alter table public.contractor_companies
    owner to postgres;

grant select, update, usage on sequence public.contractor_companies_company_id_seq to anon;

grant select, update, usage on sequence public.contractor_companies_company_id_seq to authenticated;

grant select, update, usage on sequence public.contractor_companies_company_id_seq to service_role;

grant delete, insert, references, select, trigger, truncate, update on public.contractor_companies to anon;

grant delete, insert, references, select, trigger, truncate, update on public.contractor_companies to authenticated;

grant delete, insert, references, select, trigger, truncate, update on public.contractor_companies to service_role;

create table public.contractor_staff
(
    staff_id   serial
        primary key,
    company_id integer not null
        references public.contractor_companies,
    first_name text    not null,
    last_name  text    not null,
    email      text,
    mobile     text
)
    using ???;

alter table public.contractor_staff
    owner to postgres;

grant select, update, usage on sequence public.contractor_staff_staff_id_seq to anon;

grant select, update, usage on sequence public.contractor_staff_staff_id_seq to authenticated;

grant select, update, usage on sequence public.contractor_staff_staff_id_seq to service_role;

create index idx_contractor_staff_company
    on public.contractor_staff using ??? (company_id);

grant delete, insert, references, select, trigger, truncate, update on public.contractor_staff to anon;

grant delete, insert, references, select, trigger, truncate, update on public.contractor_staff to authenticated;

grant delete, insert, references, select, trigger, truncate, update on public.contractor_staff to service_role;

create table public.project_roles
(
    role_id   serial
        primary key,
    role_name text not null
        unique
)
    using ???;

alter table public.project_roles
    owner to postgres;

grant select, update, usage on sequence public.project_roles_role_id_seq to anon;

grant select, update, usage on sequence public.project_roles_role_id_seq to authenticated;

grant select, update, usage on sequence public.project_roles_role_id_seq to service_role;

grant delete, insert, references, select, trigger, truncate, update on public.project_roles to anon;

grant delete, insert, references, select, trigger, truncate, update on public.project_roles to authenticated;

grant delete, insert, references, select, trigger, truncate, update on public.project_roles to service_role;

create table public.project_contractors
(
    project_id integer not null
        references public.projects,
    company_id integer not null
        references public.contractor_companies,
    staff_id   integer not null
        references public.contractor_staff,
    role_id    integer not null
        references public.project_roles,
    start_date date,
    end_date   date,
    primary key (project_id, company_id, staff_id)
)
    using ???;

alter table public.project_contractors
    owner to postgres;

create index idx_project_contractors_project
    on public.project_contractors using ??? (project_id);

create index idx_project_contractors_company
    on public.project_contractors using ??? (company_id);

create index idx_project_contractors_staff
    on public.project_contractors using ??? (staff_id);

grant delete, insert, references, select, trigger, truncate, update on public.project_contractors to anon;

grant delete, insert, references, select, trigger, truncate, update on public.project_contractors to authenticated;

grant delete, insert, references, select, trigger, truncate, update on public.project_contractors to service_role;


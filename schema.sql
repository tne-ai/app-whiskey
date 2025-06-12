create table l_materials
(
    material_id   uuid default gen_random_uuid() not null
        primary key,
    material_name varchar(100)                   not null
        unique
)
    using ???;

alter table l_materials
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on l_materials to anon;

grant delete, insert, references, select, trigger, truncate, update on l_materials to authenticated;

grant delete, insert, references, select, trigger, truncate, update on l_materials to service_role;

create table l_submaterials
(
    submaterial_id    uuid default gen_random_uuid() not null
        primary key,
    material_id       uuid                           not null
        references l_materials,
    submaterial_name  varchar(100)                   not null,
    density_kg_per_m3 numeric,
    unique (material_id, submaterial_name)
)
    using ???;

alter table l_submaterials
    owner to postgres;

create index idx_l_submaterials_material_id
    on l_submaterials using ??? (material_id);

grant delete, insert, references, select, trigger, truncate, update on l_submaterials to anon;

grant delete, insert, references, select, trigger, truncate, update on l_submaterials to authenticated;

grant delete, insert, references, select, trigger, truncate, update on l_submaterials to service_role;

create table l_item_details
(
    item_id            uuid default gen_random_uuid() not null
        constraint l_item_to_submaterial_pkey
            primary key,
    item_name          varchar                        not null,
    submaterial_id     uuid                           not null
        constraint l_item_to_submaterial_submaterial_id_fkey
            references l_submaterials,
    weight_kg          numeric(12, 2),
    volume_m3          double precision,
    default_excess_pct numeric(5, 2)
)
    using ???;

alter table l_item_details
    owner to postgres;

create index idx_l_item_to_submaterial_submaterial_id
    on l_item_details using ??? (submaterial_id);

grant delete, insert, references, select, trigger, truncate, update on l_item_details to anon;

grant delete, insert, references, select, trigger, truncate, update on l_item_details to authenticated;

grant delete, insert, references, select, trigger, truncate, update on l_item_details to service_role;

create table l_site_types
(
    site_type_id   uuid default gen_random_uuid() not null
        primary key,
    site_type_name varchar(50)                    not null
        unique
)
    using ???;

alter table l_site_types
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on l_site_types to anon;

grant delete, insert, references, select, trigger, truncate, update on l_site_types to authenticated;

grant delete, insert, references, select, trigger, truncate, update on l_site_types to service_role;

create table l_land_uses
(
    land_use_id   uuid default gen_random_uuid() not null
        primary key,
    land_use_name varchar(50)                    not null
        unique
)
    using ???;

alter table l_land_uses
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on l_land_uses to anon;

grant delete, insert, references, select, trigger, truncate, update on l_land_uses to authenticated;

grant delete, insert, references, select, trigger, truncate, update on l_land_uses to service_role;

create table l_units
(
    unit_id       uuid default gen_random_uuid() not null
        primary key,
    unit_name     varchar(20)                    not null
        unique,
    unit_category varchar(50)
)
    using ???;

alter table l_units
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on l_units to anon;

grant delete, insert, references, select, trigger, truncate, update on l_units to authenticated;

grant delete, insert, references, select, trigger, truncate, update on l_units to service_role;

create table l_suppliers
(
    supplier_id   uuid default gen_random_uuid() not null
        primary key,
    supplier_name varchar(100)                   not null
        unique,
    contact_info  text
)
    using ???;

alter table l_suppliers
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on l_suppliers to anon;

grant delete, insert, references, select, trigger, truncate, update on l_suppliers to authenticated;

grant delete, insert, references, select, trigger, truncate, update on l_suppliers to service_role;

create table l_vehicle_types
(
    vehicle_type_id   uuid default gen_random_uuid() not null
        primary key,
    vehicle_type_name varchar(50)                    not null
        unique
)
    using ???;

alter table l_vehicle_types
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on l_vehicle_types to anon;

grant delete, insert, references, select, trigger, truncate, update on l_vehicle_types to authenticated;

grant delete, insert, references, select, trigger, truncate, update on l_vehicle_types to service_role;

create table l_disposal_methods
(
    disposal_method_id   uuid default gen_random_uuid() not null
        primary key,
    disposal_method_name varchar(50)                    not null
        unique
)
    using ???;

alter table l_disposal_methods
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on l_disposal_methods to anon;

grant delete, insert, references, select, trigger, truncate, update on l_disposal_methods to authenticated;

grant delete, insert, references, select, trigger, truncate, update on l_disposal_methods to service_role;

create table l_disposal_facilities
(
    disposal_facility_id   uuid default gen_random_uuid() not null
        primary key,
    disposal_facility_name varchar(100),
    facility_address       text
)
    using ???;

alter table l_disposal_facilities
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on l_disposal_facilities to anon;

grant delete, insert, references, select, trigger, truncate, update on l_disposal_facilities to authenticated;

grant delete, insert, references, select, trigger, truncate, update on l_disposal_facilities to service_role;

create table l_machine_types
(
    machine_type_id   uuid default gen_random_uuid() not null
        primary key,
    machine_type_name varchar(100)                   not null
        unique
)
    using ???;

alter table l_machine_types
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on l_machine_types to anon;

grant delete, insert, references, select, trigger, truncate, update on l_machine_types to authenticated;

grant delete, insert, references, select, trigger, truncate, update on l_machine_types to service_role;

create table l_fuel_types
(
    fuel_type_id   uuid default gen_random_uuid() not null
        primary key,
    fuel_type_name varchar(50)                    not null
        unique
)
    using ???;

alter table l_fuel_types
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on l_fuel_types to anon;

grant delete, insert, references, select, trigger, truncate, update on l_fuel_types to authenticated;

grant delete, insert, references, select, trigger, truncate, update on l_fuel_types to service_role;

create table l_resource_types
(
    resource_type_id   uuid default gen_random_uuid() not null
        primary key,
    resource_type_name varchar(50)                    not null
        unique
)
    using ???;

alter table l_resource_types
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on l_resource_types to anon;

grant delete, insert, references, select, trigger, truncate, update on l_resource_types to authenticated;

grant delete, insert, references, select, trigger, truncate, update on l_resource_types to service_role;

create table l_contacts
(
    contact_id   uuid default gen_random_uuid() not null
        primary key,
    contact_name varchar(100)                   not null,
    email        varchar(100)
        unique,
    role         varchar(50),
    mobile       varchar(20),
    company_name varchar(100),
    address      text
)
    using ???;

alter table l_contacts
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on l_contacts to anon;

grant delete, insert, references, select, trigger, truncate, update on l_contacts to authenticated;

grant delete, insert, references, select, trigger, truncate, update on l_contacts to service_role;

create table i_sites
(
    site_id          uuid      default gen_random_uuid() not null
        primary key,
    site_name        varchar(100)                        not null,
    site_address     varchar(255),
    site_city        varchar(100),
    site_state       varchar(50),
    site_postal_code varchar(20),
    site_country     varchar(50),
    site_type_id     uuid
        references l_site_types,
    land_use_id      uuid
        references l_land_uses,
    creation_date    timestamp default CURRENT_TIMESTAMP,
    project_cost     numeric(12, 2),
    floor_area_m_2   numeric(12, 2)
)
    using ???;

alter table i_sites
    owner to postgres;

create index idx_i_sites_site_type_id
    on i_sites using ??? (site_type_id);

create index idx_i_sites_land_use_id
    on i_sites using ??? (land_use_id);

grant delete, insert, references, select, trigger, truncate, update on i_sites to anon;

grant delete, insert, references, select, trigger, truncate, update on i_sites to authenticated;

grant delete, insert, references, select, trigger, truncate, update on i_sites to service_role;

create table i_sites_stages
(
    stage_id   uuid default gen_random_uuid() not null
        constraint i_stages_pkey
            primary key,
    site_id    uuid,
    start_date date,
    end_date   date
)
    using ???;

alter table i_sites_stages
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on i_sites_stages to anon;

grant delete, insert, references, select, trigger, truncate, update on i_sites_stages to authenticated;

grant delete, insert, references, select, trigger, truncate, update on i_sites_stages to service_role;

create table i_materials
(
    material_entry_id     uuid    default gen_random_uuid() not null
        primary key,
    site_id               uuid                              not null
        references i_sites,
    submaterial_id        uuid
        references l_submaterials,
    quantity              numeric(12, 2)                    not null,
    unit_id               uuid
        references l_units,
    weight_kg             numeric(12, 2),
    volume_m3             numeric(12, 2),
    cost_per_unit         numeric(12, 2),
    total_cost            numeric(12, 2),
    supplier_id           uuid
        references l_suppliers,
    delivery_date         date,
    stage_id              uuid,
    notes                 text,
    item_id               uuid,
    arrival_doc_item_name varchar,
    arrival_doc_id        uuid,
    is_valid              boolean default false,
    default_waste_pct     numeric(5, 2),
    id_po                 varchar
)
    using ???;

alter table i_materials
    owner to postgres;

create index idx_i_materials_site_id
    on i_materials using ??? (site_id);

create index idx_i_materials_submaterial_id
    on i_materials using ??? (submaterial_id);

create index idx_i_materials_unit_id
    on i_materials using ??? (unit_id);

create index idx_i_materials_supplier_id
    on i_materials using ??? (supplier_id);

create index idx_i_materials_stage_id
    on i_materials using ??? (stage_id);

grant delete, insert, references, select, trigger, truncate, update on i_materials to anon;

grant delete, insert, references, select, trigger, truncate, update on i_materials to authenticated;

grant delete, insert, references, select, trigger, truncate, update on i_materials to service_role;

create table i_logistics
(
    logistics_id             uuid default gen_random_uuid() not null
        primary key,
    site_id                  uuid                           not null
        references i_sites,
    submaterial_id           uuid                           not null
        references l_submaterials,
    supplier_id              uuid
        references l_suppliers,
    total_material_weight_kg numeric(12, 2),
    delivery_distance_km     integer,
    delivery_date            date,
    delivery_vehicle_type_id uuid
        references l_vehicle_types,
    delivery_notes           text
)
    using ???;

alter table i_logistics
    owner to postgres;

create index idx_i_logistics_site_id
    on i_logistics using ??? (site_id);

create index idx_i_logistics_submaterial_id
    on i_logistics using ??? (submaterial_id);

create index idx_i_logistics_supplier_id
    on i_logistics using ??? (supplier_id);

create index idx_i_logistics_delivery_vehicle_type_id
    on i_logistics using ??? (delivery_vehicle_type_id);

grant delete, insert, references, select, trigger, truncate, update on i_logistics to anon;

grant delete, insert, references, select, trigger, truncate, update on i_logistics to authenticated;

grant delete, insert, references, select, trigger, truncate, update on i_logistics to service_role;

create table i_resource_removal
(
    removal_id           uuid default gen_random_uuid() not null
        primary key,
    site_id              uuid                           not null
        references i_sites,
    submaterial_id       uuid                           not null
        references l_submaterials,
    waste_weight_kg      numeric(12, 2),
    waste_volume_m3      numeric(12, 2),
    removal_distance_km  integer,
    removal_date         date,
    disposal_method_id   uuid
        references l_disposal_methods,
    disposal_facility_id uuid
        references l_disposal_facilities,
    removal_cost         numeric(12, 2),
    removal_notes        text,
    removal_partner_id   uuid,
    appx_resource_value  numeric(12, 2),
    id_po                varchar
)
    using ???;

alter table i_resource_removal
    owner to postgres;

create index idx_i_resource_removal_site_id
    on i_resource_removal using ??? (site_id);

create index idx_i_resource_removal_submaterial_id
    on i_resource_removal using ??? (submaterial_id);

create index idx_i_resource_removal_disposal_method_id
    on i_resource_removal using ??? (disposal_method_id);

create index idx_i_resource_removal_disposal_facility_id
    on i_resource_removal using ??? (disposal_facility_id);

grant delete, insert, references, select, trigger, truncate, update on i_resource_removal to anon;

grant delete, insert, references, select, trigger, truncate, update on i_resource_removal to authenticated;

grant delete, insert, references, select, trigger, truncate, update on i_resource_removal to service_role;

create table i_machine_usage
(
    usage_id                uuid default gen_random_uuid() not null
        primary key,
    site_id                 uuid                           not null
        references i_sites,
    machine_type_id         uuid
        references l_machine_types,
    usage_hours             numeric(10, 2)                 not null,
    fuel_type_id            uuid
        references l_fuel_types,
    fuel_consumption_liters numeric(10, 2),
    co2_emissions_kg        numeric(10, 2),
    usage_date              date,
    stage_id                uuid
        references i_sites_stages,
    notes                   text
)
    using ???;

alter table i_machine_usage
    owner to postgres;

create index idx_i_machine_usage_site_id
    on i_machine_usage using ??? (site_id);

create index idx_i_machine_usage_machine_type_id
    on i_machine_usage using ??? (machine_type_id);

create index idx_i_machine_usage_fuel_type_id
    on i_machine_usage using ??? (fuel_type_id);

create index idx_i_machine_usage_stage_id
    on i_machine_usage using ??? (stage_id);

grant delete, insert, references, select, trigger, truncate, update on i_machine_usage to anon;

grant delete, insert, references, select, trigger, truncate, update on i_machine_usage to authenticated;

grant delete, insert, references, select, trigger, truncate, update on i_machine_usage to service_role;

create table i_water_energy
(
    resource_id         uuid default gen_random_uuid() not null
        primary key,
    site_id             uuid                           not null
        references i_sites,
    resource_type_id    uuid
        references l_resource_types,
    consumption_amount  numeric(12, 2)                 not null,
    consumption_unit_id uuid
        references l_units,
    co2_equivalent_kg   numeric(10, 2),
    cost                numeric(10, 2),
    consumption_date    date,
    stage_id            uuid
        references i_sites_stages,
    notes               text
)
    using ???;

alter table i_water_energy
    owner to postgres;

create index idx_i_water_energy_site_id
    on i_water_energy using ??? (site_id);

create index idx_i_water_energy_resource_type_id
    on i_water_energy using ??? (resource_type_id);

create index idx_i_water_energy_consumption_unit_id
    on i_water_energy using ??? (consumption_unit_id);

create index idx_i_water_energy_stage_id
    on i_water_energy using ??? (stage_id);

grant delete, insert, references, select, trigger, truncate, update on i_water_energy to anon;

grant delete, insert, references, select, trigger, truncate, update on i_water_energy to authenticated;

grant delete, insert, references, select, trigger, truncate, update on i_water_energy to service_role;

create table r_site_details
(
    site_detail_id               uuid      default gen_random_uuid() not null
        primary key,
    site_id                      uuid                                not null
        references i_sites,
    project_name                 varchar(100)                        not null,
    site_type                    varchar(50),
    site_address                 varchar(255),
    land_use                     varchar(50),
    build_type                   varchar(50),
    construction_floor_area_sqm  integer,
    estimated_project_value      numeric(14, 2),
    stories                      integer,
    expected_start_date          date,
    expected_end_date            date,
    building_owner               varchar(100),
    description                  text,
    company_name                 varchar(100),
    project_leader_contact_id    uuid
        references l_contacts,
    resource_manager1_contact_id uuid
        references l_contacts,
    report_generation_date       timestamp default CURRENT_TIMESTAMP
)
    using ???;

alter table r_site_details
    owner to postgres;

create index idx_r_site_details_site_id
    on r_site_details using ??? (site_id);

create index idx_r_site_details_project_leader_contact_id
    on r_site_details using ??? (project_leader_contact_id);

create index idx_r_site_details_resource_manager1_contact_id
    on r_site_details using ??? (resource_manager1_contact_id);

grant delete, insert, references, select, trigger, truncate, update on r_site_details to anon;

grant delete, insert, references, select, trigger, truncate, update on r_site_details to authenticated;

grant delete, insert, references, select, trigger, truncate, update on r_site_details to service_role;

create table r_materials
(
    material_report_id          uuid      default gen_random_uuid() not null
        primary key,
    site_id                     uuid                                not null
        references i_sites,
    material_id                 uuid                                not null
        references l_materials,
    total_weight_kg             numeric(12, 2),
    total_volume_m3             numeric(12, 2),
    total_cost                  numeric(12, 2),
    avg_excess_percentage       numeric(5, 2),
    project_budget              numeric(14, 2),
    material_total_cost         numeric(12, 2),
    materials_budget_percentage numeric(5, 2),
    report_generation_date      timestamp default CURRENT_TIMESTAMP
)
    using ???;

alter table r_materials
    owner to postgres;

create index idx_r_materials_site_id
    on r_materials using ??? (site_id);

create index idx_r_materials_material_id
    on r_materials using ??? (material_id);

grant delete, insert, references, select, trigger, truncate, update on r_materials to anon;

grant delete, insert, references, select, trigger, truncate, update on r_materials to authenticated;

grant delete, insert, references, select, trigger, truncate, update on r_materials to service_role;

create table r_waste
(
    waste_report_id        uuid      default gen_random_uuid() not null
        primary key,
    site_id                uuid                                not null
        references i_sites,
    material_id            uuid                                not null
        references l_materials,
    submaterial_id         uuid                                not null
        references l_submaterials,
    waste_weight_kg        numeric(12, 2),
    waste_volume_m3        numeric(12, 2),
    waste_value            numeric(12, 2),
    removal_cost           numeric(12, 2),
    landfill_weight        numeric(12, 2),
    cleanfill_weight       numeric(12, 2),
    recycle_weight         numeric(12, 2),
    reuse_weight           numeric(12, 2),
    diversion_rate_pct     numeric(5, 2),
    report_generation_date timestamp default CURRENT_TIMESTAMP
)
    using ???;

alter table r_waste
    owner to postgres;

create index idx_r_waste_site_id
    on r_waste using ??? (site_id);

create index idx_r_waste_material_id
    on r_waste using ??? (material_id);

create index idx_r_waste_submaterial_id
    on r_waste using ??? (submaterial_id);

grant delete, insert, references, select, trigger, truncate, update on r_waste to anon;

grant delete, insert, references, select, trigger, truncate, update on r_waste to authenticated;

grant delete, insert, references, select, trigger, truncate, update on r_waste to service_role;

create table r_waste_summary
(
    waste_summary_id            uuid      default gen_random_uuid() not null
        primary key,
    site_id                     uuid                                not null
        references i_sites,
    total_waste_weight_kg       numeric(12, 2),
    total_waste_volume_m3       numeric(12, 2),
    total_waste_value           numeric(12, 2),
    total_removal_cost          numeric(12, 2),
    total_landfill_weight       numeric(12, 2),
    total_cleanfill_weight      numeric(12, 2),
    total_recycle_weight        numeric(12, 2),
    total_reuse_weight          numeric(12, 2),
    diversion_percentage        numeric(5, 2),
    waste_generation_rate_kg_m2 numeric(10, 4),
    report_generation_date      timestamp default CURRENT_TIMESTAMP
)
    using ???;

alter table r_waste_summary
    owner to postgres;

create index idx_r_waste_summary_site_id
    on r_waste_summary using ??? (site_id);

grant delete, insert, references, select, trigger, truncate, update on r_waste_summary to anon;

grant delete, insert, references, select, trigger, truncate, update on r_waste_summary to authenticated;

grant delete, insert, references, select, trigger, truncate, update on r_waste_summary to service_role;

create table r_logistics_emissions
(
    logistics_report_id      uuid      default gen_random_uuid() not null
        primary key,
    site_id                  uuid                                not null
        references i_sites,
    material_id              uuid                                not null
        references l_materials,
    submaterial_id           uuid                                not null
        references l_submaterials,
    supplier                 varchar(100),
    total_material_weight_kg numeric(12, 2),
    waste_weight_kg          numeric(12, 2),
    delivery_distance_km     integer,
    removal_distance_km      integer,
    delivery_emissions_co2   numeric(10, 2),
    removal_emissions_co2    numeric(10, 2),
    total_emissions_co2      numeric(10, 2),
    report_generation_date   timestamp default CURRENT_TIMESTAMP
)
    using ???;

alter table r_logistics_emissions
    owner to postgres;

create index idx_r_logistics_emissions_site_id
    on r_logistics_emissions using ??? (site_id);

create index idx_r_logistics_emissions_material_id
    on r_logistics_emissions using ??? (material_id);

create index idx_r_logistics_emissions_submaterial_id
    on r_logistics_emissions using ??? (submaterial_id);

grant delete, insert, references, select, trigger, truncate, update on r_logistics_emissions to anon;

grant delete, insert, references, select, trigger, truncate, update on r_logistics_emissions to authenticated;

grant delete, insert, references, select, trigger, truncate, update on r_logistics_emissions to service_role;

create table r_logistics_emissions_summary
(
    logistics_summary_id         uuid      default gen_random_uuid() not null
        primary key,
    site_id                      uuid                                not null
        references i_sites,
    total_delivery_emissions_co2 numeric(12, 2),
    total_removal_emissions_co2  numeric(12, 2),
    total_emissions_co2          numeric(12, 2),
    avg_delivery_distance        integer,
    avg_removal_distance         integer,
    avg_total_distance           integer,
    report_generation_date       timestamp default CURRENT_TIMESTAMP
)
    using ???;

alter table r_logistics_emissions_summary
    owner to postgres;

create index idx_r_logistics_emissions_summary_site_id
    on r_logistics_emissions_summary using ??? (site_id);

grant delete, insert, references, select, trigger, truncate, update on r_logistics_emissions_summary to anon;

grant delete, insert, references, select, trigger, truncate, update on r_logistics_emissions_summary to authenticated;

grant delete, insert, references, select, trigger, truncate, update on r_logistics_emissions_summary to service_role;

create table r_embodied_carbon
(
    carbon_report_id         uuid      default gen_random_uuid() not null
        primary key,
    site_id                  uuid                                not null
        references i_sites,
    material_id              uuid                                not null
        references l_materials,
    submaterial_id           uuid                                not null
        references l_submaterials,
    total_material_weight_kg numeric(12, 2),
    waste_weight_kg          numeric(12, 2),
    carbon_factor            numeric(10, 4),
    material_carbon          numeric(12, 2),
    waste_carbon             numeric(12, 2),
    logistics_carbon         numeric(12, 2),
    total_embodied_carbon    numeric(12, 2),
    report_generation_date   timestamp default CURRENT_TIMESTAMP
)
    using ???;

alter table r_embodied_carbon
    owner to postgres;

create index idx_r_embodied_carbon_site_id
    on r_embodied_carbon using ??? (site_id);

create index idx_r_embodied_carbon_material_id
    on r_embodied_carbon using ??? (material_id);

create index idx_r_embodied_carbon_submaterial_id
    on r_embodied_carbon using ??? (submaterial_id);

grant delete, insert, references, select, trigger, truncate, update on r_embodied_carbon to anon;

grant delete, insert, references, select, trigger, truncate, update on r_embodied_carbon to authenticated;

grant delete, insert, references, select, trigger, truncate, update on r_embodied_carbon to service_role;

create table r_embodied_carbon_summary
(
    carbon_summary_id      uuid      default gen_random_uuid() not null
        primary key,
    site_id                uuid                                not null
        references i_sites,
    total_material_carbon  numeric(12, 2),
    total_waste_carbon     numeric(12, 2),
    total_logistics_carbon numeric(12, 2),
    total_embodied_carbon  numeric(12, 2),
    report_generation_date timestamp default CURRENT_TIMESTAMP
)
    using ???;

alter table r_embodied_carbon_summary
    owner to postgres;

create index idx_r_embodied_carbon_summary_site_id
    on r_embodied_carbon_summary using ??? (site_id);

grant delete, insert, references, select, trigger, truncate, update on r_embodied_carbon_summary to anon;

grant delete, insert, references, select, trigger, truncate, update on r_embodied_carbon_summary to authenticated;

grant delete, insert, references, select, trigger, truncate, update on r_embodied_carbon_summary to service_role;

create table r_materials_budget
(
    budget_report_id          uuid      default gen_random_uuid() not null
        primary key,
    site_id                   uuid                                not null
        references i_sites,
    total_project_budget      numeric(14, 2),
    budget_spent_on_materials numeric(14, 2),
    percentage_of_budget      numeric(5, 2),
    report_generation_date    timestamp default CURRENT_TIMESTAMP
)
    using ???;

alter table r_materials_budget
    owner to postgres;

create index idx_r_materials_budget_site_id
    on r_materials_budget using ??? (site_id);

grant delete, insert, references, select, trigger, truncate, update on r_materials_budget to anon;

grant delete, insert, references, select, trigger, truncate, update on r_materials_budget to authenticated;

grant delete, insert, references, select, trigger, truncate, update on r_materials_budget to service_role;

create table i_arrival_documents
(
    arrival_doc_id          uuid    default gen_random_uuid(),
    delivery_date           date,
    arrival_doc_name        varchar,
    arrival_doc_description varchar,
    arrival_doc_text        varchar,
    site_id                 uuid,
    is_valid                boolean default false
)
    using ???;

alter table i_arrival_documents
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on i_arrival_documents to anon;

grant delete, insert, references, select, trigger, truncate, update on i_arrival_documents to authenticated;

grant delete, insert, references, select, trigger, truncate, update on i_arrival_documents to service_role;

create table l_removal_partners
(
    removal_partner_id           uuid default gen_random_uuid(),
    removal_partner_name         varchar,
    removal_partner_contact_info integer
)
    using ???;

alter table l_removal_partners
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on l_removal_partners to anon;

grant delete, insert, references, select, trigger, truncate, update on l_removal_partners to authenticated;

grant delete, insert, references, select, trigger, truncate, update on l_removal_partners to service_role;

create table r_diversion_pct_by_month
(
    year_num      integer,
    month_num     integer
        constraint check_valid_month
            check ((month_num >= 1) AND (month_num <= 12)),
    diversion_pct numeric(5, 2)
)
    using ???;

alter table r_diversion_pct_by_month
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on r_diversion_pct_by_month to anon;

grant delete, insert, references, select, trigger, truncate, update on r_diversion_pct_by_month to authenticated;

grant delete, insert, references, select, trigger, truncate, update on r_diversion_pct_by_month to service_role;

create table r_removal_by_month_and_method
(
    year_num           integer,
    month_num          integer
        constraint check_valid_month
            check ((month_num >= 1) AND (month_num <= 12)),
    disposal_method_id uuid,
    mass_kg            numeric(5, 2)
)
    using ???;

alter table r_removal_by_month_and_method
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on r_removal_by_month_and_method to anon;

grant delete, insert, references, select, trigger, truncate, update on r_removal_by_month_and_method to authenticated;

grant delete, insert, references, select, trigger, truncate, update on r_removal_by_month_and_method to service_role;

create table l_stages
(
    stage_id   uuid default gen_random_uuid(),
    stage_name varchar
)
    using ???;

alter table l_stages
    owner to postgres;

grant delete, insert, references, select, trigger, truncate, update on l_stages to anon;

grant delete, insert, references, select, trigger, truncate, update on l_stages to authenticated;

grant delete, insert, references, select, trigger, truncate, update on l_stages to service_role;
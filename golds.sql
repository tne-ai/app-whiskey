--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: materials; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materials (
    delivery_date text,
    stage text,
    trade_provider text,
    item_name text,
    unit_quantities text,
    unit_measure text,
    purchase_cost_total text,
    id_po text,
    site text
);


ALTER TABLE public.materials OWNER TO postgres;

--
-- Name: project_sites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.project_sites (
    main_contractor text,
    address text,
    main_contact_name text,
    email text,
    phone_number text,
    site_name text,
    site_type text,
    build_type text,
    site_address text,
    project_description text,
    start_date text,
    estimated_finish_date text,
    project_cost text,
    floor_size_sqm_total text,
    building_certification text,
    removal_partner text,
    email_2 text,
    resource_manager text,
    phone_number_2 text,
    email_3 text,
    num_different_units text,
    num_units text,
    floor_area_per_unit_sqm text,
    num_bedrooms text,
    num_stories text,
    cladding_type text,
    type_of_framing text,
    roofing_type text
);


ALTER TABLE public.project_sites OWNER TO postgres;

--
-- Data for Name: materials; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materials (delivery_date, stage, trade_provider, item_name, unit_quantities, unit_measure, purchase_cost_total, id_po, site) FROM stdin;
13/01/2024	Framing	ITM	H1.2 - 100x45 - bracing & steel packing	100	m	378	121564	Murthi 
13/01/2024	Foundation 	Mitre 10 	Freo Rebar HD10 6M Deformed 500E	200	m	1020.4	121564	Murthi 
13/01/2024	Internal Lining	GIB	GIB BD 3000X1200X13MM STANDARD SH	180	m	912.4	121564	Murthi 
13/01/2024	Waterproofing	Placemakers	T/Thene Orange 300MU 4000MM X 25M 100M2	180	m	912.4	58962	Murthi 
13/01/2024	Roofing	The Roofing Store	H1.2 - 100x45 - bracing & steel packing	220	m	1100.56	54415	Murthi 
13/01/2024	Internal Fitout	3M	DI-NOC™ Glass Finishes PA-180DG, Design Glass Film, 1220 mm x 25 m, 1 Roll/Case	180	m	912.5	54545	Murthi 
13/01/2024	External Fitout 	CSR building	Hebel walls	320	sheet	39000	56149	Murthi 
13/01/2024	Internal Fitout 	Elite Insulation 	Pink Batts R1.0 1220 x 580 x 40mm 21.2m	56	sheet	8600	64165	Murthi 
\.


--
-- Data for Name: project_sites; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.project_sites (main_contractor, address, main_contact_name, email, phone_number, site_name, site_type, build_type, site_address, project_description, start_date, estimated_finish_date, project_cost, floor_size_sqm_total, building_certification, removal_partner, email_2, resource_manager, phone_number_2, email_3, num_different_units, num_units, floor_area_per_unit_sqm, num_bedrooms, num_stories, cladding_type, type_of_framing, roofing_type) FROM stdin;
Sentinel Homes	129 Tristram Street, Hamilton Central, Hamilton 3204	Jono Kraelzin 	Jonok@sentinelhomes.co.nz	021 123 4985	Murthi 	Construction 	Residential - Single House	5 Barrance Avenue, Rototuna North, Hamilton 3210, New Zealand	Single story, greenfield site 	23/05/2024	28/04/2025	$1,325,578.52 	270m2	N/A	Green Gorilla	imatwat@gg.co.nz	Geoff Smith 	021 541 8484	Geoff@sentinel.co.nz	1	1	270m2	4	1	Brick	Steel	Colour Steel
Jalcon Homes	1 Hastings Road, Hobsonville	Simon Clark	Simon@jalcon.co.nz 	027 201 9337	Midgley Stage 2 Block 4	Construction 	Residential - Multi-Unit-Development	107-115 Tahingamanu Road, Hobsonville, Auckland 0616	New build construction of units	1/1/25	24/12/25	$5,000,000.00 	800m2	HomeStar	Waste Managament	wm@wm.co.nz	Simon Clark	027 201 9337	Simon@jalcon.co.nz 	2	8	100m2	2	2	Weatherboard, Fibre Cement	Timber	Long-run Steel
\.


--
-- PostgreSQL database dump complete
--


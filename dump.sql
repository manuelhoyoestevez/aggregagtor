--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.2
-- Dumped by pg_dump version 9.6.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: postgres; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- Name: bjumper; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA bjumper;


--
-- Name: bjumperHistory; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA "bjumperHistory";


--
-- Name: bjumperv2; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA bjumperv2;


--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = bjumper, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: rack; Type: TABLE; Schema: bjumper; Owner: -
--

CREATE TABLE rack (
    id integer NOT NULL,
    parentid integer,
    name character varying(250) NOT NULL,
    total_u integer,
    used_u double precision,
    clientid character varying(250),
    free_u integer,
    empty boolean
);


--
-- Name: Rack_idRack_seq; Type: SEQUENCE; Schema: bjumper; Owner: -
--

CREATE SEQUENCE "Rack_idRack_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Rack_idRack_seq; Type: SEQUENCE OWNED BY; Schema: bjumper; Owner: -
--

ALTER SEQUENCE "Rack_idRack_seq" OWNED BY rack.id;


--
-- Name: row; Type: TABLE; Schema: bjumper; Owner: -
--

CREATE TABLE "row" (
    id integer NOT NULL,
    parentid integer,
    name character varying(250) NOT NULL,
    used_u double precision,
    clientid character varying(250),
    total_u integer,
    free_u integer
);


--
-- Name: Row_idRow_seq; Type: SEQUENCE; Schema: bjumper; Owner: -
--

CREATE SEQUENCE "Row_idRow_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Row_idRow_seq; Type: SEQUENCE OWNED BY; Schema: bjumper; Owner: -
--

ALTER SEQUENCE "Row_idRow_seq" OWNED BY "row".id;


--
-- Name: alarmhistory; Type: TABLE; Schema: bjumper; Owner: -
--

CREATE TABLE alarmhistory (
    "timestamp" timestamp with time zone,
    total integer,
    information integer,
    warning integer,
    failure integer,
    critical integer
);


--
-- Name: alarmhistoryv2; Type: TABLE; Schema: bjumper; Owner: -
--

CREATE TABLE alarmhistoryv2 (
    "timestamp" timestamp with time zone,
    severity character varying(255),
    value integer
);


--
-- Name: dc; Type: TABLE; Schema: bjumper; Owner: -
--

CREATE TABLE dc (
    parentid integer,
    name character varying(255) NOT NULL,
    clientid character varying(250),
    total_u integer,
    used_u integer,
    free_u integer,
    "%it_u" real,
    "%com_u" real,
    "%patch_u" real,
    "%san_u" real,
    id integer NOT NULL
);


--
-- Name: dc_id_seq; Type: SEQUENCE; Schema: bjumper; Owner: -
--

CREATE SEQUENCE dc_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dc_id_seq; Type: SEQUENCE OWNED BY; Schema: bjumper; Owner: -
--

ALTER SEQUENCE dc_id_seq OWNED BY dc.id;


--
-- Name: room; Type: TABLE; Schema: bjumper; Owner: -
--

CREATE TABLE room (
    id integer NOT NULL,
    clientid character varying(250),
    name character varying(250),
    used_u double precision,
    total_u double precision,
    free_u double precision,
    parentid integer
);


--
-- Name: room_id_seq; Type: SEQUENCE; Schema: bjumper; Owner: -
--

CREATE SEQUENCE room_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: room_id_seq; Type: SEQUENCE OWNED BY; Schema: bjumper; Owner: -
--

ALTER SEQUENCE room_id_seq OWNED BY room.id;


--
-- Name: top10racks_example; Type: TABLE; Schema: bjumper; Owner: -
--

CREATE TABLE top10racks_example (
    rack character varying(255),
    occupiedus integer,
    site character varying(255),
    room character varying(255)
);


--
-- Name: top5racks_example; Type: TABLE; Schema: bjumper; Owner: -
--

CREATE TABLE top5racks_example (
    "timestamp" date,
    rack character varying(255),
    room character varying(255),
    site character varying(255),
    occupationus numeric(10,2),
    "draw(kw)" numeric(10,2)
);


SET search_path = bjumperv2, pg_catalog;

--
-- Name: Item; Type: TABLE; Schema: bjumperv2; Owner: -
--

CREATE TABLE "Item" (
    "idItem" integer NOT NULL,
    "Name" character varying(250),
    "idItemClass" integer,
    "idParent" integer,
    "Active" boolean
);


--
-- Name: ItemClass; Type: TABLE; Schema: bjumperv2; Owner: -
--

CREATE TABLE "ItemClass" (
    "idItemClass" integer NOT NULL,
    "Name" character varying(250)
);


--
-- Name: ItemClass-Measure; Type: TABLE; Schema: bjumperv2; Owner: -
--

CREATE TABLE "ItemClass-Measure" (
    "idItemClass" integer,
    "idMeasure" integer
);


--
-- Name: ItemClass_idItemClass_seq; Type: SEQUENCE; Schema: bjumperv2; Owner: -
--

CREATE SEQUENCE "ItemClass_idItemClass_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ItemClass_idItemClass_seq; Type: SEQUENCE OWNED BY; Schema: bjumperv2; Owner: -
--

ALTER SEQUENCE "ItemClass_idItemClass_seq" OWNED BY "ItemClass"."idItemClass";


--
-- Name: Item_idItem_seq; Type: SEQUENCE; Schema: bjumperv2; Owner: -
--

CREATE SEQUENCE "Item_idItem_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Item_idItem_seq; Type: SEQUENCE OWNED BY; Schema: bjumperv2; Owner: -
--

ALTER SEQUENCE "Item_idItem_seq" OWNED BY "Item"."idItem";


--
-- Name: Measure; Type: TABLE; Schema: bjumperv2; Owner: -
--

CREATE TABLE "Measure" (
    "idMeasure" integer NOT NULL,
    "Name" character varying(250),
    "UnitName" character varying(250),
    "idUnitDataType" integer
);


--
-- Name: MeasureValue; Type: TABLE; Schema: bjumperv2; Owner: -
--

CREATE TABLE "MeasureValue" (
    "idMeasureValue" integer NOT NULL,
    "idItem" integer,
    "idMeasure" integer,
    "Value" character varying(250),
    "MeasureTimestamp" timestamp without time zone,
    "idOriginSystem" integer
);


--
-- Name: MeasureValue_idMeasureValue_seq; Type: SEQUENCE; Schema: bjumperv2; Owner: -
--

CREATE SEQUENCE "MeasureValue_idMeasureValue_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: MeasureValue_idMeasureValue_seq; Type: SEQUENCE OWNED BY; Schema: bjumperv2; Owner: -
--

ALTER SEQUENCE "MeasureValue_idMeasureValue_seq" OWNED BY "MeasureValue"."idMeasureValue";


--
-- Name: Measure_idMeasure_seq; Type: SEQUENCE; Schema: bjumperv2; Owner: -
--

CREATE SEQUENCE "Measure_idMeasure_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: Measure_idMeasure_seq; Type: SEQUENCE OWNED BY; Schema: bjumperv2; Owner: -
--

ALTER SEQUENCE "Measure_idMeasure_seq" OWNED BY "Measure"."idMeasure";


--
-- Name: OriginSystem; Type: TABLE; Schema: bjumperv2; Owner: -
--

CREATE TABLE "OriginSystem" (
    "idOriginSystem" integer NOT NULL,
    "Name" character varying(250)
);


--
-- Name: OriginSystem-Item; Type: TABLE; Schema: bjumperv2; Owner: -
--

CREATE TABLE "OriginSystem-Item" (
    "idOriginSystem" integer,
    "idItem" integer,
    "idIteminOrigin" character varying(250)
);


--
-- Name: OriginSystem_idOriginSystem_seq; Type: SEQUENCE; Schema: bjumperv2; Owner: -
--

CREATE SEQUENCE "OriginSystem_idOriginSystem_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: OriginSystem_idOriginSystem_seq; Type: SEQUENCE OWNED BY; Schema: bjumperv2; Owner: -
--

ALTER SEQUENCE "OriginSystem_idOriginSystem_seq" OWNED BY "OriginSystem"."idOriginSystem";


--
-- Name: UnitDataType; Type: TABLE; Schema: bjumperv2; Owner: -
--

CREATE TABLE "UnitDataType" (
    "idUnitDataType" integer NOT NULL,
    "Name" character varying(250)
);


--
-- Name: UnitDataType_idUnitDataType_seq; Type: SEQUENCE; Schema: bjumperv2; Owner: -
--

CREATE SEQUENCE "UnitDataType_idUnitDataType_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: UnitDataType_idUnitDataType_seq; Type: SEQUENCE OWNED BY; Schema: bjumperv2; Owner: -
--

ALTER SEQUENCE "UnitDataType_idUnitDataType_seq" OWNED BY "UnitDataType"."idUnitDataType";


SET search_path = bjumper, pg_catalog;

--
-- Name: dc id; Type: DEFAULT; Schema: bjumper; Owner: -
--

ALTER TABLE ONLY dc ALTER COLUMN id SET DEFAULT nextval('dc_id_seq'::regclass);


--
-- Name: rack id; Type: DEFAULT; Schema: bjumper; Owner: -
--

ALTER TABLE ONLY rack ALTER COLUMN id SET DEFAULT nextval('"Rack_idRack_seq"'::regclass);


--
-- Name: room id; Type: DEFAULT; Schema: bjumper; Owner: -
--

ALTER TABLE ONLY room ALTER COLUMN id SET DEFAULT nextval('room_id_seq'::regclass);


--
-- Name: row id; Type: DEFAULT; Schema: bjumper; Owner: -
--

ALTER TABLE ONLY "row" ALTER COLUMN id SET DEFAULT nextval('"Row_idRow_seq"'::regclass);


SET search_path = bjumperv2, pg_catalog;

--
-- Name: Item idItem; Type: DEFAULT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "Item" ALTER COLUMN "idItem" SET DEFAULT nextval('"Item_idItem_seq"'::regclass);


--
-- Name: ItemClass idItemClass; Type: DEFAULT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "ItemClass" ALTER COLUMN "idItemClass" SET DEFAULT nextval('"ItemClass_idItemClass_seq"'::regclass);


--
-- Name: Measure idMeasure; Type: DEFAULT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "Measure" ALTER COLUMN "idMeasure" SET DEFAULT nextval('"Measure_idMeasure_seq"'::regclass);


--
-- Name: MeasureValue idMeasureValue; Type: DEFAULT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "MeasureValue" ALTER COLUMN "idMeasureValue" SET DEFAULT nextval('"MeasureValue_idMeasureValue_seq"'::regclass);


--
-- Name: OriginSystem idOriginSystem; Type: DEFAULT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "OriginSystem" ALTER COLUMN "idOriginSystem" SET DEFAULT nextval('"OriginSystem_idOriginSystem_seq"'::regclass);


--
-- Name: UnitDataType idUnitDataType; Type: DEFAULT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "UnitDataType" ALTER COLUMN "idUnitDataType" SET DEFAULT nextval('"UnitDataType_idUnitDataType_seq"'::regclass);


SET search_path = bjumper, pg_catalog;

--
-- Name: Rack_idRack_seq; Type: SEQUENCE SET; Schema: bjumper; Owner: -
--

SELECT pg_catalog.setval('"Rack_idRack_seq"', 1, false);


--
-- Name: Row_idRow_seq; Type: SEQUENCE SET; Schema: bjumper; Owner: -
--

SELECT pg_catalog.setval('"Row_idRow_seq"', 1, false);


--
-- Data for Name: alarmhistory; Type: TABLE DATA; Schema: bjumper; Owner: -
--

COPY alarmhistory ("timestamp", total, information, warning, failure, critical) FROM stdin;
\.


--
-- Data for Name: alarmhistoryv2; Type: TABLE DATA; Schema: bjumper; Owner: -
--

COPY alarmhistoryv2 ("timestamp", severity, value) FROM stdin;
\.


--
-- Data for Name: dc; Type: TABLE DATA; Schema: bjumper; Owner: -
--

COPY dc (parentid, name, clientid, total_u, used_u, free_u, "%it_u", "%com_u", "%patch_u", "%san_u", id) FROM stdin;
\N      SC1     673cb62a-1e5d-40f0-91a1-3e788799cbff    \N      \N      \N      \N      \N      \N      \N      1
\N      PL1     a1d64202-194a-4b44-820e-0524bfec20e1    \N      \N      \N      \N      \N      \N      \N      2
\.


--
-- Name: dc_id_seq; Type: SEQUENCE SET; Schema: bjumper; Owner: -
--

SELECT pg_catalog.setval('dc_id_seq', 2, true);


--
-- Data for Name: rack; Type: TABLE DATA; Schema: bjumper; Owner: -
--

COPY rack (id, parentid, name, total_u, used_u, clientid, free_u, empty) FROM stdin;
\.


--
-- Data for Name: room; Type: TABLE DATA; Schema: bjumper; Owner: -
--

COPY room (id, clientid, name, used_u, total_u, free_u, parentid) FROM stdin;
1       9f20756c-1231-4aa0-8e8b-9d2ad72ef6dd    SC1-ACG1        \N      \N      \N      \N
2       5ad8b855-a44f-48fe-8ba1-83a1c3464235    SC1-DC  \N      \N      \N      \N
3       1b766edc-2667-44b1-8bb9-41f572757bff    P2-DC   \N      \N      \N      \N
\.


--
-- Name: room_id_seq; Type: SEQUENCE SET; Schema: bjumper; Owner: -
--

SELECT pg_catalog.setval('room_id_seq', 3, true);


--
-- Data for Name: row; Type: TABLE DATA; Schema: bjumper; Owner: -
--

COPY "row" (id, parentid, name, used_u, clientid, total_u, free_u) FROM stdin;
\.


--
-- Data for Name: top10racks_example; Type: TABLE DATA; Schema: bjumper; Owner: -
--

COPY top10racks_example (rack, occupiedus, site, room) FROM stdin;
\.


--
-- Data for Name: top5racks_example; Type: TABLE DATA; Schema: bjumper; Owner: -
--

COPY top5racks_example ("timestamp", rack, room, site, occupationus, "draw(kw)") FROM stdin;
\.


SET search_path = bjumperv2, pg_catalog;

--
-- Data for Name: Item; Type: TABLE DATA; Schema: bjumperv2; Owner: -
--

COPY "Item" ("idItem", "Name", "idItemClass", "idParent", "Active") FROM stdin;
\.


--
-- Data for Name: ItemClass; Type: TABLE DATA; Schema: bjumperv2; Owner: -
--

COPY "ItemClass" ("idItemClass", "Name") FROM stdin;
1       Datacenter
2       Room
3       Row
4       Rack
5       Server
6       Sensor
\.


--
-- Data for Name: ItemClass-Measure; Type: TABLE DATA; Schema: bjumperv2; Owner: -
--

COPY "ItemClass-Measure" ("idItemClass", "idMeasure") FROM stdin;
\.


--
-- Name: ItemClass_idItemClass_seq; Type: SEQUENCE SET; Schema: bjumperv2; Owner: -
--

SELECT pg_catalog.setval('"ItemClass_idItemClass_seq"', 6, true);


--
-- Name: Item_idItem_seq; Type: SEQUENCE SET; Schema: bjumperv2; Owner: -
--

SELECT pg_catalog.setval('"Item_idItem_seq"', 1, false);


--
-- Data for Name: Measure; Type: TABLE DATA; Schema: bjumperv2; Owner: -
--

COPY "Measure" ("idMeasure", "Name", "UnitName", "idUnitDataType") FROM stdin;
1       Empty           4
5       IT_U    Percentage      2
6       COM_U   Percentage      2
7       Patch_U Percentage      2
8       SAN_U   Percentage      2
9       COLO            4
10      Customer        CustomerNam     3
11      Divided Option  3
12      Max_Pwr Watt    2
13      Used_Pwr        Watt    2
14      Avail_Pwr       Watt    2
15      Avail_Outlet    Watt    1
16      Total_Outlet    Watt    1
17      UsedSwitchCU    Ports   1
18      UsedSwitchFO    Ports   1
19      AvailSwitchCU   Ports   1
20      AvailSwitchFO   Ports   1
21      Mirrored                4
22      UsedPanelCU_    Ports   1
23      UsedPanelFO_    Ports   1
24      AvailPanelCU_   Ports   1
25      AvailPanelFO_   Ports   1
26      Front_T         2
27      Rear_T          2
28      Delta_T         2
29      HUM             2
30      Used_R          1
31      Free_R          1
32      Used_2R         1
33      Used_3R         1
34      Used_4R         1
35      Charact Option  3
36      Temp    C       2
37      TotalSqmt               2
2       Total_U U       2
3       Used_U  U       2
4       Free_U  U       2
38      PUE             5
\.


--
-- Data for Name: MeasureValue; Type: TABLE DATA; Schema: bjumperv2; Owner: -
--

COPY "MeasureValue" ("idMeasureValue", "idItem", "idMeasure", "Value", "MeasureTimestamp", "idOriginSystem") FROM stdin;
\.


--
-- Name: MeasureValue_idMeasureValue_seq; Type: SEQUENCE SET; Schema: bjumperv2; Owner: -
--

SELECT pg_catalog.setval('"MeasureValue_idMeasureValue_seq"', 1, false);


--
-- Name: Measure_idMeasure_seq; Type: SEQUENCE SET; Schema: bjumperv2; Owner: -
--

SELECT pg_catalog.setval('"Measure_idMeasure_seq"', 38, true);


--
-- Data for Name: OriginSystem; Type: TABLE DATA; Schema: bjumperv2; Owner: -
--

COPY "OriginSystem" ("idOriginSystem", "Name") FROM stdin;
1       iTracs
2       ITA
3       File
\.


--
-- Data for Name: OriginSystem-Item; Type: TABLE DATA; Schema: bjumperv2; Owner: -
--

COPY "OriginSystem-Item" ("idOriginSystem", "idItem", "idIteminOrigin") FROM stdin;
\.


--
-- Name: OriginSystem_idOriginSystem_seq; Type: SEQUENCE SET; Schema: bjumperv2; Owner: -
--

SELECT pg_catalog.setval('"OriginSystem_idOriginSystem_seq"', 3, true);


--
-- Data for Name: UnitDataType; Type: TABLE DATA; Schema: bjumperv2; Owner: -
--

COPY "UnitDataType" ("idUnitDataType", "Name") FROM stdin;
1       Integer
2       Float
3       String
4       Boolean
5       Double
\.


--
-- Name: UnitDataType_idUnitDataType_seq; Type: SEQUENCE SET; Schema: bjumperv2; Owner: -
--

SELECT pg_catalog.setval('"UnitDataType_idUnitDataType_seq"', 5, true);


SET search_path = bjumper, pg_catalog;

--
-- Name: rack Rack_pkey; Type: CONSTRAINT; Schema: bjumper; Owner: -
--

ALTER TABLE ONLY rack
    ADD CONSTRAINT "Rack_pkey" PRIMARY KEY (id);


--
-- Name: row Row_pkey; Type: CONSTRAINT; Schema: bjumper; Owner: -
--

ALTER TABLE ONLY "row"
    ADD CONSTRAINT "Row_pkey" PRIMARY KEY (id);


--
-- Name: dc dc_pkey; Type: CONSTRAINT; Schema: bjumper; Owner: -
--

ALTER TABLE ONLY dc
    ADD CONSTRAINT dc_pkey PRIMARY KEY (id);


--
-- Name: room room_pkey; Type: CONSTRAINT; Schema: bjumper; Owner: -
--

ALTER TABLE ONLY room
    ADD CONSTRAINT room_pkey PRIMARY KEY (id);


SET search_path = bjumperv2, pg_catalog;

--
-- Name: ItemClass ItemClass_pkey; Type: CONSTRAINT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "ItemClass"
    ADD CONSTRAINT "ItemClass_pkey" PRIMARY KEY ("idItemClass");


--
-- Name: Item Item_pkey; Type: CONSTRAINT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "Item"
    ADD CONSTRAINT "Item_pkey" PRIMARY KEY ("idItem");


--
-- Name: MeasureValue MeasureValue_pkey; Type: CONSTRAINT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "MeasureValue"
    ADD CONSTRAINT "MeasureValue_pkey" PRIMARY KEY ("idMeasureValue");


--
-- Name: Measure Measure_pkey; Type: CONSTRAINT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "Measure"
    ADD CONSTRAINT "Measure_pkey" PRIMARY KEY ("idMeasure");


--
-- Name: OriginSystem OriginSystem_pkey; Type: CONSTRAINT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "OriginSystem"
    ADD CONSTRAINT "OriginSystem_pkey" PRIMARY KEY ("idOriginSystem");


--
-- Name: UnitDataType UnitDataType_pkey; Type: CONSTRAINT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "UnitDataType"
    ADD CONSTRAINT "UnitDataType_pkey" PRIMARY KEY ("idUnitDataType");


SET search_path = bjumper, pg_catalog;

--
-- Name: room fk_dcid; Type: FK CONSTRAINT; Schema: bjumper; Owner: -
--

ALTER TABLE ONLY room
    ADD CONSTRAINT fk_dcid FOREIGN KEY (parentid) REFERENCES dc(id);


--
-- Name: row fk_roomid; Type: FK CONSTRAINT; Schema: bjumper; Owner: -
--

ALTER TABLE ONLY "row"
    ADD CONSTRAINT fk_roomid FOREIGN KEY (parentid) REFERENCES room(id);


--
-- Name: rack fk_rowid; Type: FK CONSTRAINT; Schema: bjumper; Owner: -
--

ALTER TABLE ONLY rack
    ADD CONSTRAINT fk_rowid FOREIGN KEY (parentid) REFERENCES "row"(id);


SET search_path = bjumperv2, pg_catalog;

--
-- Name: OriginSystem-Item fk_item; Type: FK CONSTRAINT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "OriginSystem-Item"
    ADD CONSTRAINT fk_item FOREIGN KEY ("idItem") REFERENCES "Item"("idItem");


--
-- Name: MeasureValue fk_item; Type: FK CONSTRAINT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "MeasureValue"
    ADD CONSTRAINT fk_item FOREIGN KEY ("idItem") REFERENCES "Item"("idItem");


--
-- Name: Item fk_itemclass; Type: FK CONSTRAINT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "Item"
    ADD CONSTRAINT fk_itemclass FOREIGN KEY ("idItemClass") REFERENCES "ItemClass"("idItemClass");


--
-- Name: ItemClass-Measure fk_itemclass; Type: FK CONSTRAINT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "ItemClass-Measure"
    ADD CONSTRAINT fk_itemclass FOREIGN KEY ("idItemClass") REFERENCES "ItemClass"("idItemClass");


--
-- Name: ItemClass-Measure fk_measure; Type: FK CONSTRAINT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "ItemClass-Measure"
    ADD CONSTRAINT fk_measure FOREIGN KEY ("idMeasure") REFERENCES "Measure"("idMeasure");


--
-- Name: MeasureValue fk_measure; Type: FK CONSTRAINT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "MeasureValue"
    ADD CONSTRAINT fk_measure FOREIGN KEY ("idMeasure") REFERENCES "Measure"("idMeasure");


--
-- Name: OriginSystem-Item fk_originsystem; Type: FK CONSTRAINT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "OriginSystem-Item"
    ADD CONSTRAINT fk_originsystem FOREIGN KEY ("idOriginSystem") REFERENCES "OriginSystem"("idOriginSystem");


--
-- Name: MeasureValue fk_originsystem; Type: FK CONSTRAINT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "MeasureValue"
    ADD CONSTRAINT fk_originsystem FOREIGN KEY ("idOriginSystem") REFERENCES "OriginSystem"("idOriginSystem");


--
-- Name: Measure fk_unitdatatype; Type: FK CONSTRAINT; Schema: bjumperv2; Owner: -
--

ALTER TABLE ONLY "Measure"
    ADD CONSTRAINT fk_unitdatatype FOREIGN KEY ("idUnitDataType") REFERENCES "UnitDataType"("idUnitDataType");


--
-- PostgreSQL database dump complete
--

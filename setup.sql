SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

CREATE SCHEMA bjumperv2;

SET search_path = bjumper, pg_catalog;
SET default_tablespace = '';
SET default_with_oids = false;
SET search_path = bjumperv2, pg_catalog;

CREATE TABLE "ItemClass" (
    "idItemClass"    BIGSERIAL PRIMARY KEY,
    "Name"           VARCHAR(250) UNIQUE NOT NULL
);

CREATE TABLE "Item" (
    "idItem"         BIGSERIAL PRIMARY KEY,
    "Name"           VARCHAR(250) NOT NULL,
    "idItemClass"    BIGINT NOT NULL,
    "idParent"       BIGINT DEFAULT NULL,
    "Active"         BOOLEAN NOT NULL,
    FOREIGN KEY ("idItemClass") REFERENCES "ItemClass" ("idItemClass"),
    FOREIGN KEY ("idParent") REFERENCES "Item" ("idItem")
);

CREATE TABLE "OriginSystem" (
    "idOriginSystem" BIGSERIAL PRIMARY KEY,
    "Name"           VARCHAR(250) UNIQUE NOT NULL
);

CREATE TABLE "OriginSystem-Item" (
    "idOriginSystem" BIGINT NOT NULL,
    "idIteminOrigin" VARCHAR(250) NOT NULL,
    "idItem"         BIGINT NOT NULL,
    PRIMARY KEY ("idOriginSystem", "idIteminOrigin"),
    FOREIGN KEY ("idOriginSystem") REFERENCES "OriginSystem" ("idOriginSystem"),
    FOREIGN KEY ("idItem") REFERENCES "Item" ("idItem")
);

CREATE TABLE "UnitDataType" (
    "idUnitDataType" BIGSERIAL PRIMARY KEY,
    "Name"           VARCHAR(250) UNIQUE NOT NULL
);

CREATE TABLE "Measure" (
    "idMeasure"      BIGSERIAL PRIMARY KEY,
    "Name"           VARCHAR(250) UNIQUE NOT NULL,
    "UnitName"       VARCHAR(250) DEFAULT NULL,
    "idUnitDataType" BIGINT NOT NULL,
    FOREIGN KEY ("idUnitDataType") REFERENCES "UnitDataType" ("idUnitDataType")
);

CREATE TABLE "ItemClass-Measure" (
    "idItemClass"    BIGINT NOT NULL,
    "idMeasure"      BIGINT NOT NULL,
    PRIMARY KEY ("idItemClass", "idMeasure"),
    FOREIGN KEY ("idItemClass") REFERENCES "ItemClass" ("idItemClass"),
    FOREIGN KEY ("idMeasure") REFERENCES "Measure" ("idMeasure")
);

CREATE TABLE "MeasureValue" (
    "idMeasureValue" BIGSERIAL PRIMARY KEY,
    "idItem"         BIGINT NOT NULL,
    "idMeasure"      BIGINT NOT NULL,
    "idOriginSystem" BIGINT NOT NULL,
    "Value"          VARCHAR(250) DEFAULT NULL,
    "MeasureTimestamp" TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    FOREIGN KEY ("idItem") REFERENCES "Item" ("idItem"),
    FOREIGN KEY ("idMeasure") REFERENCES "Measure" ("idMeasure"),
    FOREIGN KEY ("idOriginSystem") REFERENCES "OriginSystem" ("idOriginSystem")
);

INSERT INTO "OriginSystem" ("idOriginSystem", "Name") VALUES
(1, 'iTracs'),
(2, 'ITA'),
(3, 'File'),
(4, 'Test');

INSERT INTO "ItemClass" ("idItemClass", "Name") VALUES
(1, 'Datacenter'),
(2, 'Room'),
(3, 'Row'),
(4, 'Rack'),
(5, 'Server'),
(6, 'Sensor');

INSERT INTO "UnitDataType" ("idUnitDataType", "Name") VALUES
(1, 'Integer'),
(2, 'Float'),
(3, 'String'),
(4, 'Boolean'),
(5, 'Double');

INSERT INTO "Measure" ("idMeasure", "Name", "UnitName", "idUnitDataType") VALUES
(1,  'Empty',          NULL,           4),
(2,  'Total_U',        'U',            2),
(3,  'Used_U',         'U',            2),
(4,  'Free_U',         'U',            2),
(5,  'IT_U',           'Percentage',   2),
(6,  'COM_U',          'Percentage',   2),
(7,  'Patch_U',        'Percentage',   2),
(8,  'SAN_U',          'Percentage',   2),
(9,  'COLO',            NULL,          4),
(10, 'Customer',        'CustomerNam', 3),
(11, 'Divided',         'Option',      3),
(12, 'Max_Pwr Watt',    NULL,          2),
(13, 'Used_Pwr',        'Watt',        2),
(14, 'Avail_Pwr',       'Watt',        2),
(15, 'Avail_Outlet',    'Watt',        1),
(16, 'Total_Outlet',    'Watt',        1),
(17, 'UsedSwitchCU',    'Ports',       1),
(18, 'UsedSwitchFO',    'Ports',       1),
(19, 'AvailSwitchCU',   'Ports',       1),
(20, 'AvailSwitchFO',   'Ports',       1),
(21, 'Mirrored',         NULL,         4),
(22, 'UsedPanelCU_',    'Ports',       1),
(23, 'UsedPanelFO_',    'Ports',       1),
(24, 'AvailPanelCU_',   'Ports',       1),
(25, 'AvailPanelFO_',   'Ports',       1),
(26, 'Front_T',         NULL,          2),
(27, 'Rear_T',          NULL,          2),
(28, 'Delta_T',         NULL,          2),
(29, 'HUM',             NULL,          2),
(30, 'Used_R',          NULL,          1),
(31, 'Free_R',          NULL,          1),
(32, 'Used_2R',         NULL,          1),
(33, 'Used_3R',         NULL,          1),
(34, 'Used_4R',         NULL,          1),
(35, 'Charact',         'Option',      3),
(36, 'Temp',            'C',           2),
(37, 'TotalSqmt',       NULL,          2),
(38, 'PUE',             NULL,          5);

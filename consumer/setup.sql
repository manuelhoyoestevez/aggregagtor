CREATE SCHEMA bjumper;

CREATE TABLE bjumper.measurement (
  "id"                VARCHAR(255) PRIMARY KEY,
  "process_timestamp" TIMESTAMP
);

CREATE TABLE bjumper.alarmHistory (
  "timestamp"       timestamp with time zone,
  "total"           integer,
  "information"     integer,
  "warning"         integer,
  "failure"         integer,
  "critical"        integer
);

CREATE TABLE bjumper.alarmHistoryV2 (
  "timestamp"       timestamp with time zone,
  "severity"        VARCHAR(255),
  "value"           integer
);

CREATE TABLE bjumper.top10racks_example (
  "rack"            VARCHAR(255),
  "occupiedus"      integer,
  "site"            VARCHAR(255),
  "room"            VARCHAR(255)  
);

CREATE TABLE bjumper.top5racks_example (
  "timestamp"       date,
  "rack"            VARCHAR(255),
  "room"            VARCHAR(255),
  "site"            VARCHAR(255),
  "occupationus"     numeric(10,2),
  "draw(kw)"        numeric(10,2)
);
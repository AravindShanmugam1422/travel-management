-- Run once on an existing database before using client/trip expense links.
ALTER TABLE expenses ADD COLUMN client_name VARCHAR(150) NULL;
ALTER TABLE expenses ADD COLUMN trip_name VARCHAR(150) NULL;
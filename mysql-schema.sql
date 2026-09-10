-- Travel Management System — full schema
-- Run this against YOUR existing database (no CREATE DATABASE / USE here on purpose,
-- since cloud providers like DigitalOcean/Aiven give you a fixed default database).

CREATE TABLE IF NOT EXISTS agents (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id         VARCHAR(64) PRIMARY KEY,
  agent_id   INT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clients (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  agent_id   INT NOT NULL,
  name       VARCHAR(100) NOT NULL,
  phone      VARCHAR(20),
  email      VARCHAR(150),
  notes      VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS passengers (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  client_id     INT NOT NULL,
  full_name     VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS trips (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  client_id  INT NOT NULL,
  agent_id   INT NOT NULL,
  trip_name  VARCHAR(150) NOT NULL,
  start_date DATE,
  end_date   DATE,
  status     VARCHAR(30) DEFAULT 'Planned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS suppliers (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(150) NOT NULL,
  url           VARCHAR(255),
  contact_email VARCHAR(150),
  contact_phone VARCHAR(20),
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itinerary_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  trip_id     INT NOT NULL,
  day_number  INT NOT NULL,
  item_time   TIME,
  description VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id                       INT AUTO_INCREMENT PRIMARY KEY,
  itinerary_item_id        INT NOT NULL,
  supplier_id              INT NOT NULL,
  agent_id                 INT NOT NULL,
  booking_reference        VARCHAR(100),
  supplier_confirmation    VARCHAR(100),
  operator_confirmation    VARCHAR(100),
  amount                   DECIMAL(12,2) NOT NULL,
  currency                 VARCHAR(10) DEFAULT 'INR',
  forex_rate               DECIMAL(12,6) DEFAULT 1,
  amount_in_base_currency  DECIMAL(12,2),
  commission_amount        DECIMAL(12,2) DEFAULT 0,
  paid_by                  ENUM('Agent','Client','Head Office') DEFAULT 'Client',
  payment_date             DATE,
  created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (itinerary_item_id) REFERENCES itinerary_items(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (agent_id) REFERENCES agents(id)
);

CREATE TABLE IF NOT EXISTS agent_expenses (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  agent_id     INT NOT NULL,
  trip_id      INT,
  description  VARCHAR(255) NOT NULL,
  amount       DECIMAL(12,2) NOT NULL,
  currency     VARCHAR(10) DEFAULT 'INR',
  expense_date DATE,
  reimbursed   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL
);

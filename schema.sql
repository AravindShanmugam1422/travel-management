-- Travel Management schema for Aiven MySQL/MariaDB
-- Run this whole file in HeidiSQL (select your Aiven DB, open a Query tab, paste, run)

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('agent','manager','head_office') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clients (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150),
  phone VARCHAR(30),
  type ENUM('Regular','New','VIP') DEFAULT 'Regular',
  status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE trips (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  destination VARCHAR(150),
  start_date DATE NULL,
  end_date DATE NULL,
  status ENUM('Pending','Confirmed','Completed','Cancelled') DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
  id VARCHAR(20) PRIMARY KEY,
  client_name VARCHAR(150),
  trip_name VARCHAR(150),
  travel_date DATE NULL,
  status ENUM('Pending','Confirmed','Paid','Partial','Pending Payment') DEFAULT 'Pending',
  amount DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suppliers (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  type ENUM('Hotel','Travels','Package') DEFAULT 'Hotel',
  contact VARCHAR(50),
  status ENUM('Active','Inactive') DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(150),
  method ENUM('Bank Transfer','UPI','Card','Net Banking','Cash') DEFAULT 'Bank Transfer',
  amount DECIMAL(12,2) DEFAULT 0,
  date DATE NULL,
  status ENUM('Received','Outstanding','Overdue') DEFAULT 'Received',
  proof VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expenses (
  id VARCHAR(20) PRIMARY KEY,
  purpose VARCHAR(150),
  method ENUM('Cash','Card','UPI','Bank Transfer') DEFAULT 'Cash',
  amount DECIMAL(12,2) DEFAULT 0,
  date DATE NULL,
  status ENUM('Paid','Unpaid') DEFAULT 'Unpaid',
  proof VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE itineraries (
  trip_id VARCHAR(20) PRIMARY KEY,
  trip_name VARCHAR(150),
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE itinerary_days (
  id INT AUTO_INCREMENT PRIMARY KEY,
  trip_id VARCHAR(20) NOT NULL,
  label VARCHAR(150),
  day_order INT DEFAULT 0,
  FOREIGN KEY (trip_id) REFERENCES itineraries(trip_id) ON DELETE CASCADE
);

CREATE TABLE itinerary_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  day_id INT NOT NULL,
  time VARCHAR(30),
  text VARCHAR(255),
  FOREIGN KEY (day_id) REFERENCES itinerary_days(id) ON DELETE CASCADE
);

CREATE TABLE reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150),
  rating INT,
  text TEXT,
  review_date VARCHAR(30),
  username VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  text VARCHAR(255),
  time VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data (same as the demo) --

INSERT INTO users (name, username, password, role) VALUES
('Aravind Shanmugam', 'aravind', 'bc077e6df7c08947623320ab3a809073:6c18a55c4d6112c1c553415677cf107c2bcc0b55081e165a2dc2083953b828707e82be3758cb93293a90bd8517e0954abb71049f0fb96dccb7e5b07a5d01ba0b', 'head_office');
-- password for 'aravind' is: admin123

INSERT INTO clients (id,name,email,phone,type,status) VALUES
('CL-001','Ravi Kumar','ravi@example.com','+91 86765 43210','Regular','Active'),
('CL-002','Priya Sharma','priya@example.com','+91 87654 12930','Regular','Active'),
('CL-003','Suresh Babu','suresh@example.com','+91 98543 21098','Regular','Active'),
('CL-004','Karthik S','karthik@example.com','+91 95432 10987','New','Active'),
('CL-005','Meena R','meena@example.com','+91 94321 09876','VIP','Inactive');

INSERT INTO trips (id,name,destination,start_date,end_date,status) VALUES
('TR-001','Kerala Tour','Kerala','2026-09-20','2026-09-25','Confirmed'),
('TR-002','Singapore Trip','Singapore','2026-09-25','2026-10-01','Pending'),
('TR-003','Dubai Holiday','UAE','2026-10-02','2026-10-07','Confirmed'),
('TR-004','Bali Trip','Indonesia','2026-10-10','2026-10-15','Pending'),
('TR-005','Andaman Tour','Andaman','2026-10-18','2026-10-22','Completed');

INSERT INTO bookings (id,client_name,trip_name,travel_date,status,amount) VALUES
('BKG-0001','Ravi Kumar','Kerala Tour','2026-09-20','Confirmed',25000),
('BKG-0002','Priya Sharma','Singapore Trip','2026-09-25','Pending',48500),
('BKG-0003','Suresh Babu','Dubai Holiday','2026-10-02','Paid',72000),
('BKG-0004','Karthik S','Bali Trip','2026-10-10','Partial',115000),
('BKG-0005','Meena R','Andaman Tour','2026-10-18','Pending Payment',38000);

INSERT INTO suppliers (id,name,type,contact,status) VALUES
('SUP-001','Hotel Grand Palace','Hotel','+91 98765 12345','Active'),
('SUP-002','Sky Travels','Travels','+91 87654 98765','Active'),
('SUP-003','Global Tours','Package','+91 76543 87654','Active'),
('SUP-004','Sunshine Hotels','Hotel','+91 65432 76543','Inactive'),
('SUP-005','Wanderlust Travels','Package','+91 54321 65432','Active');

INSERT INTO payments (id,name,method,amount,date,status) VALUES
('PAY-001','Ravi Kumar','Bank Transfer',25000,'2026-09-18','Received'),
('PAY-002','Priya Sharma','UPI',48500,'2026-09-20','Received'),
('PAY-003','Suresh Babu','Card',72000,'2026-09-20','Outstanding'),
('PAY-004','Karthik S','Net Banking',115000,'2026-09-21','Overdue'),
('PAY-005','Meena R','Cash',38000,'2026-09-22','Received');

INSERT INTO expenses (id,purpose,method,amount,date,status) VALUES
('EXP-001','Hotel Stay','Bank Transfer',12500,'2026-09-15','Paid'),
('EXP-002','Fuel','Cash',2000,'2026-09-16','Paid'),
('EXP-003','Food','Card',3600,'2026-09-16','Unpaid'),
('EXP-004','Transport','Card',8900,'2026-09-18','Paid'),
('EXP-005','Marketing','UPI',4500,'2026-09-19','Unpaid');

INSERT INTO itineraries (trip_id, trip_name) VALUES ('TR-002','Singapore Trip');
INSERT INTO itinerary_days (trip_id, label, day_order) VALUES
('TR-002','Day 1 - 25 Sep 2026 (Sat)',1),
('TR-002','Day 2 - 26 Sep 2026 (Sun)',2);
INSERT INTO itinerary_items (day_id, time, text) VALUES
(1,'09:00 AM','Arrival at Singapore Airport'),
(1,'01:00 PM','Hotel Check-in (Marina Bay Sands)'),
(1,'03:00 PM','City Tour'),
(2,'09:00 AM','Universal Studios'),
(2,'05:00 PM','Sentosa Island');

INSERT INTO reviews (name, rating, text, review_date, username) VALUES
('Ravi Kumar',5,'Amazing trip! Everything was well planned. Highly recommend.','15 Sep 2026','ravi'),
('Priya Sharma',5,'Excellent service and support. Will definitely book again.','10 Sep 2026','priya'),
('Suresh Babu',4,'Great experience, very professional team.','05 Sep 2026','suresh');

INSERT INTO notifications (text, time) VALUES
('Client meeting - Blue Sky Tours','17 Sep 2026, 10:00 AM'),
('Hotel confirmation - Singapore Trip','18 Sep 2026, 09:00 AM'),
('Payment due - Global Travels (\u20b945,000)','20 Sep 2026');

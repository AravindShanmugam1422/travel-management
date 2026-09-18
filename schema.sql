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
('CL-005','Meena R','meena@example.com','+91 94321 09876','VIP','Inactive'),
('CL-006','Arjun Nair','arjun@example.com','+91 90000 10001','VIP','Active'),
('CL-007','Divya Menon','divya@example.com','+91 90000 10002','Regular','Active'),
('CL-008','Vikram Singh','vikram@example.com','+91 90000 10003','New','Active'),
('CL-009','Ananya Rao','ananya@example.com','+91 90000 10004','VIP','Active'),
('CL-010','Rahul Das','rahul@example.com','+91 90000 10005','Regular','Inactive'),
('CL-011','Nisha Patel','nisha@example.com','+91 90000 10006','Regular','Active'),
('CL-012','Manoj Iyer','manoj@example.com','+91 90000 10007','New','Active');

INSERT INTO trips (id,name,destination,start_date,end_date,status) VALUES
('TR-001','Kerala Tour','Kerala','2026-09-20','2026-09-25','Confirmed'),
('TR-002','Singapore Trip','Singapore','2026-09-25','2026-10-01','Pending'),
('TR-003','Dubai Holiday','UAE','2026-10-02','2026-10-07','Confirmed'),
('TR-004','Bali Trip','Indonesia','2026-10-10','2026-10-15','Pending'),
('TR-005','Andaman Tour','Andaman','2026-10-18','2026-10-22','Completed'),
('TR-006','Rajasthan Heritage','Rajasthan','2026-11-01','2026-11-07','Confirmed'),
('TR-007','Maldives Escape','Maldives','2026-11-10','2026-11-14','Pending'),
('TR-008','Japan Explorer','Japan','2026-11-20','2026-11-29','Pending'),
('TR-009','Europe Highlights','Europe','2026-12-01','2026-12-12','Confirmed'),
('TR-010','Goa Weekend','Goa','2026-12-15','2026-12-18','Completed'),
('TR-011','Australia Adventure','Australia','2027-01-05','2027-01-15','Pending'),
('TR-012','Himachal Snow Tour','Himachal Pradesh','2027-01-20','2027-01-26','Confirmed');

INSERT INTO bookings (id,client_name,trip_name,travel_date,status,amount) VALUES
('BKG-0001','Ravi Kumar','Kerala Tour','2026-09-20','Confirmed',25000),
('BKG-0002','Priya Sharma','Singapore Trip','2026-09-25','Pending',48500),
('BKG-0003','Suresh Babu','Dubai Holiday','2026-10-02','Paid',72000),
('BKG-0004','Karthik S','Bali Trip','2026-10-10','Partial',115000),
('BKG-0005','Meena R','Andaman Tour','2026-10-18','Pending Payment',38000),
('BKG-0006','Arjun Nair','Rajasthan Heritage','2026-11-01','Confirmed',68000),
('BKG-0007','Divya Menon','Maldives Escape','2026-11-10','Pending',92000),
('BKG-0008','Vikram Singh','Japan Explorer','2026-11-20','Partial',145000),
('BKG-0009','Ananya Rao','Europe Highlights','2026-12-01','Paid',185000),
('BKG-0010','Rahul Das','Goa Weekend','2026-12-15','Confirmed',32000),
('BKG-0011','Nisha Patel','Australia Adventure','2027-01-05','Pending Payment',210000),
('BKG-0012','Manoj Iyer','Himachal Snow Tour','2027-01-20','Pending',56000);

INSERT INTO suppliers (id,name,type,contact,status) VALUES
('SUP-001','Hotel Grand Palace','Hotel','+91 98765 12345','Active'),
('SUP-002','Sky Travels','Travels','+91 87654 98765','Active'),
('SUP-003','Global Tours','Package','+91 76543 87654','Active'),
('SUP-004','Sunshine Hotels','Hotel','+91 65432 76543','Inactive'),
('SUP-005','Wanderlust Travels','Package','+91 54321 65432','Active'),
('SUP-006','Royal Rajasthan Stays','Hotel','+91 54321 11111','Active'),
('SUP-007','Island Blue Resorts','Hotel','+91 54321 22222','Active'),
('SUP-008','Tokyo Connect','Travels','+91 54321 33333','Active'),
('SUP-009','Euro Link Holidays','Package','+91 54321 44444','Active'),
('SUP-010','Mountain Trails','Travels','+91 54321 55555','Inactive');

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

INSERT INTO itineraries (trip_id, trip_name) VALUES
('TR-001','Kerala Tour'),
('TR-003','Dubai Holiday'),
('TR-006','Rajasthan Heritage'),
('TR-009','Europe Highlights');

INSERT INTO itinerary_days (trip_id, label, day_order) VALUES
('TR-001','Day 1 - Arrival in Kochi',1),
('TR-001','Day 2 - Munnar Sightseeing',2),
('TR-003','Day 1 - Dubai City Tour',1),
('TR-003','Day 2 - Desert Safari',2),
('TR-006','Day 1 - Jaipur Heritage Walk',1),
('TR-006','Day 2 - Udaipur Lake Tour',2),
('TR-009','Day 1 - Paris Arrival',1),
('TR-009','Day 2 - Eiffel Tower Tour',2);

INSERT INTO itinerary_items (day_id, time, text) VALUES
(3,'10:00 AM','Arrive at Kochi Airport'),
(3,'02:00 PM','Hotel Check-in and Welcome Lunch'),
(4,'09:00 AM','Munnar Tea Garden Visit'),
(4,'04:00 PM','Mattupetty Dam Sightseeing'),
(5,'10:00 AM','Burj Khalifa and Dubai Mall'),
(5,'07:00 PM','Dubai Marina Dinner Cruise'),
(6,'03:00 PM','Desert Safari Pickup'),
(6,'08:00 PM','BBQ Dinner and Cultural Show'),
(7,'09:00 AM','Amber Fort Visit'),
(7,'02:00 PM','Jaipur City Palace'),
(8,'10:00 AM','Udaipur Lake Palace Boat Ride'),
(8,'05:00 PM','Local Market Walk'),
(9,'11:00 AM','Arrive in Paris and Hotel Check-in'),
(9,'06:00 PM','Seine River Evening Cruise'),
(10,'09:00 AM','Eiffel Tower and Louvre Museum'),
(10,'04:00 PM','Montmartre Walking Tour');

INSERT INTO reviews (name, rating, text, review_date, username) VALUES
('Ravi Kumar',5,'Amazing trip! Everything was well planned. Highly recommend.','15 Sep 2026','ravi'),
('Priya Sharma',5,'Excellent service and support. Will definitely book again.','10 Sep 2026','priya'),
('Suresh Babu',4,'Great experience, very professional team.','05 Sep 2026','suresh');

INSERT INTO notifications (text, time) VALUES
('Client meeting - Blue Sky Tours','17 Sep 2026, 10:00 AM'),
('Hotel confirmation - Singapore Trip','18 Sep 2026, 09:00 AM'),
('Payment due - Global Travels (\u20b945,000)','20 Sep 2026');

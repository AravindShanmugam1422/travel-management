-- Run this file only after the main schema.sql has already been created.
-- It adds extra demo data without recreating or deleting existing tables.

INSERT IGNORE INTO clients (id,name,email,phone,type,status) VALUES
('CL-006','Arjun Nair','arjun@example.com','+91 90000 10001','VIP','Active'),
('CL-007','Divya Menon','divya@example.com','+91 90000 10002','Regular','Active'),
('CL-008','Vikram Singh','vikram@example.com','+91 90000 10003','New','Active'),
('CL-009','Ananya Rao','ananya@example.com','+91 90000 10004','VIP','Active'),
('CL-010','Rahul Das','rahul@example.com','+91 90000 10005','Regular','Inactive'),
('CL-011','Nisha Patel','nisha@example.com','+91 90000 10006','Regular','Active'),
('CL-012','Manoj Iyer','manoj@example.com','+91 90000 10007','New','Active');

INSERT IGNORE INTO trips (id,name,destination,start_date,end_date,status) VALUES
('TR-006','Rajasthan Heritage','Rajasthan','2026-11-01','2026-11-07','Confirmed'),
('TR-007','Maldives Escape','Maldives','2026-11-10','2026-11-14','Pending'),
('TR-008','Japan Explorer','Japan','2026-11-20','2026-11-29','Pending'),
('TR-009','Europe Highlights','Europe','2026-12-01','2026-12-12','Confirmed'),
('TR-010','Goa Weekend','Goa','2026-12-15','2026-12-18','Completed'),
('TR-011','Australia Adventure','Australia','2027-01-05','2027-01-15','Pending'),
('TR-012','Himachal Snow Tour','Himachal Pradesh','2027-01-20','2027-01-26','Confirmed');

INSERT IGNORE INTO bookings (id,client_name,trip_name,travel_date,status,amount) VALUES
('BKG-0006','Arjun Nair','Rajasthan Heritage','2026-11-01','Confirmed',68000),
('BKG-0007','Divya Menon','Maldives Escape','2026-11-10','Pending',92000),
('BKG-0008','Vikram Singh','Japan Explorer','2026-11-20','Partial',145000),
('BKG-0009','Ananya Rao','Europe Highlights','2026-12-01','Paid',185000),
('BKG-0010','Rahul Das','Goa Weekend','2026-12-15','Confirmed',32000),
('BKG-0011','Nisha Patel','Australia Adventure','2027-01-05','Pending Payment',210000),
('BKG-0012','Manoj Iyer','Himachal Snow Tour','2027-01-20','Pending',56000);

INSERT IGNORE INTO suppliers (id,name,type,contact,status) VALUES
('SUP-006','Royal Rajasthan Stays','Hotel','+91 54321 11111','Active'),
('SUP-007','Island Blue Resorts','Hotel','+91 54321 22222','Active'),
('SUP-008','Tokyo Connect','Travels','+91 54321 33333','Active'),
('SUP-009','Euro Link Holidays','Package','+91 54321 44444','Active'),
('SUP-010','Mountain Trails','Travels','+91 54321 55555','Inactive');

INSERT IGNORE INTO itineraries (trip_id, trip_name) VALUES
('TR-001','Kerala Tour'),
('TR-003','Dubai Holiday'),
('TR-006','Rajasthan Heritage'),
('TR-009','Europe Highlights');

INSERT INTO itinerary_days (trip_id,label,day_order)
SELECT 'TR-001','Day 1 - Arrival in Kochi',1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM itinerary_days WHERE trip_id='TR-001' AND day_order=1);
INSERT INTO itinerary_days (trip_id,label,day_order)
SELECT 'TR-001','Day 2 - Munnar Sightseeing',2 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM itinerary_days WHERE trip_id='TR-001' AND day_order=2);
INSERT INTO itinerary_days (trip_id,label,day_order)
SELECT 'TR-003','Day 1 - Dubai City Tour',1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM itinerary_days WHERE trip_id='TR-003' AND day_order=1);
INSERT INTO itinerary_days (trip_id,label,day_order)
SELECT 'TR-003','Day 2 - Desert Safari',2 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM itinerary_days WHERE trip_id='TR-003' AND day_order=2);
INSERT INTO itinerary_days (trip_id,label,day_order)
SELECT 'TR-006','Day 1 - Jaipur Heritage Walk',1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM itinerary_days WHERE trip_id='TR-006' AND day_order=1);
INSERT INTO itinerary_days (trip_id,label,day_order)
SELECT 'TR-006','Day 2 - Udaipur Lake Tour',2 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM itinerary_days WHERE trip_id='TR-006' AND day_order=2);
INSERT INTO itinerary_days (trip_id,label,day_order)
SELECT 'TR-009','Day 1 - Paris Arrival',1 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM itinerary_days WHERE trip_id='TR-009' AND day_order=1);
INSERT INTO itinerary_days (trip_id,label,day_order)
SELECT 'TR-009','Day 2 - Eiffel Tower Tour',2 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM itinerary_days WHERE trip_id='TR-009' AND day_order=2);

INSERT INTO itinerary_items (day_id,time,text)
SELECT d.id,'10:00 AM','Arrive at Kochi Airport' FROM itinerary_days d
WHERE d.trip_id='TR-001' AND d.day_order=1
  AND NOT EXISTS (SELECT 1 FROM itinerary_items i WHERE i.day_id=d.id AND i.text='Arrive at Kochi Airport');
INSERT INTO itinerary_items (day_id,time,text)
SELECT d.id,'02:00 PM','Hotel Check-in and Welcome Lunch' FROM itinerary_days d
WHERE d.trip_id='TR-001' AND d.day_order=1
  AND NOT EXISTS (SELECT 1 FROM itinerary_items i WHERE i.day_id=d.id AND i.text='Hotel Check-in and Welcome Lunch');
INSERT INTO itinerary_items (day_id,time,text)
SELECT d.id,'09:00 AM','Munnar Tea Garden Visit' FROM itinerary_days d
WHERE d.trip_id='TR-001' AND d.day_order=2
  AND NOT EXISTS (SELECT 1 FROM itinerary_items i WHERE i.day_id=d.id AND i.text='Munnar Tea Garden Visit');
INSERT INTO itinerary_items (day_id,time,text)
SELECT d.id,'10:00 AM','Burj Khalifa and Dubai Mall' FROM itinerary_days d
WHERE d.trip_id='TR-003' AND d.day_order=1
  AND NOT EXISTS (SELECT 1 FROM itinerary_items i WHERE i.day_id=d.id AND i.text='Burj Khalifa and Dubai Mall');
INSERT INTO itinerary_items (day_id,time,text)
SELECT d.id,'03:00 PM','Desert Safari Pickup' FROM itinerary_days d
WHERE d.trip_id='TR-003' AND d.day_order=2
  AND NOT EXISTS (SELECT 1 FROM itinerary_items i WHERE i.day_id=d.id AND i.text='Desert Safari Pickup');
INSERT INTO itinerary_items (day_id,time,text)
SELECT d.id,'09:00 AM','Amber Fort Visit' FROM itinerary_days d
WHERE d.trip_id='TR-006' AND d.day_order=1
  AND NOT EXISTS (SELECT 1 FROM itinerary_items i WHERE i.day_id=d.id AND i.text='Amber Fort Visit');
INSERT INTO itinerary_items (day_id,time,text)
SELECT d.id,'10:00 AM','Udaipur Lake Palace Boat Ride' FROM itinerary_days d
WHERE d.trip_id='TR-006' AND d.day_order=2
  AND NOT EXISTS (SELECT 1 FROM itinerary_items i WHERE i.day_id=d.id AND i.text='Udaipur Lake Palace Boat Ride');
INSERT INTO itinerary_items (day_id,time,text)
SELECT d.id,'11:00 AM','Arrive in Paris and Hotel Check-in' FROM itinerary_days d
WHERE d.trip_id='TR-009' AND d.day_order=1
  AND NOT EXISTS (SELECT 1 FROM itinerary_items i WHERE i.day_id=d.id AND i.text='Arrive in Paris and Hotel Check-in');
INSERT INTO itinerary_items (day_id,time,text)
SELECT d.id,'09:00 AM','Eiffel Tower and Louvre Museum' FROM itinerary_days d
WHERE d.trip_id='TR-009' AND d.day_order=2
  AND NOT EXISTS (SELECT 1 FROM itinerary_items i WHERE i.day_id=d.id AND i.text='Eiffel Tower and Louvre Museum');

-- Run once after schema.sql. Existing records remain visible to Head Office and Managers.
ALTER TABLE users ADD COLUMN manager_id INT NULL, ADD COLUMN phone VARCHAR(30), ADD COLUMN email VARCHAR(150), ADD COLUMN avatar_url VARCHAR(255);
ALTER TABLE clients ADD COLUMN assigned_agent_id INT NULL, ADD COLUMN passengers JSON NULL;
ALTER TABLE trips ADD COLUMN assigned_agent_id INT NULL;
ALTER TABLE bookings ADD COLUMN assigned_agent_id INT NULL;
ALTER TABLE notifications ADD COLUMN kind VARCHAR(20) NOT NULL DEFAULT 'notification';

-- Add foreign keys only after all existing user data has been checked.
CREATE INDEX idx_clients_agent ON clients (assigned_agent_id);
CREATE INDEX idx_trips_agent ON trips (assigned_agent_id);
CREATE INDEX idx_bookings_agent ON bookings (assigned_agent_id);

CREATE TABLE IF NOT EXISTS password_reset_requests (
	id INT AUTO_INCREMENT PRIMARY KEY,
	user_id INT NOT NULL,
	username VARCHAR(100) NOT NULL,
	status ENUM('pending','approved','rejected','used') NOT NULL DEFAULT 'pending',
	temporary_password_hash VARCHAR(255),
	expires_at DATETIME,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Run this once on an existing database.
-- It keeps existing rows as notifications and enables separate reminders.
ALTER TABLE notifications
  ADD COLUMN kind VARCHAR(20) NOT NULL DEFAULT 'notification';
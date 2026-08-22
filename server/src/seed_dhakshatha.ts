import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../data/dayflow.db');
const db = new Database(dbPath);

// 1. Ensure HR Admin account exists (Avery Morgan / HR Lead)
const hrEmail = 'avery.morgan@dayflow.co';
const hrPassHash = bcrypt.hashSync('password123', 10);
db.prepare(`INSERT OR REPLACE INTO users (id, email, password_hash, role) VALUES ('DF-1001', ?, ?, 'admin')`).run(hrEmail, hrPassHash);

db.prepare(`INSERT OR REPLACE INTO employees (id, name, initials, email, role, title, department, location, joined, salary, color) 
VALUES ('DF-1001', 'Avery Morgan', 'AM', ?, 'admin', 'People Operations Lead', 'People', 'New York', '2022-01-01', 128000, '#9eb9a8')`).run(hrEmail);

// 2. Ensure Employee Dhakshatha exists
const empEmail = 'dhakshatha@dayflow.co';
const empPassHash = bcrypt.hashSync('password123', 10);
db.prepare(`INSERT OR REPLACE INTO users (id, email, password_hash, role) VALUES ('DF-1250', ?, ?, 'employee')`).run(empEmail, empPassHash);

db.prepare(`INSERT OR REPLACE INTO employees (id, name, initials, email, role, title, department, location, joined, salary, color)
VALUES ('DF-1250', 'Dhakshatha', 'DH', ?, 'employee', 'Software Engineer', 'Engineering', 'Remote', '2023-05-15', 98000, '#d49a7d')`).run(empEmail);

// 3. Insert Pending Paid Leave Request for Dhakshatha
const leaveId = 'l-dhakshatha-' + Date.now();
db.prepare(`INSERT INTO leaves (id, employee_id, type, start, end, days, reason, status, comment)
VALUES (?, 'DF-1250', 'Paid leave', '2025-05-01', '2025-05-05', 5, 'Personal vacation & family event time away', 'pending', '')`).run(leaveId);

// 4. Create Notification for HR Admin
db.prepare(`INSERT INTO notifications (id, employee_id, title, message, type, read)
VALUES (?, 'DF-1001', 'New Time Away Request', 'Dhakshatha requested 5 day(s) of Paid leave (2025-05-01 to 2025-05-05).', 'leave', 0)`).run('n-' + Date.now());

console.log('Successfully inserted Dhakshatha leave request & HR credentials!');

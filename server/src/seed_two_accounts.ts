import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../data/dayflow.db');
const db = new Database(dbPath);

const passwordHash = bcrypt.hashSync('password123', 10);

// 1. Create Dedicated Employee Account (Alex Rivera)
const empEmail = 'alex.employee@dayflow.co';
const empId = 'DF-2001';

db.prepare(`INSERT OR REPLACE INTO users (id, email, password_hash, role) VALUES (?, ?, ?, 'employee')`).run(empId, empEmail, passwordHash);
db.prepare(`INSERT OR REPLACE INTO employees (id, name, initials, email, role, title, department, location, joined, salary, color) 
VALUES (?, 'Alex Rivera', 'AR', ?, 'employee', 'Fullstack Developer', 'Engineering', 'San Francisco', '2023-01-10', 105000, '#6366f1')`).run(empId, empEmail);

// 2. Create Dedicated HR Admin Account (Jordan Taylor)
const hrEmail = 'jordan.hr@dayflow.co';
const hrId = 'DF-3001';

db.prepare(`INSERT OR REPLACE INTO users (id, email, password_hash, role) VALUES (?, ?, ?, 'admin')`).run(hrId, hrEmail, passwordHash);
db.prepare(`INSERT OR REPLACE INTO employees (id, name, initials, email, role, title, department, location, joined, salary, color) 
VALUES (?, 'Jordan Taylor', 'JT', ?, 'admin', 'Senior HR Manager', 'People Operations', 'New York', '2021-08-01', 135000, '#10b981')`).run(hrId, hrEmail);

// 3. Create a fresh Pending Leave Request from Alex Rivera
const leaveId = 'l-alex-' + Date.now();
db.prepare(`INSERT INTO leaves (id, employee_id, type, start, end, days, reason, status, comment)
VALUES (?, ?, 'Paid leave', '2025-05-12', '2025-05-16', 4, 'Annual family vacation and wellness time away', 'pending', '')`).run(leaveId, empId);

// 4. Send Notification to HR Admin Jordan Taylor
db.prepare(`INSERT INTO notifications (id, employee_id, title, message, type, read)
VALUES (?, ?, 'New Time Away Request', 'Alex Rivera requested 4 day(s) of Paid leave (2025-05-12 to 2025-05-16).', 'leave', 0)`).run('n-' + Date.now(), hrId);

console.log('=== DEDICATED ACCOUNTS CREATED SUCCESSFULLY ===');
console.log('Employee:', empEmail);
console.log('HR Admin:', hrEmail);

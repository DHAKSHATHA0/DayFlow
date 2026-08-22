import { Response } from 'express';
import { db } from '../db/database.js';
import { AuthRequest } from '../middleware/auth.js';

export async function getAllAttendance(req: AuthRequest, res: Response) {
  const { employeeId, date } = req.query;

  let query = `SELECT * FROM attendance WHERE 1=1`;
  const params: any[] = [];

  if (employeeId) {
    query += ` AND employee_id = ?`;
    params.push(employeeId);
  }
  if (date) {
    query += ` AND date = ?`;
    params.push(date);
  }

  query += ` ORDER BY date DESC`;

  const records = db.prepare(query).all(...params).map((row: any) => ({
    id: row.id,
    employeeId: row.employee_id,
    date: row.date,
    checkIn: row.check_in,
    checkOut: row.check_out,
    status: row.status
  }));

  res.json(records);
}

export async function toggleAttendance(req: AuthRequest, res: Response) {
  const employeeId = req.user?.id;
  if (!employeeId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const record = db.prepare(`SELECT * FROM attendance WHERE employee_id = ? AND date = ?`).get(employeeId, today) as any;

  if (!record) {
    // Create new check-in
    const newId = `a-${Date.now()}`;
    db.prepare(`
      INSERT INTO attendance (id, employee_id, date, check_in, check_out, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(newId, employeeId, today, nowTime, '', 'present');
  } else {
    // Toggle check-out or re-check-in
    const newCheckOut = record.check_out ? '' : nowTime;
    const newCheckIn = record.check_in || nowTime;
    db.prepare(`
      UPDATE attendance
      SET check_in = ?, check_out = ?
      WHERE id = ?
    `).run(newCheckIn, newCheckOut, record.id);
  }

  const allAttendance = db.prepare(`SELECT * FROM attendance ORDER BY date DESC`).all().map((row: any) => ({
    id: row.id,
    employeeId: row.employee_id,
    date: row.date,
    checkIn: row.check_in,
    checkOut: row.check_out,
    status: row.status
  }));

  res.json(allAttendance);
}

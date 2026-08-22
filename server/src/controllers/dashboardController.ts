import { Response } from 'express';
import { db } from '../db/database.js';
import { AuthRequest } from '../middleware/auth.js';

export async function getDashboardStats(req: AuthRequest, res: Response) {
  const employeesCount = (db.prepare(`SELECT count(*) as count FROM employees`).get() as any).count;

  const today = new Date().toISOString().slice(0, 10);
  const attendanceToday = db.prepare(`SELECT count(*) as count FROM attendance WHERE date = ? AND (status = 'present' OR status = 'late' OR status = 'remote')`).get(today) as any;

  const pendingLeaves = (db.prepare(`SELECT count(*) as count FROM leaves WHERE status = 'pending'`).get() as any).count;
  const payrollTotal = (db.prepare(`SELECT sum(salary) as total FROM employees`).get() as any).total || 0;

  res.json({
    totalEmployees: employeesCount,
    presentToday: attendanceToday.count,
    pendingLeaves,
    annualPayroll: payrollTotal
  });
}

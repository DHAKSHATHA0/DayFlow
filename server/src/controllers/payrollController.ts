import { Response } from 'express';
import { db } from '../db/database.js';
import { AuthRequest } from '../middleware/auth.js';

export async function getPayrollSummary(req: AuthRequest, res: Response) {
  const employees = db.prepare(`SELECT id, name, title, department, salary FROM employees`).all() as any[];

  const totalBase = employees.reduce((sum, e) => sum + e.salary, 0);
  const monthlyGross = totalBase / 12;

  res.json({
    totalEmployees: employees.length,
    annualBaseTotal: totalBase,
    monthlyGrossTotal: monthlyGross,
    nextPayDate: 'Apr 30',
    employees: employees.map(e => ({
      ...e,
      monthlyGross: e.salary / 12
    }))
  });
}

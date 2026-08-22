import { Response } from 'express';
import { db } from '../db/database.js';
import { AuthRequest } from '../middleware/auth.js';

export async function getReportsSummary(req: AuthRequest, res: Response) {
  const employees = db.prepare(`SELECT * FROM employees`).all() as any[];
  const attendance = db.prepare(`SELECT * FROM attendance`).all() as any[];
  const leaves = db.prepare(`SELECT * FROM leaves`).all() as any[];

  // Department headcount
  const departmentCounts: Record<string, number> = {};
  employees.forEach(e => {
    departmentCounts[e.department] = (departmentCounts[e.department] || 0) + 1;
  });

  // Leave breakdown by status & type
  const leaveStats = {
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
    paid: leaves.filter(l => l.type === 'Paid leave').length,
    sick: leaves.filter(l => l.type === 'Sick leave').length,
    unpaid: leaves.filter(l => l.type === 'Unpaid leave').length
  };

  // Attendance rate summary
  const attendanceStats = {
    present: attendance.filter(a => a.status === 'present').length,
    late: attendance.filter(a => a.status === 'late').length,
    remote: attendance.filter(a => a.status === 'remote').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    halfDay: attendance.filter(a => a.status === 'half-day').length
  };

  const totalBasePayroll = employees.reduce((sum, e) => sum + e.salary, 0);

  res.json({
    totalEmployees: employees.length,
    totalBasePayroll,
    monthlyPayroll: totalBasePayroll / 12,
    departmentCounts,
    leaveStats,
    attendanceStats
  });
}

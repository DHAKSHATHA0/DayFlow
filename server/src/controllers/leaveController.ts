import { Response } from 'express';
import { z } from 'zod';
import { db } from '../db/database.js';
import { AuthRequest } from '../middleware/auth.js';
import { createNotification } from './notificationController.js';

const applyLeaveSchema = z.object({
  type: z.enum(['Paid leave', 'Sick leave', 'Unpaid leave']),
  start: z.string().min(1, 'Start date required'),
  end: z.string().min(1, 'End date required'),
  days: z.number().positive(),
  reason: z.string().optional().transform(r => r && r.trim().length > 0 ? r.trim() : 'Personal time away')
});

const updateLeaveStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  comment: z.string().optional()
});

export async function getAllLeaves(req: AuthRequest, res: Response) {
  try {
    const leaves = db.prepare(`SELECT * FROM leaves ORDER BY created_at DESC`).all().map((row: any) => ({
      id: row.id,
      employeeId: row.employee_id,
      type: row.type,
      start: row.start,
      end: row.end,
      days: row.days,
      reason: row.reason,
      status: row.status,
      comment: row.comment
    }));
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch leave requests' });
  }
}

export async function applyLeave(req: AuthRequest, res: Response) {
  const employeeId = req.user?.id;
  if (!employeeId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const result = applyLeaveSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation error', details: result.error.errors });
    return;
  }

  const { type, start, end, days, reason } = result.data;
  const id = `l-${Date.now()}`;

  const emp = db.prepare(`SELECT name FROM employees WHERE id = ?`).get(employeeId) as any;
  const empName = emp?.name || 'Employee';

  db.prepare(`
    INSERT INTO leaves (id, employee_id, type, start, end, days, reason, status, comment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, employeeId, type, start, end, days, reason, 'pending', '');

  // Emit Notification to Admin and Employee
  createNotification('ADMIN', 'New Time Away Request', `${empName} requested ${days} day(s) of ${type} (${start} to ${end}).`, 'leave');
  createNotification(employeeId, 'Time Away Submitted', `Your request for ${days} day(s) of ${type} was submitted for manager review.`, 'leave');

  const leaves = db.prepare(`SELECT * FROM leaves ORDER BY created_at DESC`).all().map((row: any) => ({
    id: row.id,
    employeeId: row.employee_id,
    type: row.type,
    start: row.start,
    end: row.end,
    days: row.days,
    reason: row.reason,
    status: row.status,
    comment: row.comment
  }));

  res.status(201).json(leaves);
}

export async function updateLeaveStatus(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const result = updateLeaveStatusSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: 'Validation error', details: result.error.errors });
    return;
  }

  const { status, comment } = result.data;

  const existing = db.prepare(`SELECT * FROM leaves WHERE id = ?`).get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Leave request not found' });
    return;
  }

  db.prepare(`
    UPDATE leaves
    SET status = ?, comment = ?
    WHERE id = ?
  `).run(status, comment || '', id);

  // Emit notification to Employee
  const notifType = status === 'approved' ? 'success' : 'warning';
  const message = `Your ${existing.type} request (${existing.start} - ${existing.end}) was ${status} by People Ops.${comment ? ' Note: "' + comment + '"' : ''}`;
  createNotification(existing.employee_id, `Time Away Request ${status.toUpperCase()}`, message, notifType);

  const leaves = db.prepare(`SELECT * FROM leaves ORDER BY created_at DESC`).all().map((row: any) => ({
    id: row.id,
    employeeId: row.employee_id,
    type: row.type,
    start: row.start,
    end: row.end,
    days: row.days,
    reason: row.reason,
    status: row.status,
    comment: row.comment
  }));

  res.json(leaves);
}

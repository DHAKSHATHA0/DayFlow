import { Response } from 'express';
import { db } from '../db/database.js';
import { AuthRequest } from '../middleware/auth.js';

export async function getNotifications(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  const role = req.user?.role;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  let query = `SELECT * FROM notifications WHERE employee_id = ? ORDER BY created_at DESC LIMIT 50`;
  const notifications = db.prepare(query).all(userId).map((n: any) => ({
    id: n.id,
    employeeId: n.employee_id,
    title: n.title,
    message: n.message,
    type: n.type,
    read: Boolean(n.read),
    createdAt: n.created_at
  }));

  res.json(notifications);
}

export async function markNotificationRead(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const userId = req.user?.id;

  db.prepare(`UPDATE notifications SET read = 1 WHERE id = ?`).run(id);

  const notifications = db.prepare(`SELECT * FROM notifications WHERE employee_id = ? ORDER BY created_at DESC LIMIT 50`).all(userId).map((n: any) => ({
    id: n.id,
    employeeId: n.employee_id,
    title: n.title,
    message: n.message,
    type: n.type,
    read: Boolean(n.read),
    createdAt: n.created_at
  }));

  res.json(notifications);
}

export async function clearNotifications(req: AuthRequest, res: Response) {
  const userId = req.user?.id;
  if (userId) {
    db.prepare(`DELETE FROM notifications WHERE employee_id = ?`).run(userId);
  }
  res.json([]);
}

export function createNotification(targetRoleOrEmpId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'leave' | 'attendance') {
  let targetEmpIds: string[] = [];

  if (targetRoleOrEmpId === 'ADMIN') {
    const admins = db.prepare(`SELECT id FROM employees WHERE role = 'admin'`).all() as { id: string }[];
    targetEmpIds = admins.map(a => a.id);
    if (targetEmpIds.length === 0) targetEmpIds = ['DF-1001'];
  } else {
    targetEmpIds = [targetRoleOrEmpId];
  }

  const insertStmt = db.prepare(`
    INSERT INTO notifications (id, employee_id, title, message, type, read)
    VALUES (?, ?, ?, ?, ?, 0)
  `);

  targetEmpIds.forEach(empId => {
    const id = `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    try {
      insertStmt.run(id, empId, title, message, type);
    } catch (e) {
      console.error('[Notification Error]', e);
    }
  });
}

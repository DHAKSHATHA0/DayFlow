import { Response } from 'express';
import { db } from '../db/database.js';
import { AuthRequest } from '../middleware/auth.js';

const defaultSettings = {
  companyName: 'Dayflow HRM',
  workStart: '09:00',
  workEnd: '18:00',
  autoApproval: 'disabled',
  emailNotifications: 'enabled',
  securityLevel: 'high'
};

export async function getSettings(req: AuthRequest, res: Response) {
  const rows = db.prepare(`SELECT * FROM settings`).all() as { key: string; value: string }[];
  const settingsObj: Record<string, string> = { ...defaultSettings };
  rows.forEach(r => {
    settingsObj[r.key] = r.value;
  });
  res.json(settingsObj);
}

export async function updateSettings(req: AuthRequest, res: Response) {
  const updates = req.body;
  const insertOrReplace = db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`);

  const transaction = db.transaction(() => {
    Object.entries(updates).forEach(([key, val]) => {
      insertOrReplace.run(key, String(val));
    });
  });

  transaction();

  const rows = db.prepare(`SELECT * FROM settings`).all() as { key: string; value: string }[];
  const settingsObj: Record<string, string> = { ...defaultSettings };
  rows.forEach(r => {
    settingsObj[r.key] = r.value;
  });

  res.json(settingsObj);
}

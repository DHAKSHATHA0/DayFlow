import { Response } from 'express';
import { z } from 'zod';
import { db } from '../db/database.js';
import { AuthRequest } from '../middleware/auth.js';

const updateEmployeeSchema = z.object({
  name: z.string().optional(),
  title: z.string().optional(),
  department: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  salary: z.number().optional(),
  color: z.string().optional()
});

export async function getAllEmployees(req: AuthRequest, res: Response) {
  const employees = db.prepare(`SELECT * FROM employees ORDER BY name ASC`).all();
  res.json(employees);
}

export async function getEmployeeById(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const employee = db.prepare(`SELECT * FROM employees WHERE id = ?`).get(id);

  if (!employee) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }

  res.json(employee);
}

export async function updateEmployee(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const data = updateEmployeeSchema.parse(req.body);

  const existing = db.prepare(`SELECT * FROM employees WHERE id = ?`).get(id) as any;
  if (!existing) {
    res.status(404).json({ error: 'Employee not found' });
    return;
  }

  // Check authorization: Admin can update any field, employee can update personal contact info
  if (req.user?.role !== 'admin' && req.user?.id !== id) {
    res.status(403).json({ error: 'Not authorized to edit this employee profile' });
    return;
  }

  const updatedName = data.name ?? existing.name;
  const initials = updatedName.split(' ').map((x: string) => x[0]).join('').slice(0, 2).toUpperCase();

  db.prepare(`
    UPDATE employees
    SET name = ?, initials = ?, title = ?, department = ?, location = ?, phone = ?, address = ?, salary = ?, color = ?
    WHERE id = ?
  `).run(
    updatedName,
    initials,
    data.title ?? existing.title,
    data.department ?? existing.department,
    data.location ?? existing.location,
    data.phone ?? existing.phone,
    data.address ?? existing.address,
    data.salary ?? existing.salary,
    data.color ?? existing.color,
    id
  );

  const updated = db.prepare(`SELECT * FROM employees WHERE id = ?`).get(id);
  res.json(updated);
}

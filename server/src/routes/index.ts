import { Router } from 'express';
import { login, register, getMe } from '../controllers/authController.js';
import { getAllEmployees, getEmployeeById, updateEmployee } from '../controllers/employeeController.js';
import { getAllAttendance, toggleAttendance } from '../controllers/attendanceController.js';
import { getAllLeaves, applyLeave, updateLeaveStatus } from '../controllers/leaveController.js';
import { getPayrollSummary } from '../controllers/payrollController.js';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Auth routes
router.post('/auth/login', login);
router.post('/auth/register', register);
router.get('/auth/me', authenticateToken, getMe);

// Employee routes
router.get('/employees', authenticateToken, getAllEmployees);
router.get('/employees/:id', authenticateToken, getEmployeeById);
router.put('/employees/:id', authenticateToken, updateEmployee);

// Attendance routes
router.get('/attendance', authenticateToken, getAllAttendance);
router.post('/attendance/toggle', authenticateToken, toggleAttendance);

// Leave routes
router.get('/leaves', authenticateToken, getAllLeaves);
router.post('/leaves', authenticateToken, applyLeave);
router.put('/leaves/:id/status', authenticateToken, requireAdmin, updateLeaveStatus);

// Payroll & Dashboard routes
router.get('/payroll/summary', authenticateToken, getPayrollSummary);
router.get('/dashboard/stats', authenticateToken, getDashboardStats);

// Notification routes
import { getNotifications, markNotificationRead, clearNotifications } from '../controllers/notificationController.js';
router.get('/notifications', authenticateToken, getNotifications);
router.put('/notifications/:id/read', authenticateToken, markNotificationRead);
router.delete('/notifications', authenticateToken, clearNotifications);

// Reports & Settings routes
import { getReportsSummary } from '../controllers/reportsController.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';
router.get('/reports/summary', authenticateToken, getReportsSummary);
router.get('/settings', authenticateToken, getSettings);
router.put('/settings', authenticateToken, requireAdmin, updateSettings);

export default router;

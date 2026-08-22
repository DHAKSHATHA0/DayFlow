import type { Attendance, Employee, Leave, Role } from '@/data/mock';

export type NotificationItem = {
  id: string;
  employeeId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'leave' | 'attendance';
  read: boolean;
  createdAt: string;
};

const API_BASE = '/api';

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('df-token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'API Request failed');
  }
  return data as T;
}

export const api = {
  // Auth
  async login(idOrEmail: string, role: Role) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idOrEmail, password: 'password123', role })
    });
    const data = await handleResponse<{ token: string; user: { employeeId: string; role: Role }; employee: Employee }>(res);
    localStorage.setItem('df-token', data.token);
    return data;
  },

  async register(name: string, email: string, role: Role) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: 'password123', role })
    });
    const data = await handleResponse<{ token: string; user: { employeeId: string; role: Role }; employee: Employee }>(res);
    localStorage.setItem('df-token', data.token);
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse<{ user: { employeeId: string; role: Role }; employee: Employee }>(res);
  },

  logout() {
    localStorage.removeItem('df-token');
  },

  // Employees
  async getEmployees(): Promise<Employee[]> {
    const res = await fetch(`${API_BASE}/employees`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Employee[]>(res);
  },

  async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse<Employee>(res);
  },

  // Attendance
  async getAttendance(): Promise<Attendance[]> {
    const res = await fetch(`${API_BASE}/attendance`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Attendance[]>(res);
  },

  async toggleAttendance(): Promise<Attendance[]> {
    const res = await fetch(`${API_BASE}/attendance/toggle`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return handleResponse<Attendance[]>(res);
  },

  // Leaves
  async getLeaves(): Promise<Leave[]> {
    const res = await fetch(`${API_BASE}/leaves`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Leave[]>(res);
  },

  async applyLeave(data: Omit<Leave, 'id' | 'status' | 'employeeId'>): Promise<Leave[]> {
    const res = await fetch(`${API_BASE}/leaves`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse<Leave[]>(res);
  },

  async updateLeaveStatus(id: string, status: Leave['status'], comment?: string): Promise<Leave[]> {
    const res = await fetch(`${API_BASE}/leaves/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, comment })
    });
    return handleResponse<Leave[]>(res);
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeaders()
    });
    return handleResponse<NotificationItem[]>(res);
  },

  async markNotificationRead(id: string): Promise<NotificationItem[]> {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return handleResponse<NotificationItem[]>(res);
  },

  async clearNotifications(): Promise<NotificationItem[]> {
    const res = await fetch(`${API_BASE}/notifications`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse<NotificationItem[]>(res);
  },

  // Reports
  async getReportsSummary(): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/summary`, {
      headers: getAuthHeaders()
    });
    return handleResponse<any>(res);
  },

  // Settings
  async getSettings(): Promise<Record<string, string>> {
    const res = await fetch(`${API_BASE}/settings`, {
      headers: getAuthHeaders()
    });
    return handleResponse<Record<string, string>>(res);
  },

  async updateSettings(settings: Record<string, string>): Promise<Record<string, string>> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    return handleResponse<Record<string, string>>(res);
  }
};

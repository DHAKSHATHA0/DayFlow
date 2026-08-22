import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { employees as seedEmployees, initialAttendance, initialLeaves, type Attendance, type Employee, type Leave, type Role } from '@/data/mock';
import { api, type NotificationItem } from '@/lib/api';

type User = { employeeId: string; role: Role };
type Ctx = {
  user: User | null;
  employee: Employee | null;
  employees: Employee[];
  attendance: Attendance[];
  leaves: Leave[];
  notifications: NotificationItem[];
  theme: 'light' | 'dark';
  signIn: (id: string, role: Role) => Promise<void>;
  signOut: () => void;
  signUp: (name: string, email: string, role: Role) => Promise<void>;
  toggleTheme: () => void;
  updateEmployee: (id: string, data: Partial<Employee>) => Promise<void>;
  toggleAttendance: () => Promise<void>;
  applyLeave: (data: Omit<Leave, 'id' | 'status' | 'employeeId'>) => Promise<void>;
  updateLeave: (id: string, status: Leave['status'], comment?: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
};

const Context = createContext<Ctx | null>(null);

const read = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => read('df-user', null));
  const [employees, setEmployees] = useState<Employee[]>(() => read('df-employees', seedEmployees));
  const [attendance, setAttendance] = useState<Attendance[]>(() => read('df-attendance', initialAttendance));
  const [leaves, setLeaves] = useState<Leave[]>(() => read('df-leaves', initialLeaves));
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => read('df-theme', 'light'));

  // Sync state to local cache for instant load
  useEffect(() => { localStorage.setItem('df-user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('df-employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('df-attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('df-leaves', JSON.stringify(leaves)); }, [leaves]);
  useEffect(() => {
    localStorage.setItem('df-theme', JSON.stringify(theme));
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Initial backend fetch & real-time synchronization interval
  useEffect(() => {
    async function loadData() {
      if (!localStorage.getItem('df-token')) return;
      try {
        const me = await api.getMe();
        setUser(me.user);

        const [empData, attData, leaveData, notifData] = await Promise.all([
          api.getEmployees(),
          api.getAttendance(),
          api.getLeaves(),
          api.getNotifications()
        ]);
        setEmployees(empData);
        setAttendance(attData);
        setLeaves(leaveData);
        setNotifications(notifData);
      } catch (err) {
        console.warn('[Backend Sync] Operating in local/cached mode:', err);
      }
    }
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const employee = useMemo(() => employees.find(e => e.id === user?.employeeId) || null, [employees, user]);

  const refreshData = async () => {
    try {
      const [empData, attData, leaveData, notifData] = await Promise.all([
        api.getEmployees(),
        api.getAttendance(),
        api.getLeaves(),
        api.getNotifications()
      ]);
      setEmployees(empData);
      setAttendance(attData);
      setLeaves(leaveData);
      setNotifications(notifData);
    } catch (err) {
      console.warn('[Sync Error]', err);
    }
  };

  const signIn = async (id: string, role: Role) => {
    try {
      const result = await api.login(id, role);
      setUser(result.user);
      if (result.employee) {
        setEmployees(prev => {
          const idx = prev.findIndex(e => e.id === result.employee.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = result.employee;
            return next;
          }
          return [result.employee, ...prev];
        });
      }
      await refreshData();
    } catch (err) {
      const found = employees.find(e => e.id.toLowerCase() === id.toLowerCase() || e.email.toLowerCase() === id.toLowerCase());
      setUser({ employeeId: found?.id || (role === 'admin' ? 'DF-1001' : 'DF-1042'), role });
    }
  };

  const signUp = async (name: string, email: string, role: Role) => {
    try {
      const result = await api.register(name, email, role);
      setUser(result.user);
      setEmployees(prev => [result.employee, ...prev]);
      await refreshData();
    } catch (err) {
      const id = `DF-${Math.floor(1200 + Math.random() * 700)}`;
      const initials = name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
      const e: Employee = { id, name, initials, email, role, title: role === 'admin' ? 'People Operations Associate' : 'Team Member', department: 'People', location: 'Remote', joined: 'Today', phone: '', address: '', salary: 72000, color: '#d49a7d' };
      setEmployees(x => [e, ...x]);
      setUser({ employeeId: id, role });
    }
  };

  const signOut = () => {
    api.logout();
    setUser(null);
    setNotifications([]);
  };

  const updateEmployee = async (id: string, data: Partial<Employee>) => {
    try {
      const updated = await api.updateEmployee(id, data);
      setEmployees(xs => xs.map(e => e.id === id ? updated : e));
    } catch (err) {
      setEmployees(xs => xs.map(e => e.id === id ? { ...e, ...data } : e));
    }
  };

  const toggleAttendance = async () => {
    if (!user) return;
    try {
      const updatedAttendance = await api.toggleAttendance();
      setAttendance(updatedAttendance);
    } catch (err) {
      setAttendance(xs => xs.map(a => a.employeeId === user.employeeId && a.date === new Date().toISOString().slice(0, 10) ? ({ ...a, checkOut: a.checkOut ? '' : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), checkIn: a.checkIn || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }) : a));
    }
  };

  const applyLeave = async (data: Omit<Leave, 'id' | 'status' | 'employeeId'>) => {
    try {
      const updatedLeaves = await api.applyLeave(data);
      setLeaves(updatedLeaves);
      const notifs = await api.getNotifications();
      setNotifications(notifs);
    } catch (err) {
      setLeaves(xs => [{ ...data, id: `l-${Date.now()}`, employeeId: user?.employeeId || 'DF-1042', status: 'pending' }, ...xs]);
    }
  };

  const updateLeave = async (id: string, status: Leave['status'], comment?: string) => {
    try {
      const updatedLeaves = await api.updateLeaveStatus(id, status, comment);
      setLeaves(updatedLeaves);
      const notifs = await api.getNotifications();
      setNotifications(notifs);
    } catch (err) {
      setLeaves(xs => xs.map(l => l.id === id ? { ...l, status, comment } : l));
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      const updated = await api.markNotificationRead(id);
      setNotifications(updated);
    } catch (err) {
      setNotifications(xs => xs.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const clearNotifications = async () => {
    try {
      await api.clearNotifications();
      setNotifications([]);
    } catch (err) {
      setNotifications([]);
    }
  };

  const value: Ctx = {
    user,
    employee,
    employees,
    attendance,
    leaves,
    notifications,
    theme,
    signIn,
    signOut,
    signUp,
    toggleTheme: () => setTheme(x => x === 'light' ? 'dark' : 'light'),
    updateEmployee,
    toggleAttendance,
    applyLeave,
    updateLeave,
    markNotificationRead,
    clearNotifications
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useApp() {
  const c = useContext(Context);
  if (!c) throw new Error('AppProvider missing');
  return c;
}
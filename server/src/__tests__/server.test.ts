import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';

const BASE_URL = 'http://localhost:5000';

async function request(path: string, options: { method?: string; headers?: Record<string, string>; body?: any } = {}) {
  const headers: Record<string, string> = { ...options.headers };
  let bodyStr: string | undefined;

  if (options.body) {
    headers['Content-Type'] = 'application/json';
    bodyStr = JSON.stringify(options.body);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body: bodyStr
  });

  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }

  return { status: res.status, headers: res.headers, data: json };
}

describe('Dayflow Enterprise Backend Unit & Integration Test Suite', () => {
  let employeeToken: string;
  let adminToken: string;
  let createdLeaveId: string;
  let registeredEmployeeId: string;

  // --- SYSTEM & INFRASTRUCTURE TESTS ---
  describe('System & Infrastructure Endpoints', () => {
    it('GET /health - should return status 200 OK', async () => {
      const res = await request('/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.status, 'ok');
      assert.ok(res.data.timestamp);
    });

    it('GET / - should return 200 OK HTML landing page', async () => {
      const res = await request('/', { headers: { Accept: 'text/html' } });
      assert.strictEqual(res.status, 200);
      assert.ok(typeof res.data === 'string' && res.data.includes('Dayflow Enterprise API'));
    });

    it('GET /.well-known/appspecific/com.chrome.devtools.json - should return 200 OK JSON', async () => {
      const res = await request('/.well-known/appspecific/com.chrome.devtools.json');
      assert.strictEqual(res.status, 200);
      assert.deepStrictEqual(res.data, {});
    });
  });

  // --- AUTHENTICATION UNIT TESTS ---
  describe('Auth Service (POST /api/auth/login & register)', () => {
    it('POST /api/auth/login - should authenticate Employee (maya.chen@dayflow.co)', async () => {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: { idOrEmail: 'maya.chen@dayflow.co', password: 'password123' }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.token);
      assert.strictEqual(res.data.user.role, 'employee');
      assert.strictEqual(res.data.employee.id, 'DF-1042');
      employeeToken = res.data.token;
    });

    it('POST /api/auth/login - should authenticate Admin (avery.morgan@dayflow.co)', async () => {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: { idOrEmail: 'avery.morgan@dayflow.co', password: 'password123', role: 'admin' }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.token);
      assert.strictEqual(res.data.user.role, 'admin');
      assert.strictEqual(res.data.employee.id, 'DF-1001');
      adminToken = res.data.token;
    });

    it('POST /api/auth/login - should fail for non-existent user or short password', async () => {
      const res = await request('/api/auth/login', {
        method: 'POST',
        body: { idOrEmail: 'nonexistent@dayflow.co', password: '123' }
      });
      assert.strictEqual(res.status, 401);
      assert.ok(res.data.error);
    });

    it('POST /api/auth/register - should register new team member', async () => {
      const testEmail = `unit.test.${Date.now()}@dayflow.co`;
      const res = await request('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Sarah Connor',
          email: testEmail,
          password: 'password123',
          role: 'employee'
        }
      });
      assert.strictEqual(res.status, 201);
      assert.ok(res.data.token);
      assert.strictEqual(res.data.employee.name, 'Sarah Connor');
      registeredEmployeeId = res.data.employee.id;
    });

    it('POST /api/auth/register - should reject duplicate email', async () => {
      const res = await request('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'Maya Duplicate',
          email: 'maya.chen@dayflow.co',
          password: 'password123'
        }
      });
      assert.strictEqual(res.status, 400);
      assert.ok(res.data.error.includes('already exists'));
    });

    it('GET /api/auth/me - should return authenticated profile', async () => {
      const res = await request('/api/auth/me', {
        headers: { Authorization: `Bearer ${employeeToken}` }
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.employee.id, 'DF-1042');
    });

    it('GET /api/auth/me - should reject request without token', async () => {
      const res = await request('/api/auth/me');
      assert.strictEqual(res.status, 401);
    });
  });

  // --- EMPLOYEE MANAGEMENT TESTS ---
  describe('Employee Service (GET & PUT /api/employees)', () => {
    it('GET /api/employees - should list all employees for authenticated user', async () => {
      const res = await request('/api/employees', {
        headers: { Authorization: `Bearer ${employeeToken}` }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data));
      assert.ok(res.data.length >= 12);
    });

    it('GET /api/employees/:id - should fetch employee by ID', async () => {
      const res = await request('/api/employees/DF-1042', {
        headers: { Authorization: `Bearer ${employeeToken}` }
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.name, 'Maya Chen');
    });

    it('PUT /api/employees/:id - employee should update own contact info', async () => {
      const res = await request('/api/employees/DF-1042', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${employeeToken}` },
        body: { phone: '+1 415 555 9999', address: '100 Market St, SF' }
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.phone, '+1 415 555 9999');
    });

    it('PUT /api/employees/:id - admin should update salary & title', async () => {
      const res = await request('/api/employees/DF-1042', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { title: 'Senior Product Designer', salary: 98000 }
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.title, 'Senior Product Designer');
      assert.strictEqual(res.data.salary, 98000);
    });
  });

  // --- ATTENDANCE & CHECK-IN TESTS ---
  describe('Attendance Service (GET & POST /api/attendance)', () => {
    it('GET /api/attendance - should fetch attendance logs', async () => {
      const res = await request('/api/attendance', {
        headers: { Authorization: `Bearer ${employeeToken}` }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data));
    });

    it('POST /api/attendance/toggle - should toggle check-in / check-out', async () => {
      const res = await request('/api/attendance/toggle', {
        method: 'POST',
        headers: { Authorization: `Bearer ${employeeToken}` }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data));
    });
  });

  // --- TIME AWAY / LEAVE REQUEST & APPROVAL WORKFLOW TESTS ---
  describe('Leave Management Service (GET, POST, PUT /api/leaves)', () => {
    it('POST /api/leaves - employee should submit leave request', async () => {
      const res = await request('/api/leaves', {
        method: 'POST',
        headers: { Authorization: `Bearer ${employeeToken}` },
        body: {
          type: 'Paid leave',
          start: '2025-07-10',
          end: '2025-07-12',
          days: 3,
          reason: 'Summer vacation test'
        }
      });
      assert.strictEqual(res.status, 201);
      assert.ok(Array.isArray(res.data));
      const created = res.data.find((l: any) => l.reason === 'Summer vacation test');
      assert.ok(created);
      assert.strictEqual(created.status, 'pending');
      createdLeaveId = created.id;
    });

    it('PUT /api/leaves/:id/status - employee cannot approve leave (must be 403 Forbidden)', async () => {
      const res = await request(`/api/leaves/${createdLeaveId}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${employeeToken}` },
        body: { status: 'approved', comment: 'Self approval attempt' }
      });
      assert.strictEqual(res.status, 403);
    });

    it('PUT /api/leaves/:id/status - admin should approve leave with note', async () => {
      const res = await request(`/api/leaves/${createdLeaveId}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { status: 'approved', comment: 'Approved by Admin for Unit Test' }
      });
      assert.strictEqual(res.status, 200);
      const updated = res.data.find((l: any) => l.id === createdLeaveId);
      assert.strictEqual(updated.status, 'approved');
      assert.strictEqual(updated.comment, 'Approved by Admin for Unit Test');
    });

    it('GET /api/leaves - employee should see approved status and admin comment on timeline', async () => {
      const res = await request('/api/leaves', {
        headers: { Authorization: `Bearer ${employeeToken}` }
      });
      assert.strictEqual(res.status, 200);
      const leaveRecord = res.data.find((l: any) => l.id === createdLeaveId);
      assert.strictEqual(leaveRecord.status, 'approved');
      assert.strictEqual(leaveRecord.comment, 'Approved by Admin for Unit Test');
    });
  });

  // --- PAYROLL & DASHBOARD TESTS ---
  describe('Payroll & Dashboard Services', () => {
    it('GET /api/payroll/summary - should calculate company payroll metrics', async () => {
      const res = await request('/api/payroll/summary', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.annualBaseTotal > 0);
      assert.ok(res.data.monthlyGrossTotal > 0);
    });

    it('GET /api/dashboard/stats - should return dashboard metrics', async () => {
      const res = await request('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.totalEmployees >= 12);
      assert.ok(typeof res.data.pendingLeaves === 'number');
    });
  });
});

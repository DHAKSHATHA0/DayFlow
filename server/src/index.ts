import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRouter from './routes/index.js';
import { seedDatabase } from './db/seed.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Logging Middlewares
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Chrome DevTools probe & favicon handler for 100% clean browser console
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  res.status(200).json({});
});
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

// Initialize Database & Seed
seedDatabase();

// Root welcome page for the API server
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Dayflow API Server</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #173d38; color: #f5eedf; margin: 0; padding: 40px; }
          .card { max-width: 600px; margin: 0 auto; background: rgba(255,255,255,0.08); padding: 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.15); }
          h1 { color: #d8bf79; margin-top: 0; }
          .badge { display: inline-block; background: #286147; color: #a9d7ba; padding: 4px 12px; border-radius: 99px; font-weight: bold; font-size: 13px; }
          ul { line-height: 1.8; }
          a { color: #d8bf79; }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="badge">● ONLINE</span>
          <h1>🚀 Dayflow Enterprise API</h1>
          <p>The backend REST API server for Dayflow HR Management is running live.</p>
          <h3>Available Endpoints:</h3>
          <ul>
            <li><a href="/health">GET /health</a> - Health check</li>
            <li><strong>POST /api/auth/login</strong> - Authenticate user</li>
            <li><strong>POST /api/auth/register</strong> - Create account</li>
            <li><strong>GET /api/employees</strong> - List employees</li>
            <li><strong>GET /api/attendance</strong> - Attendance records</li>
            <li><strong>GET /api/leaves</strong> - Leave requests</li>
            <li><strong>GET /api/payroll/summary</strong> - Payroll summary</li>
            <li><strong>GET /api/dashboard/stats</strong> - Overview metrics</li>
          </ul>
          <p style="margin-top:24px; font-size:14px; opacity:0.8;">Frontend running at <a href="http://localhost:5173" target="_blank">http://localhost:5173</a></p>
        </div>
      </body>
      </html>
    `);
  } else {
    res.json({
      message: 'Dayflow Backend REST API Server is operational',
      version: '1.0.0',
      status: 'online',
      endpoints: [
        '/health',
        '/api/auth/login',
        '/api/auth/register',
        '/api/employees',
        '/api/attendance',
        '/api/leaves',
        '/api/payroll/summary',
        '/api/dashboard/stats'
      ]
    });
  }
});

// API Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Dayflow Backend Server listening at http://localhost:${PORT}`);
  console.log(`====================================================`);
});

// import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import jwt, { JwtPayload } from 'jsonwebtoken';
import router from './routes';
import config from './config';

import globalErrorHandler from './middlewares/globalErrorHandler';
import notFound from './middlewares/notFound';

const app: Application = express();

// Trust the reverse proxy (DigitalOcean/nginx) so rate-limit & secure cookies
// see the real client IP, not the proxy's.
app.set('trust proxy', 1);

// Security headers.
app.use(helmet());

// Gzip-compress all responses — big win for mobile clients on slower networks
// (JSON lists shrink ~70-80%, so every screen loads faster).
app.use(compression());

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://deshi-tracker-frontend-bwt5.vercel.app',
  'https://desitracker.com',
  'https://www.desitracker.com',
];

app.use(
  cors({
    // Note: the native mobile app sends requests with NO Origin header, so
    // `!origin` must stay allowed or the app breaks. Browser origins are
    // restricted to the HTTPS allow-list above.
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Reject the request without throwing — an Error here becomes an
        // unhandled rejection that crashes the whole process (server.ts
        // shuts the server down on any unhandledRejection/uncaughtException).
        callback(null, false);
      }
    },
    credentials: true,
  }),
);

//parsers(middlewares)
app.use(express.json({ limit: '5mb' }));

// Strip any keys containing `$` or `.` from req.body/query/params to block
// NoSQL operator injection (e.g. { "email": { "$ne": null } }).
app.use(mongoSanitize());

// Global rate limit — coarse backstop against abuse/DoS.
//
// Keyed by signed-in user rather than by IP. Every member of staff at one
// venue shares a single public address, so an IP bucket is really a whole
// restaurant's bucket: five people on the same wifi during service were
// spending one allowance between them and hitting the limit in ordinary use.
// The dashboard alone is ten requests each time it comes into focus.
//
// The token is verified, not just read, so a forged or expired one cannot mint
// a fresh bucket — it falls back to the IP like any other anonymous caller.
const rateLimitKey = (req: Request): string => {
  const header = req.headers.authorization;
  const raw = header?.startsWith('Bearer ') ? header.slice(7) : header;
  if (raw && config.jwt.accessSecret) {
    try {
      const decoded = jwt.verify(raw, config.jwt.accessSecret as string) as JwtPayload;
      const id = decoded?.id || decoded?._id || decoded?.userId;
      if (id) return `u:${id}`;
    } catch {
      // Not a valid session — fall through and treat it as anonymous.
    }
  }
  return `ip:${ipKeyGenerator(req.ip || '')}`;
};

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    // Headroom for a screen that fans out to ten endpoints and a person moving
    // briskly between screens, while still stopping anything running away.
    max: 600,
    keyGenerator: rateLimitKey,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests. Please wait a moment and try again.' },
  }),
);

// Tighter limits on credential / code endpoints (brute-force & OTP guessing).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});
app.use('/api/v1/auth/login', authLimiter);
// NOTE: these paths must match the routes actually registered in auth.api.ts.
// The OTP flow lives at /forgot-password-code (not /request-reset-code), and the
// legacy web flow at /forgot-password + /reset-password/:token — all of which
// send email or accept reset tokens, so they must be throttled too.
app.use('/api/v1/auth/forgot-password', authLimiter);
app.use('/api/v1/auth/forgot-password-code', authLimiter);
app.use('/api/v1/auth/reset-password', authLimiter);
app.use('/api/v1/auth/reset-password-code', authLimiter);
app.use('/api/v1/members/login', authLimiter);

// Registration is necessarily public AND accepts a file upload
// (users/register runs multer's upload.single('file') before any auth), so
// without its own limit the only thing standing between an anonymous caller
// and the disk / Cloudinary quota was the 600-a-minute global cap. Account
// creation is not something a real person does repeatedly, so it gets the
// tighter budget the credential endpoints use.
app.use('/api/v1/users/register', authLimiter);
app.use('/api/v1/members/register', authLimiter);

app.use('/api/v1', router);

const test = async (req: Request, res: Response) => {
  res.send('Business Tracker Server is running..');
};
app.get('/', test);

// 404 for unmatched routes must run BEFORE the error handler.
app.use(notFound);
app.use(globalErrorHandler);

export default app;

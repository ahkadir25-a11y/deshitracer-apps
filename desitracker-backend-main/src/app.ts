// import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import router from './routes';

import globalErrorHandler from './middlewares/globalErrorHandler';
import notFound from './middlewares/notFound';

const app: Application = express();
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://8dd9-123-253-215-113.ngrok-free.app',
  'https://deshi-tracker-frontend-bwt5.vercel.app',
  'http://desitracker.com',
  'https://desitracker.com',
  'https://www.desitracker.com',
  'http://www.desitracker.com'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);

//parsers(middlewares)
app.use(express.json({ limit: '100mb' }));
app.use('/api/v1', router);

const test = async (req: Request, res: Response) => {
  res.send('Business Tracker Server is running..');
};
app.get('/', test);
app.use(globalErrorHandler);
app.use(notFound);

export default app;

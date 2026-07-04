import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './config';
import { initSocket } from './utils/socket';
import { startCronJobs } from './utils/cron';
import removePhoneNumberIndex from './modules/user/user/removeIndex';
// import seedSuperAdmin from './app/DB';

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.db_url as string);

    // One-time: drop the stale unique `phone_1` index (legacy schema) so phone
    // duplicates are allowed. Done once here instead of on every registration.
    await removePhoneNumberIndex();

    // seed super admin
    // seedSuperAdmin();

    server = app.listen(config.port, () => {
      console.log(`app is listening on port ${config.port}`);
    });

    // Initialize Socket.IO
    initSocket(server);

    // Start background cron jobs (forgot-to-clock-out reminder, etc.)
    startCronJobs();
  } catch (err) {
    console.log(err);
  }
}

main();

// Graceful shutdown: close HTTP server + DB connection on platform stop signals
// so in-flight requests finish and connections aren't abruptly killed.
const gracefulShutdown = (signal: string) => {
  console.log(`${signal} received. Closing server gracefully...`);
  const finish = () => {
    mongoose.connection.close(false).finally(() => process.exit(0));
  };
  if (server) {
    server.close(finish);
  } else {
    finish();
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.log('unhandledRejection is detected. Server is shutting down...');
  console.error(reason);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.log('uncaughtException occurred. Server is shutting down...');
  console.error(err);
  process.exit(1);
});

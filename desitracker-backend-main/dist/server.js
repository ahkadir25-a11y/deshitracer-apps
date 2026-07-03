"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./config"));
const socket_1 = require("./utils/socket");
const cron_1 = require("./utils/cron");
const removeIndex_1 = __importDefault(require("./modules/user/user/removeIndex"));
// import seedSuperAdmin from './app/DB';
let server;
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(config_1.default.db_url);
            // One-time: drop the stale unique `phone_1` index (legacy schema) so phone
            // duplicates are allowed. Done once here instead of on every registration.
            yield (0, removeIndex_1.default)();
            // seed super admin
            // seedSuperAdmin();
            server = app_1.default.listen(config_1.default.port, () => {
                console.log(`app is listening on port ${config_1.default.port}`);
            });
            // Initialize Socket.IO
            (0, socket_1.initSocket)(server);
            // Start background cron jobs (forgot-to-clock-out reminder, etc.)
            (0, cron_1.startCronJobs)();
        }
        catch (err) {
            console.log(err);
        }
    });
}
main();
// Graceful shutdown: close HTTP server + DB connection on platform stop signals
// so in-flight requests finish and connections aren't abruptly killed.
const gracefulShutdown = (signal) => {
    console.log(`${signal} received. Closing server gracefully...`);
    const finish = () => {
        mongoose_1.default.connection.close(false).finally(() => process.exit(0));
    };
    if (server) {
        server.close(finish);
    }
    else {
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
    }
    process.exit(1);
});
process.on('uncaughtException', (err) => {
    console.log('uncaughtException occurred. Server is shutting down...');
    console.error(err);
    process.exit(1);
});

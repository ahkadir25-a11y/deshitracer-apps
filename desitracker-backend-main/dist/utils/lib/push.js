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
exports.sendExpoPush = sendExpoPush;
const https_1 = __importDefault(require("https"));
// Send one or more messages to the Expo push service.
// Silently ignores invalid / unregistered tokens — no throw on partial failure.
function sendExpoPush(messages) {
    return __awaiter(this, void 0, void 0, function* () {
        const batch = Array.isArray(messages) ? messages : [messages];
        if (!batch.length)
            return;
        const payload = JSON.stringify(batch.map((m) => {
            var _a, _b;
            return (Object.assign(Object.assign({}, m), { sound: (_a = m.sound) !== null && _a !== void 0 ? _a : 'default', channelId: (_b = m.channelId) !== null && _b !== void 0 ? _b : 'shift-reminders' }));
        }));
        return new Promise((resolve) => {
            const req = https_1.default.request({
                hostname: 'exp.host',
                path: '/--/api/v2/push/send',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'Accept-Encoding': 'gzip, deflate',
                    'Content-Length': Buffer.byteLength(payload),
                },
            }, (res) => {
                res.resume();
                res.on('end', resolve);
            });
            req.on('error', (err) => {
                console.error('[push] Expo push error:', err.message);
                resolve();
            });
            req.write(payload);
            req.end();
        });
    });
}

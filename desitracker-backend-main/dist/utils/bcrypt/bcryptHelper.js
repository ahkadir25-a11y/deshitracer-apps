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
exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    // Guard against a missing/typo'd BCRYPT_SALT_ROUNDS env (Number(undefined) -> NaN,
    // which makes bcrypt throw on every signup). Fall back to a safe cost factor of 12.
    const rounds = Number(config_1.default.saltRounds) || 12;
    return yield bcrypt_1.default.hash(password, rounds);
});
exports.hashPassword = hashPassword;

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
const removePhoneNumberIndex = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (mongoose_1.default.connection.readyState !== 1) {
            throw new Error('Database not connected');
        }
        if (!mongoose_1.default.connection.db) {
            throw new Error('Database object is undefined on mongoose connection');
        }
        const collections = yield mongoose_1.default.connection.db.listCollections({ name: 'users' }).toArray();
        if (collections.length === 0) {
            console.warn('⚠️ Collection "users" does not exist. Skipping index drop.');
            return true;
        }
        const userCollection = mongoose_1.default.connection.db.collection('users');
        yield userCollection.dropIndex('phone_1');
        console.log('✅ Dropped index phone_1');
        return true;
    }
    catch (error) {
        if (error.code === 27 || error.codeName === 'IndexNotFound') {
            console.log('✅ Index "phone_1" not found. Nothing to drop.');
            return true;
        }
        console.error('❌ Error dropping phone_1 index:', error);
        return error;
    }
});
exports.default = removePhoneNumberIndex;

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
const http_status_1 = __importDefault(require("http-status"));
const config_1 = __importDefault(require("../config"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const user_model_1 = require("../modules/user/user/user.model");
const handleAsyncRequest_1 = __importDefault(require("../utils/handleAsyncRequest"));
const jwt_1 = require("../utils/jwt");
const auth = (...requiredRoles) => {
    return (0, handleAsyncRequest_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const authHeader = req.headers.authorization;
        // check if client has token
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not authorized. please login.');
        }
        const token = authHeader.slice(7);
        // check if the token is valid
        const decodedUser = jwt_1.JwtHelpers.verifyToken(token, config_1.default.jwt.accessSecret);
        // console.log(decodedUser);
        const { id, role, iat } = decodedUser;
        const user = yield user_model_1.User.isUserExists(id);
        // check if user exists
        if (!user) {
            throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'This user is not found');
        }
        //   // check if user is deleted
        if (user === null || user === void 0 ? void 0 : user.isDeleted) {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is deleted');
        }
        //   // check if user is blocked
        if ((user === null || user === void 0 ? void 0 : user.userStatus) === 'suspicious') {
            throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'This user is blocked');
        }
        //   // check if the user is authorized for this task/operation
        if (requiredRoles && !requiredRoles.includes(role)) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Authorization error.');
        }
        // add decoded data to global req.user
        req.user = decodedUser;
        next();
    }));
};
exports.default = auth;

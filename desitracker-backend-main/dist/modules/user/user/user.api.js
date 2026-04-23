"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const sendImageToCloudinery_1 = require("../../../utils/lib/sendImageToCloudinery");
const auth_constants_1 = require("../auth/auth.constants");
const user_controllers_1 = require("./user.controllers");
const router = (0, express_1.Router)();
router.post('/register', sendImageToCloudinery_1.upload.single('file'), (req, res, next) => {
    var _a;
    console.log('bor ouch');
    req.body = JSON.parse((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.data);
    next();
}, user_controllers_1.UserControllers.registerUser);
router.get('/me', (0, auth_1.default)(auth_constants_1.USER_ROLE.USER, auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER), user_controllers_1.UserControllers.getMe);
router.get('/', user_controllers_1.UserControllers.getUsers);
router.get('/:id', user_controllers_1.UserControllers.getUserDetails);
router.put('/:id', (0, auth_1.default)(auth_constants_1.USER_ROLE.USER, auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER), user_controllers_1.UserControllers.updateUser);
router.delete('/:id', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN), user_controllers_1.UserControllers.deleteUser);
exports.UserRoutes = router;

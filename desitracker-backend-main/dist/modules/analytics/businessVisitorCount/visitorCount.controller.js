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
exports.VisitorCountControllers = void 0;
const handleAsyncRequest_1 = __importDefault(require("../../../utils/handleAsyncRequest"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const visitorCount_service_1 = require("./visitorCount.service");
const getBusinessAnalytics = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { businessId } = req === null || req === void 0 ? void 0 : req.params;
    const result = yield visitorCount_service_1.VisitorCountServices.getBusinessAnalytics(businessId, req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Business Visitor analytics retrieved successfully!',
        data: result,
    });
}));
const getAdminAnalytics = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield visitorCount_service_1.VisitorCountServices.getAdminAnalytics(req.query);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Business Visitor analytics retrieved successfully!',
        data: result,
    });
}));
// 🆕 Add this!
const addToVisitorCount = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { businessId } = req.params;
    const result = yield visitorCount_service_1.VisitorCountServices.addToVisitorCount(businessId, req);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 201,
        message: 'Visitor count updated successfully!',
        data: result,
    });
}));
exports.VisitorCountControllers = {
    getBusinessAnalytics,
    getAdminAnalytics,
    addToVisitorCount
};

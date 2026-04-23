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
exports.BusinessControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const handleAsyncRequest_1 = __importDefault(require("../../utils/handleAsyncRequest"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const business_service_1 = require("./business.service");
const registerBusiness = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield business_service_1.BusinessServices.registerBusiness(req === null || req === void 0 ? void 0 : req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Business is registered successfully',
        data: result,
    });
}));
const updateBusiness = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const slug = (_a = req.params) === null || _a === void 0 ? void 0 : _a.slug;
    const result = yield business_service_1.BusinessServices.updateBusiness(slug, req === null || req === void 0 ? void 0 : req.body, req === null || req === void 0 ? void 0 : req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Business info is updated successfully',
        data: result,
    });
}));
const getAllBusiness = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield business_service_1.BusinessServices.getAllBusiness(query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'All Businesses retrieved successfully',
        meta: result.meta,
        data: result.result,
    });
}));
const getSingleBusiness = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const slug = (_a = req.params) === null || _a === void 0 ? void 0 : _a.slug;
    const result = yield business_service_1.BusinessServices.getSingleBusiness(slug, req);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Business is retrieved successfully',
        data: result,
    });
}));
const deleteBusiness = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const slug = req.params.slug;
    const result = yield business_service_1.BusinessServices.deleteBusiness(slug, req === null || req === void 0 ? void 0 : req.user);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Business is deleted successfully',
        data: result,
    });
}));
const getAllBusinessListings = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const result = yield business_service_1.BusinessServices.getAllBusinessListings(query);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'All Businesses retrieved successfully',
        meta: result.meta,
        data: result.result,
    });
}));
exports.BusinessControllers = {
    registerBusiness,
    updateBusiness,
    getAllBusiness,
    getSingleBusiness,
    deleteBusiness,
    getAllBusinessListings
};

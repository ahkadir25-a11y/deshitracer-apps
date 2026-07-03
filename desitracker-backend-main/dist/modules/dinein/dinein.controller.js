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
exports.DineInControllers = void 0;
const http_status_1 = __importDefault(require("http-status"));
const handleAsyncRequest_1 = __importDefault(require("../../utils/handleAsyncRequest"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const dinein_service_1 = require("./dinein.service");
const createTable = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield dinein_service_1.DineInServices.createTable(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: 'Table created successfully',
        data: result,
    });
}));
const getTablesByBusiness = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield dinein_service_1.DineInServices.getTablesByBusiness(req.params.businessId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Tables retrieved successfully',
        data: result,
    });
}));
const updateTable = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield dinein_service_1.DineInServices.updateTable(req.params.tableId, req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Table updated successfully',
        data: result,
    });
}));
const deleteTable = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield dinein_service_1.DineInServices.deleteTable(req.params.tableId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Table removed successfully',
        data: result,
    });
}));
const getFloorStatus = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield dinein_service_1.DineInServices.getFloorStatus(req.params.businessId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Floor status retrieved successfully',
        data: result,
    });
}));
exports.DineInControllers = {
    createTable,
    getTablesByBusiness,
    updateTable,
    deleteTable,
    getFloorStatus,
};

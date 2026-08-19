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
exports.TableControllers = void 0;
const handleAsyncRequest_1 = __importDefault(require("../../utils/handleAsyncRequest"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const table_service_1 = require("./table.service");
const createTable = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const business_id = req.body.business_id || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.business_id);
    const result = yield table_service_1.TableServices.createTable(business_id, req.body, {
        id: (_b = req.user) === null || _b === void 0 ? void 0 : _b.id,
        role: (_c = req.user) === null || _c === void 0 ? void 0 : _c.role,
    });
    (0, sendResponse_1.default)(res, {
        statusCode: 201,
        success: true,
        message: 'Table created successfully',
        data: result,
    });
}));
const getBusinessTables = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const business_id = req.params.businessId;
    const result = yield table_service_1.TableServices.getBusinessTables(business_id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Tables retrieved successfully',
        data: result,
    });
}));
const updateTable = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const result = yield table_service_1.TableServices.updateTable((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, (_b = req.user) === null || _b === void 0 ? void 0 : _b.role, req.params.id, { tableNo: (_c = req.body) === null || _c === void 0 ? void 0 : _c.tableNo, capacity: (_d = req.body) === null || _d === void 0 ? void 0 : _d.capacity });
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Table updated successfully',
        data: result,
    });
}));
const deleteTable = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // Ownership is resolved from the table's own business_id inside the service
    // — the JWT does not carry business_id.
    const result = yield table_service_1.TableServices.deleteTable((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, (_b = req.user) === null || _b === void 0 ? void 0 : _b.role, req.params.id);
    (0, sendResponse_1.default)(res, {
        statusCode: 200,
        success: true,
        message: 'Table deleted successfully',
        data: result,
    });
}));
exports.TableControllers = {
    createTable,
    getBusinessTables,
    updateTable,
    deleteTable,
};

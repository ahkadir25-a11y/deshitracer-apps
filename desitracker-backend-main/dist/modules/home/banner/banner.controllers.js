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
exports.BannerControllers = void 0;
const handleAsyncRequest_1 = __importDefault(require("../../../utils/handleAsyncRequest"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const banner_services_1 = require("./banner.services");
// Create a new banner
const createBanner = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield banner_services_1.BannerServices.createBanner(req.file);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 201,
        message: 'Banner created successfully!',
        data: result,
    });
}));
// Get all banners
const getAllBanners = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield banner_services_1.BannerServices.getAllBanners();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Banners retrieved successfully!',
        data: result,
    });
}));
// Get a single banner by ID
const getSingleBanner = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield banner_services_1.BannerServices.getSingleBanner(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Banner retrieved successfully!',
        data: result,
    });
}));
// Update a banner
// const updateBanner = handleAsyncRequest(async (req: Request, res: Response) => {
//   const result = await BannerServices.updateBanner(
//     req.params.id,
//     req.body,
//     req.file,
//   );
//   sendResponse(res, {
//     success: true,
//     statusCode: 200,
//     message: 'Banner updated successfully!',
//     data: result,
//   });
// });
// Delete a banner
const deleteBanner = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield banner_services_1.BannerServices.deleteBanner(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Banner deleted successfully!',
        data: null,
    });
}));
exports.BannerControllers = {
    createBanner,
    getAllBanners,
    getSingleBanner,
    deleteBanner,
};

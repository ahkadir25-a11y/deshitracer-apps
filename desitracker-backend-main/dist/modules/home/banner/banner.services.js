"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.BannerServices = void 0;
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const sendImageToCloudinery_1 = __importStar(require("../../../utils/lib/sendImageToCloudinery"));
const banner_model_1 = require("./banner.model");
// Create a new banner
const createBanner = (bannerImage) => __awaiter(void 0, void 0, void 0, function* () {
    const bannerData = {};
    if (bannerImage) {
        const imageName = `${bannerImage === null || bannerImage === void 0 ? void 0 : bannerImage.filename}-${new Date().toISOString()}`;
        const path = bannerImage === null || bannerImage === void 0 ? void 0 : bannerImage.path;
        const response = yield (0, sendImageToCloudinery_1.sendImageToCloudinary)(imageName, path, 'web_banner');
        bannerData.url = response.secure_url;
        bannerData.public_id = response.public_id;
    }
    return yield banner_model_1.Banner.create(bannerData);
});
// Get all banners
const getAllBanners = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield banner_model_1.Banner.find();
});
// Get a single banner by ID
const getSingleBanner = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield banner_model_1.Banner.findById(id);
});
// Delete a banner
const deleteBanner = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const image = yield banner_model_1.Banner.findById(id);
    if (!image) {
        throw new AppError_1.default(404, 'Banner is not found.');
    }
    yield sendImageToCloudinery_1.default.uploader.destroy(image === null || image === void 0 ? void 0 : image.public_id);
    return yield banner_model_1.Banner.findByIdAndDelete(image._id);
});
exports.BannerServices = {
    createBanner,
    getAllBanners,
    getSingleBanner,
    deleteBanner,
};

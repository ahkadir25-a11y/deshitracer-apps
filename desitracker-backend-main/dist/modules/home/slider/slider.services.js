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
exports.SliderServices = void 0;
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const sendImageToCloudinery_1 = __importStar(require("../../../utils/lib/sendImageToCloudinery"));
const slider_model_1 = require("./slider.model");
const createSlider = (payload, sliderImage) => __awaiter(void 0, void 0, void 0, function* () {
    const sliderData = Object.assign({}, payload);
    let publicId = '';
    if (sliderImage) {
        const imageName = `${sliderImage === null || sliderImage === void 0 ? void 0 : sliderImage.filename}-${new Date().toISOString()}`;
        const path = sliderImage === null || sliderImage === void 0 ? void 0 : sliderImage.path;
        const response = yield (0, sendImageToCloudinery_1.sendImageToCloudinary)(imageName, path, 'web_slider');
        publicId = response.public_id;
        sliderData.url = response.secure_url;
        sliderData.public_id = response.public_id;
    }
    try {
        return yield slider_model_1.Slider.create(sliderData);
    }
    catch (err) {
        yield sendImageToCloudinery_1.default.uploader.destroy(publicId);
        throw new AppError_1.default(400, `Failed to create slider: ${err === null || err === void 0 ? void 0 : err.message}`);
    }
});
const getAllSliders = () => __awaiter(void 0, void 0, void 0, function* () {
    return yield slider_model_1.Slider.find();
});
const getSingleSlider = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield slider_model_1.Slider.findById(id);
    return result;
});
const deleteSlider = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const slider = yield slider_model_1.Slider.findById(id);
    if (!slider) {
        throw new AppError_1.default(404, 'Slider is not found.');
    }
    yield sendImageToCloudinery_1.default.uploader.destroy(slider === null || slider === void 0 ? void 0 : slider.public_id);
    return yield slider_model_1.Slider.findByIdAndDelete(id);
});
exports.SliderServices = {
    createSlider,
    getAllSliders,
    getSingleSlider,
    deleteSlider,
};

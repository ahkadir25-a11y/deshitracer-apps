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
exports.SliderControllers = void 0;
const handleAsyncRequest_1 = __importDefault(require("../../../utils/handleAsyncRequest"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const slider_services_1 = require("./slider.services");
const createSlider = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield slider_services_1.SliderServices.createSlider(req.body, req.file);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 201,
        message: 'Slider created successfully!',
        data: result,
    });
}));
const getAllSliders = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield slider_services_1.SliderServices.getAllSliders();
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Sliders retrieved successfully!',
        data: result,
    });
}));
const getSingleSlider = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield slider_services_1.SliderServices.getSingleSlider(req.params.id);
    // console.log({ result });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Slider retrieved successfully!',
        data: result,
    });
}));
const deleteSlider = (0, handleAsyncRequest_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield slider_services_1.SliderServices.deleteSlider(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: 'Slider deleted successfully!',
        data: null,
    });
}));
exports.SliderControllers = {
    createSlider,
    getAllSliders,
    getSingleSlider,
    deleteSlider,
};

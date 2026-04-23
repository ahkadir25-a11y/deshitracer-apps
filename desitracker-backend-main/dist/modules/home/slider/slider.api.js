"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SliderRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const sendImageToCloudinery_1 = require("../../../utils/lib/sendImageToCloudinery");
const auth_constants_1 = require("../../user/auth/auth.constants");
const slider_controllers_1 = require("./slider.controllers");
const router = (0, express_1.Router)();
router.post('/create', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN), sendImageToCloudinery_1.upload.single('file'), (req, res, next) => {
    req.body = JSON.parse(req.body.data);
    next();
}, slider_controllers_1.SliderControllers.createSlider);
router.get('/all', slider_controllers_1.SliderControllers.getAllSliders);
router.delete('/delete/:id', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN), slider_controllers_1.SliderControllers.deleteSlider);
router.get('/:id', slider_controllers_1.SliderControllers.getSingleSlider);
exports.SliderRoutes = router;

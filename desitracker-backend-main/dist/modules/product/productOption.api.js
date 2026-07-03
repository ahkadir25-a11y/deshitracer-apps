"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductOptionRoutes = void 0;
const express_1 = require("express");
const productOption_controller_1 = require("./productOption.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../user/auth/auth.constants");
const router = (0, express_1.Router)();
// Writes require an authenticated business user; GET stays public for menus.
const requireBiz = (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER, auth_constants_1.USER_ROLE.STAFF);
router.post("/create", requireBiz, productOption_controller_1.createProductOption);
router.get("/", productOption_controller_1.getProductOptions);
router.get("/:optionId", productOption_controller_1.getSingleProductOption);
router.put("/:optionId", requireBiz, productOption_controller_1.updateProductOption);
router.delete("/:optionId", requireBiz, productOption_controller_1.deleteProductOption);
exports.ProductOptionRoutes = router;

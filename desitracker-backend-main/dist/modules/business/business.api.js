"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessRoutes = void 0;
const express_1 = require("express");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const auth_constants_1 = require("../user/auth/auth.constants");
const business_controller_1 = require("./business.controller");
const router = (0, express_1.Router)();
// Create a category (Admin only)
router.post('/register', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.USER, auth_constants_1.USER_ROLE.BUSINESS_OWNER), business_controller_1.BusinessControllers.registerBusiness);
// Get all business (Public)
router.get('/', business_controller_1.BusinessControllers.getAllBusiness);
// Get all business (Public)
router.get('/list', business_controller_1.BusinessControllers.getAllBusinessListings);
// Get a single business by slug (Public)
router.get('/:slug', business_controller_1.BusinessControllers.getSingleBusiness);
// Update a business by slug (Admin only, and Owner)
router.put('/:slug', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER), business_controller_1.BusinessControllers.updateBusiness);
// Delete a business by slug (Admin and owner)
router.delete('/:slug', (0, auth_1.default)(auth_constants_1.USER_ROLE.ADMIN, auth_constants_1.USER_ROLE.BUSINESS_OWNER), business_controller_1.BusinessControllers.deleteBusiness);
exports.BusinessRoutes = router;

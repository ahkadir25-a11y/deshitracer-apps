"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../../middlewares/auth"));
const announcement_controller_1 = require("./announcement.controller");
const router = express_1.default.Router();
// Read — both staff and owner.
router.get('/', (0, auth_1.default)('staff', 'business_owner', 'admin'), announcement_controller_1.AnnouncementController.list);
router.get('/unread-count', (0, auth_1.default)('staff', 'business_owner', 'admin'), announcement_controller_1.AnnouncementController.unreadCount);
router.post('/:id/read', (0, auth_1.default)('staff', 'business_owner', 'admin'), announcement_controller_1.AnnouncementController.markRead);
// Write — owner only.
router.post('/', (0, auth_1.default)('business_owner', 'admin'), announcement_controller_1.AnnouncementController.create);
router.patch('/:id', (0, auth_1.default)('business_owner', 'admin'), announcement_controller_1.AnnouncementController.update);
router.delete('/:id', (0, auth_1.default)('business_owner', 'admin'), announcement_controller_1.AnnouncementController.remove);
exports.AnnouncementRoutes = router;

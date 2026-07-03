import { Router } from "express";
import {
  createProductOption,
  getProductOptions,
  updateProductOption,
  deleteProductOption,
  getSingleProductOption,
} from "./productOption.controller";
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/auth/auth.constants';

const router = Router();

// Writes require an authenticated business user; GET stays public for menus.
const requireBiz = auth(USER_ROLE.ADMIN, USER_ROLE.BUSINESS_OWNER, USER_ROLE.STAFF);

router.post("/create", requireBiz, createProductOption);
router.get("/", getProductOptions);
router.get("/:optionId", getSingleProductOption);
router.put("/:optionId", requireBiz, updateProductOption);
router.delete("/:optionId", requireBiz, deleteProductOption);

export const ProductOptionRoutes = router;
import { Router } from "express";
import {
  createProductOption,
  getProductOptions,
  updateProductOption,
  deleteProductOption,
  getSingleProductOption,
} from "./productOption.controller";

const router = Router();

router.post("/create", createProductOption);
router.get("/", getProductOptions);
router.get("/:optionId", getSingleProductOption);
router.put("/:optionId", updateProductOption);
router.delete("/:optionId", deleteProductOption);

export const ProductOptionRoutes = router;
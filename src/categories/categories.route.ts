import { Router } from "express";
import { CategoryController } from "./categories.controller";
import { authenticateToken } from "../auth/auth.middleware";

const router: Router = Router();

router.get("/", authenticateToken, CategoryController.getAllCategories);
router.post("/", authenticateToken, CategoryController.createCategory);
router.get("/:id", authenticateToken, CategoryController.getCategoryById);
router.put("/:id", authenticateToken, CategoryController.updateCategory);
router.delete("/:id", authenticateToken, CategoryController.deleteCategory);
export default router;

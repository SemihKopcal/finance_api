import { Router } from "express";
import { CategoryController } from "./categories.controller";
import { authenticateToken } from "../auth/auth.middleware";
import { 
  validateCreateCategory, 
  validateUpdateCategory, 
  validateGetCategories, 
  validateCategoryId 
} from "../middleware/validation.middleware";

const router: Router = Router();

// Default kategorileri getirir (authentication gerekmez)
router.get("/defaults", CategoryController.getDefaultCategories);

// Kullanıcının kendi kategorileri
router.get("/", 
  authenticateToken, 
  validateGetCategories, 
  CategoryController.getAllCategories
);

router.post("/", 
  authenticateToken, 
  validateCreateCategory, 
  CategoryController.createCategory
);

router.get("/:id", 
  validateCategoryId, 
  CategoryController.getCategoryById
);

router.put("/:id", 
  authenticateToken, 
  validateCategoryId, 
  validateUpdateCategory, 
  CategoryController.updateCategory
);

router.delete("/:id", 
  authenticateToken, 
  validateCategoryId, 
  CategoryController.deleteCategory
);

export default router;

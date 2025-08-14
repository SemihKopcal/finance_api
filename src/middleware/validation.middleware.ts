import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array().map(err => ({
          field: err.type,
          message: err.msg
        }))
      },
      timestamp: new Date().toISOString()
    });
  }
  next();
};

// ===== CATEGORY VALIDATION =====

export const validateCreateCategory = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('İsim 2-50 karakter olmalı')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
    .withMessage('İsim sadece harf ve boşluk içerebilir'),
  
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Tip sadece "income" veya "expense" olabilir'),
  
  body('color')
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Renk geçerli hex formatında olmalı (örn: #FF5733)'),
  
  handleValidationErrors
];

export const validateUpdateCategory = [
  param('id')
    .isMongoId()
    .withMessage('Geçersiz kategori ID formatı'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('İsim 2-50 karakter olmalı')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
    .withMessage('İsim sadece harf ve boşluk içerebilir'),
  
  body('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Tip sadece "income" veya "expense" olabilir'),
  
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Renk geçerli hex formatında olmalı (örn: #FF5733)'),
  
  handleValidationErrors
];

export const validateGetCategories = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sayfa numarası 1\'den büyük olmalı'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit 1-100 arasında olmalı'),
  
  handleValidationErrors
];

export const validateCategoryId = [
  param('id')
    .isMongoId()
    .withMessage('Geçersiz kategori ID formatı'),
  
  handleValidationErrors
];

// ===== AUTH VALIDATION =====

export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('İsim 2-50 karakter olmalı')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
    .withMessage('İsim sadece harf ve boşluk içerebilir'),
  
  body('email')
    .isEmail()
    .withMessage('Geçerli email adresi giriniz')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6, max: 100 })
    .withMessage('Şifre en az 6 karakter olmalı')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Şifre en az 1 küçük harf, 1 büyük harf ve 1 rakam içermeli'),
  
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Geçerli email adresi giriniz')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Şifre gerekli'),
  
  handleValidationErrors
];

export const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('İsim 2-50 karakter olmalı')
    .matches(/^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/)
    .withMessage('İsim sadece harf ve boşluk içerebilir'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Geçerli email adresi giriniz')
    .normalizeEmail(),
  
  body('password')
    .optional()
    .isLength({ min: 6, max: 100 })
    .withMessage('Şifre en az 6 karakter olmalı')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Şifre en az 1 küçük harf, 1 büyük harf ve 1 rakam içermeli'),
  
  handleValidationErrors
];

export const validateUserId = [
  param('id')
    .isMongoId()
    .withMessage('Geçersiz kullanıcı ID formatı'),
  
  handleValidationErrors
];

// ===== TRANSACTION VALIDATION =====

export const validateCreateTransaction = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Tutar 0.01\'den büyük olmalı'),
  
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Tip sadece "income" veya "expense" olabilir'),
  
  body('categoryId')
    .isMongoId()
    .withMessage('Geçersiz kategori ID formatı'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Açıklama en fazla 500 karakter olabilir'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Geçerli tarih formatı giriniz (YYYY-MM-DD)'),
  
  handleValidationErrors
];

export const validateUpdateTransaction = [
  param('id')
    .isMongoId()
    .withMessage('Geçersiz transaction ID formatı'),
  
  body('amount')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Tutar 0.01\'den büyük olmalı'),
  
  body('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Tip sadece "income" veya "expense" olabilir'),
  
  body('categoryId')
    .optional()
    .isMongoId()
    .withMessage('Geçersiz kategori ID formatı'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Açıklama en fazla 500 karakter olabilir'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Geçerli tarih formatı giriniz (YYYY-MM-DD)'),
  
  handleValidationErrors
];

export const validateGetTransactions = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sayfa numarası 1\'den büyük olmalı'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit 1-100 arasında olmalı'),
  
  query('type')
    .optional()
    .isIn(['income', 'expense'])
    .withMessage('Tip sadece "income" veya "expense" olabilir'),
  
  query('categoryId')
    .optional()
    .isMongoId()
    .withMessage('Geçersiz kategori ID formatı'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Başlangıç tarihi geçerli format olmalı (YYYY-MM-DD)'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Bitiş tarihi geçerli format olmalı (YYYY-MM-DD)'),
  
  query('minAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum tutar 0\'dan büyük olmalı'),
  
  query('maxAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maksimum tutar 0\'dan büyük olmalı'),
  
  handleValidationErrors
];

export const validateTransactionId = [
  param('id')
    .isMongoId()
    .withMessage('Geçersiz transaction ID formatı'),
  
  handleValidationErrors
];

// ===== REPORTS VALIDATION =====

export const validateCreateReport = [
  body('type')
    .isIn(['income', 'expense', 'summary', 'category', 'trend'])
    .withMessage('Rapor tipi geçersiz'),
  
  body('startDate')
    .isISO8601()
    .withMessage('Başlangıç tarihi geçerli format olmalı (YYYY-MM-DD)'),
  
  body('endDate')
    .isISO8601()
    .withMessage('Bitiş tarihi geçerli format olmalı (YYYY-MM-DD)'),
  
  body('categoryId')
    .optional()
    .isMongoId()
    .withMessage('Geçersiz kategori ID formatı'),
  
  body('groupBy')
    .optional()
    .isIn(['day', 'week', 'month', 'year', 'category'])
    .withMessage('Gruplama tipi geçersiz'),
  
  handleValidationErrors
];

export const validateGetReports = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Sayfa numarası 1\'den büyük olmalı'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit 1-50 arasında olmalı'),
  
  query('type')
    .optional()
    .isIn(['income', 'expense', 'summary', 'category', 'trend'])
    .withMessage('Rapor tipi geçersiz'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Başlangıç tarihi geçerli format olmalı (YYYY-MM-DD)'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Bitiş tarihi geçerli format olmalı (YYYY-MM-DD)'),
  
  handleValidationErrors
];

export const validateReportId = [
  param('id')
    .isMongoId()
    .withMessage('Geçersiz rapor ID formatı'),
  
  handleValidationErrors
];

export const validateDateRange = [
  query('startDate')
    .isISO8601()
    .withMessage('Başlangıç tarihi geçerli format olmalı (YYYY-MM-DD)'),
  
  query('endDate')
    .isISO8601()
    .withMessage('Bitiş tarihi geçerli format olmalı (YYYY-MM-DD)'),
  
  handleValidationErrors
];

export const validateMonthQuery = [
  query('month')
    .optional()
    .custom((value) => {
      if (!value) return true; 
      
      // YYYY-MM, YYYY/MM, YYYY.MM 
      const monthPattern = /^\d{4}[-/.]\d{1,2}$/;
      if (!monthPattern.test(value)) {
        throw new Error('Ay parametresi YYYY-MM, YYYY/MM veya YYYY.MM formatında olmalı');
      }
      
      // Checked whether the month is between 1-12
      const parts = value.split(/[-/.]/);
      const month = parseInt(parts[1]);
      if (month < 1 || month > 12) {
        throw new Error('Ay değeri 1-12 arasında olmalı');
      }
      
      return true;
    }),
  handleValidationErrors
];

const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['student', 'instructor', 'admin'])
    .withMessage('Role must be student, instructor, or admin'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(['student', 'instructor', 'admin'])
    .withMessage('Role must be student, instructor, or admin'),
  handleValidationErrors
];

// Course validation rules
const validateCourse = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Course title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  handleValidationErrors
];

// Coding question validation rules
const validateCodingQuestion = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Question title must be between 5 and 100 characters'),
  body('statement')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Question statement must be between 10 and 2000 characters'),
  body('difficulty')
    .isIn(['easy', 'medium', 'hard'])
    .withMessage('Difficulty must be easy, medium, or hard'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  body('testCases')
    .optional()
    .isArray()
    .withMessage('Test cases must be an array'),
  body('testCases.*.input')
    .optional()
    .notEmpty()
    .withMessage('Test case input is required'),
  body('testCases.*.output')
    .optional()
    .notEmpty()
    .withMessage('Test case output is required'),
  handleValidationErrors
];

// Interview attempt validation rules
const validateInterviewAttempt = [
  body('question')
    .isMongoId()
    .withMessage('Valid question ID is required'),
  body('score')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Score must be between 0 and 100'),
  body('durationSec')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duration must be a positive integer'),
  body('transcript')
    .optional()
    .trim()
    .isLength({ max: 10000 })
    .withMessage('Transcript must not exceed 10000 characters'),
  handleValidationErrors
];

// Common validation rules
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} ID`),
  handleValidationErrors
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateCourse,
  validateCodingQuestion,
  validateInterviewAttempt,
  validateObjectId,
  validatePagination
};
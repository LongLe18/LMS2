// middlewares/validationMiddleware.js
const { validationResult } = require('express-validator');

const validateDto = (rules) => {
  // Kiểm tra và đảm bảo rules luôn là một mảng
  const validationRules = Array.isArray(rules) ? rules : [rules];

  return [
    ...validationRules, // Sử dụng các quy tắc xác thực
    (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      next();
    },
  ];
};

module.exports = { validateDto };

/**
 * Analysis Routes
 */

const express = require("express");
const { body } = require("express-validator");
const analysisController = require("../controllers/analysisController");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Analysis routes
router.post(
  "/image",
  [body("imageData").notEmpty().withMessage("Image data is required")],
  validate,
  analysisController.analyzeImage
);

router.get("/history", analysisController.getHistory);
router.get("/:id", analysisController.getAnalysis);

router.post(
  "/:id/feedback",
  [
    body("helpful").isBoolean(),
    body("rating").optional().isInt({ min: 1, max: 5 }),
  ],
  validate,
  analysisController.submitFeedback
);

module.exports = router;
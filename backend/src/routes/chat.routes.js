/**
 * Chat Routes
 */

const express = require('express');
const { body } = require('express-validator');
const chatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Chat routes
router.post(
  '/start',
  [body('analysisId').notEmpty()],
  validate,
  chatController.startConversation
);

router.post(
  '/:conversationId/message',
  [body('message').trim().notEmpty()],
  validate,
  chatController.sendMessage
);

router.get('/:conversationId', chatController.getConversation);
router.get('/conversations', chatController.getUserConversations);

module.exports = router;
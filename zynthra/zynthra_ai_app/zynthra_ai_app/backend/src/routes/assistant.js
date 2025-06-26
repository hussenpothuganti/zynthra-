const express = require('express');
const router = express.Router();
const assistantController = require('../controllers/assistantController');
const { validateChatRequest, validateVoiceRequest } = require('../middleware/validation');

/**
 * @route POST /api/assistant/chat
 * @desc Send message to AI assistant
 * @access Private
 */
router.post('/chat', validateChatRequest, assistantController.chatWithAssistant);

/**
 * @route POST /api/assistant/voice
 * @desc Process voice input for AI assistant
 * @access Private
 */
router.post('/voice', validateVoiceRequest, assistantController.processVoiceInput);

/**
 * @route GET /api/assistant/history
 * @desc Get chat history
 * @access Private
 */
router.get('/history', assistantController.getChatHistory);

/**
 * @route DELETE /api/assistant/history
 * @desc Clear chat history
 * @access Private
 */
router.delete('/history', assistantController.clearChatHistory);

/**
 * @route POST /api/assistant/reminder
 * @desc Create a new reminder
 * @access Private
 */
router.post('/reminder', assistantController.createReminder);

/**
 * @route GET /api/assistant/reminder
 * @desc Get all reminders
 * @access Private
 */
router.get('/reminder', assistantController.getReminders);

/**
 * @route PUT /api/assistant/reminder/:id
 * @desc Update a reminder
 * @access Private
 */
router.put('/reminder/:id', assistantController.updateReminder);

/**
 * @route DELETE /api/assistant/reminder/:id
 * @desc Delete a reminder
 * @access Private
 */
router.delete('/reminder/:id', assistantController.deleteReminder);

module.exports = router;

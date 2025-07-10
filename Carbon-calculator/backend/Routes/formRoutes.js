const express = require('express');
const router = express.Router();
const {
  saveFormSubmission,
  getUserSubmissions,
  deleteSubmission
} = require('../controllers/formController');

const { isLoggedIn } = require('../middleware/authMiddleware'); 

router.post('/submit', isLoggedIn, saveFormSubmission);
router.get('/submissions/:id', isLoggedIn, getUserSubmissions);

module.exports = router;

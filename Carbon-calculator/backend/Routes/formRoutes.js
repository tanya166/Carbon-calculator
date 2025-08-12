const express = require('express');
const router = express.Router();
const {
  saveFormSubmission,
  getUserSubmissions,
  deleteSubmission
} = require('../controllers/formController');

const { isLoggedIn } = require('../middleware/authMiddleware'); 

// Form submission endpoints
router.post('/submit', isLoggedIn, saveFormSubmission);
router.get('/submissions', isLoggedIn, (req, res) => {
  // Redirect to user-specific submissions
  getUserSubmissions(req, res);
});
router.get('/submissions/:id', isLoggedIn, getUserSubmissions);
router.delete('/submissions/:id', isLoggedIn, deleteSubmission);

module.exports = router;

const { Router } = require("express");
const { submitContactForm } = require("../controllers/userController");
const { isLoggedIn } = require("../middleware/authMiddleware");

const router = Router();
router.post('/contact', isLoggedIn, submitContactForm);

module.exports = router;

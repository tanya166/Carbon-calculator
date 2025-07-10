const { Router } = require("express");
const { signup, login } = require("../controllers/authController");
const { isLoggedIn } = require("../middleware/authMiddleware"); 

const router = Router();

router.get('/verify', isLoggedIn, (req, res) => {
  res.json({
    success: true,
    user: req.user 
  });
});

router.post("/signup", signup);
router.post("/login", login);


module.exports = router;

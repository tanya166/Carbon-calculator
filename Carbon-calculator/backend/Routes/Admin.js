
const { Router } = require("express");
const { isLoggedIn } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware"); 
const { 
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById
} = require("../controllers/adminController");

const router = Router(); 

router.get("/users", isLoggedIn, isAdmin, getAllUsers);
router.get("/users/:id", isLoggedIn, isAdmin, getUserById);
router.put("/users/:id", isLoggedIn, isAdmin, updateUserById);
router.delete("/users/:id", isLoggedIn, isAdmin, deleteUserById);

module.exports = router;

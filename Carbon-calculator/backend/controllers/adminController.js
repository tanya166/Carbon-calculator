const User = require("../models/User");

const getAllUsers = async (req, res) => {
  try {
    const result = await User.findAll();
    res.status(200).json({ result });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdSafe(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

const updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password, role } = req.body;

    const userExists = await User.existsById(id);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    if (username && await User.usernameExists(username, id)) {
      return res.status(400).json({ error: "Username already taken" });
    }

    if (email && await User.emailExists(email, id)) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;

    if (password) {
      updateData.password = await User.hashPassword(password);
    }

    const updated = await User.updateById(id, updateData);
    
    if (!updated) {
      return res.status(400).json({ error: "Failed to update user" });
    }

    const updatedUser = await User.findByIdSafe(id);

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const userExists = await User.existsById(id);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    const deleted = await User.deleteById(id);
    
    if (!deleted) {
      return res.status(400).json({ error: "Failed to delete user" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById
};
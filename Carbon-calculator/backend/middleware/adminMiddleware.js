const db = require('../db/connection'); 

const isAdmin = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  try {
    const [results] = await db.query('SELECT role FROM users WHERE id = ?', [req.user.id]);
    
    if (!results || results.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const userRole = results[0].role;
    if (userRole && userRole.toLowerCase() === 'admin') {
      next();
    } else {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
  } catch (error) {
    console.error('Database query error:', error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  isAdmin
};
const db = require('../db/connection');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findById(id) {
    try {
      const [results] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
      return results.length > 0 ? new User(results[0]) : null;
    } catch (err) {
      throw err;
    }
  }

  static async findByIdSafe(id) {
    try {
      const [results] = await db.query('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [id]);
      return results.length > 0 ? results[0] : null;
    } catch (err) {
      throw err;
    }
  }

  static async insertInTable(username, email, password) {
    try {
      const [results] = await db.query('INSERT INTO users (username, email, password) VALUES (?,?,?)', [username, email, password]);
      return results;
    } catch (err) {
      throw err;
    }
  }

  static async insertInTableContact(email, message) {
    try {
      const [results] = await db.query('INSERT INTO support (email, message) VALUES (?,?)', [email, message]);
      return results;
    } catch (err) {
      throw err;
    }
  }

  static async findByUsername(username) {
    try {
      const [results] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
      return results.length > 0 ? new User(results[0]) : null;
    } catch (err) {
      throw err;
    }
  }

  static async findByEmail(email) {
    try {
      const [results] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      return results.length > 0 ? new User(results[0]) : null;
    } catch (err) {
      throw err;
    }
  }

  static async findAll() {
    try {
      const [results] = await db.query('SELECT id, username, email, role, created_at FROM users');
      return results;
    } catch (err) {
      throw err;
    }
  }

  static async getEmailFromUsername(username) {
    try {
      const [results] = await db.query('SELECT email FROM users WHERE username=?', [username]);
      return results.length > 0 ? results[0].email : null;
    } catch (err) {
      throw err;
    }
  }

  static async updateById(id, updateData) {
    try {
      const updateFields = [];
      const updateValues = [];

      for (let [key, value] of Object.entries(updateData)) {
        if (value !== undefined && value !== null) {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }

      updateValues.push(id);
      const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;

      const [results] = await db.query(query, updateValues);
      return results.affectedRows > 0;
    } catch (err) {
      throw err;
    }
  }

  static async deleteById(id) {
    try {
      const [results] = await db.query('DELETE FROM users WHERE id = ?', [id]);
      return results.affectedRows > 0;
    } catch (err) {
      throw err;
    }
  }

  static async existsById(id) {
    try {
      const [results] = await db.query('SELECT id FROM users WHERE id = ?', [id]);
      return results.length > 0;
    } catch (err) {
      throw err;
    }
  }

  async comparePassword(candidatePassword) {
    try {
      return await bcrypt.compare(candidatePassword, this.password);
    } catch (err) {
      throw err;
    }
  }

  toJSON() {
    const userObj = { ...this };
    delete userObj.password;
    return userObj;
  }

  static async usernameExists(username, excludeId = null) {
    try {
      let query = 'SELECT id FROM users WHERE username = ?';
      let params = [username];
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      
      const [results] = await db.query(query, params);
      return results.length > 0;
    } catch (err) {
      throw err;
    }
  }

  static async emailExists(email, excludeId = null) {
    try {
      let query = 'SELECT id FROM users WHERE email = ?';
      let params = [email];
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      
      const [results] = await db.query(query, params);
      return results.length > 0;
    } catch (err) {
      throw err;
    }
  }

  static async hashPassword(password) {
    try {
      return await bcrypt.hash(password, 10);
    } catch (err) {
      throw err;
    }
  }
}

module.exports = User;
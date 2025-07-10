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

  static findById(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.length > 0 ? new User(results[0]) : null);
        }
      });
    });
  }

  static insertInTable(username,email,password){
    return new Promise((resolve,reject)=>{
      db.query('INSERT INTO users (username,email,password) VALUES (?,?,?)',[username,email,password],(err,results)=>{
        if(err){
          reject(err);
        }else{
          resolve(results);
        }
      })
    })
  }
  static insertInTableContact(email,message){
    return new Promise((resolve,reject)=>{
      db.query('INSERT INTO support (email,message) VALUES (?,?)',[email,message],(err,results)=>{
        if(err){
          reject(err);
        }else{
          resolve(results);
        }
    })
  })
}

  static findByUsername(username) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.length > 0 ? new User(results[0]) : null);
        }
      });
    });
  }

  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.length > 0 ? new User(results[0]) : null);
        }
      });
    });
  }


  static findAll() {
    return new Promise((resolve, reject) => {
      db.query('SELECT id, username, email, role, created_at FROM users', (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

static getEmailFromUsername(username){
  return new Promise((resolve,reject)=>{
    db.query('SELECT email FROM users where username=?',[username],(err,results)=>{
       if (err) {
          reject(err);
        } else {
         resolve(results.length > 0 ? results[0].email : null);
        }
    })
  })
}

  static updateById(id, updateData) {
    return new Promise((resolve, reject) => {
  
      const updateFields = [];
      const updateValues = [];

      for (let [key, value] of Object.entries(updateData)) {
        if (value !== undefined && value !== null) {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      }

      if (updateFields.length === 0) {
        reject(new Error('No fields to update'));
        return;
      }

      updateValues.push(id);
      const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;

      db.query(query, updateValues, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.affectedRows > 0); // returns true if atleast one row changed
        }
      });
    });
  }

  static deleteById(id) {
    return new Promise((resolve, reject) => {
      db.query('DELETE FROM users WHERE id = ?', [id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.affectedRows > 0);
        }
      });
    });
  }

  static existsById(id) {
    return new Promise((resolve, reject) => {
      db.query('SELECT id FROM users WHERE id = ?', [id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.length > 0);
        }
      });
    });
  }

  comparePassword(candidatePassword) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        if (err) {
          reject(err);
        } else {
          resolve(isMatch);
        }
      });
    });
  }

  toJSON() {
    const userObj = { ...this };
    delete userObj.password;
    return userObj;
  }

  static usernameExists(username, excludeId = null) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT id FROM users WHERE username = ?';
      let params = [username]; // because db.query expects an array of values as params which it will fit as ?
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      
      db.query(query, params, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.length > 0);
        }
      });
    });
  }

  static emailExists(email, excludeId = null) {
    return new Promise((resolve, reject) => {
      let query = 'SELECT id FROM users WHERE email = ?';
      let params = [email];
      
      if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
      }
      
      db.query(query, params, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results.length > 0);
        }
      });
    });
  }


  static hashPassword(password) {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          reject(err);
        } else {
          resolve(hashedPassword);
        }
      });
    });
  }
}

module.exports = User;
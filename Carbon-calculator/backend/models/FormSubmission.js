const db = require('../db/connection');

class FormSubmission {
  constructor(data) {
    this.id = data.id;
    this.userId = data.userId;
    this.formType = data.formType;
    this.submissionData = data.submissionData;
    this.carbonFootprint = data.carbonFootprint;
    this.submittedAt = data.submittedAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }


  static findAll() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM FormSubmissions', (err, results) => {
        if (err) return reject(err);
        const submissions = results.map(row => new FormSubmission(row));
        resolve(submissions);
      });
    });
  }

  static findByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM FormSubmissions WHERE userId = ?', [userId], (err, results) => {
        if (err) return reject(err);
        const submissions = results.map(row => new FormSubmission(row));
        resolve(submissions);
      });
    });
  }

 
save() {
    return new Promise((resolve, reject) => {
      db.query(
        `INSERT INTO FormSubmissions (userId, formType, submissionData, carbonFootprint)
         VALUES (?, ?, ?, ?)`,
        [this.userId, this.formType, JSON.stringify(this.submissionData), this.carbonFootprint],
        (err, result) => {
          if (err) return reject(err);
          this.id = result.insertId;
          resolve(this);
        }
      );
    });
  }
}

module.exports = FormSubmission;

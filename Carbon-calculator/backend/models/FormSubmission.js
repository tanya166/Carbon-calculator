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

  static async findAll() {
    try {
      const [results] = await db.query('SELECT * FROM FormSubmissions');
      return results.map(row => new FormSubmission(row));
    } catch (err) {
      throw err;
    }
  }

  static async findByUserId(userId) {
    try {
      const [results] = await db.query('SELECT * FROM FormSubmissions WHERE userId = ?', [userId]);
      return results.map(row => new FormSubmission(row));
    } catch (err) {
      throw err;
    }
  }

  async save() {
    try {
      const [result] = await db.query(
        `INSERT INTO FormSubmissions (userId, formType, submissionData, carbonFootprint)
         VALUES (?, ?, ?, ?)`,
        [this.userId, this.formType, JSON.stringify(this.submissionData), this.carbonFootprint]
      );
      this.id = result.insertId;
      return this;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = FormSubmission;
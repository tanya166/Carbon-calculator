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

  // Auto-create table if it doesn't exist
  static async ensureTableExists() {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS FormSubmissions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          userId INT NOT NULL,
          formType VARCHAR(255) NOT NULL,
          submissionData JSON NOT NULL,
          carbonFootprint DECIMAL(10,2) DEFAULT 0,
          submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_userId (userId),
          FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ FormSubmissions table ensured');
    } catch (err) {
      console.error('❌ Error creating FormSubmissions table:', err);
      throw err;
    }
  }

  static async findAll() {
    try {
      await this.ensureTableExists();
      const [results] = await db.query('SELECT * FROM FormSubmissions');
      return results.map(row => new FormSubmission(row));
    } catch (err) {
      throw err;
    }
  }

  static async findByUserId(userId) {
    try {
      await this.ensureTableExists();
      const [results] = await db.query('SELECT * FROM FormSubmissions WHERE userId = ? ORDER BY submittedAt DESC', [userId]);
      return results.map(row => {
        // Parse JSON submissionData if it's a string
        const submission = new FormSubmission(row);
        if (typeof submission.submissionData === 'string') {
          try {
            submission.submissionData = JSON.parse(submission.submissionData);
          } catch (parseErr) {
            console.warn('Could not parse submissionData:', parseErr);
          }
        }
        return submission;
      });
    } catch (err) {
      throw err;
    }
  }

  async save() {
    try {
      await FormSubmission.ensureTableExists();
      const [result] = await db.query(
        `INSERT INTO FormSubmissions (userId, formType, submissionData, carbonFootprint)
         VALUES (?, ?, ?, ?)`,
        [
          this.userId, 
          this.formType, 
          JSON.stringify(this.submissionData), 
          this.carbonFootprint || 0
        ]
      );
      this.id = result.insertId;
      
      // Fetch the complete record to get timestamps
      const [insertedRecord] = await db.query('SELECT * FROM FormSubmissions WHERE id = ?', [this.id]);
      if (insertedRecord.length > 0) {
        Object.assign(this, insertedRecord[0]);
        if (typeof this.submissionData === 'string') {
          this.submissionData = JSON.parse(this.submissionData);
        }
      }
      
      return this;
    } catch (err) {
      throw err;
    }
  }

  static async deleteById(id, userId) {
    try {
      await this.ensureTableExists();
      const [result] = await db.query(
        'DELETE FROM FormSubmissions WHERE id = ? AND userId = ?',
        [id, userId]
      );
      return result.affectedRows > 0;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = FormSubmission;
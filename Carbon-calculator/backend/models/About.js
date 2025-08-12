
const db = require('../db/connection');

class About {
  constructor(data) {
    this.id = data.id;
    this.text_1 = data.text_1;
    this.text_2 = data.text_2;
  }

  static async findAll() {
    try {
      const [results] = await db.query('SELECT * FROM information');
      const info = results.map(row => new About(row));
      return info;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = About;


const db = require('../db/connection');

class Offset {
  constructor(data) {
    this.id = data.id;
    this.text = data.text;
    this.text2 = data.text2;
  }

  static async findAll() {
    try {
      const [results] = await db.query('SELECT * FROM details');
      const info = results.map(row => new Offset(row));
      return info;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Offset;
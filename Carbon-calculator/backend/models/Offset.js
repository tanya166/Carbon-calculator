const db = require('../db/connection');

class Offset {
  constructor(data) {
    this.id = data.id;
    this.text = data.text;
    this.text2 = data.text2;
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM details', (err, results) => {
        if (err) {
          return reject(err);
        }
        const info = results.map(row => new Offset(row));
        resolve(info);
      });
    });
  }
}

module.exports = Offset;
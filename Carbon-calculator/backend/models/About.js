const db = require('../db/connection');

class About {
  constructor(data) {
    this.id = data.id;
    this.text_1 = data.text_1;
    this.text_2 = data.text_2;
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      db.query('SELECT * FROM information', (err, results) => {
        if (err) {
          return reject(err);
        }
        const info = results.map(row => new About(row));
        resolve(info);
      });
    });
  }
}

module.exports = About;


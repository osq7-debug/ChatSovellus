const bcrypt = require('bcrypt');

const salasana = 'Osku123'; //Salasana
const saltRounds = 10;

bcrypt.hash(salasana, saltRounds, (err, hash) => {
    if (err) throw err;
    console.log('Hashattu salasana:');
    console.log(hash);
});

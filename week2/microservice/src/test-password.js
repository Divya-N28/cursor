const bcrypt = require('bcryptjs');

const storedHash = '$2a$10$UYL6nESETm6ru1p7LOoP.OGp2jZz9aZlkPXwghSXMujiwJLZlAlRy';
const password = 'password123';

bcrypt.compare(password, storedHash)
  .then(result => {
    console.log('Password comparison result:', result);
  })
  .catch(error => {
    console.error('Error comparing passwords:', error);
  }); 
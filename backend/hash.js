import bcrypt from 'bcryptjs';

const password = 'admin123'; // Change this to your desired password
const saltRounds = 12;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
  } else {
    console.log('Hashed password:', hash);
  }
});
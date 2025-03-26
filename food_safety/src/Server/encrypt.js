import bcrypt from "bcrypt";

const saltRounds = 10;

const hashedPassword = async (password) => {
  return await bcrypt.hash(password, saltRounds);
};


const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export { hashedPassword, comparePassword };

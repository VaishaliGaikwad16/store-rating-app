function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    password.length <= 16 &&
    /[A-Z]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

function validateName(name) {
  return typeof name === "string" && name.trim().length >= 20 && name.trim().length <= 60;
}

function validateAddress(address) {
  return typeof address === "string" && address.trim().length <= 400;
}

module.exports = { isValidEmail, isValidPassword, validateName, validateAddress };
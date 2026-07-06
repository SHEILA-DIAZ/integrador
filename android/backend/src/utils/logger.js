const logError = (mensaje, error) => {
  console.error(`❌ ${mensaje}`);
  console.error(error);
};

module.exports = { logError };
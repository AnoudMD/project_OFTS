function makeQrValue(batchId) {
  return `http://localhost:3000/api/scan/${batchId}`;
}

module.exports = { makeQrValue };
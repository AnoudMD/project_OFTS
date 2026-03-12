const QRCode = require('qrcode');
const generateBatchQr = async (text) => {
return QRCode.toDataURL(text);
};
module.exports = { generateBatchQr };
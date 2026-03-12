module.exports = (req, res, next) => {
const { productName, farmName, productionDate, expiryDate } = req.body;
if (!productName || !farmName || !productionDate || !expiryDate) {
return res.status(400).json({ message: 'Missing required fields' });
}
if (new Date(expiryDate) <= new Date(productionDate)) {
return res.status(400).json({ message:
'Expiry date must be after production date' });
}
next();
};
const validateBatch = require('../middleware/validateBatch');
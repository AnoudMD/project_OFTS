const router = require("express").Router();
const store = require("../data/store");
const { requireRole } = require("../middleware/auth");
const generateId = require("../utils/generateId");
const { makeQrValue } = require("../utils/qr");

// إنشاء Batch
router.post("/", requireRole(["producer"]), (req, res) => {
  const {
    productName,
    farmName,
    productionDate,
    expiryDate,
    certificateId,
    verificationUrl
  } = req.body || {};

  if (!productName || !farmName || !productionDate || !expiryDate) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const batch = {
  id: generateId("BATCH"),
  productName,
  farmName,
  productionDate,
  expiryDate,
  certificateId: certificateId || "",
  verificationUrl: verificationUrl || "",
  status: "ACTIVE",
  certificationStatus: "PENDING",
  certifierNotes: "",
  certifiedAt: null,
  createdByRole: req.role,
  createdAt: new Date().toISOString()
};

  store.batches.push(batch);

  return res.status(201).json(batch);
});

// جلب كل الباتشات
router.get("/", (req, res) => {
  res.json(store.batches);
});

// جلب Batch واحد
router.get("/:id", (req, res) => {
  const batch = store.batches.find((b) => b.id === req.params.id);

  if (!batch) {
    return res.status(404).json({ message: "Batch not found" });
  }

  return res.json(batch);
});

// QR value
router.get("/:id/qr", (req, res) => {
  const batch = store.batches.find((b) => b.id === req.params.id);

  if (!batch) {
    return res.status(404).json({ message: "Batch not found" });
  }

  return res.json({
    batchId: batch.id,
    qrValue: makeQrValue(batch.id)
  });
});

module.exports = router;
const router = require("express").Router({ mergeParams: true });
const multer = require("multer");
const path = require("path");
const store = require("../data/store");
const { requireRole } = require("../middleware/auth");
const generateId = require("../utils/generateId");
const hashFile = require("../utils/hashFile");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/certificates"));
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// upload certificate
router.post("/", requireRole(["producer"]), upload.single("certificateFile"), (req, res) => {
  const batchId = req.params.batchId;
  const batch = store.batches.find((b) => b.id === batchId);

  if (!batch) {
    return res.status(404).json({ message: "Batch not found" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "certificateFile is required" });
  }

  const certificateId = req.body.certificateId || batch.certificateId || "";
  const verificationUrl = req.body.verificationUrl || batch.verificationUrl || "";
  const filePath = req.file.path;
  const fileHash = hashFile(filePath);

  const certificate = {
    id: generateId("CERT"),
    batchId,
    fileName: req.file.filename,
    originalName: req.file.originalname,
    filePath: `/uploads/certificates/${req.file.filename}`,
    fileHash,
    certificateId,
    verificationUrl,
    uploadedAt: new Date().toISOString()
  };

  batch.certificateId = certificateId;
  batch.verificationUrl = verificationUrl;

  const oldIndex = store.certificates.findIndex((c) => c.batchId === batchId);
  if (oldIndex !== -1) {
    store.certificates.splice(oldIndex, 1);
  }

  store.certificates.push(certificate);

  return res.status(201).json({
    message: "Certificate uploaded successfully",
    certificate
  });
});

// certifier approve or reject certificate
router.post("/approve", requireRole(["certifier"]), (req, res) => {
  const batchId = req.params.batchId;
  const { decision, notes } = req.body || {};

  const batch = store.batches.find((b) => b.id === batchId);

  if (!batch) {
    return res.status(404).json({
      message: "Batch not found"
    });
  }

  if (!["APPROVED", "REJECTED"].includes(decision)) {
    return res.status(400).json({
      message: "Decision must be APPROVED or REJECTED"
    });
  }

  batch.certificationStatus = decision;
  batch.certifierNotes = notes || "";
  batch.certifiedAt = new Date().toISOString();

  return res.json({
    message: "Certification decision saved",
    batch
  });
});

module.exports = router;
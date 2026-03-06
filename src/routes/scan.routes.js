const router = require("express").Router();
const store = require("../data/store");

router.get("/:batchId", async (req, res) => {
  const batch = store.batches.find((b) => b.id === req.params.batchId);

  if (!batch) {
    return res.status(404).json({
      valid: false,
      message: "Invalid QR"
    });
  }

  const certificate =
    store.certificates.find((c) => c.batchId === batch.id) || null;

  const events = store.events
    .filter((e) => e.batchId === batch.id)
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));

  let authorityVerified = null;
  let authorityData = null;

  if (certificate && certificate.verificationUrl) {
    try {
      const response = await fetch(certificate.verificationUrl);
      if (response.ok) {
        const data = await response.json();
        authorityVerified = !!data.valid;
        authorityData = data.certificate || null;
      } else {
        authorityVerified = false;
      }
    } catch (error) {
      authorityVerified = false;
    }
  }

  return res.json({
  valid: true,
  batch: {
    id: batch.id,
    productName: batch.productName,
    farmName: batch.farmName,
    productionDate: batch.productionDate,
    expiryDate: batch.expiryDate,
    status: batch.status,
    certificationStatus: batch.certificationStatus,
    certifierNotes: batch.certifierNotes,
    certifiedAt: batch.certifiedAt
  },
  certificate: certificate
    ? {
        id: certificate.id,
        certificateId: certificate.certificateId,
        verificationUrl: certificate.verificationUrl,
        filePath: certificate.filePath,
        fileHash: certificate.fileHash,
        authorityVerified,
        authorityData
      }
    : null,
  events
});
});

module.exports = router;
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const certificates = [
  {
    certificateId: "ORG-2026-0001",
    issuer: "Saudi Organic Authority (DEMO)",
    company: "Al Farm",
    productType: "Organic Grapes",
    issueDate: "2026-03-01",
    expiryDate: "2026-09-01",
    status: "VALID"
  },
  {
    certificateId: "ORG-2026-0002",
    issuer: "Saudi Organic Authority (DEMO)",
    company: "Green Valley",
    productType: "Organic Honey",
    issueDate: "2026-03-02",
    expiryDate: "2026-10-01",
    status: "VALID"
  }
];

app.get("/", (req, res) => {
  res.json({ ok: true, service: "Authority Verification Server" });
});

app.get("/verify/:certificateId", (req, res) => {
  const cert = certificates.find(
    (c) => c.certificateId === req.params.certificateId
  );

  if (!cert) {
    return res.status(404).json({
      valid: false,
      message: "Certificate not found"
    });
  }

  return res.json({
    valid: true,
    certificate: cert
  });
});

app.listen(4000, () => {
  console.log("Authority server running on http://localhost:4000");
});
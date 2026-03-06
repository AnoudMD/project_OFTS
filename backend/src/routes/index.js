const router = require("express").Router();

router.get("/ping", (req, res) => {
  res.json({ pong: true });
});

router.use("/auth", require("./auth.routes"));
router.use("/batches", require("./batches.routes"));
router.use("/batches/:batchId/events", require("./events.routes"));
router.use("/batches/:batchId/certificate", require("./certificate.routes"));
router.use("/scan", require("./scan.routes"));

module.exports = router;
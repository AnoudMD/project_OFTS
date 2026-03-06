const router = require("express").Router({ mergeParams: true });
const store = require("../data/store");
const { requireRole } = require("../middleware/auth");
const generateId = require("../utils/generateId");

router.post("/", requireRole(["distributor", "retailer"]), (req, res) => {
  const { type, location, dateTime, notes } = req.body || {};
  const batchId = req.params.batchId;

  if (!type || !location || !dateTime) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const batch = store.batches.find((b) => b.id === batchId);

  if (!batch) {
    return res.status(404).json({ message: "Batch not found" });
  }

  const event = {
    id: generateId("EV"),
    batchId,
    type,
    location,
    dateTime,
    notes: notes || "",
    actorRole: req.role,
    createdAt: new Date().toISOString()
  };

  store.events.push(event);

  return res.status(201).json(event);
});

module.exports = router;
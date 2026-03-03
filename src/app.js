const express = require("express");

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true, service: "OFTS API" }));
app.use("/api", require("./routes"));

module.exports = app;
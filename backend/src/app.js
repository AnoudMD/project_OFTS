const express = require("express");
const cors = require("cors");
const path = require("path");

const routes = require("./routes");

const app = express();

app.use(cors());
app.use(express.json());

// الوصول للملفات المرفوعة
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "OFTS API"
  });
});

app.use("/api", routes);

module.exports = app;


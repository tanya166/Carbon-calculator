const { Router } = require("express");
const Offset = require("../models/Offset");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const info = await Offset.findAll();
    res.json(info);
  } catch (err) {
    console.error("Error fetching offset data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
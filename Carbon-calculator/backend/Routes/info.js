const { Router } = require("express");
const About = require("../models/About");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const info = await About.findAll();
    res.json(info);
  } catch (err) {
    console.error("Error fetching about data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;


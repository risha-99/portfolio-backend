const express = require("express");
const { getProjects, getProjectById } = require("../controllers/projects");

const router = express.Router();

// Public read — used by the portfolio site
router.get("/", getProjects);
router.get("/:id", getProjectById);

module.exports = router;

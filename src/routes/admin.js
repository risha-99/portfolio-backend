const express = require("express");
const Project = require("../models/Project");
const TechStack = require("../models/TechStack");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth, requireAdmin);

function normalizeTechList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

/** New bullet only when text starts with "-" (or a new line with "-"). */
function normalizeHighlights(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value !== "string") return [];

  return value
    .split(/(?:^|\n)\s*-\s*/)
    .map((item) => item.trim().replace(/\s*\n\s*/g, " "))
    .filter(Boolean);
}

async function resolveTechStackIds(value) {
  const names = normalizeTechList(value);
  const ids = [];

  for (const name of names) {
    let tech = await TechStack.findOne({
      project_tech_stack: new RegExp(`^${escapeRegex(name)}$`, "i"),
    });

    if (!tech) {
      tech = await TechStack.create({ project_tech_stack: name });
    }

    ids.push(tech._id);
  }

  return ids;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function projectPayload(body = {}) {
  return {
    title: body.title,
    subtitle: body.subtitle ?? "",
    role: body.role ?? "",
    timeline: body.timeline ?? "",
    description: body.description ?? "",
    highlights: normalizeHighlights(body.highlights),
    metrics: body.metrics ?? "",
    link: body.link || "#",
    featured: Boolean(body.featured),
    tech_stack: await resolveTechStackIds(body.tech_stack ?? body.tags),
  };
}

// List all projects
router.get("/projects", async (_req, res) => {
  try {
    const projects = await Project.find()
      .populate("tech_stack")
      .sort({ createdAt: -1 });
    res.status(200).json({ projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
});

// Get one project
router.get("/projects/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate("tech_stack");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ project });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch project" });
  }
});

// Create project
router.post("/projects", async (req, res) => {
  try {
    if (!req.body?.title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const created = await Project.create(await projectPayload(req.body));
    const project = await Project.findById(created._id).populate("tech_stack");
    res.status(201).json({ project, message: "Project created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create project" });
  }
});

// Update project
router.put("/projects/:id", async (req, res) => {
  try {
    if (!req.body?.title?.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      await projectPayload(req.body),
      { new: true, runValidators: true }
    ).populate("tech_stack");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(200).json({ project, message: "Project updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update project" });
  }
});

// Delete project
router.delete("/projects/:id", async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete project" });
  }
});

module.exports = router;

const Project = require("../models/Project");

async function getProjects(_req, res) {
  try {
    const projects = await Project.find()
      .populate("tech_stack")
      .sort({ featured: -1, createdAt: -1 });
    res.status(200).json({ projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch projects" });
  }
}

async function getProjectById(req, res) {
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
}

module.exports = {
  getProjects,
  getProjectById,
};

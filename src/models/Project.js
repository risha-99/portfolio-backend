const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "", trim: true },
    role: { type: String, default: "", trim: true },
    timeline: { type: String, default: "", trim: true },
    description: { type: String, default: "" },
    highlights: [{ type: String, trim: true }],
    metrics: { type: String, default: "", trim: true },
    link: { type: String, default: "#", trim: true },
    featured: { type: Boolean, default: false },
    tech_stack: [{ type: mongoose.Schema.Types.ObjectId, ref: "TechStack" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);

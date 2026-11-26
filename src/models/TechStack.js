const mongoose = require("mongoose");

const techStackSchema = new mongoose.Schema({
    project_tech_stack: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("TechStack", techStackSchema);
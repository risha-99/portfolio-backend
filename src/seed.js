const User = require("./models/User");
const Project = require("./models/Project");
const { ROLES } = require("./models/User");

async function seedAdminPortal() {
  // Remove legacy sub-user accounts from earlier schema
  const removed = await User.deleteMany({ role: { $ne: ROLES.ADMIN } });
  if (removed.deletedCount > 0) {
    console.log(`Removed ${removed.deletedCount} non-admin user(s)`);
  }

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@portfolio.local").toLowerCase();

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: "Admin",
      email: adminEmail,
      password: process.env.ADMIN_PASSWORD || "Admin@123",
      role: ROLES.ADMIN,
    });
    console.log(`Seeded admin user: ${adminEmail}`);
  }

  // Migrate legacy project docs (owner/tech from older schema)
  const legacyProjects = await Project.collection.find({
    $or: [{ owner: { $exists: true } }, { tech: { $exists: true } }],
  }).toArray();

  for (const doc of legacyProjects) {
    const tags =
      Array.isArray(doc.tags) && doc.tags.length
        ? doc.tags
        : Array.isArray(doc.tech)
          ? doc.tech
          : [];

    await Project.collection.updateOne(
      { _id: doc._id },
      {
        $set: {
          subtitle: doc.subtitle || "",
          role: doc.role || "",
          timeline: doc.timeline || "",
          highlights: Array.isArray(doc.highlights) ? doc.highlights : [],
          tags,
          metrics: doc.metrics || "",
          link: doc.link || "#",
        },
        $unset: { owner: "", tech: "" },
      }
    );
  }

  if (legacyProjects.length > 0) {
    console.log(`Migrated ${legacyProjects.length} legacy project(s)`);
  }

  const projectCount = await Project.countDocuments();
  if (projectCount === 0) {
    await Project.create([
      {
        title: "Portfolio Website",
        subtitle: "Personal Brand Site",
        role: "Full Stack Developer",
        timeline: "2026",
        description: "Personal portfolio built with React, Express, and MongoDB.",
        highlights: [
          "Admin portal for project CRUD",
          "JWT-authenticated Express API",
        ],
        tags: ["Next.js", "Express", "MongoDB"],
        metrics: "Admin + API",
        link: "#",
        featured: true,
      },
      {
        title: "Sample App",
        subtitle: "Demo Project",
        role: "Solo Developer",
        timeline: "2026",
        description: "Example project managed from the admin portal.",
        highlights: ["Created via seed data"],
        tags: ["Node.js"],
        metrics: "Demo",
        link: "#",
        featured: false,
      },
    ]);
    console.log("Seeded sample projects");
  }

  return { admin };
}

module.exports = { seedAdminPortal };

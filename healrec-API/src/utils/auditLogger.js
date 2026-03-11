const AuditLog = require("../models/auditLogSchema");

const logPatientAccess = async ({
  patientId,
  actor,
  action,
  resourceType,
  resourceId = "",
  req = null,
  details = {},
}) => {
  try {
    if (!patientId || !actor?._id || !actor?.role || !action || !resourceType) {
      return;
    }

    await AuditLog.create({
      patientId,
      actorId: actor._id,
      actorRole: actor.role,
      actorName: actor.name || actor.email || "Unknown",
      action,
      resourceType,
      resourceId: resourceId ? String(resourceId) : "",
      details,
      ipAddress: req?.ip || req?.headers?.["x-forwarded-for"] || "",
      userAgent: req?.get?.("user-agent") || "",
    });
  } catch (error) {
    console.error("[audit] failed to write access log:", error.message);
  }
};

module.exports = { logPatientAccess };


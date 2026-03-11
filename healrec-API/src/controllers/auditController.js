const AuditLog = require("../models/auditLogSchema");

const getMyAuditLogs = async (req, res) => {
  try {
    const patientId = req.user._id;
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 50, 1),
      200
    );
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      AuditLog.find({ patientId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments({ patientId }),
    ]);

    return res.json({
      success: true,
      logs: logs.map((log) => ({
        id: log._id,
        actorName: log.actorName,
        actorRole: log.actorRole,
        action: log.action,
        resourceType: log.resourceType,
        resourceId: log.resourceId,
        details: log.details || {},
        viewedAt: log.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
      },
    });
  } catch (error) {
    console.error("getMyAuditLogs error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch trust logs",
    });
  }
};

module.exports = { getMyAuditLogs };


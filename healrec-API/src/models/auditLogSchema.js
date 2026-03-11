const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
      immutable: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      immutable: true,
    },
    actorRole: {
      type: String,
      enum: ["doctor", "patient", "system"],
      required: true,
      immutable: true,
    },
    actorName: {
      type: String,
      default: "Unknown",
      immutable: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      immutable: true,
      trim: true,
    },
    resourceType: {
      type: String,
      required: true,
      immutable: true,
      trim: true,
    },
    resourceId: {
      type: String,
      default: "",
      immutable: true,
      trim: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      immutable: true,
    },
    ipAddress: {
      type: String,
      default: "",
      immutable: true,
      trim: true,
    },
    userAgent: {
      type: String,
      default: "",
      immutable: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

auditLogSchema.index({ patientId: 1, createdAt: -1 });
auditLogSchema.index({ actorId: 1, createdAt: -1 });

const immutableError = () => {
  throw new Error("Audit logs are immutable");
};

auditLogSchema.pre("findOneAndUpdate", immutableError);
auditLogSchema.pre("updateOne", immutableError);
auditLogSchema.pre("updateMany", immutableError);
auditLogSchema.pre("findOneAndDelete", immutableError);
auditLogSchema.pre("deleteOne", immutableError);
auditLogSchema.pre("deleteMany", immutableError);

module.exports = mongoose.model("AuditLog", auditLogSchema);


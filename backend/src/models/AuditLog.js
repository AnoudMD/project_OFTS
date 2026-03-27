const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role:       { type: String, required: true },
  action:     { type: String, required: true },
  targetType: { type: String, enum: ['Batch', 'Event', 'User', 'System'] },
  targetId:   { type: String, default: '' },
  details:    { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
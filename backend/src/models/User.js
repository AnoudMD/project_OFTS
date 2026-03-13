const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['consumer', 'producer', 'certifier', 'distributor', 'retailer'];

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Never return password hash in queries by default
    },
    role: {
      type: String,
      enum: { values: ROLES, message: 'Invalid role: {VALUE}' },
      default: 'consumer',
    },
    organization: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

// ── Instance methods ──────────────────────────────────────────────────────────

/** Compare a plain-text password against the stored hash */
userSchema.methods.comparePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// ── Static methods ────────────────────────────────────────────────────────────

/** Hash a plain-text password */
userSchema.statics.hashPassword = async function (plain) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plain, salt);
};

// ── Pre-save hook — auto-hash if password field was changed manually ───────────
userSchema.pre('save', async function (next) {
  // Only runs if passwordHash was set as plain text (e.g., during seeding)
  if (!this.isModified('passwordHash')) return next();
  // If already hashed (starts with $2b$) skip
  if (this.passwordHash.startsWith('$2b$')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

module.exports = mongoose.model('User', userSchema);

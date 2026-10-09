const mongoose = require('mongoose');
const { Schema } = mongoose;

// 1. User Model
const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    role: { type: String, enum: ['ADMIN', 'STUDENT'], required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 2. Session Model
const SessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// 3. PasswordToken Model
const PasswordTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true, unique: true },
    purpose: { type: String, enum: ['SETUP', 'RESET'], required: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// 4. Branch Model
const BranchSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 5. Course Model
const CourseSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    creditHours: { type: Number, required: true, min: 1, max: 6 },
    department: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 6. Student Model
const StudentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    cnic: { type: String, required: true, unique: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    address: { type: String, required: true, trim: true },
    fatherName: { type: String, required: true, trim: true },
    parentCnic: { type: String, required: true, trim: true },
    occupation: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    emergencyContact: { type: String, required: true, trim: true },
    program: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, min: 1, max: 12 },
    sessionBatch: { type: String, required: true, trim: true },
    prevQualification: { type: String, required: true, trim: true },
    prevInstitute: { type: String, required: true, trim: true },
    marksOrCgpa: { type: String, required: true, trim: true },
    selectedBranchId: { type: Schema.Types.ObjectId, ref: 'Branch', default: null },
    assignmentsFinalized: { type: Boolean, default: false },
    deactivatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// 7. Assignment Model
const AssignmentSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  },
  { timestamps: true }
);
AssignmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// 8. ExamSlot Model
const ExamSlotSchema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' },
  },
  { timestamps: true }
);

// 9. DateSheet Model
const DateSheetSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
    currentRevision: { type: Number, default: 1 },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 10. Selection Model
const SelectionSchema = new Schema(
  {
    dateSheetId: { type: Schema.Types.ObjectId, ref: 'DateSheet', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    slotId: { type: Schema.Types.ObjectId, ref: 'ExamSlot', required: true },
  },
  { timestamps: true }
);

// 11. SheetRevision Model
const SheetRevisionSchema = new Schema(
  {
    dateSheetId: { type: Schema.Types.ObjectId, ref: 'DateSheet', required: true },
    revision: { type: Number, required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    documentSnapshot: { type: String, required: true },
    reason: { type: String, required: true },
  },
  { timestamps: true }
);

// 12. ChangeRequest Model
const ChangeRequestSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    type: { type: String, enum: ['BRANCH', 'DATE_SHEET'], required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    remark: { type: String, default: null },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// 13. ChangeGrant Model
const ChangeGrantSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    requestId: { type: Schema.Types.ObjectId, ref: 'ChangeRequest', required: true },
    type: { type: String, enum: ['BRANCH', 'DATE_SHEET'], required: true },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = {
  User: mongoose.models.User || mongoose.model('User', UserSchema),
  Session: mongoose.models.Session || mongoose.model('Session', SessionSchema),
  PasswordToken: mongoose.models.PasswordToken || mongoose.model('PasswordToken', PasswordTokenSchema),
  Branch: mongoose.models.Branch || mongoose.model('Branch', BranchSchema),
  Course: mongoose.models.Course || mongoose.model('Course', CourseSchema),
  Student: mongoose.models.Student || mongoose.model('Student', StudentSchema),
  Assignment: mongoose.models.Assignment || mongoose.model('Assignment', AssignmentSchema),
  ExamSlot: mongoose.models.ExamSlot || mongoose.model('ExamSlot', ExamSlotSchema),
  DateSheet: mongoose.models.DateSheet || mongoose.model('DateSheet', DateSheetSchema),
  Selection: mongoose.models.Selection || mongoose.model('Selection', SelectionSchema),
  SheetRevision: mongoose.models.SheetRevision || mongoose.model('SheetRevision', SheetRevisionSchema),
  ChangeRequest: mongoose.models.ChangeRequest || mongoose.model('ChangeRequest', ChangeRequestSchema),
  ChangeGrant: mongoose.models.ChangeGrant || mongoose.model('ChangeGrant', ChangeGrantSchema),
};

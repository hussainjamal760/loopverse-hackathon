import mongoose, { Schema, Document, Model } from 'mongoose';

// 1. User Model
export interface IUser extends Document {
  email: string;
  passwordHash?: string | null;
  role: 'ADMIN' | 'STUDENT';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    role: { type: String, enum: ['ADMIN', 'STUDENT'], required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 2. Session Model
export interface ISession extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  createdAt: Date;
}

const SessionSchema = new Schema<ISession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// 3. PasswordToken Model
export interface IPasswordToken extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  purpose: 'SETUP' | 'RESET';
  expiresAt: Date;
  usedAt?: Date | null;
  createdAt: Date;
}

const PasswordTokenSchema = new Schema<IPasswordToken>(
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
export interface IBranch extends Document {
  code: string;
  name: string;
  city: string;
  address: string;
  contactNumber: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>(
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
export interface ICourse extends Document {
  code: string;
  title: string;
  creditHours: number;
  department: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    creditHours: { type: Number, required: true },
    department: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// 6. Student Model
export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  registrationNumber: string;
  fullName: string;
  phone: string;
  cnic: string;
  dateOfBirth: Date;
  gender: string;
  address: string;
  photoUrl?: string | null;
  fatherName: string;
  parentCnic: string;
  occupation: string;
  contactNumber: string;
  emergencyContact: string;
  program: string;
  semester: number;
  sessionBatch: string;
  prevQualification: string;
  prevInstitute: string;
  marksOrCgpa: string;
  selectedBranchId?: mongoose.Types.ObjectId | null;
  assignmentsFinalized: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    registrationNumber: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    cnic: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    photoUrl: { type: String, default: null },
    fatherName: { type: String, required: true, trim: true },
    parentCnic: { type: String, required: true, trim: true },
    occupation: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    emergencyContact: { type: String, required: true, trim: true },
    program: { type: String, required: true, trim: true },
    semester: { type: Number, required: true },
    sessionBatch: { type: String, required: true, trim: true },
    prevQualification: { type: String, required: true, trim: true },
    prevInstitute: { type: String, required: true, trim: true },
    marksOrCgpa: { type: String, required: true, trim: true },
    selectedBranchId: { type: Schema.Types.ObjectId, ref: 'Branch', default: null },
    assignmentsFinalized: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);

// 7. Assignment Model
export interface IAssignment extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  },
  { timestamps: true }
);
AssignmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// 8. ExamSlot Model
export interface IExamSlot extends Document {
  courseId: mongoose.Types.ObjectId;
  startsAt: Date;
  endsAt: Date;
  status: 'DRAFT' | 'PUBLISHED';
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSlotSchema = new Schema<IExamSlot>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
);
ExamSlotSchema.index({ courseId: 1, startsAt: 1, endsAt: 1 }, { unique: true });

// 9. DateSheet Model
export interface IDateSheet extends Document {
  studentId: mongoose.Types.ObjectId;
  currentRevision: number;
  savedAt: Date;
  updatedAt: Date;
}

const DateSheetSchema = new Schema<IDateSheet>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true, unique: true },
    currentRevision: { type: Number, default: 1 },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 10. Selection Model
export interface ISelection extends Document {
  dateSheetId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  slotId: mongoose.Types.ObjectId;
}

const SelectionSchema = new Schema<ISelection>(
  {
    dateSheetId: { type: Schema.Types.ObjectId, ref: 'DateSheet', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    slotId: { type: Schema.Types.ObjectId, ref: 'ExamSlot', required: true },
  },
  { timestamps: false }
);
SelectionSchema.index({ dateSheetId: 1, courseId: 1 }, { unique: true });

// 11. SheetRevision Model
export interface ISheetRevision extends Document {
  dateSheetId: mongoose.Types.ObjectId;
  revision: number;
  branchId: mongoose.Types.ObjectId;
  documentSnapshot: string;
  reason?: string | null;
  createdAt: Date;
}

const SheetRevisionSchema = new Schema<ISheetRevision>(
  {
    dateSheetId: { type: Schema.Types.ObjectId, ref: 'DateSheet', required: true },
    revision: { type: Number, required: true },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    documentSnapshot: { type: String, required: true },
    reason: { type: String, default: null },
  },
  { timestamps: true }
);
SheetRevisionSchema.index({ dateSheetId: 1, revision: 1 }, { unique: true });

// 12. ChangeRequest Model
export interface IChangeRequest extends Document {
  studentId: mongoose.Types.ObjectId;
  type: 'BRANCH' | 'DATE_SHEET';
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  remark?: string | null;
  reviewedBy?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  reviewedAt?: Date | null;
}

const ChangeRequestSchema = new Schema<IChangeRequest>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    type: { type: String, enum: ['BRANCH', 'DATE_SHEET'], required: true },
    reason: { type: String, required: true, trim: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    remark: { type: String, default: null },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// 13. ChangeGrant Model
export interface IChangeGrant extends Document {
  requestId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  type: 'BRANCH' | 'DATE_SHEET';
  consumedAt?: Date | null;
  createdAt: Date;
}

const ChangeGrantSchema = new Schema<IChangeGrant>(
  {
    requestId: { type: Schema.Types.ObjectId, ref: 'ChangeRequest', required: true, unique: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    type: { type: String, enum: ['BRANCH', 'DATE_SHEET'], required: true },
    consumedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// 14. EmailOutbox Model
export interface IEmailOutbox extends Document {
  userId: mongoose.Types.ObjectId;
  template: string;
  relatedEntityId?: string | null;
  status: 'PENDING' | 'SENT' | 'FAILED';
  attempts: number;
  nextAttemptAt: Date;
  sentAt?: Date | null;
  sanitizedError?: string | null;
  createdAt: Date;
}

const EmailOutboxSchema = new Schema<IEmailOutbox>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    template: { type: String, required: true },
    relatedEntityId: { type: String, default: null },
    status: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
    attempts: { type: Number, default: 0 },
    nextAttemptAt: { type: Date, default: Date.now },
    sentAt: { type: Date, default: null },
    sanitizedError: { type: String, default: null },
  },
  { timestamps: true }
);

// 15. AuditEvent Model
export interface IAuditEvent extends Document {
  actorUserId: mongoose.Types.ObjectId;
  action: string;
  entityType: string;
  entityId: string;
  sanitizedMetadata?: string | null;
  createdAt: Date;
}

const AuditEventSchema = new Schema<IAuditEvent>(
  {
    actorUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true },
    sanitizedMetadata: { type: String, default: null },
  },
  { timestamps: true }
);

// Export Mongoose Models with singleton prevention for Next.js hot reloading
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export const Session: Model<ISession> = mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);
export const PasswordToken: Model<IPasswordToken> = mongoose.models.PasswordToken || mongoose.model<IPasswordToken>('PasswordToken', PasswordTokenSchema);
export const Branch: Model<IBranch> = mongoose.models.Branch || mongoose.model<IBranch>('Branch', BranchSchema);
export const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
export const Student: Model<IStudent> = mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
export const Assignment: Model<IAssignment> = mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);
export const ExamSlot: Model<IExamSlot> = mongoose.models.ExamSlot || mongoose.model<IExamSlot>('ExamSlot', ExamSlotSchema);
export const DateSheet: Model<IDateSheet> = mongoose.models.DateSheet || mongoose.model<IDateSheet>('DateSheet', DateSheetSchema);
export const Selection: Model<ISelection> = mongoose.models.Selection || mongoose.model<ISelection>('Selection', SelectionSchema);
export const SheetRevision: Model<ISheetRevision> = mongoose.models.SheetRevision || mongoose.model<ISheetRevision>('SheetRevision', SheetRevisionSchema);
export const ChangeRequest: Model<IChangeRequest> = mongoose.models.ChangeRequest || mongoose.model<IChangeRequest>('ChangeRequest', ChangeRequestSchema);
export const ChangeGrant: Model<IChangeGrant> = mongoose.models.ChangeGrant || mongoose.model<IChangeGrant>('ChangeGrant', ChangeGrantSchema);
export const EmailOutbox: Model<IEmailOutbox> = mongoose.models.EmailOutbox || mongoose.model<IEmailOutbox>('EmailOutbox', EmailOutboxSchema);
export const AuditEvent: Model<IAuditEvent> = mongoose.models.AuditEvent || mongoose.model<IAuditEvent>('AuditEvent', AuditEventSchema);

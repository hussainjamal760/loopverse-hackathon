import bcrypt from 'bcryptjs';
import { connectToDatabase } from '../../lib/db';
import {
  User,
  Branch,
  Course,
  Student,
  Assignment,
  ExamSlot,
  DateSheet,
  Selection,
  SheetRevision,
  ChangeRequest,
  ChangeGrant,
  EmailOutbox,
  AuditEvent,
} from '../models';

export async function seedDatabase() {
  await connectToDatabase();

  console.log('[Seed] Starting database seed...');

  // 1. Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Branch.deleteMany({}),
    Course.deleteMany({}),
    Student.deleteMany({}),
    Assignment.deleteMany({}),
    ExamSlot.deleteMany({}),
    DateSheet.deleteMany({}),
    Selection.deleteMany({}),
    SheetRevision.deleteMany({}),
    ChangeRequest.deleteMany({}),
    ChangeGrant.deleteMany({}),
    EmailOutbox.deleteMany({}),
    AuditEvent.deleteMany({}),
  ]);

  // 2. Admin User
  const adminPasswordHash = await bcrypt.hash(
    process.env.SEED_ADMIN_PASSWORD || 'AdminPassword123!',
    10
  );
  const adminUser = await User.create({
    email: (process.env.SEED_ADMIN_EMAIL || 'admin@examslot.edu.pk').toLowerCase(),
    passwordHash: adminPasswordHash,
    role: 'ADMIN',
    active: true,
  });
  console.log('[Seed] Created Admin user:', adminUser.email);

  // 3. Create Branches
  const branchesData = [
    { code: 'KHI-01', name: 'Karachi Central', city: 'Karachi', address: 'Block 6, PECHS, Main Shahrah-e-Faisal', contactNumber: '+92 21 3456 7890', active: true },
    { code: 'LHR-01', name: 'Lahore Garden', city: 'Lahore', address: 'Gulberg III, Main Boulevard', contactNumber: '+92 42 3578 9012', active: true },
    { code: 'ISB-01', name: 'Islamabad Campus', city: 'Islamabad', address: 'Sector H-8/4, Service Road South', contactNumber: '+92 51 4861 2345', active: true },
  ];
  const branches = await Branch.insertMany(branchesData);
  console.log(`[Seed] Created ${branches.length} branches`);

  // 4. Create Courses
  const coursesData = [
    { code: 'CS101', title: 'Introduction to Computing', creditHours: 3, department: 'Computer Science', active: true },
    { code: 'CS201', title: 'Programming Fundamentals', creditHours: 3, department: 'Computer Science', active: true },
    { code: 'CS301', title: 'Data Structures & Algorithms', creditHours: 3, department: 'Computer Science', active: true },
    { code: 'MTH101', title: 'Calculus & Analytical Geometry', creditHours: 3, department: 'Mathematics', active: true },
    { code: 'MTH202', title: 'Discrete Mathematics', creditHours: 3, department: 'Mathematics', active: true },
    { code: 'ENG101', title: 'English Composition', creditHours: 3, department: 'Humanities', active: true },
    { code: 'STA301', title: 'Statistics & Probability', creditHours: 3, department: 'Mathematics', active: true },
    { code: 'MGT101', title: 'Introduction to Management', creditHours: 3, department: 'Management', active: true },
  ];
  const courses = await Course.insertMany(coursesData);
  console.log(`[Seed] Created ${courses.length} courses`);

  // 5. Create Exam Slots for Courses
  // Compute dates relative to seed execution (+7 to +21 days)
  const now = new Date();
  const slotsToInsert: Array<{
    courseId: any;
    startsAt: Date;
    endsAt: Date;
    status: 'DRAFT' | 'PUBLISHED';
  }> = [];

  courses.forEach((course, idx) => {
    // 3 Published future slots per course
    const dayOffset1 = 7 + idx;
    const dayOffset2 = 10 + idx;
    const dayOffset3 = 14 + idx;

    // Slot 1: Morning 09:00 - 11:00
    const start1 = new Date(now);
    start1.setDate(now.getDate() + dayOffset1);
    start1.setHours(9, 0, 0, 0);
    const end1 = new Date(start1);
    end1.setHours(11, 0, 0, 0);

    // Slot 2: Afternoon 14:00 - 16:00
    const start2 = new Date(now);
    start2.setDate(now.getDate() + dayOffset2);
    start2.setHours(14, 0, 0, 0);
    const end2 = new Date(start2);
    end2.setHours(16, 0, 0, 0);

    // Slot 3: Evening 17:00 - 19:00
    const start3 = new Date(now);
    start3.setDate(now.getDate() + dayOffset3);
    start3.setHours(17, 0, 0, 0);
    const end3 = new Date(start3);
    end3.setHours(19, 0, 0, 0);

    // Slot 4 (Draft slot): Morning 10:00 - 12:00
    const start4 = new Date(now);
    start4.setDate(now.getDate() + 20);
    start4.setHours(10, 0, 0, 0);
    const end4 = new Date(start4);
    end4.setHours(12, 0, 0, 0);

    slotsToInsert.push(
      { courseId: course._id, startsAt: start1, endsAt: end1, status: 'PUBLISHED' },
      { courseId: course._id, startsAt: start2, endsAt: end2, status: 'PUBLISHED' },
      { courseId: course._id, startsAt: start3, endsAt: end3, status: 'PUBLISHED' },
      { courseId: course._id, startsAt: start4, endsAt: end4, status: 'DRAFT' }
    );
  });

  const slots = await ExamSlot.insertMany(slotsToInsert);
  console.log(`[Seed] Created ${slots.length} exam slots`);

  // Helper student generator
  const defaultPasswordHash = await bcrypt.hash('StudentPassword123!', 10);

  // Student A: Invited, no password hash yet, 3 draft assignments
  const userA = await User.create({
    email: 'student.a@examslot.edu.pk',
    passwordHash: null,
    role: 'STUDENT',
    active: true,
  });
  const studentA = await Student.create({
    userId: userA._id,
    registrationNumber: 'SU-2026-001',
    fullName: 'Ali Raza',
    phone: '03001234567',
    cnic: '42101-1234567-1',
    dateOfBirth: new Date('2002-05-14'),
    gender: 'Male',
    address: 'House 12, Street 4, F-8/1, Islamabad',
    fatherName: 'Muhammad Raza',
    parentCnic: '42101-9876543-1',
    occupation: 'Engineer',
    contactNumber: '03009876543',
    emergencyContact: '03009876543',
    program: 'BS Computer Science',
    semester: 4,
    sessionBatch: '2024-2028',
    prevQualification: 'HSSC Pre-Engineering',
    prevInstitute: 'Federal College Islamabad',
    marksOrCgpa: '3.65 CGPA',
    assignmentsFinalized: false,
  });
  // 3 draft assignments
  await Assignment.insertMany([
    { studentId: studentA._id, courseId: courses[0]._id },
    { studentId: studentA._id, courseId: courses[1]._id },
    { studentId: studentA._id, courseId: courses[2]._id },
  ]);

  // Student B: Active demo login, 4 finalized courses, no branch, no sheet
  const userB = await User.create({
    email: (process.env.SEED_STUDENT_EMAIL || 'student@examslot.edu.pk').toLowerCase(),
    passwordHash: defaultPasswordHash,
    role: 'STUDENT',
    active: true,
  });
  const studentB = await Student.create({
    userId: userB._id,
    registrationNumber: 'SU-2026-002',
    fullName: 'Fatima Khan',
    phone: '03123456789',
    cnic: '42201-2345678-2',
    dateOfBirth: new Date('2003-08-22'),
    gender: 'Female',
    address: 'Flat 302, Garden Heights, Gulberg III, Lahore',
    fatherName: 'Tariq Khan',
    parentCnic: '42201-8765432-2',
    occupation: 'Doctor',
    contactNumber: '03129876543',
    emergencyContact: '03129876543',
    program: 'BS Software Engineering',
    semester: 3,
    sessionBatch: '2024-2028',
    prevQualification: 'FSc Pre-Engineering',
    prevInstitute: 'Kinnaird College Lahore',
    marksOrCgpa: '3.82 CGPA',
    assignmentsFinalized: true,
  });
  await Assignment.insertMany([
    { studentId: studentB._id, courseId: courses[0]._id },
    { studentId: studentB._id, courseId: courses[1]._id },
    { studentId: studentB._id, courseId: courses[3]._id },
    { studentId: studentB._id, courseId: courses[5]._id },
  ]);

  // Student C: 5 finalized courses, branch selected (Karachi), unsaved sheet
  const userC = await User.create({
    email: 'student.c@examslot.edu.pk',
    passwordHash: defaultPasswordHash,
    role: 'STUDENT',
    active: true,
  });
  const studentC = await Student.create({
    userId: userC._id,
    registrationNumber: 'SU-2026-003',
    fullName: 'Usman Tariq',
    phone: '03214567890',
    cnic: '42301-3456789-3',
    dateOfBirth: new Date('2001-11-05'),
    gender: 'Male',
    address: 'House A-45, North Nazimabad, Karachi',
    fatherName: 'Tariq Mehmood',
    parentCnic: '42301-7654321-3',
    occupation: 'Businessman',
    contactNumber: '03219876543',
    emergencyContact: '03219876543',
    program: 'BS Information Technology',
    semester: 5,
    sessionBatch: '2023-2027',
    prevQualification: 'DAE Information Technology',
    prevInstitute: 'Government Poly-Technic Karachi',
    marksOrCgpa: '84% Marks',
    selectedBranchId: branches[0]._id,
    assignmentsFinalized: true,
  });
  await Assignment.insertMany([
    { studentId: studentC._id, courseId: courses[0]._id },
    { studentId: studentC._id, courseId: courses[1]._id },
    { studentId: studentC._id, courseId: courses[2]._id },
    { studentId: studentC._id, courseId: courses[3]._id },
    { studentId: studentC._id, courseId: courses[4]._id },
  ]);

  // Student D: 6 finalized courses, saved sheet and pending date-sheet request
  const userD = await User.create({
    email: 'student.d@examslot.edu.pk',
    passwordHash: defaultPasswordHash,
    role: 'STUDENT',
    active: true,
  });
  const studentD = await Student.create({
    userId: userD._id,
    registrationNumber: 'SU-2026-004',
    fullName: 'Zainab Ahmed',
    phone: '03335678901',
    cnic: '42401-4567890-4',
    dateOfBirth: new Date('2002-02-18'),
    gender: 'Female',
    address: 'Sector F-10/2, Islamabad',
    fatherName: 'Ahmed Bilal',
    parentCnic: '42401-6543210-4',
    occupation: 'Civil Servant',
    contactNumber: '03339876543',
    emergencyContact: '03339876543',
    program: 'BS Data Science',
    semester: 4,
    sessionBatch: '2024-2028',
    prevQualification: 'A-Levels',
    prevInstitute: 'Beaconhouse Islamabad',
    marksOrCgpa: '3.91 CGPA',
    selectedBranchId: branches[2]._id,
    assignmentsFinalized: true,
  });
  const coursesD = [courses[0], courses[1], courses[2], courses[3], courses[4], courses[6]];
  await Assignment.insertMany(
    coursesD.map((c) => ({ studentId: studentD._id, courseId: c._id }))
  );
  // DateSheet for D
  const dateSheetD = await DateSheet.create({
    studentId: studentD._id,
    currentRevision: 1,
    savedAt: new Date(),
  });
  // Selections for D
  const selectionsD = [];
  for (const course of coursesD) {
    const slot = slots.find((s) => s.courseId.toString() === course._id.toString() && s.status === 'PUBLISHED');
    if (slot) {
      selectionsD.push({ dateSheetId: dateSheetD._id, courseId: course._id, slotId: slot._id });
    }
  }
  await Selection.insertMany(selectionsD);
  await SheetRevision.create({
    dateSheetId: dateSheetD._id,
    revision: 1,
    branchId: branches[2]._id,
    documentSnapshot: JSON.stringify({
      studentName: studentD.fullName,
      registrationNumber: studentD.registrationNumber,
      branchName: branches[2].name,
      branchAddress: branches[2].address,
      savedAt: dateSheetD.savedAt,
    }),
    reason: 'Initial saved date sheet',
  });
  // Pending DateSheet Change Request for D
  await ChangeRequest.create({
    studentId: studentD._id,
    type: 'DATE_SHEET',
    reason: 'Clash with internship exam schedule on 15th November',
    status: 'PENDING',
  });

  // Student E: 4 finalized courses, saved sheet and rejected branch request with remark
  const userE = await User.create({
    email: 'student.e@examslot.edu.pk',
    passwordHash: defaultPasswordHash,
    role: 'STUDENT',
    active: true,
  });
  const studentE = await Student.create({
    userId: userE._id,
    registrationNumber: 'SU-2026-005',
    fullName: 'Hamza Sheikh',
    phone: '03456789012',
    cnic: '42501-5678901-5',
    dateOfBirth: new Date('2003-01-30'),
    gender: 'Male',
    address: 'DHA Phase 5, Lahore',
    fatherName: 'Sheikh Zubair',
    parentCnic: '42501-5432109-5',
    occupation: 'Architect',
    contactNumber: '03459876543',
    emergencyContact: '03459876543',
    program: 'BS Artificial Intelligence',
    semester: 2,
    sessionBatch: '2025-2029',
    prevQualification: 'FSc Pre-Engineering',
    prevInstitute: 'GC University Lahore',
    marksOrCgpa: '3.70 CGPA',
    selectedBranchId: branches[1]._id,
    assignmentsFinalized: true,
  });
  const coursesE = [courses[0], courses[1], courses[3], courses[7]];
  await Assignment.insertMany(
    coursesE.map((c) => ({ studentId: studentE._id, courseId: c._id }))
  );
  const dateSheetE = await DateSheet.create({
    studentId: studentE._id,
    currentRevision: 1,
    savedAt: new Date(),
  });
  const selectionsE = [];
  for (const course of coursesE) {
    const slot = slots.find((s) => s.courseId.toString() === course._id.toString() && s.status === 'PUBLISHED');
    if (slot) {
      selectionsE.push({ dateSheetId: dateSheetE._id, courseId: course._id, slotId: slot._id });
    }
  }
  await Selection.insertMany(selectionsE);
  await SheetRevision.create({
    dateSheetId: dateSheetE._id,
    revision: 1,
    branchId: branches[1]._id,
    documentSnapshot: JSON.stringify({
      studentName: studentE.fullName,
      registrationNumber: studentE.registrationNumber,
      branchName: branches[1].name,
      branchAddress: branches[1].address,
      savedAt: dateSheetE.savedAt,
    }),
    reason: 'Initial saved date sheet',
  });
  // Rejected Branch Change Request for E
  await ChangeRequest.create({
    studentId: studentE._id,
    type: 'BRANCH',
    reason: 'Moved to Karachi for personal reasons',
    status: 'REJECTED',
    remark: 'Branch transfer window closed for current semester cycle.',
    reviewedBy: adminUser._id,
    reviewedAt: new Date(),
  });

  console.log('[Seed] Database seeded successfully!');
}

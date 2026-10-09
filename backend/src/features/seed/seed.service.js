const bcrypt = require('bcryptjs');
const {
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
  Session,
  PasswordToken,
} = require('../../models');

async function seedDatabase() {
  console.log('🌱 Starting ExamSlot database seed...');

  // 1. Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Session.deleteMany({}),
    PasswordToken.deleteMany({}),
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
  ]);

  // 2. Admin User
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'AdminPassword123!';
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  const adminEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@examslot.edu.pk').toLowerCase();

  const adminUser = await User.create({
    email: adminEmail,
    passwordHash: adminPasswordHash,
    role: 'ADMIN',
    active: true,
  });
  console.log(`✅ Admin account created: ${adminUser.email}`);

  // 3. Branches
  const branchesData = [
    { code: 'KHI-01', name: 'Karachi Central', city: 'Karachi', address: 'Block 6, PECHS, Main Shahrah-e-Faisal', contactNumber: '+92 21 3456 7890', active: true },
    { code: 'LHR-01', name: 'Lahore Garden', city: 'Lahore', address: 'Gulberg III, Main Boulevard', contactNumber: '+92 42 3578 9012', active: true },
    { code: 'ISB-01', name: 'Islamabad Campus', city: 'Islamabad', address: 'Sector H-8/4, Service Road South', contactNumber: '+92 51 4861 2345', active: true },
  ];
  const branches = await Branch.insertMany(branchesData);
  console.log(`✅ Created ${branches.length} campus branches`);

  // 4. Courses
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
  console.log(`✅ Created ${courses.length} academic courses`);

  // 5. Exam Slots (Published & Draft)
  const now = new Date();
  const slotsToInsert = [];

  courses.forEach((course, idx) => {
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

    // Slot 4: Draft
    const start4 = new Date(now);
    start4.setDate(now.getDate() + 21);
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
  console.log(`✅ Created ${slots.length} exam slots`);

  // 6. Demo Students
  const defaultPasswordHash = await bcrypt.hash('StudentPassword123!', 10);

  // Student B (Main demo login: student@examslot.edu.pk)
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
  console.log(`✅ Demo Student account created: ${userB.email}`);

  // Student C (Karachi branch set, 5 assignments finalized)
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

  // Student D (Saved date sheet + pending change request)
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
  const dateSheetD = await DateSheet.create({
    studentId: studentD._id,
    currentRevision: 1,
    savedAt: new Date(),
  });
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
  // Pending request for D
  await ChangeRequest.create({
    studentId: studentD._id,
    type: 'DATE_SHEET',
    reason: 'Clash with internship exam schedule on 15th November',
    status: 'PENDING',
  });

  console.log('🎉 ExamSlot Database Seed Completed Successfully!');
  return {
    admin: adminUser.email,
    demoStudent: userB.email,
    branchesCount: branches.length,
    coursesCount: courses.length,
    slotsCount: slots.length,
  };
}

module.exports = {
  seedDatabase,
};

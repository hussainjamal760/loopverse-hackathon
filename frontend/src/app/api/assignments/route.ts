import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import {
  Student,
  Assignment,
  Course,
  DateSheet,
  AuditEvent,
} from '@/server/models';
import { getAuthenticatedUser } from '@/server/auth/session';

export async function GET(req: Request) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const programFilter = searchParams.get('program')?.trim() || '';
    const statusFilter = searchParams.get('status')?.trim() || 'ALL';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10', 10), 100);

    // 1. Calculate Global KPI Statistics
    const allStudents = await Student.find({}, '_id assignmentsFinalized').lean();
    const allAssignments = await Assignment.find({}, 'studentId').lean();

    const studentAssignmentCountMap = new Map<string, number>();
    for (const a of allAssignments) {
      const sId = a.studentId.toString();
      studentAssignmentCountMap.set(sId, (studentAssignmentCountMap.get(sId) || 0) + 1);
    }

    const totalStudents = allStudents.length;
    let finalizedCount = 0;
    let incompleteCount = 0;
    let unassignedCount = 0;

    for (const s of allStudents) {
      const sId = s._id.toString();
      const count = studentAssignmentCountMap.get(sId) || 0;
      if (count === 0) {
        unassignedCount++;
      } else if (s.assignmentsFinalized && count >= 4 && count <= 6) {
        finalizedCount++;
      } else {
        incompleteCount++;
      }
    }

    const stats = {
      totalStudents,
      finalizedCount,
      incompleteCount,
      unassignedCount,
    };

    // 2. Build Query Filter
    const studentQuery: any = {};
    if (search) {
      studentQuery.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
        { cnic: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    if (programFilter) {
      studentQuery.program = programFilter;
    }

    // Status filter pre-filtering if needed
    if (statusFilter === 'FINALIZED') {
      studentQuery.assignmentsFinalized = true;
    } else if (statusFilter === 'UNASSIGNED') {
      // Find students with 0 assignments
      const studentIdsWithAssignments = Array.from(studentAssignmentCountMap.keys());
      studentQuery._id = { $nin: studentIdsWithAssignments };
    } else if (statusFilter === 'INCOMPLETE') {
      // Either not finalized or count not in 4..6, but has at least 1 assignment
      const incompleteIds = allStudents
        .filter((s) => {
          const count = studentAssignmentCountMap.get(s._id.toString()) || 0;
          return count > 0 && (!s.assignmentsFinalized || count < 4 || count > 6);
        })
        .map((s) => s._id);
      studentQuery._id = { $in: incompleteIds };
    }

    const totalMatching = await Student.countDocuments(studentQuery);
    const students = await Student.find(studentQuery)
      .populate('userId', 'email active')
      .populate('selectedBranchId', 'code name city')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    const studentIds = students.map((s) => s._id);

    // Fetch assignments and datesheet records for the current page of students
    const [pageAssignments, pageDateSheets] = await Promise.all([
      Assignment.find({ studentId: { $in: studentIds } })
        .populate('courseId', 'code title creditHours department active')
        .lean(),
      DateSheet.find({ studentId: { $in: studentIds } }, 'studentId currentRevision savedAt').lean(),
    ]);

    const dateSheetMap = new Map<string, any>();
    for (const ds of pageDateSheets) {
      dateSheetMap.set(ds.studentId.toString(), ds);
    }

    const assignmentsByStudent = new Map<string, any[]>();
    for (const a of pageAssignments) {
      const sId = a.studentId.toString();
      if (!assignmentsByStudent.has(sId)) {
        assignmentsByStudent.set(sId, []);
      }
      assignmentsByStudent.get(sId)!.push(a);
    }

    const enrichedStudents = students.map((student) => {
      const sId = student._id.toString();
      const studentAssignments = assignmentsByStudent.get(sId) || [];
      const ds = dateSheetMap.get(sId);

      const totalCreditHours = studentAssignments.reduce((acc, curr) => {
        return acc + (curr.courseId?.creditHours || 0);
      }, 0);

      return {
        ...student,
        assignments: studentAssignments,
        coursesCount: studentAssignments.length,
        totalCreditHours,
        hasDateSheet: !!ds,
        dateSheetRevision: ds?.currentRevision || null,
        dateSheetSavedAt: ds?.savedAt || null,
      };
    });

    return NextResponse.json({
      students: enrichedStudents,
      stats,
      pagination: {
        page,
        pageSize,
        total: totalMatching,
        totalPages: Math.ceil(totalMatching / pageSize) || 1,
      },
    });
  } catch (err: any) {
    console.error('Failed to fetch assignments overview:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch course assignments' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    await connectToDatabase();
    const { studentId, courseId } = await req.json();

    if (!studentId || !courseId) {
      return NextResponse.json({ error: 'studentId and courseId are required.' }, { status: 400 });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    const course = await Course.findById(courseId);
    if (!course || !course.active) {
      return NextResponse.json({ error: 'Course not found or inactive.' }, { status: 404 });
    }

    // Check if student has saved date sheet
    const dateSheet = await DateSheet.findOne({ studentId });
    if (dateSheet) {
      return NextResponse.json(
        {
          error: 'Cannot assign new course: Student has already saved and finalized a date sheet.',
          hasDateSheet: true,
          dateSheetRevision: dateSheet.currentRevision,
        },
        { status: 400 }
      );
    }

    // Check duplicate assignment
    const existing = await Assignment.findOne({ studentId, courseId });
    if (existing) {
      return NextResponse.json({ error: 'This course is already assigned to the student.' }, { status: 400 });
    }

    // Insert assignment
    const assignment = await Assignment.create({ studentId, courseId });

    const totalAssigned = await Assignment.countDocuments({ studentId });

    await AuditEvent.create({
      actorUserId: authData.user._id,
      action: 'ASSIGN_COURSE',
      entityType: 'Assignment',
      entityId: assignment._id.toString(),
      sanitizedMetadata: JSON.stringify({
        studentId,
        courseId,
        courseCode: course.code,
        totalAssigned,
      }),
    });

    const populated = await Assignment.findById(assignment._id).populate('courseId');

    return NextResponse.json({
      success: true,
      assignment: populated,
      totalAssigned,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to assign course' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const courseId = searchParams.get('courseId');
    const clearAll = searchParams.get('all') === 'true';

    if (!studentId) {
      return NextResponse.json({ error: 'studentId query param is required.' }, { status: 400 });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }

    // Date sheet check
    const dateSheet = await DateSheet.findOne({ studentId });
    if (dateSheet) {
      return NextResponse.json(
        {
          error: 'Cannot remove course: student has an active saved Date Sheet.',
          hasDateSheet: true,
        },
        { status: 400 }
      );
    }

    if (clearAll) {
      const deletedResult = await Assignment.deleteMany({ studentId });
      student.assignmentsFinalized = false;
      await student.save();

      await AuditEvent.create({
        actorUserId: authData.user._id,
        action: 'CLEAR_ALL_STUDENT_COURSES',
        entityType: 'Student',
        entityId: studentId,
        sanitizedMetadata: JSON.stringify({ deletedCount: deletedResult.deletedCount }),
      });

      return NextResponse.json({
        success: true,
        deletedCount: deletedResult.deletedCount,
        remainingCount: 0,
      });
    }

    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required when not clearing all assignments.' }, { status: 400 });
    }

    await Assignment.deleteOne({ studentId, courseId });
    const remainingCount = await Assignment.countDocuments({ studentId });
    if (remainingCount < 4) {
      student.assignmentsFinalized = false;
      await student.save();
    }

    await AuditEvent.create({
      actorUserId: authData.user._id,
      action: 'REMOVE_STUDENT_COURSE',
      entityType: 'Assignment',
      entityId: studentId,
      sanitizedMetadata: JSON.stringify({ courseId, remainingCount }),
    });

    return NextResponse.json({
      success: true,
      remainingCount,
      assignmentsFinalized: student.assignmentsFinalized,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to remove course assignment' }, { status: 500 });
  }
}

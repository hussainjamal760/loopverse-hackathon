import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import {
  Student,
  Assignment,
  ExamSlot,
  DateSheet,
  Selection,
  SheetRevision,
  ChangeGrant,
  Branch,
} from '@/server/models';
import { getAuthenticatedUser } from '@/server/auth/session';

export async function POST(req: Request) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'STUDENT' || !authData.student) {
      return NextResponse.json({ error: 'Unauthorized. Student access required.' }, { status: 403 });
    }

    await connectToDatabase();
    const student = await Student.findById(authData.student._id);

    if (!student) {
      return NextResponse.json({ error: 'Student record not found.' }, { status: 404 });
    }

    if (!student.selectedBranchId) {
      return NextResponse.json(
        { error: 'Please select an exam branch before saving your date sheet.' },
        { status: 400 }
      );
    }

    if (!student.assignmentsFinalized) {
      return NextResponse.json(
        { error: 'Your course assignments are not finalized by admin yet.' },
        { status: 400 }
      );
    }

    const assignments = await Assignment.find({ studentId: student._id });
    if (assignments.length < 4 || assignments.length > 6) {
      return NextResponse.json(
        { error: `You must have between 4 and 6 finalized course assignments to save a date sheet. Current: ${assignments.length}` },
        { status: 400 }
      );
    }

    const { selections } = await req.json(); // Array of { courseId, slotId }
    if (!Array.isArray(selections) || selections.length !== assignments.length) {
      return NextResponse.json(
        { error: `You must select exactly one slot for each of your ${assignments.length} assigned courses.` },
        { status: 400 }
      );
    }

    // Check existing date sheet and grant authorization
    let existingDateSheet = await DateSheet.findOne({ studentId: student._id });
    let grantToConsume: any = null;

    if (existingDateSheet) {
      grantToConsume = await ChangeGrant.findOne({
        studentId: student._id,
        type: 'DATE_SHEET',
        consumedAt: null,
      });

      if (!grantToConsume) {
        return NextResponse.json(
          { error: 'Date sheet is write-once. You need an approved date sheet change request to modify it.' },
          { status: 403 }
        );
      }
    }

    // Verify all assigned courses are covered uniquely
    const assignedCourseIds = new Set(assignments.map((a) => a.courseId.toString()));
    const selectedCourseIds = new Set();
    const selectedSlots: any[] = [];

    for (const sel of selections) {
      if (!sel.courseId || !sel.slotId) {
        return NextResponse.json({ error: 'Invalid selection payload.' }, { status: 400 });
      }

      if (!assignedCourseIds.has(sel.courseId)) {
        return NextResponse.json(
          { error: `Course ${sel.courseId} is not in your assigned courses.` },
          { status: 400 }
        );
      }

      if (selectedCourseIds.has(sel.courseId)) {
        return NextResponse.json({ error: 'Duplicate course selection detected.' }, { status: 400 });
      }
      selectedCourseIds.add(sel.courseId);

      // Verify slot validity
      const slot = await ExamSlot.findById(sel.slotId);
      if (!slot || slot.status !== 'PUBLISHED' || slot.startsAt <= new Date()) {
        return NextResponse.json(
          { error: 'One or more selected slots are invalid, unpublished, or in the past.' },
          { status: 400 }
        );
      }

      if (slot.courseId.toString() !== sel.courseId) {
        return NextResponse.json(
          { error: 'Selected slot does not match the designated course.' },
          { status: 400 }
        );
      }

      selectedSlots.push(slot);
    }

    // Check slot overlaps (startA < endB && startB < endA)
    for (let i = 0; i < selectedSlots.length; i++) {
      for (let j = i + 1; j < selectedSlots.length; j++) {
        const slotA = selectedSlots[i];
        const slotB = selectedSlots[j];

        const startA = new Date(slotA.startsAt).getTime();
        const endA = new Date(slotA.endsAt).getTime();
        const startB = new Date(slotB.startsAt).getTime();
        const endB = new Date(slotB.endsAt).getTime();

        if (startA < endB && startB < endA) {
          return NextResponse.json(
            { error: `Time conflict detected between slots! (${slotA.startsAt.toISOString()} and ${slotB.startsAt.toISOString()})` },
            { status: 400 }
          );
        }
      }
    }

    // Atomic persistence
    const branch = await Branch.findById(student.selectedBranchId);
    let dateSheet = existingDateSheet;

    if (!dateSheet) {
      dateSheet = await DateSheet.create({
        studentId: student._id,
        currentRevision: 1,
        savedAt: new Date(),
      });
    } else {
      dateSheet.currentRevision += 1;
      dateSheet.updatedAt = new Date();
      await dateSheet.save();
      // Remove previous selections
      await Selection.deleteMany({ dateSheetId: dateSheet._id });
    }

    // Insert new selections
    const selectionDocs = selections.map((sel: any) => ({
      dateSheetId: dateSheet!._id,
      courseId: sel.courseId,
      slotId: sel.slotId,
    }));
    await Selection.insertMany(selectionDocs);

    // Create SheetRevision snapshot
    const documentSnapshot = JSON.stringify({
      studentName: student.fullName,
      registrationNumber: student.registrationNumber,
      program: student.program,
      branchName: branch?.name || 'Main Branch',
      branchAddress: branch?.address || '',
      savedAt: new Date(),
      selections: selectedSlots.map((s) => ({
        courseId: s.courseId,
        startsAt: s.startsAt,
        endsAt: s.endsAt,
      })),
    });

    await SheetRevision.create({
      dateSheetId: dateSheet!._id,
      revision: dateSheet!.currentRevision,
      branchId: student.selectedBranchId,
      documentSnapshot,
      reason: grantToConsume ? 'Updated date sheet via approved grant' : 'Initial date sheet save',
    });

    // Mark grant as consumed if applied
    if (grantToConsume) {
      grantToConsume.consumedAt = new Date();
      await grantToConsume.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Date sheet saved successfully.',
      dateSheetId: dateSheet!._id,
      revision: dateSheet!.currentRevision,
    });
  } catch (err: any) {
    console.error('Save date sheet error:', err);
    return NextResponse.json({ error: 'Failed to save date sheet.' }, { status: 500 });
  }
}

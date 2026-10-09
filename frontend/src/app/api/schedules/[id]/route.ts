import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { ExamSlot, Course, Selection, AuditEvent } from '@/server/models';
import { getAuthenticatedUser } from '@/server/auth/session';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    const slot = await ExamSlot.findById(id).populate('courseId', 'code title creditHours department');
    if (!slot) {
      return NextResponse.json({ error: 'Exam slot not found' }, { status: 404 });
    }

    const selections = await Selection.find({ slotId: id }).populate({
      path: 'dateSheetId',
      populate: { path: 'studentId', select: 'fullName registrationNumber' },
    });

    return NextResponse.json({
      slot,
      bookedCount: selections.length,
      selections,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to retrieve slot details' }, { status: 500 });
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await context.params;
    await connectToDatabase();
    const body = await req.json();

    const slot = await ExamSlot.findById(id);
    if (!slot) {
      return NextResponse.json({ error: 'Exam slot not found' }, { status: 404 });
    }

    // Protection rule per artifacts/05-DATA-MODEL.md & user requirements:
    // Slots that have already been chosen by a student must be protected
    const hasBookings = await Selection.exists({ slotId: id });

    if (hasBookings) {
      // If attempting to alter time interval
      if (body.startsAt || body.endsAt) {
        const newStart = body.startsAt ? new Date(body.startsAt).getTime() : slot.startsAt.getTime();
        const newEnd = body.endsAt ? new Date(body.endsAt).getTime() : slot.endsAt.getTime();

        if (newStart !== slot.startsAt.getTime() || newEnd !== slot.endsAt.getTime()) {
          return NextResponse.json(
            {
              error:
                'This exam slot is already selected by students in finalized date sheets. Modifications to exam date/time are locked to protect student schedules.',
              isBooked: true,
            },
            { status: 409 }
          );
        }
      }

      // If attempting to unpublish
      if (body.status === 'DRAFT' && slot.status === 'PUBLISHED') {
        return NextResponse.json(
          {
            error:
              'Cannot unpublish an exam slot that is currently booked by active students.',
            isBooked: true,
          },
          { status: 409 }
        );
      }
    }

    // Process allowable updates for unbooked slots or status changes
    if (body.startsAt) {
      const start = new Date(body.startsAt);
      if (start <= new Date()) {
        return NextResponse.json({ error: 'Exam slot cannot be set to a past date.' }, { status: 400 });
      }
      slot.startsAt = start;
    }

    if (body.endsAt) {
      const end = new Date(body.endsAt);
      if (end <= slot.startsAt) {
        return NextResponse.json({ error: 'End time must be strictly after start time.' }, { status: 400 });
      }
      slot.endsAt = end;
    }

    if (body.status && ['DRAFT', 'PUBLISHED'].includes(body.status)) {
      slot.status = body.status;
    }

    slot.version = (slot.version || 1) + 1;
    await slot.save();

    await AuditEvent.create({
      actorUserId: authData.user._id,
      action: 'UPDATE_EXAM_SLOT',
      entityType: 'ExamSlot',
      entityId: slot._id.toString(),
      sanitizedMetadata: JSON.stringify({
        status: slot.status,
        startsAt: slot.startsAt.toISOString(),
      }),
    });

    const populated = await ExamSlot.findById(id).populate('courseId', 'code title creditHours department');

    return NextResponse.json({ slot: populated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update exam slot' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const authData = await getAuthenticatedUser();
    if (!authData || authData.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { id } = await context.params;
    await connectToDatabase();

    const slot = await ExamSlot.findById(id);
    if (!slot) {
      return NextResponse.json({ error: 'Exam slot not found' }, { status: 404 });
    }

    // Safe deletion integrity check: Slots already chosen by a student must be protected
    const isChosen = await Selection.exists({ slotId: id });
    if (isChosen) {
      return NextResponse.json(
        {
          error:
            'Slot has active student selections. Academic integrity prevents deletion of a booked exam slot. Notify affected students or manage via administrative change requests.',
          isBooked: true,
        },
        { status: 409 }
      );
    }

    await ExamSlot.findByIdAndDelete(id);

    await AuditEvent.create({
      actorUserId: authData.user._id,
      action: 'DELETE_EXAM_SLOT',
      entityType: 'ExamSlot',
      entityId: id,
      sanitizedMetadata: JSON.stringify({
        courseId: slot.courseId.toString(),
        startsAt: slot.startsAt.toISOString(),
      }),
    });

    return NextResponse.json({ success: true, message: 'Exam slot deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete exam slot' }, { status: 500 });
  }
}

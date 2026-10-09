import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Branch, Student, SheetRevision, AuditEvent } from '@/server/models';
import { getAuthenticatedUser } from '@/server/auth/session';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await connectToDatabase();

    const branch = await Branch.findById(id);
    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    const enrolledStudentsCount = await Student.countDocuments({ selectedBranchId: id });

    return NextResponse.json({ branch, enrolledStudentsCount });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to retrieve branch details' }, { status: 500 });
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

    const branch = await Branch.findById(id);
    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    if (body.name !== undefined) branch.name = body.name.trim();
    if (body.city !== undefined) branch.city = body.city.trim();
    if (body.address !== undefined) branch.address = body.address.trim();
    if (body.contactNumber !== undefined) branch.contactNumber = body.contactNumber.trim();
    if (body.active !== undefined) branch.active = Boolean(body.active);

    await branch.save();

    await AuditEvent.create({
      actorUserId: authData.user._id,
      action: 'UPDATE_BRANCH',
      entityType: 'Branch',
      entityId: branch._id.toString(),
      sanitizedMetadata: JSON.stringify({ code: branch.code, active: branch.active }),
    });

    return NextResponse.json({ branch });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to update branch' }, { status: 500 });
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

    const branch = await Branch.findById(id);
    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    // Safe deletion integrity check per artifacts/05-DATA-MODEL.md
    const hasStudents = await Student.exists({ selectedBranchId: id });
    const hasRevisions = await SheetRevision.exists({ branchId: id });

    if (hasStudents || hasRevisions) {
      return NextResponse.json(
        {
          error:
            'Branch has existing student enrollments or saved exam revisions. Safe integrity protection prevents deletion. Deactivate the branch instead to archive it.',
          canDeactivate: true,
        },
        { status: 409 }
      );
    }

    await Branch.findByIdAndDelete(id);

    await AuditEvent.create({
      actorUserId: authData.user._id,
      action: 'DELETE_BRANCH',
      entityType: 'Branch',
      entityId: id,
      sanitizedMetadata: JSON.stringify({ code: branch.code, name: branch.name }),
    });

    return NextResponse.json({ success: true, message: `Branch ${branch.code} deleted successfully.` });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to delete branch' }, { status: 500 });
  }
}

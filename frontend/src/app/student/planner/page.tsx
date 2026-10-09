'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HiOutlineIdentification,
  HiOutlineQuestionMarkCircle,
  HiClock,
  HiExclamationCircle,
  HiExclamationTriangle,
  HiArrowPath,
  HiCheckCircle,
  HiClipboardDocumentCheck,
} from 'react-icons/hi2';
import { toast } from 'sonner';
import {
  StudentHeader,
  StudentSidebar,
  StudentHero,
  StudentStatusStrip,
  StudentDossierCard,
  CourseCard,
  ExamAgendaPanel,
  StudentKanbanBoard,
  ReviewModal,
  LockedDateSheetView,
  type CourseSlot,
  type KanbanCourse,
  type DateSheetRow,
} from '@/features/student';

interface CourseEntity {
  _id: string;
  code: string;
  title: string;
  creditHours: number;
  department: string;
}

interface SlotEntity {
  _id: string;
  courseId: any;
  startsAt: string;
  endsAt: string;
  status: string;
}

function formatTime(d: Date | string): string {
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateFull(d: Date | string): string {
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'long' });
  const day = date.toLocaleDateString('en-GB', { day: 'numeric' });
  const month = date.toLocaleDateString('en-GB', { month: 'long' });
  const year = date.toLocaleDateString('en-GB', { year: 'numeric' });
  return `${day} ${month} ${year} (${weekday})`;
}

function formatDateShort(d: Date | string): string {
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatDayOfWeek(d: Date | string): string {
  const date = new Date(d);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { weekday: 'long' });
}

function getMonthAbbr(d: Date | string): string {
  const date = new Date(d);
  if (isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
}

function getDayNumber(d: Date | string): string {
  const date = new Date(d);
  if (isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('en-US', { day: '2-digit' });
}

export default function StudentPlannerPage() {
  const router = useRouter();

  // Core state
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [branch, setBranch] = useState<any>(null);
  const [courses, setCourses] = useState<CourseEntity[]>([]);
  const [slots, setSlots] = useState<SlotEntity[]>([]);
  const [canEditDateSheet, setCanEditDateSheet] = useState(true);
  const [hasUnusedGrant, setHasUnusedGrant] = useState(false);
  const [dateSheetData, setDateSheetData] = useState<any>(null);

  // View state
  const [viewMode, setViewMode] = useState<'planner' | 'kanban'>('planner');
  const [isLocked, setIsLocked] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Selections mapping courseId -> slotId
  const [selections, setSelections] = useState<Record<string, string>>({});

  // Fetch real planner data
  const loadPlannerData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/student/planner');

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to load planner');
      }

      const data = await res.json();
      setStudent(data.student);
      setBranch(data.branch || data.student?.selectedBranchId || null);
      setCourses(data.courses || []);
      setSlots(data.slots || []);
      setCanEditDateSheet(data.canEditDateSheet ?? true);
      setHasUnusedGrant(data.hasUnusedGrant ?? false);
      setDateSheetData(data.dateSheet);

      // Prepopulate selections if date sheet exists
      if (data.dateSheet?.selections && Array.isArray(data.dateSheet.selections)) {
        const initialSelections: Record<string, string> = {};
        data.dateSheet.selections.forEach((sel: any) => {
          const courseId = sel.courseId?._id || sel.courseId;
          const slotId = sel.slotId?._id || sel.slotId;
          if (courseId && slotId) {
            initialSelections[courseId.toString()] = slotId.toString();
          }
        });
        setSelections(initialSelections);
        // If cannot edit, display locked view
        if (!data.canEditDateSheet) {
          setIsLocked(true);
        }
      }
    } catch (err: any) {
      console.error('Error fetching student planner:', err);
      toast.error('Unable to retrieve exam schedule. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadPlannerData();
  }, [loadPlannerData]);

  // Handle slot selection (by courseId and slotId)
  const handleSelectSlot = (courseId: string, slotId: string) => {
    setSelections((prev) => ({
      ...prev,
      [courseId]: slotId,
    }));
  };

  // Conflict / Overlap detection
  const selectedSlotObjects = Object.entries(selections)
    .map(([courseId, slotId]) => {
      const slot = slots.find((s) => s._id.toString() === slotId);
      const course = courses.find((c) => c._id.toString() === courseId);
      return slot ? { ...slot, courseCode: course?.code || 'Course' } : null;
    })
    .filter(Boolean) as (SlotEntity & { courseCode: string })[];

  let hasConflict = false;
  let conflictMessage = '';

  for (let i = 0; i < selectedSlotObjects.length; i++) {
    for (let j = i + 1; j < selectedSlotObjects.length; j++) {
      const a = selectedSlotObjects[i];
      const b = selectedSlotObjects[j];
      const startA = new Date(a.startsAt).getTime();
      const endA = new Date(a.endsAt).getTime();
      const startB = new Date(b.startsAt).getTime();
      const endB = new Date(b.endsAt).getTime();

      if (startA < endB && startB < endA) {
        hasConflict = true;
        conflictMessage = `Time conflict detected between ${a.courseCode} and ${b.courseCode} on ${formatDateShort(a.startsAt)}. Overlapping exam slots are blocked.`;
        break;
      }
    }
    if (hasConflict) break;
  }

  // Course counts
  const totalCourses = courses.length;
  const plannedCount = courses.filter((c) => Boolean(selections[c._id.toString()])).length;
  const isAllPlanned = totalCourses > 0 && plannedCount === totalCourses && !hasConflict;
  const totalCreditHours = courses.reduce((acc, c) => acc + (c.creditHours || 3), 0);

  // Confirm and persist date sheet to MongoDB
  const handleConfirmSave = async () => {
    if (hasConflict) {
      toast.error(conflictMessage || 'Cannot save: Resolve exam time conflicts first.');
      return;
    }

    if (plannedCount < totalCourses) {
      toast.error(`Please select a time slot for all ${totalCourses} assigned courses before saving.`);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        selections: courses.map((c) => ({
          courseId: c._id.toString(),
          slotId: selections[c._id.toString()],
        })),
      };

      const res = await fetch('/api/student/date-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Failed to confirm date sheet.');
        return;
      }

      toast.success('Examination date sheet confirmed & locked successfully!');
      setReviewModalOpen(false);
      setIsLocked(true);
      setCanEditDateSheet(false);
      // Refresh to ensure DB sync
      loadPlannerData();
    } catch {
      toast.error('Network error saving date sheet. Please retry.');
    } finally {
      setSaving(false);
    }
  };

  // Build rows for locked view, sorted chronologically by rawDate
  const lockedRows: DateSheetRow[] = (dateSheetData?.selections || []).map(
    (sel: any, idx: number) => {
      const course = sel.courseId;
      const slot = sel.slotId;
      const startsAt = slot?.startsAt;
      const endsAt = slot?.endsAt;

      return {
        date: startsAt ? formatDateShort(startsAt) + ' ' + new Date(startsAt).getFullYear() : 'TBD',
        day: startsAt ? formatDayOfWeek(startsAt) : 'TBD',
        timeSlot:
          startsAt && endsAt
            ? `${formatTime(startsAt)} – ${formatTime(endsAt)}`
            : 'TBD',
        code: course?.code || 'Course',
        title: course?.title || 'Academic Course',
        hallDesk: `Hall ${String.fromCharCode(65 + (idx % 4))} / Desk ${String(
          idx * 7 + 12
        ).padStart(2, '0')}`,
        rawDate: startsAt ? new Date(startsAt).getTime() : 0,
      };
    }
  );

  // If no saved date sheet rows in DB yet, but isLocked state, build from current selections
  const displayLockedRows: DateSheetRow[] =
    lockedRows.length > 0
      ? lockedRows
      : courses.map((course, idx) => {
          const slotId = selections[course._id.toString()];
          const slot = slots.find((s) => s._id.toString() === slotId);
          const startsAt = slot?.startsAt;
          const endsAt = slot?.endsAt;
          return {
            date: startsAt ? formatDateShort(startsAt) + ' ' + new Date(startsAt).getFullYear() : 'TBD',
            day: startsAt ? formatDayOfWeek(startsAt) : 'TBD',
            timeSlot: startsAt && endsAt ? `${formatTime(startsAt)} – ${formatTime(endsAt)}` : 'TBD',
            code: course.code,
            title: course.title,
            hallDesk: `Hall ${String.fromCharCode(65 + (idx % 4))} / Desk ${String(
              idx * 7 + 12
            ).padStart(2, '0')}`,
            rawDate: startsAt ? new Date(startsAt).getTime() : 0,
          };
        });

  // Prepare standard course cards data
  const courseCardsData = courses.map((course, cIdx) => {
    const courseSlots = slots.filter((s) => {
      const cid = s.courseId?._id || s.courseId;
      return cid?.toString() === course._id.toString();
    });

    const selectedSlotId = selections[course._id.toString()] || null;
    const selectedSlot = courseSlots.find((s) => s._id.toString() === selectedSlotId);

    // Exam date display
    const examDate = selectedSlot
      ? formatDateFull(selectedSlot.startsAt)
      : courseSlots[0]
      ? formatDateFull(courseSlots[0].startsAt)
      : 'Date to be announced';

    const formattedSlots: CourseSlot[] = courseSlots.map((slot, sIdx) => {
      const isSelected = selectedSlotId === slot._id.toString();
      const timeStr = `${formatTime(slot.startsAt)} – ${formatTime(slot.endsAt)}`;
      const locationStr = `Hall ${String.fromCharCode(65 + ((cIdx + sIdx) % 4))} · ${
        branch?.name || 'Main Campus'
      }`;

      return {
        id: slot._id.toString(),
        time: timeStr,
        location: locationStr,
        seatsText: isSelected ? 'Selected' : 'Available',
      };
    });

    return {
      id: course._id.toString(),
      code: course.code,
      title: course.title,
      creditHours: course.creditHours,
      examDate,
      slots: formattedSlots,
      selectedSlotId,
    };
  });

  // Prepare Agenda Items
  const agendaItems = courses.map((course) => {
    const slotId = selections[course._id.toString()];
    const slot = slots.find((s) => s._id.toString() === slotId);

    if (slot) {
      return {
        courseCode: course.code,
        courseTitle: course.title,
        month: getMonthAbbr(slot.startsAt),
        day: getDayNumber(slot.startsAt),
        timeText: `${formatTime(slot.startsAt)} – ${formatTime(slot.endsAt)}`,
        location: branch?.name || 'Main Campus',
        isPlanned: true,
      };
    }

    return {
      courseCode: course.code,
      courseTitle: course.title,
      month: '--',
      day: '--',
      timeText: 'Not selected',
      location: 'Pending',
      isPlanned: false,
    };
  });

  // Prepare Kanban Courses
  const kanbanCourses: KanbanCourse[] = courses.map((course, cIdx) => {
    const courseSlots = slots.filter((s) => {
      const cid = s.courseId?._id || s.courseId;
      return cid?.toString() === course._id.toString();
    });
    const selectedSlotId = selections[course._id.toString()] || null;
    const selectedSlot = courseSlots.find((s) => s._id.toString() === selectedSlotId);

    const examDate = selectedSlot
      ? formatDateShort(selectedSlot.startsAt) + ' ' + new Date(selectedSlot.startsAt).getFullYear()
      : courseSlots[0]
      ? formatDateShort(courseSlots[0].startsAt) + ' ' + new Date(courseSlots[0].startsAt).getFullYear()
      : 'Date TBA';

    return {
      code: course.code,
      title: course.title,
      creditHours: course.creditHours,
      examDate,
      selectedSlotTime: selectedSlot
        ? `${formatTime(selectedSlot.startsAt)} – ${formatTime(selectedSlot.endsAt)}`
        : null,
      selectedHall: selectedSlot ? `Hall ${String.fromCharCode(65 + (cIdx % 4))}` : null,
      status: selectedSlot ? 'SCHEDULED' : 'UNSCHEDULED',
      availableSlots: courseSlots.map((s, sIdx) => ({
        id: s._id.toString(),
        time: `${formatTime(s.startsAt)} – ${formatTime(s.endsAt)}`,
        location: `Hall ${String.fromCharCode(65 + ((cIdx + sIdx) % 4))}`,
        seats: selections[course._id.toString()] === s._id.toString() ? 'Selected' : 'Available',
      })),
    };
  });

  // Items for Review Modal
  const reviewModalItems = courses
    .map((c) => {
      const slotId = selections[c._id.toString()];
      const slot = slots.find((s) => s._id.toString() === slotId);
      if (!slot) return null;
      return {
        code: c.code,
        title: c.title,
        date: formatDateShort(slot.startsAt) + ' (' + formatDayOfWeek(slot.startsAt) + ')',
        time: `${formatTime(slot.startsAt)} – ${formatTime(slot.endsAt)}`,
      };
    })
    .filter(Boolean) as Array<{ code: string; title: string; date: string; time: string }>;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex flex-col font-sans">
        <StudentHeader studentName="Student" />
        <main className="w-full pt-[88px] pb-16 flex-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="p-16 text-center text-[#59645B] text-sm flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#285742] border-t-transparent animate-spin" />
              <span>Loading your examination timetable and courses...</span>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const studentName = student?.fullName || 'Student';
  const registrationNumber = student?.registrationNumber || 'VU-REG';
  const program = student?.program || 'Academic Program';
  const semester = student?.semester || 1;
  const branchName = branch?.name || 'Examination Center';
  const branchAddress = branch?.address ? `${branch.address}, ${branch.city || ''}` : 'Center Campus';

  return (
    <div className="min-h-screen bg-[#F7F5EF] flex flex-col font-sans">
      {/* Sleek Auto-Collapsible Student Sidebar */}
      <StudentSidebar
        studentName={studentName}
        registrationNumber={registrationNumber}
        program={program}
      />

      {/* Fixed Header with View Switcher */}
      <StudentHeader
        studentName={studentName}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
      />

      {/* Main Container */}
      <main className="w-full pt-[88px] pb-16 flex-1 pl-0 lg:pl-[68px]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Hero Section */}
          <StudentHero
            studentName={studentName}
            registrationNumber={registrationNumber}
            program={program}
            semester={semester}
          />

          {/* Section 5.3: Complete Student Information (personal, parent and academic) in read-only form along with selected branch */}
          {student && (
            <StudentDossierCard student={student} branch={branch} />
          )}

          {/* Compact 3-Card Status Strip */}
          <StudentStatusStrip
            branchName={branchName}
            branchAddress={branchAddress}
            totalCourses={totalCourses}
            totalCreditHours={totalCreditHours}
            selectedCount={plannedCount}
          />

          {/* Conflict Banner: Clear Message & Block Saving (Section 5.3) */}
          {hasConflict && (
            <div className="mb-6 p-4 rounded-2xl bg-[#FAEAE7] border-2 border-[#A3342F] text-[#A3342F] flex items-center gap-3 shadow-xs">
              <HiExclamationTriangle className="w-6 h-6 shrink-0 text-[#A3342F]" />
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider">
                  Exam Schedule Conflict Detected
                </h4>
                <p className="text-xs text-[#24352B] mt-0.5 font-medium">
                  {conflictMessage}
                </p>
                <p className="text-[11px] text-[#A3342F] mt-0.5">
                  Two courses cannot share the same date and overlapping time interval. Please re-assign one of the conflicting course slots.
                </p>
              </div>
            </div>
          )}

          {/* Conditional: Locked View OR Live Planner / Kanban */}
          {isLocked ? (
            <div className="mb-8">
              <LockedDateSheetView
                studentName={studentName}
                registrationNumber={registrationNumber}
                program={program}
                branchName={branchName}
                branchAddress={branchAddress}
                rows={displayLockedRows}
                hasUnusedGrant={hasUnusedGrant}
                onUnlock={() => setIsLocked(false)}
                onBranchUpdated={loadPlannerData}
              />
            </div>
          ) : totalCourses === 0 ? (
            /* Empty Courses State */
            <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-8 text-center my-8 shadow-xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F0EEE6] text-[#59645B] mx-auto flex items-center justify-center">
                <HiExclamationCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-semibold text-[#24352B]">
                No Course Enrollments Found
              </h3>
              <p className="text-xs text-[#59645B] max-w-md mx-auto">
                Your course registrations have not yet been synchronized by the university registrar office. Please reach out to administrative support.
              </p>
              <div className="pt-2">
                <Link
                  href="/student/help"
                  className="inline-block px-4 py-2 bg-[#285742] text-white text-xs font-semibold rounded-xl"
                >
                  Contact Registrar Desk
                </Link>
              </div>
            </div>
          ) : viewMode === 'kanban' ? (
            /* Kanban Board Mode */
            <div className="mb-8">
              <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#DEDCD1] shadow-xs">
                <StudentKanbanBoard
                  courses={kanbanCourses}
                  onSelectSlot={(courseCode, slotId) => {
                    const targetCourse = courses.find((c) => c.code === courseCode);
                    if (targetCourse) {
                      handleSelectSlot(targetCourse._id.toString(), slotId);
                    }
                  }}
                  isDateSheetLocked={isLocked}
                  onSaveDateSheet={() => setReviewModalOpen(true)}
                  hasConflict={hasConflict}
                />
              </div>
            </div>
          ) : (
            /* Standard 2-Column Planner Grid (65% / 35%) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-start">
              {/* Left Column: Course Cards */}
              <div className="lg:col-span-8 flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 gap-2">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-semibold text-[#24352B] tracking-tight">
                      Choose your exam times
                    </h2>
                    <p className="text-xs text-[#59645B] mt-0.5">
                      Select one available date and time for every course from the slots created by admin.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-[#59645B] bg-[#FFFFFF] px-3 py-1.5 rounded-full border border-[#DEDCD1] shadow-xs self-start sm:self-auto">
                    <HiClock className="w-4 h-4 text-[#285742]" />
                    <span>All times: Asia/Karachi (PKT)</span>
                  </div>
                </div>

                {courseCardsData.map((course) => (
                  <CourseCard
                    key={course.id}
                    courseCode={course.code}
                    title={course.title}
                    creditHours={course.creditHours}
                    examDate={course.examDate}
                    slots={course.slots}
                    selectedSlotId={course.selectedSlotId}
                    onSelectSlot={(slotId) => handleSelectSlot(course.id, slotId)}
                    helperText={
                      course.slots.length === 0
                        ? 'No exam slots published for this course yet. Please contact administration.'
                        : undefined
                    }
                  />
                ))}
              </div>

              {/* Right Column: Sticky Agenda Panel & Save Action */}
              <div className="lg:col-span-4">
                <ExamAgendaPanel
                  items={agendaItems}
                  plannedCount={plannedCount}
                  totalCount={totalCourses}
                  hasConflict={hasConflict}
                  onOpenReview={() => setReviewModalOpen(true)}
                />
              </div>
            </div>
          )}

          {/* Secondary Support Content Strip */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E7EEE3] text-[#285742] flex items-center justify-center shrink-0">
                  <HiOutlineIdentification className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#24352B]">
                    Your student information
                  </h4>
                  <p className="text-xs text-[#59645B] mt-0.5">
                    View verified personal credentials, guardian details, and degree records on your official student profile.
                  </p>
                </div>
              </div>
              <Link
                href="/student/profile"
                className="text-xs font-semibold text-[#285742] hover:text-[#204735] inline-flex items-center gap-1 self-start"
              >
                <span>View profile</span>
                <span>→</span>
              </Link>
            </div>

            <div className="bg-[#FFFFFF] border border-[#DEDCD1] rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E7EEE3] text-[#285742] flex items-center justify-center shrink-0">
                  <HiOutlineQuestionMarkCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#24352B]">
                    Need to make a change?
                  </h4>
                  <p className="text-xs text-[#59645B] mt-0.5">
                    Submit a formal ticket to change examination campus center or request a date sheet timetable revision.
                  </p>
                </div>
              </div>
              <Link
                href="/student/help"
                className="text-xs font-semibold text-[#285742] hover:text-[#204735] inline-flex items-center gap-1 self-start"
              >
                <span>Get help & submit request</span>
                <span>→</span>
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Review & Confirmation Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onConfirm={handleConfirmSave}
        branchName={branchName}
        saving={saving}
        items={reviewModalItems}
      />

      {/* Footer */}
      <footer className="w-full bg-[#FFFFFF] border-t border-[#DEDCD1] py-6 pl-0 lg:pl-[68px] print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#59645B] text-center sm:text-left">
          <p>ExamSlot · University student exam portal · Fall 2026 Session</p>
          <div className="flex items-center gap-5">
            <Link href="/student/profile" className="hover:text-[#285742] transition-colors">
              My Profile
            </Link>
            <Link href="/student/help" className="hover:text-[#285742] transition-colors">
              Registrar Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

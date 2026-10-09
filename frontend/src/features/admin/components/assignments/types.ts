export interface CourseItem {
  _id: string;
  code: string;
  title: string;
  creditHours: number;
  department: string;
  active: boolean;
}

export interface AssignmentRecord {
  _id: string;
  studentId: string;
  courseId: CourseItem;
  createdAt?: string;
}

export interface StudentAssignmentRow {
  _id: string;
  fullName: string;
  registrationNumber: string;
  program: string;
  semester: number;
  sessionBatch: string;
  phone?: string;
  cnic?: string;
  assignmentsFinalized: boolean;
  userId?: {
    _id: string;
    email: string;
    active: boolean;
  };
  selectedBranchId?: {
    _id: string;
    code: string;
    name: string;
    city: string;
  };
  assignments: AssignmentRecord[];
  coursesCount: number;
  totalCreditHours: number;
  hasDateSheet: boolean;
  dateSheetRevision?: number | null;
  dateSheetSavedAt?: string | null;
}

export interface AssignmentStats {
  totalStudents: number;
  finalizedCount: number;
  incompleteCount: number;
  unassignedCount: number;
}

export type StatusFilterType = 'ALL' | 'FINALIZED' | 'INCOMPLETE' | 'UNASSIGNED';

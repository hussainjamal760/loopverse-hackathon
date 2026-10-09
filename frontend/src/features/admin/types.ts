export interface AdminStats {
  totalStudents: number;
  totalBranches: number;
  totalCourses: number;
  totalSlots: number;
  publishedSlots: number;
  draftSlots: number;
  pendingRequests: number;
  totalSavedSheets: number;
  needAssignment: number;
  planningInProgress: number;
}

export interface BranchMetric {
  id: string;
  name: string;
  code: string;
  city: string;
  totalStudents: number;
  savedSheets: number;
}

export interface DepartmentSlotMetric {
  department: string;
  coursesCount: number;
  publishedSlots: number;
  draftSlots: number;
}

export interface RequestBreakdownMetric {
  type: 'BRANCH' | 'DATE_SHEET';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  count: number;
}

export interface UpcomingSlotItem {
  id: string;
  courseCode: string;
  courseTitle: string;
  department: string;
  startsAt: string;
  endsAt: string;
  status: 'PUBLISHED' | 'DRAFT';
}

export interface RecentActivityItem {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  actorEmail?: string;
  createdAt: string;
  metadata?: string | null;
}

export interface PendingRequestItem {
  id: string;
  studentName: string;
  registrationNumber: string;
  initials: string;
  requestType: 'Date sheet change' | 'Branch change';
  type?: 'BRANCH' | 'DATE_SHEET';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  raisedTime: string;
  reason?: string;
  remark?: string;
  program?: string;
  branchName?: string;
  branchCity?: string;
  requestedBranchName?: string;
  targetCourseCode?: string;
  targetCourseTitle?: string;
  currentSlotTime?: string;
  bookedCoursesCount?: number;
  totalCoursesCount?: number;
  createdAt?: string;
}

export interface AdminOverviewData {
  stats: AdminStats;
  recentRequests: PendingRequestItem[];
  upcomingSlots: UpcomingSlotItem[];
  recentActivity: RecentActivityItem[];
  branchMetrics: BranchMetric[];
  departmentSlotMetrics: DepartmentSlotMetric[];
  requestBreakdown: RequestBreakdownMetric[];
}

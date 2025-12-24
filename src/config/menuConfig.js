import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  BankOutlined,
  BookOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  CarOutlined,
  InboxOutlined,
  ScheduleOutlined,
  BellOutlined,
  BarChartOutlined,
  SettingOutlined,
  AuditOutlined,
  SafetyOutlined,
  ReadOutlined,
  SolutionOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';

// Menu items configuration with role-based access
export const menuItems = [
  {
    key: '/dashboard',
    icon: DashboardOutlined,
    label: 'Dashboard',
    roles: ['super_admin', 'main_branch_admin', 'branch_admin', 'teacher', 'staff', 'student', 'parent'],
  },
  {
    key: 'branches',
    icon: BankOutlined,
    label: 'Branch Management',
    roles: ['super_admin', 'main_branch_admin'],
    children: [
      { key: '/branches', label: 'All Branches' },
      { key: '/branches/create', label: 'Add Branch' },
      { key: '/branches/hierarchy', label: 'Branch Hierarchy' },
    ],
  },
  {
    key: 'students',
    icon: UserOutlined,
    label: 'Students',
    roles: ['super_admin', 'main_branch_admin', 'branch_admin', 'teacher'],
    children: [
      { key: '/students', label: 'All Students' },
      { key: '/students/create', label: 'Add Student' },
      { key: '/students/promote', label: 'Promote Students' },
      { key: '/students/transfer', label: 'Transfer Students' },
    ],
  },
  {
    key: 'staff',
    icon: TeamOutlined,
    label: 'Staff',
    roles: ['super_admin', 'main_branch_admin', 'branch_admin'],
    children: [
      { key: '/staff', label: 'All Staff' },
      { key: '/staff/create', label: 'Add Staff' },
      { key: '/staff/attendance', label: 'Staff Attendance' },
      { key: '/staff/leave', label: 'Leave Management' },
    ],
  },
  {
    key: 'academic',
    icon: ReadOutlined,
    label: 'Academic',
    roles: ['super_admin', 'main_branch_admin', 'branch_admin'],
    children: [
      { key: '/academic/years', label: 'Academic Years' },
      { key: '/academic/classes', label: 'Classes & Sections' },
      { key: '/academic/subjects', label: 'Subjects' },
    ],
  },
  {
    key: 'fees',
    icon: DollarOutlined,
    label: 'Fee Management',
    roles: ['super_admin', 'main_branch_admin', 'branch_admin', 'staff'],
    children: [
      { key: '/fees', label: 'Dashboard' },
      { key: '/fees/structures', label: 'Fee Structures' },
      { key: '/fees/invoices', label: 'Invoices' },
      { key: '/fees/collect', label: 'Collect Fee' },
      { key: '/fees/scholarships', label: 'Scholarships' },
      { key: '/fees/discounts', label: 'Discount Rules' },
      { key: '/fees/reports', label: 'Reports' },
    ],
  },
  {
    key: 'attendance',
    icon: CalendarOutlined,
    label: 'Attendance',
    roles: ['super_admin', 'main_branch_admin', 'branch_admin', 'teacher'],
    children: [
      { key: '/attendance', label: 'Mark Attendance' },
      { key: '/attendance/view', label: 'View Attendance' },
      { key: '/attendance/reports', label: 'Reports' },
    ],
  },
  {
    key: 'exams',
    icon: FileTextOutlined,
    label: 'Examinations',
    roles: ['super_admin', 'main_branch_admin', 'branch_admin', 'teacher'],
    children: [
      { key: '/exams', label: 'Exam Schedules' },
      { key: '/exams/create', label: 'Create Exam' },
      { key: '/exams/marks', label: 'Enter Marks' },
      { key: '/exams/results', label: 'Results' },
      { key: '/exams/report-cards', label: 'Report Cards' },
    ],
  },
  {
    key: 'timetable',
    icon: ScheduleOutlined,
    label: 'Timetable',
    roles: ['super_admin', 'main_branch_admin', 'branch_admin', 'teacher'],
    children: [
      { key: '/timetable', label: 'View Timetable' },
      { key: '/timetable/builder', label: 'Timetable Builder' },
    ],
  },
  {
    key: 'library',
    icon: BookOutlined,
    label: 'Library',
    roles: ['super_admin', 'main_branch_admin', 'branch_admin', 'staff'],
    children: [
      { key: '/library', label: 'Dashboard' },
      { key: '/library/books/create', label: 'Add Book' },
      { key: '/library/categories', label: 'Categories' },
      { key: '/library/members', label: 'Members' },
      { key: '/library/reservations', label: 'Reservations' },
      { key: '/library/settings', label: 'Settings' },
    ],
  },
  {
    key: 'transport',
    icon: CarOutlined,
    label: 'Transport',
    roles: ['super_admin', 'main_branch_admin', 'branch_admin'],
    children: [
      { key: '/transport', label: 'Vehicles' },
      { key: '/transport/routes', label: 'Routes' },
      { key: '/transport/assignments', label: 'Assignments' },
    ],
  },
  {
    key: 'inventory',
    icon: InboxOutlined,
    label: 'Inventory',
    roles: ['super_admin', 'main_branch_admin', 'branch_admin', 'staff'],
    children: [
      { key: '/inventory', label: 'All Items' },
      { key: '/inventory/items/create', label: 'Add Item' },
      { key: '/inventory/categories', label: 'Categories' },
      { key: '/inventory/stock', label: 'Stock Management' },
    ],
  },
  {
    key: 'notifications',
    icon: BellOutlined,
    label: 'Notifications',
    roles: ['super_admin', 'main_branch_admin', 'branch_admin'],
    children: [
      { key: '/notifications', label: 'All Notifications' },
      { key: '/notifications/send', label: 'Send Notification' },
      { key: '/notifications/templates', label: 'Templates' },
    ],
  },
  {
    key: 'reports',
    icon: BarChartOutlined,
    label: 'Reports',
    roles: ['super_admin', 'main_branch_admin', 'branch_admin'],
    children: [
      { key: '/reports', label: 'Dashboard' },
      { key: '/reports/students', label: 'Student Reports' },
      { key: '/reports/fees', label: 'Fee Reports' },
      { key: '/reports/exams', label: 'Exam Reports' },
      { key: '/reports/attendance', label: 'Attendance Reports' },
    ],
  },
  {
    key: 'activity-logs',
    icon: AuditOutlined,
    label: 'Activity Logs',
    roles: ['super_admin', 'main_branch_admin'],
  },
  {
    key: 'settings',
    icon: SettingOutlined,
    label: 'Settings',
    roles: ['super_admin', 'main_branch_admin', 'branch_admin'],
    children: [
      { key: '/settings', label: 'General' },
      { key: '/settings/academic', label: 'Academic' },
      { key: '/settings/fees', label: 'Fee Rules' },
      { key: '/settings/notifications', label: 'Notification' },
    ],
  },
];

// Get menu items based on user role with Link wrappers for prefetching
export const getMenuItemsByRole = (userRole, LinkComponent = null) => {
  return menuItems
    .filter((item) => item.roles.includes(userRole))
    .map((item) => ({
      key: item.key,
      icon: item.icon,
      label: LinkComponent && item.key.startsWith('/') ? (
        <LinkComponent href={item.key} prefetch={true}>{item.label}</LinkComponent>
      ) : item.label,
      children: item.children?.map((child) => ({
        key: child.key,
        label: LinkComponent ? (
          <LinkComponent href={child.key} prefetch={true}>{child.label}</LinkComponent>
        ) : child.label,
      })),
    }));
};

// Quick actions for dashboard based on role
export const quickActions = {
  super_admin: [
    { key: 'add-branch', label: 'Add Branch', icon: BankOutlined, path: '/branches/create' },
    { key: 'add-admin', label: 'Add Admin', icon: SafetyOutlined, path: '/staff/create' },
    { key: 'view-reports', label: 'View Reports', icon: BarChartOutlined, path: '/reports' },
    { key: 'settings', label: 'Settings', icon: SettingOutlined, path: '/settings' },
  ],
  main_branch_admin: [
    { key: 'add-student', label: 'Add Student', icon: UserOutlined, path: '/students/create' },
    { key: 'add-staff', label: 'Add Staff', icon: TeamOutlined, path: '/staff/create' },
    { key: 'collect-fee', label: 'Collect Fee', icon: DollarOutlined, path: '/fees/collect' },
    { key: 'view-reports', label: 'View Reports', icon: BarChartOutlined, path: '/reports' },
  ],
  branch_admin: [
    { key: 'add-student', label: 'Add Student', icon: UserOutlined, path: '/students/create' },
    { key: 'mark-attendance', label: 'Mark Attendance', icon: CalendarOutlined, path: '/attendance' },
    { key: 'collect-fee', label: 'Collect Fee', icon: DollarOutlined, path: '/fees/collect' },
    { key: 'exams', label: 'Manage Exams', icon: FileTextOutlined, path: '/exams' },
  ],
  teacher: [
    { key: 'mark-attendance', label: 'Mark Attendance', icon: CalendarOutlined, path: '/attendance' },
    { key: 'enter-marks', label: 'Enter Marks', icon: FileTextOutlined, path: '/exams/marks' },
    { key: 'timetable', label: 'My Timetable', icon: ScheduleOutlined, path: '/timetable' },
    { key: 'students', label: 'My Students', icon: UserOutlined, path: '/students' },
  ],
};


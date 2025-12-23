# School SaaS Frontend Implementation Plan

## Overview

Based on our backend API, the frontend will be a **multi-tenant school management system** with role-based dashboards and modules.

---

## Recommended Tech Stack

### Core Framework
```
Next.js (Seo friendly, modern)
```

### Key Libraries
| Category | Library | Purpose |
|----------|---------|---------|
| **Routing** | React Router v6 | Page navigation |
| **State Management** | Zustand or Redux Toolkit | Global state |
| **Data Fetching** | TanStack Query (React Query) | API calls, caching |
| **Forms** | React Hook Form + Zod | Form handling & validation |
| **UI Components** | Shadcn/ui + Tailwind CSS | Beautiful, accessible UI |
| **Tables** | TanStack Table | Data tables with sorting/filtering |
| **Charts** | Recharts or Chart.js | Dashboard analytics |
| **Date Handling** | date-fns | Date manipulation |
| **Icons** | Lucide React | Icon set |
| **PDF Generation** | react-pdf | Report cards, receipts |
| **Excel Export** | xlsx | Data export |
| **Notifications** | Sonner or React Hot Toast | Toast notifications |

---

## Project Structure

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                    # API layer
│   │   ├── axios.js           # Axios instance with interceptors
│   │   ├── auth.api.js
│   │   ├── students.api.js
│   │   ├── staff.api.js
│   │   ├── fees.api.js
│   │   ├── exams.api.js
│   │   ├── attendance.api.js
│   │   ├── library.api.js
│   │   ├── transport.api.js
│   │   ├── inventory.api.js
│   │   ├── timetable.api.js
│   │   ├── reports.api.js
│   │   └── settings.api.js
│   │
│   ├── components/             # Reusable components
│   │   ├── ui/                # Shadcn components
│   │   │   ├── button.jsx
│   │   │   ├── input.jsx
│   │   │   ├── card.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── table.jsx
│   │   │   ├── select.jsx
│   │   │   ├── tabs.jsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/            # Layout components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── MainLayout.jsx
│   │   │
│   │   ├── common/            # Shared components
│   │   │   ├── DataTable.jsx
│   │   │   ├── SearchInput.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── DateRangePicker.jsx
│   │   │   ├── Pagination.jsx
│   │   │   └── StatCard.jsx
│   │   │
│   │   └── forms/             # Form components
│   │       ├── StudentForm.jsx
│   │       ├── StaffForm.jsx
│   │       ├── FeeForm.jsx
│   │       └── ...
│   │
│   ├── features/              # Feature modules
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── students/
│   │   ├── staff/
│   │   ├── fees/
│   │   ├── exams/
│   │   ├── attendance/
│   │   ├── library/
│   │   ├── transport/
│   │   ├── inventory/
│   │   ├── timetable/
│   │   ├── reports/
│   │   ├── notifications/
│   │   └── settings/
│   │
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useDebounce.js
│   │   ├── useLocalStorage.js
│   │   └── usePagination.js
│   │
│   ├── store/                 # Global state
│   │   ├── authStore.js
│   │   ├── uiStore.js
│   │   └── index.js
│   │
│   ├── utils/                 # Utilities
│   │   ├── constants.js
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── helpers.js
│   │
│   ├── styles/               # Global styles
│   │   └── globals.css
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── routes.jsx
│
├── .env
├── .env.example
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## Module Implementation Details

---

### 1. AUTHENTICATION MODULE

#### Pages
- `/login` - Login page
- `/forgot-password` - Password reset request
- `/reset-password/:token` - Password reset form

#### Features
```
✓ JWT token management (localStorage/cookies)
✓ Auto-refresh tokens
✓ Remember me functionality
✓ Protected route wrapper
✓ Role-based route access
✓ Logout with cleanup
```

#### Implementation Flow
```
1. User enters credentials
2. API call to /api/auth/login
3. Store JWT token in localStorage
4. Set auth header for all requests
5. Redirect to role-based dashboard
6. Token refresh on expiry (401 response)
```

#### Key Components
```jsx
// ProtectedRoute.jsx
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};
```

---

### 2. DASHBOARD MODULE

#### Role-Based Dashboards
| Role | Dashboard Content |
|------|-------------------|
| **Super Admin** | All branches overview, system stats, user management |
| **Branch Admin** | Branch stats, student/staff counts, fee collection |
| **Teacher** | My classes, today's schedule, attendance quick entry |
| **Student** | My results, attendance, fee status, timetable |
| **Parent** | Child's performance, fee dues, attendance |

#### Dashboard Widgets
```
┌─────────────────────────────────────────────────────────────┐
│  📊 DASHBOARD                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Students │ │  Staff   │ │ Revenue  │ │ Pending  │       │
│  │   1,250  │ │    85    │ │ ₹5.2L    │ │ ₹1.8L    │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
│  ┌─────────────────────────┐ ┌─────────────────────────┐   │
│  │   Fee Collection Chart   │ │   Attendance Chart      │   │
│  │   (Monthly Bar Chart)    │ │   (Weekly Line Chart)   │   │
│  └─────────────────────────┘ └─────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────┐ ┌─────────────────────────┐   │
│  │   Recent Activities      │ │   Upcoming Events       │   │
│  │   - Student admitted     │ │   - Mid-term exams      │   │
│  │   - Fee collected        │ │   - Parent meeting      │   │
│  └─────────────────────────┘ └─────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### API Calls
```javascript
// Dashboard data fetching
GET /api/reports/dashboard?branch={branchId}

// Returns:
{
  totalStudents, totalStaff, totalBranches,
  totalRevenue, pendingFees,
  todayAttendance, upcomingExams,
  recentActivities, monthlyCollection
}
```

---

### 3. STUDENT MODULE

#### Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/students` | StudentList | All students with filters |
| `/students/new` | StudentForm | Admission form |
| `/students/:id` | StudentDetail | Student profile |
| `/students/:id/edit` | StudentForm | Edit student |
| `/students/:id/report-card` | ReportCard | Academic report |
| `/students/promote` | PromotionWizard | Bulk promotion |
| `/students/import` | BulkImport | CSV/Excel import |

#### Student List Features
```
✓ Search by name, admission number, email
✓ Filter by class, section, status, gender
✓ Sort by any column
✓ Pagination (20 per page)
✓ Export to Excel/PDF
✓ Bulk actions (promote, delete, status change)
```

#### Student Form Sections
```
1. Basic Information
   - Name, DOB, Gender, Blood Group
   - Photo upload
   
2. Contact Information
   - Address, Phone, Email
   
3. Academic Information
   - Branch, Class, Section, Roll Number
   - Academic Year
   
4. Guardian Information (repeatable)
   - Father/Mother/Guardian details
   - Contact info, Occupation
   - Mark as primary
   
5. Emergency Contact
   - Name, Relation, Phone
   
6. Medical Information
   - Allergies, Conditions, Doctor info
   
7. Previous School (optional)
   - School name, Last class, TC number
   
8. Documents
   - Birth certificate, TC, Photos
```

#### Key API Calls
```javascript
GET    /api/students                    // List with filters
POST   /api/students                    // Create student
GET    /api/students/:id                // Get single student
PUT    /api/students/:id                // Update student
DELETE /api/students/:id                // Soft delete
PATCH  /api/students/:id/status         // Change status
POST   /api/students/promote            // Bulk promote
POST   /api/students/:id/transfer       // Transfer to branch
GET    /api/students/:id/report-card    // Get report card
POST   /api/students/bulk-import        // Import from file
```

---

### 4. STAFF MODULE

#### Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/staff` | StaffList | All staff with filters |
| `/staff/new` | StaffForm | Add new staff |
| `/staff/:id` | StaffDetail | Staff profile |
| `/staff/:id/edit` | StaffForm | Edit staff |

#### Staff Form Sections
```
1. Personal Information
   - Name, DOB, Gender, CNIC
   - Photo, Contact details
   
2. Employment Details
   - Employee ID, Department, Designation
   - Role, Employment type
   - Joining date
   
3. Teaching Information (for teachers)
   - Subjects assigned
   - Classes assigned
   - Is class teacher?
   
4. Salary Information
   - Basic salary, Allowances
   - Deductions, Bank details
   
5. Qualifications (repeatable)
   - Degree, Institution, Year
   
6. Experience (repeatable)
   - Previous organization, Duration
   
7. Documents
   - Resume, Certificates, ID proof
```

---

### 5. FEE MANAGEMENT MODULE

#### Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/fees` | FeeList | All fee invoices |
| `/fees/structure` | FeeStructure | Define fee types |
| `/fees/collect` | FeeCollection | Payment collection |
| `/fees/invoice/:id` | InvoiceDetail | View/Print invoice |
| `/fees/scholarships` | ScholarshipList | Manage scholarships |
| `/fees/discounts` | DiscountRules | Discount configuration |
| `/fees/reports` | FeeReports | Collection reports |

#### Fee Collection Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Select     │ --> │  Select     │ --> │  Apply      │
│  Student    │     │  Invoice    │     │  Discount   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                  │                   │
       v                  v                   v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Enter      │ --> │  Select     │ --> │  Generate   │
│  Amount     │     │  Payment    │     │  Receipt    │
│             │     │  Method     │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
```

#### Fee Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  💰 FEE MANAGEMENT                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Today: ₹45,000 collected │ This Month: ₹5,20,000          │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PENDING FEES                                         │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Student        │ Class │ Amount  │ Due Date │ Action│  │
│  │  John Doe       │ 10-A  │ ₹15,000 │ 10 Nov   │ [Pay] │  │
│  │  Jane Smith     │ 9-B   │ ₹12,000 │ 15 Nov   │ [Pay] │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [Generate Invoices] [Send Reminders] [Export Report]      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 6. EXAM MODULE

#### Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/exams` | ExamList | All exams |
| `/exams/schedule` | ExamSchedule | Create exam schedule |
| `/exams/:id` | ExamDetail | Exam details |
| `/exams/:id/marks` | MarksEntry | Enter marks |
| `/exams/results` | ResultList | View results |
| `/exams/report-cards` | ReportCards | Generate report cards |

#### Marks Entry Interface
```
┌─────────────────────────────────────────────────────────────┐
│  📝 MARKS ENTRY - Mathematics | Class 10-A | Mid Term      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Total Marks: 100  │  Passing: 33  │  Students: 45         │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Roll │ Student Name    │ Marks │ Status  │ Grade    │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  1   │ Ahmed Khan      │ [85]  │ Present │ A        │  │
│  │  2   │ Sara Ali        │ [72]  │ Present │ B        │  │
│  │  3   │ Zain Ahmed      │ [--]  │ Absent  │ -        │  │
│  │  4   │ Fatima Malik    │ [91]  │ Present │ A+       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  [Save Draft] [Submit & Calculate] [Export]                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Report Card Component
```jsx
// ReportCard.jsx - Printable report card
const ReportCard = ({ student, results, attendance }) => {
  return (
    <div className="report-card print:a4">
      <header>
        <SchoolLogo />
        <StudentInfo student={student} />
      </header>
      
      <section className="marks-table">
        <SubjectWiseMarks results={results} />
      </section>
      
      <section className="summary">
        <TotalMarks />
        <Percentage />
        <Grade />
        <Rank />
      </section>
      
      <section className="attendance">
        <AttendanceSummary attendance={attendance} />
      </section>
      
      <footer>
        <TeacherRemarks />
        <Signatures />
      </footer>
    </div>
  );
};
```

---

### 7. ATTENDANCE MODULE

#### Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/attendance` | AttendanceList | View attendance records |
| `/attendance/mark` | MarkAttendance | Daily attendance entry |
| `/attendance/student/:id` | StudentAttendance | Student's attendance |
| `/attendance/reports` | AttendanceReports | Attendance analytics |

#### Mark Attendance Interface
```
┌─────────────────────────────────────────────────────────────┐
│  ✅ MARK ATTENDANCE                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Date: [Nov 28, 2024 ▼]  Class: [10 ▼]  Section: [A ▼]     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Roll │ Name          │ P │ A │ L │ Late │ Remarks   │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  1   │ Ahmed Khan    │ ● │ ○ │ ○ │  ○   │ [______]  │  │
│  │  2   │ Sara Ali      │ ○ │ ● │ ○ │  ○   │ Sick      │  │
│  │  3   │ Zain Ahmed    │ ○ │ ○ │ ● │  ○   │ Family    │  │
│  │  4   │ Fatima Malik  │ ● │ ○ │ ○ │  ○   │ [______]  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Summary: Present: 42 │ Absent: 2 │ Leave: 1              │
│                                                             │
│  [Mark All Present] [Save] [Send Absent SMS]               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 8. LIBRARY MODULE

#### Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/library` | LibraryDashboard | Overview |
| `/library/books` | BookList | Book catalog |
| `/library/books/new` | BookForm | Add book |
| `/library/issue` | IssueBook | Issue/Return |
| `/library/members` | MemberList | Library members |
| `/library/fines` | FineManagement | Overdue fines |

#### Book Issue Flow
```
1. Scan/Enter Book ISBN or ID
2. Scan/Enter Student/Staff ID
3. System checks:
   - Book availability
   - Member's current issues (limit check)
   - Any pending fines
4. Set due date (default from settings)
5. Confirm issue
6. Print slip (optional)
```

---

### 9. TRANSPORT MODULE

#### Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/transport` | TransportDashboard | Overview |
| `/transport/vehicles` | VehicleList | All vehicles |
| `/transport/routes` | RouteList | Route management |
| `/transport/tracking` | LiveTracking | GPS tracking |
| `/transport/assignments` | StudentAssignment | Assign students |

#### Live Tracking Map
```jsx
// LiveTracking.jsx
const LiveTracking = () => {
  const { vehicles } = useVehicleLocations();
  
  return (
    <MapContainer center={[24.8607, 67.0011]} zoom={12}>
      {vehicles.map(vehicle => (
        <Marker 
          key={vehicle.id}
          position={[vehicle.lat, vehicle.lng]}
          icon={busIcon}
        >
          <Popup>
            <h3>{vehicle.number}</h3>
            <p>Driver: {vehicle.driver}</p>
            <p>Students: {vehicle.studentCount}</p>
            <p>Speed: {vehicle.speed} km/h</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
```

---

### 10. TIMETABLE MODULE

#### Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/timetable` | TimetableList | All timetables |
| `/timetable/create` | TimetableBuilder | Create timetable |
| `/timetable/class/:class` | ClassTimetable | View class timetable |
| `/timetable/teacher/:id` | TeacherTimetable | Teacher's schedule |

#### Timetable Builder
```
┌─────────────────────────────────────────────────────────────┐
│  📅 TIMETABLE BUILDER - Class 10-A                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│       │ Period 1 │ Period 2 │ Break │ Period 3 │ Period 4 │
│       │ 8:00-8:40│ 8:40-9:20│ 9:20  │ 9:40-10:20│10:20-11 │
│  ─────┼──────────┼──────────┼───────┼──────────┼──────────│
│  Mon  │ [Math ▼] │ [Eng ▼]  │  ☕   │ [Sci ▼]  │ [Urdu ▼]│
│  Tue  │ [Eng ▼]  │ [Sci ▼]  │  ☕   │ [Math ▼] │ [Comp ▼]│
│  Wed  │ [Sci ▼]  │ [Math ▼] │  ☕   │ [Urdu ▼] │ [Eng ▼] │
│  Thu  │ [Comp ▼] │ [Urdu ▼] │  ☕   │ [Eng ▼]  │ [Math ▼]│
│  Fri  │ [Urdu ▼] │ [Comp ▼] │  ☕   │ [Math ▼] │ [Sci ▼] │
│  ─────┴──────────┴──────────┴───────┴──────────┴──────────│
│                                                             │
│  ⚠️ Conflict: Mr. Ahmed assigned to 2 classes at 8:00 Mon  │
│                                                             │
│  [Check Conflicts] [Save] [Publish]                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 11. INVENTORY MODULE

#### Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/inventory` | InventoryDashboard | Overview |
| `/inventory/assets` | AssetList | All assets |
| `/inventory/assets/new` | AssetForm | Add asset |
| `/inventory/maintenance` | MaintenanceList | Maintenance schedule |
| `/inventory/reports` | InventoryReports | Depreciation, etc. |

---

### 12. REPORTS MODULE

#### Available Reports
```
📊 REPORTS

├── Financial Reports
│   ├── Fee Collection Report
│   ├── Outstanding Dues
│   ├── Daily Collection
│   └── Scholarship Report
│
├── Academic Reports
│   ├── Exam Results Analysis
│   ├── Class Performance
│   ├── Subject-wise Analysis
│   └── Toppers List
│
├── Attendance Reports
│   ├── Daily Attendance
│   ├── Monthly Summary
│   ├── Low Attendance Students
│   └── Staff Attendance
│
├── Student Reports
│   ├── Student Directory
│   ├── Class-wise Strength
│   ├── Admission Report
│   └── TC Issued
│
└── Custom Report Builder
    ├── Select Data Source
    ├── Choose Columns
    ├── Apply Filters
    └── Export (PDF/Excel)
```

---

### 13. SETTINGS MODULE

#### Pages
| Route | Component | Description |
|-------|-----------|-------------|
| `/settings` | SettingsLayout | Settings container |
| `/settings/general` | GeneralSettings | Basic settings |
| `/settings/academic` | AcademicSettings | Academic year, classes |
| `/settings/fees` | FeeSettings | Fee rules, late fees |
| `/settings/grading` | GradingSettings | Grade system |
| `/settings/notifications` | NotificationSettings | Email/SMS templates |
| `/settings/users` | UserManagement | Admin users |

---

## UI/UX Guidelines

### Design System
```css
/* Color Palette */
--primary: #2563eb;      /* Blue */
--secondary: #64748b;    /* Slate */
--success: #22c55e;      /* Green */
--warning: #f59e0b;      /* Amber */
--danger: #ef4444;       /* Red */
--background: #f8fafc;   /* Light gray */
--card: #ffffff;         /* White */

/* Typography */
--font-family: 'Inter', sans-serif;
--heading-font: 'Plus Jakarta Sans', sans-serif;

/* Spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;

/* Border Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
```

### Responsive Breakpoints
```css
/* Mobile First */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Component Patterns
```
1. Loading States
   - Skeleton loaders for lists
   - Spinner for buttons
   - Progress bar for uploads

2. Error Handling
   - Toast notifications for errors
   - Inline validation messages
   - Error boundary for crashes

3. Empty States
   - Illustration + message
   - Action button

4. Confirmation Dialogs
   - Destructive actions require confirmation
   - Clear action buttons
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
```
✓ Project setup (Vite + React)
✓ Install dependencies
✓ Setup Tailwind + Shadcn
✓ Create folder structure
✓ Setup routing
✓ Setup API layer (Axios)
✓ Authentication flow
✓ Protected routes
✓ Basic layout (Sidebar, Header)
```

### Phase 2: Core Modules (Week 2-3)
```
✓ Dashboard
✓ Student management
✓ Staff management
✓ Basic CRUD operations
✓ Data tables with filters
✓ Forms with validation
```

### Phase 3: Academic Modules (Week 4)
```
✓ Fee management
✓ Exam management
✓ Marks entry
✓ Report cards
✓ Attendance marking
```

### Phase 4: Secondary Modules (Week 5)
```
✓ Library management
✓ Transport management
✓ Inventory management
✓ Timetable management
```

### Phase 5: Reports & Settings (Week 6)
```
✓ Reports module
✓ Export functionality
✓ Settings module
✓ User management
✓ Activity logs
```

### Phase 6: Polish & Deploy (Week 7)
```
✓ UI/UX improvements
✓ Performance optimization
✓ Testing
✓ Bug fixes
✓ Documentation
✓ Deployment
```

---

## API Integration Pattern

### API Service Example
```javascript
// src/api/students.api.js
import api from './axios';

export const studentApi = {
  // List with filters
  getAll: (params) => api.get('/students', { params }),
  
  // Get single
  getById: (id) => api.get(`/students/${id}`),
  
  // Create
  create: (data) => api.post('/students', data),
  
  // Update
  update: (id, data) => api.put(`/students/${id}`, data),
  
  // Delete
  delete: (id) => api.delete(`/students/${id}`),
  
  // Change status
  changeStatus: (id, status, reason) => 
    api.patch(`/students/${id}/status`, { status, reason }),
  
  // Promote
  promote: (data) => api.post('/students/promote', data),
  
  // Get report card
  getReportCard: (id, params) => 
    api.get(`/students/${id}/report-card`, { params }),
};
```

### React Query Hook Example
```javascript
// src/features/students/hooks/useStudents.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentApi } from '@/api/students.api';

export const useStudents = (filters) => {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: () => studentApi.getAll(filters),
  });
};

export const useStudent = (id) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => studentApi.getById(id),
    enabled: !!id,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: studentApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['students']);
      toast.success('Student created successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create student');
    },
  });
};
```

---

## Getting Started Commands

```bash
# Create project
npm create vite@latest frontend -- --template react

# Navigate to project
cd frontend

# Install core dependencies
npm install react-router-dom @tanstack/react-query axios zustand

# Install UI dependencies
npm install -D tailwindcss postcss autoprefixer
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# Install form dependencies
npm install react-hook-form @hookform/resolvers zod

# Install utility dependencies
npm install date-fns recharts

# Initialize Tailwind
npx tailwindcss init -p

# Install Shadcn CLI
npx shadcn-ui@latest init

# Add Shadcn components
npx shadcn-ui@latest add button card input table dialog select tabs
```

---

## Summary

| Module | Pages | Priority | Complexity |
|--------|-------|----------|------------|
| Auth | 3 | 🔴 High | ⭐⭐ |
| Dashboard | 1 | 🔴 High | ⭐⭐⭐ |
| Students | 7 | 🔴 High | ⭐⭐⭐⭐ |
| Staff | 4 | 🔴 High | ⭐⭐⭐ |
| Fees | 7 | 🔴 High | ⭐⭐⭐⭐⭐ |
| Exams | 6 | 🟡 Medium | ⭐⭐⭐⭐ |
| Attendance | 4 | 🟡 Medium | ⭐⭐⭐ |
| Library | 6 | 🟢 Low | ⭐⭐⭐ |
| Transport | 5 | 🟢 Low | ⭐⭐⭐ |
| Inventory | 5 | 🟢 Low | ⭐⭐⭐ |
| Timetable | 4 | 🟡 Medium | ⭐⭐⭐⭐ |
| Reports | 5 | 🟡 Medium | ⭐⭐⭐⭐ |
| Settings | 6 | 🟢 Low | ⭐⭐ |

**Total: ~63 pages/views**

---

Ready to start frontend development? Let me know which framework you prefer!


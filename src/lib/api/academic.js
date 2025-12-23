import api from '../axios';

export const academicApi = {
    // Academic Years
    getAcademicYears: (params) => api.get('/academic/academic-years', { params }),
    getCurrentAcademicYear: () => api.get('/academic/academic-years/current'),
    createAcademicYear: (data) => api.post('/academic/academic-years', data),
    updateAcademicYear: (id, data) => api.put(`/academic/academic-years/${id}`, data),
    deleteAcademicYear: (id) => api.delete(`/academic/academic-years/${id}`),
    setCurrentAcademicYear: (id) => api.put(`/academic/academic-years/${id}/set-current`),

    // Classes
    getClasses: (params) => api.get('/academic/classes', { params }),
    getClass: (id) => api.get(`/academic/classes/${id}`),
    createClass: (data) => api.post('/academic/classes', data),
    updateClass: (id, data) => api.put(`/academic/classes/${id}`, data),
    deleteClass: (id) => api.delete(`/academic/classes/${id}`),
    addSection: (classId, data) => api.post(`/academic/classes/${classId}/sections`, data),
    updateSection: (classId, sectionName, data) => api.put(`/academic/classes/${classId}/sections/${sectionName}`, data),
    assignClassTeacher: (classId, data) => api.post(`/academic/classes/${classId}/assign-teacher`, data),

    // Subjects
    getSubjects: (params) => api.get('/academic/subjects', { params }),
    getSubject: (id) => api.get(`/academic/subjects/${id}`),
    createSubject: (data) => api.post('/academic/subjects', data),
    updateSubject: (id, data) => api.put(`/academic/subjects/${id}`, data),
    deleteSubject: (id) => api.delete(`/academic/subjects/${id}`),
    assignSubjectTeacher: (id, data) => api.post(`/academic/subjects/${id}/assign-teacher`, data),

    // Rooms
    getRooms: (params) => api.get('/academic/rooms', { params }),
    createRoom: (data) => api.post('/academic/rooms', data),
    updateRoom: (id, data) => api.put(`/academic/rooms/${id}`, data),

    // Exam Types
    getExamTypes: (params) => api.get('/academic/exam-types', { params }),
    createExamType: (data) => api.post('/academic/exam-types', data),

    // Exam Schedules
    getExamSchedules: (params) => api.get('/academic/exam-schedules', { params }),
    getExamSchedule: (id) => api.get(`/academic/exam-schedules/${id}`),
    createExamSchedule: (data) => api.post('/academic/exam-schedules', data),
    updateExamSchedule: (id, data) => api.put(`/academic/exam-schedules/${id}`, data),
    publishExamSchedule: (id) => api.post(`/academic/exam-schedules/${id}/publish`),

    // Exam Results
    getExamResults: (params) => api.get('/academic/results', { params }),
    getStudentResult: (studentId, examScheduleId) => api.get(`/academic/results/${studentId}/${examScheduleId}`),
    createExamResult: (data) => api.post('/academic/results', data),
    bulkEnterMarks: (data) => api.post('/academic/results/bulk-marks', data),
    publishResults: (examScheduleId) => api.post(`/academic/results/publish/${examScheduleId}`),

    // Grade Systems
    getGradeSystems: (params) => api.get('/academic/grade-systems', { params }),
    createGradeSystem: (data) => api.post('/academic/grade-systems', data),
    updateGradeSystem: (id, data) => api.put(`/academic/grade-systems/${id}`, data),
    setDefaultGradeSystem: (id) => api.put(`/academic/grade-systems/${id}/set-default`),

    // Report Card Templates
    getReportCardTemplates: (params) => api.get('/academic/report-templates', { params }),
    createReportCardTemplate: (data) => api.post('/academic/report-templates', data),
    updateReportCardTemplate: (id, data) => api.put(`/academic/report-templates/${id}`, data),

    // Report Cards & Promotions
    generateReportCard: (studentId, examScheduleId) => api.get(`/academic/report-card/${studentId}/${examScheduleId}`),
    promoteStudents: (data) => api.post('/academic/promote-students', data),
};

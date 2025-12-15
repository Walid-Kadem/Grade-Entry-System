// Application State
const state = {
    currentUser: null,
    activeAdminTab: 'classes',
    selectedClass: null,
    selectedStudent: null,
    users: [
        { id: 1, username: 'admin', password: 'admin', role: 'admin', name: 'Secretary' },
        { id: 2, username: 'teacher1', password: 'teacher1', role: 'teacher', name: 'Mrs. Ahmed' },
        { id: 3, username: 'teacher2', password: 'teacher2', role: 'teacher', name: 'Mr. Benali' }
    ],
    classes: [
        { id: 1, name: 'Class 3A', year: '2024-2025', teacherId: 2, gradeType: 'numerical' },
        { id: 2, name: 'Class 4B', year: '2024-2025', teacherId: 2, gradeType: 'numerical' },
        { id: 3, name: 'Class 1A', year: '2024-2025', teacherId: 3, gradeType: 'remark' }
    ],
    students: [
        { id: 1, name: 'Ahmed Hassan', classId: 1 },
        { id: 2, name: 'Fatima Zahra', classId: 1 },
        { id: 3, name: 'Youssef Benali', classId: 1 },
        { id: 4, name: 'Amina Kaddour', classId: 1 },
        { id: 5, name: 'Karim Mansouri', classId: 2 },
        { id: 6, name: 'Salma Boutahar', classId: 2 },
        { id: 7, name: 'Omar Idrissi', classId: 3 },
        { id: 8, name: 'Nour El Houda', classId: 3 }
    ],
    grades: [
        { studentId: 1, value: '8.5', remark: 'Good work', timestamp: new Date().toISOString() },
        { studentId: 2, value: '9.0', remark: 'Excellent', timestamp: new Date().toISOString() },
        { studentId: 7, value: null, remark: 'Needs more practice with letters', timestamp: new Date().toISOString() }
    ]
};

// Utility Functions
function icon(name, size = 24) {
    return `<i data-lucide="${name}" width="${size}" height="${size}"></i>`;
}

function refreshIcons() {
    if (window.lucide) {
        lucide.createIcons();
    }
}

function showSaveIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'save-indicator';
    indicator.innerHTML = `${icon('save', 20)} Saved successfully!`;
    document.body.appendChild(indicator);
    setTimeout(() => indicator.remove(), 2000);
}

// Render Functions
function renderLogin() {
    return `
        <div class="login-container">
            <div class="login-box">
                <div class="login-header">
                    ${icon('graduation-cap', 48)}
                    <h1>Grade Entry</h1>
                </div>
                <div>
                    <div class="form-group">
                        <label class="form-label">Username</label>
                        <input type="text" id="username" class="form-input" placeholder="Enter username">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" id="password" class="form-input" placeholder="Enter password">
                    </div>
                    <button onclick="handleLogin()" class="btn btn-primary">Login</button>
                </div>
                <div class="login-info">
                    <strong>Demo credentials:</strong><br>
                    Admin: admin/admin<br>
                    Teacher: teacher1/teacher1
                </div>
            </div>
        </div>
    `;
}

function renderHeader() {
    return `
        <div class="header">
            <div class="header-content">
                <div class="header-left">
                    ${icon('graduation-cap', 32)}
                    <div>
                        <div class="header-title">Grade Entry System</div>
                        <div class="header-subtitle">${state.currentUser.name} (${state.currentUser.role})</div>
                    </div>
                </div>
                <button onclick="handleLogout()" class="btn-logout">
                    ${icon('log-out', 20)}
                    Logout
                </button>
            </div>
        </div>
    `;
}

function renderAdminTabs() {
    if (state.currentUser.role !== 'admin' || state.selectedClass) return '';
    
    return `
        <div class="tabs">
            <button class="tab ${state.activeAdminTab === 'classes' ? 'active' : ''}" onclick="switchTab('classes')">
                ${icon('book-open', 20)}
                Classes
            </button>
            <button class="tab ${state.activeAdminTab === 'teachers' ? 'active' : ''}" onclick="switchTab('teachers')">
                ${icon('user-plus', 20)}
                Teachers
            </button>
            <button class="tab ${state.activeAdminTab === 'students' ? 'active' : ''}" onclick="switchTab('students')">
                ${icon('users', 20)}
                Students
            </button>
        </div>
    `;
}

function renderClassesView() {
    const teacherClasses = state.currentUser.role === 'teacher' 
        ? state.classes.filter(c => c.teacherId === state.currentUser.id)
        : state.classes;
    
    return `
        <div class="section-header">
            <h2 class="section-title">
                ${icon('book-open', 28)}
                ${state.currentUser.role === 'admin' ? 'All Classes' : 'My Classes'}
            </h2>
            ${state.currentUser.role === 'admin' ? `
                <button onclick="openModal('addClass')" class="btn-add">
                    ${icon('plus', 20)}
                    Add Class
                </button>
            ` : ''}
        </div>
        <div class="grid">
            ${teacherClasses.map(cls => {
                const classStudents = state.students.filter(s => s.classId === cls.id);
                const gradedCount = classStudents.filter(s => 
                    state.grades.some(g => g.studentId === s.id)
                ).length;
                const teacher = state.users.find(u => u.id === cls.teacherId);
                
                return `
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title" onclick="selectClass(${cls.id})" style="cursor: pointer;">${cls.name}</h3>
                            ${state.currentUser.role === 'admin' ? `
                                <button onclick="deleteClass(${cls.id})" class="btn-delete" title="Delete class">
                                    ${icon('trash-2', 20)}
                                </button>
                            ` : ''}
                        </div>
                        <p class="card-subtitle">${cls.year}</p>
                        <p class="card-info">Type: ${cls.gradeType === 'numerical' ? 'Numerical + Remark' : 'Remark Only'}</p>
                        ${state.currentUser.role === 'admin' ? `
                            <div class="class-assignment">
                                <label>Assigned Teacher:</label>
                                <select onchange="assignTeacher(${cls.id}, this.value)" onclick="event.stopPropagation()">
                                    <option value="">Unassigned</option>
                                    ${state.users.filter(u => u.role === 'teacher').map(t => `
                                        <option value="${t.id}" ${cls.teacherId === t.id ? 'selected' : ''}>${t.name}</option>
                                    `).join('')}
                                </select>
                            </div>
                        ` : teacher ? `<p class="card-info">Teacher: ${teacher.name}</p>` : ''}
                        <div class="card-footer">
                            <span class="card-stats">
                                ${icon('users', 16)}
                                ${classStudents.length} students
                            </span>
                            <span class="${gradedCount === classStudents.length ? 'status-complete' : 'status-incomplete'}">
                                ${gradedCount}/${classStudents.length} graded
                            </span>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderTeachersView() {
    const teachers = state.users.filter(u => u.role === 'teacher');
    
    return `
        <div class="section-header">
            <h2 class="section-title">
                ${icon('user-plus', 28)}
                Teachers
            </h2>
            <button onclick="openModal('addTeacher')" class="btn-add">
                ${icon('plus', 20)}
                Add Teacher
            </button>
        </div>
        <div class="grid">
            ${teachers.map(teacher => {
                const teacherClasses = state.classes.filter(c => c.teacherId === teacher.id);
                return `
                    <div class="teacher-card">
                        <div class="card-header">
                            <h3 class="card-title">${teacher.name}</h3>
                            <button onclick="deleteTeacher(${teacher.id})" class="btn-delete" title="Delete teacher">
                                ${icon('trash-2', 20)}
                            </button>
                        </div>
                        <p class="card-subtitle">Username: ${teacher.username}</p>
                        <div class="teacher-classes">
                            <p>Assigned Classes (${teacherClasses.length}):</p>
                            ${teacherClasses.length > 0 ? `
                                <ul>
                                    ${teacherClasses.map(cls => `<li>• ${cls.name}</li>`).join('')}
                                </ul>
                            ` : '<p class="no-classes">No classes assigned</p>'}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderStudentsView() {
    return `
        <div class="section-header">
            <h2 class="section-title">
                ${icon('users', 28)}
                All Students
            </h2>
            <div class="btn-group">
                <button onclick="openModal('bulkUpload')" class="btn-add">
                    ${icon('upload', 20)}
                    Bulk Upload
                </button>
                <button onclick="openModal('addStudent')" class="btn-add">
                    ${icon('plus', 20)}
                    Add Student
                </button>
            </div>
        </div>
        <div>
            ${state.classes.map(cls => {
                const classStudents = state.students.filter(s => s.classId === cls.id);
                if (classStudents.length === 0) return '';
                
                return `
                    <div class="students-section">
                        <h3>${cls.name}</h3>
                        <div class="students-grid">
                            ${classStudents.map(student => `
                                <div class="student-item">
                                    <p>${student.name}</p>
                                    <button onclick="deleteStudent(${student.id})" class="btn-delete" title="Delete student">
                                        ${icon('trash-2', 16)}
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderStudentCards() {
    const classStudents = state.students.filter(s => s.classId === state.selectedClass.id);
    
    return `
        <div class="section-header">
            <div>
                <button onclick="backToClasses()" class="back-btn">
                    ← Back to ${state.currentUser.role === 'admin' ? 'dashboard' : 'classes'}
                </button>
                <h2 class="section-title">${state.selectedClass.name}</h2>
                <p class="card-info">Grade Type: ${state.selectedClass.gradeType === 'numerical' ? 'Numerical + Remark' : 'Remark Only'}</p>
            </div>
            ${state.currentUser.role === 'admin' ? `
                <button onclick="openModal('addStudent', ${state.selectedClass.id})" class="btn-add">
                    ${icon('plus', 20)}
                    Add Student
                </button>
            ` : ''}
        </div>
        <div class="grid">
            ${classStudents.map(student => {
                const grade = state.grades.find(g => g.studentId === student.id);
                const hasGrade = !!grade;
                
                return `
                    <div class="student-card ${hasGrade ? 'graded' : 'not-graded'}" onclick="selectStudent(${student.id})">
                        <div class="student-header">
                            <h3 class="student-name">${student.name}</h3>
                            <div class="status-dot ${hasGrade ? 'graded' : 'not-graded'}"></div>
                        </div>
                        ${hasGrade ? `
                            <div>
                                ${state.selectedClass.gradeType === 'numerical' && grade.value ? `
                                    <p class="grade-value">${grade.value}/10</p>
                                ` : ''}
                                ${grade.remark ? `
                                    <p class="grade-remark">"${grade.remark}"</p>
                                ` : ''}
                            </div>
                        ` : '<p class="no-grade">No grade entered</p>'}
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderModals() {
    return `
        <!-- Add Class Modal -->
        <div id="addClassModal" class="modal-overlay hidden">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Add New Class</h3>
                    <button onclick="closeModal('addClass')" class="btn-close">
                        ${icon('x', 24)}
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Class Name</label>
                        <input type="text" id="className" class="form-input" placeholder="e.g., Class 5A">
                    </div>
                    <div class="form-group">
                        <label class="form-label">School Year</label>
                        <input type="text" id="classYear" class="form-input" placeholder="e.g., 2024-2025">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Grade Type</label>
                        <select id="classGradeType" class="form-input">
                            <option value="numerical">Numerical Grade + Optional Remark</option>
                            <option value="remark">Remark Only</option>
                        </select>
                    </div>
                    <button onclick="addClass()" class="btn btn-primary">Add Class</button>
                </div>
            </div>
        </div>

        <!-- Add Student Modal -->
        <div id="addStudentModal" class="modal-overlay hidden">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Add New Student</h3>
                    <button onclick="closeModal('addStudent')" class="btn-close">
                        ${icon('x', 24)}
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Student Name</label>
                        <input type="text" id="studentName" class="form-input" placeholder="e.g., Ahmed Hassan">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Class</label>
                        <select id="studentClass" class="form-input">
                            <option value="">Select a class</option>
                            ${state.classes.map(cls => `
                                <option value="${cls.id}">${cls.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <button onclick="addStudent()" class="btn btn-primary">Add Student</button>
                </div>
            </div>
        </div>

        <!-- Add Teacher Modal -->
        <div id="addTeacherModal" class="modal-overlay hidden">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Add New Teacher</h3>
                    <button onclick="closeModal('addTeacher')" class="btn-close">
                        ${icon('x', 24)}
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" id="teacherName" class="form-input" placeholder="e.g., Mrs. Ahmed">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Username</label>
                        <input type="text" id="teacherUsername" class="form-input" placeholder="e.g., ahmed.teacher">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" id="teacherPassword" class="form-input" placeholder="Create a password">
                    </div>
                    <button onclick="addTeacher()" class="btn btn-primary">Add Teacher</button>
                </div>
            </div>
        </div>

        <!-- Bulk Upload Modal -->
        <div id="bulkUploadModal" class="modal-overlay hidden">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">Bulk Upload Students</h3>
                    <button onclick="closeModal('bulkUpload')" class="btn-close">
                        ${icon('x', 24)}
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label class="form-label">Select Class</label>
                        <select id="bulkClass" class="form-input">
                            <option value="">Select a class</option>
                            ${state.classes.map(cls => `
                                <option value="${cls.id}">${cls.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Student Names (one per line)</label>
                        <textarea id="bulkStudents" class="form-input" rows="8" placeholder="Ahmed Hassan
Fatima Zahra
Youssef Benali
Amina Kaddour"></textarea>
                        <p class="help-text">Enter each student name on a new line</p>
                    </div>
                    <button onclick="bulkUpload()" class="btn btn-primary">
                        ${icon('upload', 20)} Upload Students
                    </button>
                </div>
            </div>
        </div>

        <!-- Grade Entry Modal -->
        <div id="gradeEntryModal" class="modal-overlay hidden">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title" id="gradeStudentName"></h3>
                    <button onclick="closeModal('gradeEntry')" class="btn-close">
                        ${icon('x', 24)}
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group" id="gradeValueGroup">
                        <label class="form-label">Grade (out of 10)</label>
                        <input type="number" id="gradeValue" class="form-input" step="0.1" min="0" max="10" placeholder="e.g., 8.5">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Remark <span id="remarkOptional"></span></label>
                        <textarea id="gradeRemark" class="form-input" rows="3" placeholder="e.g., Good work, needs improvement..."></textarea>
                    </div>
                    <button onclick="saveGrade()" class="btn btn-primary">
                        ${icon('save', 20)} Save Grade
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Event Handlers
function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = state.users.find(u => u.username === username && u.password === password);
    if (user) {
        state.currentUser = user;
        render();
    } else {
        alert('Invalid credentials. Try admin/admin or teacher1/teacher1');
    }
}

function handleLogout() {
    state.currentUser = null;
    state.selectedClass = null;
    state.selectedStudent = null;
    state.activeAdminTab = 'classes';
    render();
}

function switchTab(tab) {
    state.activeAdminTab = tab;
    render();
}

function selectClass(classId) {
    state.selectedClass = state.classes.find(c => c.id === classId);
    render();
}

function backToClasses() {
    state.selectedClass = null;
    render();
}

function selectStudent(studentId) {
    state.selectedStudent = state.students.find(s => s.id === studentId);
    const grade = state.grades.find(g => g.studentId === studentId);
    
    document.getElementById('gradeStudentName').textContent = state.selectedStudent.name;
    document.getElementById('gradeValue').value = grade?.value || '';
    document.getElementById('gradeRemark').value = grade?.remark || '';
    
    const isNumerical = state.selectedClass.gradeType === 'numerical';
    document.getElementById('gradeValueGroup').classList.toggle('hidden', !isNumerical);
    document.getElementById('remarkOptional').textContent = isNumerical ? '(optional)' : '';
    
    openModal('gradeEntry');
}

function assignTeacher(classId, teacherId) {
    const cls = state.classes.find(c => c.id === classId);
    if (cls) {
        cls.teacherId = teacherId ? parseInt(teacherId) : null;
        render();
    }
}

function deleteClass(classId) {
    if (confirm('Are you sure you want to delete this class? All associated students and grades will also be deleted.')) {
        state.classes = state.classes.filter(c => c.id !== classId);
        state.students = state.students.filter(s => s.classId !== classId);
        state.grades = state.grades.filter(g => !state.students.find(s => s.id === g.studentId && s.classId === classId));
        render();
    }
}

function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student? Their grades will also be deleted.')) {
        state.students = state.students.filter(s => s.id !== studentId);
        state.grades = state.grades.filter(g => g.studentId !== studentId);
        render();
    }
}

function deleteTeacher(teacherId) {
    const teacherClasses = state.classes.filter(c => c.teacherId === teacherId);
    if (teacherClasses.length > 0) {
        alert('Cannot delete teacher with assigned classes. Please reassign their classes first.');
        return;
    }
    if (confirm('Are you sure you want to delete this teacher?')) {
        state.users = state.users.filter(u => u.id !== teacherId);
        render();
    }
}

function openModal(modalType, classId = null) {
    const modals = {
        'addClass': 'addClassModal',
        'addStudent': 'addStudentModal',
        'addTeacher': 'addTeacherModal',
        'bulkUpload': 'bulkUploadModal',
        'gradeEntry': 'gradeEntryModal'
    };
    
    const modal = document.getElementById(modals[modalType]);
    if (modal) {
        modal.classList.remove('hidden');
        
        if (modalType === 'addStudent' && classId) {
            document.getElementById('studentClass').value = classId;
        }
    }
}

function closeModal(modalType) {
    const modals = {
        'addClass': 'addClassModal',
        'addStudent': 'addStudentModal',
        'addTeacher': 'addTeacherModal',
        'bulkUpload': 'bulkUploadModal',
        'gradeEntry': 'gradeEntryModal'
    };
    
    const modal = document.getElementById(modals[modalType]);
    if (modal) {
        modal.classList.add('hidden');
        
        // Clear form fields
        if (modalType === 'addClass') {
            document.getElementById('className').value = '';
            document.getElementById('classYear').value = '';
            document.getElementById('classGradeType').value = 'numerical';
        } else if (modalType === 'addStudent') {
            document.getElementById('studentName').value = '';
            document.getElementById('studentClass').value = '';
        } else if (modalType === 'addTeacher') {
            document.getElementById('teacherName').value = '';
            document.getElementById('teacherUsername').value = '';
            document.getElementById('teacherPassword').value = '';
        } else if (modalType === 'bulkUpload') {
            document.getElementById('bulkStudents').value = '';
            document.getElementById('bulkClass').value = '';
        }
    }
}

function addClass() {
    const name = document.getElementById('className').value;
    const year = document.getElementById('classYear').value;
    const gradeType = document.getElementById('classGradeType').value;
    
    if (name && year) {
        state.classes.push({
            id: state.classes.length + 1,
            name,
            year,
            teacherId: null,
            gradeType
        });
        closeModal('addClass');
        render();
    }
}

function addStudent() {
    const name = document.getElementById('studentName').value;
    const classId = document.getElementById('studentClass').value;
    
    if (name && classId) {
        state.students.push({
            id: state.students.length + 1,
            name,
            classId: parseInt(classId)
        });
        closeModal('addStudent');
        render();
    }
}

function addTeacher() {
    const name = document.getElementById('teacherName').value;
    const username = document.getElementById('teacherUsername').value;
    const password = document.getElementById('teacherPassword').value;
    
    if (name && username && password) {
        state.users.push({
            id: state.users.length + 1,
            username,
            password,
            role: 'teacher',
            name
        });
        closeModal('addTeacher');
        render();
    }
}

function bulkUpload() {
    const classId = document.getElementById('bulkClass').value;
    const studentsText = document.getElementById('bulkStudents').value;
    
    if (classId && studentsText.trim()) {
        const names = studentsText.split('\n').map(n => n.trim()).filter(n => n);
        names.forEach(name => {
            state.students.push({
                id: state.students.length + 1,
                name,
                classId: parseInt(classId)
            });
        });
        closeModal('bulkUpload');
        render();
    }
}

function saveGrade() {
    const value = document.getElementById('gradeValue').value;
    const remark = document.getElementById('gradeRemark').value;
    const isNumerical = state.selectedClass.gradeType === 'numerical';
    
    if ((isNumerical && !value) || (!isNumerical && !remark)) {
        return;
    }
    
    const existingGradeIndex = state.grades.findIndex(g => g.studentId === state.selectedStudent.id);
    const newGrade = {
        studentId: state.selectedStudent.id,
        value: isNumerical ? value : null,
        remark,
        timestamp: new Date().toISOString()
    };
    
    if (existingGradeIndex >= 0) {
        state.grades[existingGradeIndex] = newGrade;
    } else {
        state.grades.push(newGrade);
    }
    
    closeModal('gradeEntry');
    showSaveIndicator();
    render();
}

// Main Render Function
function render() {
    const app = document.getElementById('app');
    
    if (!state.currentUser) {
        app.innerHTML = renderLogin();
        refreshIcons();
        return;
    }
    
    let content = '';
    
    if (!state.selectedClass) {
        if (state.currentUser.role === 'admin') {
            if (state.activeAdminTab === 'classes') {
                content = renderClassesView();
            } else if (state.activeAdminTab === 'teachers') {
                content = renderTeachersView();
            } else if (state.activeAdminTab === 'students') {
                content = renderStudentsView();
            }
        } else {
            content = renderClassesView();
        }
    } else {
        content = renderStudentCards();
    }
    
    app.innerHTML = `
        ${renderHeader()}
        <div class="main-content">
            ${renderAdminTabs()}
            ${content}
        </div>
        ${renderModals()}
    `;
    
    refreshIcons();
}

// Initialize
render();

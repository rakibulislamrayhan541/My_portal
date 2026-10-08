// INITIAL DUMMY DATABASE
const defaultStudents = {
  "101": {
    name: "আরিফুল ইসলাম",
    studentClass: "Class 6",
    password: "123",
    attendance: 85,
    results: [
      { course: "Bangla", marks: 82 },
      { course: "English", marks: 75 },
      { course: "Mathematics", marks: 95 },
      { course: "General Science", marks: 88 },
      { course: "ICT", marks: 90 }
    ],
    fees: [
      { month: "January", amount: "1200 BDT", status: "Paid" },
      { month: "February", amount: "1200 BDT", status: "Paid" },
      { month: "March", amount: "1200 BDT", status: "Due" }
    ]
  }
};

const defaultTeachers = {
  "1001": {
    name: "মোহাম্মদ রফিকুল ইসলাম",
    password: "123",
    salaryHistory: [
      { month: "January", amount: "32,000 BDT", status: "Disbursed to Bank" },
      { month: "February", amount: "32,000 BDT", status: "Disbursed to Bank" },
      { month: "March", amount: "32,000 BDT", status: "Pending" }
    ]
  }
};

// Load Data from LocalStorage
let studentsData = JSON.parse(localStorage.getItem('csc_students')) || defaultStudents;
let teachersData = JSON.parse(localStorage.getItem('csc_teachers')) || defaultTeachers;

function saveData() {
  localStorage.setItem('csc_students', JSON.stringify(studentsData));
  localStorage.setItem('csc_teachers', JSON.stringify(teachersData));
}

let activeUser = null;

// Toggle Class Field in SignUp
function toggleSignUpClass(role) {
  const classGroup = document.getElementById('signup-class-group');
  if (role === 'student') {
    classGroup.style.display = 'block';
  } else {
    classGroup.style.display = 'none';
  }
}

// Switch Tabs for Auth
function switchAuthTab(type) {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');

  if (type === 'signin') {
    tabBtns[0].classList.add('active');
    tabBtns[1].classList.remove('active');
    signinForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  } else {
    tabBtns[1].classList.add('active');
    tabBtns[0].classList.remove('active');
    signupForm.classList.remove('hidden');
    signinForm.classList.add('hidden');
  }
}

// SIGN UP FUNCTION
function handleSignUp() {
  const role = document.getElementById('signup-role').value;
  const name = document.getElementById('signup-name').value.trim();
  const id = document.getElementById('signup-id').value.trim();
  const pass = document.getElementById('signup-pass').value.trim();
  const studentClass = document.getElementById('signup-class').value;
  const msg = document.getElementById('signup-msg');

  if (!name || !id || !pass) {
    msg.className = "alert alert-danger";
    msg.innerText = "সবগুলো ফিল্ড পূরণ করুন!";
    msg.style.display = "block";
    return;
  }

  if (role === 'student') {
    if (studentsData[id]) {
      msg.className = "alert alert-danger";
      msg.innerText = "এই রোল নম্বরের একাউন্ট ইতোমধ্যে বিদ্যমান!";
      msg.style.display = "block";
      return;
    }
    studentsData[id] = {
      name: name,
      studentClass: studentClass,
      password: pass,
      attendance: 0,
      results: [],
      fees: [
        { month: "January", amount: "1200 BDT", status: "Due" },
        { month: "February", amount: "1200 BDT", status: "Due" }
      ]
    };
  } else {
    if (teachersData[id]) {
      msg.className = "alert alert-danger";
      msg.innerText = "এই টিচার আইডি আগেই রেজিস্টার্ড করা হয়েছে!";
      msg.style.display = "block";
      return;
    }
    teachersData[id] = {
      name: name,
      password: pass,
      salaryHistory: [
        { month: "Current Month", amount: "30,000 BDT", status: "Processing" }
      ]
    };
  }

  saveData();
  msg.className = "alert alert-success";
  msg.innerText = "সফলভাবে সাইন-আপ হয়েছে! এখন সাইন-ইন করুন।";
  msg.style.display = "block";
  document.getElementById('signup-form').reset();
}

// SIGN IN FUNCTION
function handleSignIn() {
  const role = document.getElementById('signin-role').value;
  const id = document.getElementById('signin-id').value.trim();
  const pass = document.getElementById('signin-pass').value.trim();
  const msg = document.getElementById('signin-msg');

  msg.style.display = "none";

  if (role === 'student') {
    if (studentsData[id] && studentsData[id].password === pass) {
      activeUser = { role: 'student', id: id };
      showStudentDashboard(id);
    } else {
      msg.innerText = "ভুল রোল নম্বর বা পাসওয়ার্ড দেওয়া হয়েছে!";
      msg.style.display = "block";
    }
  } else {
    if (teachersData[id] && teachersData[id].password === pass) {
      activeUser = { role: 'teacher', id: id };
      showTeacherDashboard(id);
    } else {
      msg.innerText = "ভুল টিচার আইডি বা পাসওয়ার্ড দেওয়া হয়েছে!";
      msg.style.display = "block";
    }
  }
}

// LOAD STUDENT DASHBOARD
function showStudentDashboard(id) {
  const student = studentsData[id];
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('student-dashboard').classList.remove('hidden');

  document.getElementById('student-display-name').innerText = student.name;
  document.getElementById('student-display-roll').innerText = id;
  document.getElementById('student-display-class').innerText = student.studentClass || "Class 6";
  document.getElementById('student-attendance-count').innerText = student.attendance;

  // Load Results & Total Calculation
  const resTable = document.getElementById('student-result-table');
  const resultSummaryCard = document.getElementById('result-summary');
  resTable.innerHTML = '';

  if (!student.results || student.results.length === 0) {
    resTable.innerHTML = '<tr><td colspan="4" style="text-align:center;">এখনো কোনো মার্কস এন্ট্রি করা হয়নি।</td></tr>';
    resultSummaryCard.classList.add('hidden');
  } else {
    let totalMarks = 0;
    let totalPoint = 0;
    let isFailed = false;

    student.results.forEach(res => {
      let grade = 'F';
      let point = 0.00;

      if (res.marks >= 80) { grade = 'A+'; point = 5.00; }
      else if (res.marks >= 70) { grade = 'A'; point = 4.00; }
      else if (res.marks >= 60) { grade = 'A-'; point = 3.50; }
      else if (res.marks >= 50) { grade = 'B'; point = 3.00; }
      else if (res.marks >= 40) { grade = 'C'; point = 2.00; }
      else if (res.marks >= 33) { grade = 'D'; point = 1.00; }
      else { grade = 'F'; point = 0.00; isFailed = true; }

      totalMarks += Number(res.marks);
      totalPoint += point;

      resTable.innerHTML += `<tr>
        <td>${res.course}</td>
        <td>${res.marks}</td>
        <td><b>${grade}</b></td>
        <td>${point.toFixed(2)}</td>
      </tr>`;
    });

    // Total Summary Calculation
    const totalSub = student.results.length;
    const avgMarks = (totalMarks / totalSub).toFixed(2);
    let finalGPA = (totalPoint / totalSub).toFixed(2);

    if (isFailed) {
      finalGPA = "0.00 (F)";
    }

    document.getElementById('total-subjects').innerText = totalSub;
    document.getElementById('total-marks').innerText = totalMarks;
    document.getElementById('avg-marks').innerText = avgMarks;
    document.getElementById('final-gpa').innerText = finalGPA;

    resultSummaryCard.classList.remove('hidden');
  }

  // Load Fees
  const feeTable = document.getElementById('student-fee-table');
  feeTable.innerHTML = '';
  student.fees.forEach(f => {
    feeTable.innerHTML += `<tr>
      <td>${f.month}</td>
      <td>${f.amount}</td>
      <td><span class="${f.status === 'Paid' ? 'status-paid' : 'status-due'}">${f.status}</span></td>
    </tr>`;
  });
}

// LOAD TEACHER DASHBOARD
function showTeacherDashboard(id) {
  const teacher = teachersData[id];
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('teacher-dashboard').classList.remove('hidden');

  document.getElementById('teacher-display-name').innerText = teacher.name;
  document.getElementById('teacher-display-id').innerText = id;

  // Render Student List for Teacher
  renderTeacherStudentList();

  // Salary Table
  const salTable = document.getElementById('teacher-salary-table');
  salTable.innerHTML = '';
  teacher.salaryHistory.forEach(s => {
    salTable.innerHTML += `<tr>
      <td>${s.month}</td>
      <td>${s.amount}</td>
      <td><b>${s.status}</b></td>
    </tr>`;
  });
}

function renderTeacherStudentList() {
  const listTable = document.getElementById('teacher-student-list');
  listTable.innerHTML = '';
  Object.keys(studentsData).forEach(roll => {
    const st = studentsData[roll];
    listTable.innerHTML += `<tr>
      <td><b>${roll}</b></td>
      <td>${st.name}</td>
      <td>${st.studentClass || "Class 6"}</td>
      <td>${st.results ? st.results.length : 0} টি বিষয়</td>
    </tr>`;
  });
}

// ASSIGN MARKS / SUBJECT BY TEACHER
function assignCourseAndMarks() {
  const selectedClass = document.getElementById('assign-class').value;
  const roll = document.getElementById('assign-roll').value.trim();
  const course = document.getElementById('assign-course').value.trim();
  const marks = parseInt(document.getElementById('assign-marks').value);

  if (!roll || !course || isNaN(marks)) {
    alert("সকল ফিল্ড ঠিকভাবে পূরণ করুন!");
    return;
  }

  if (studentsData[roll]) {
    studentsData[roll].studentClass = selectedClass;
    if (!studentsData[roll].results) {
      studentsData[roll].results = [];
    }

    const existingSubject = studentsData[roll].results.find(r => r.course.toLowerCase() === course.toLowerCase());
    if (existingSubject) {
      existingSubject.marks = marks;
    } else {
      studentsData[roll].results.push({ course: course, marks: marks });
    }

    saveData();
    renderTeacherStudentList();
    alert(`রোল ${roll} (${selectedClass}) এর জন্য ${course} বিষয়ের মার্কস (${marks}) যোগ করা হয়েছে।`);
    document.getElementById('assign-course').value = '';
    document.getElementById('assign-marks').value = '';
  } else {
    alert("এই রোলের কোনো শিক্ষার্থী খুঁজে পাওয়া যায়নি! আগে স্টুডেন্ট সাইন-আপ করতে বলুন।");
  }
}

// UPDATE ATTENDANCE BY TEACHER
function updateStudentAttendance() {
  const roll = document.getElementById('att-roll').value.trim();
  const count = parseInt(document.getElementById('att-count').value);

  if (!roll || isNaN(count)) {
    alert("রোল এবং উপস্থিতি প্রদান করুন!");
    return;
  }

  if (studentsData[roll]) {
    studentsData[roll].attendance = count;
    saveData();
    alert(`রোল ${roll} এর নতুন উপস্থিতি সংখ্যা (${count}) আপডেট করা হয়েছে।`);
    document.getElementById('att-roll').value = '';
    document.getElementById('att-count').value = '';
  } else {
    alert("এই রোলের কোনো শিক্ষার্থী পাওয়া যায়নি!");
  }
}

// UPDATE PASSWORD
function updatePassword(role) {
  if (role === 'student') {
    const pass = document.getElementById('student-new-pass').value.trim();
    if (!pass) return alert("পাসওয়ার্ড লিখুন!");
    studentsData[activeUser.id].password = pass;
    saveData();
    alert("শিক্ষার্থীর পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!");
    document.getElementById('student-new-pass').value = '';
  } else {
    const pass = document.getElementById('teacher-new-pass').value.trim();
    if (!pass) return alert("পাসওয়ার্ড লিখুন!");
    teachersData[activeUser.id].password = pass;
    saveData();
    alert("শিক্ষকের পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে!");
    document.getElementById('teacher-new-pass').value = '';
  }
}

// LOGOUT
function logout() {
  activeUser = null;
  document.getElementById('student-dashboard').classList.add('hidden');
  document.getElementById('teacher-dashboard').classList.add('hidden');
  document.getElementById('auth-section').classList.remove('hidden');
  document.getElementById('signin-form').reset();
}
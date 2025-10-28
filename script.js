const API_URL = "https://student-backend-mn2o.onrender.com/api/students";

// Element selectors
const form = document.getElementById("studentForm");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const tableBody = document.querySelector("#studentTable tbody");
const toastContainer = document.getElementById("toastContainer");
const toggleDarkMode = document.getElementById("toggleDarkMode");

// --- 🌗 Improved Dark Mode ---
function setTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    toggleDarkMode.innerHTML = '☀️ Light Mode';
    localStorage.setItem('theme', 'dark');
  } else {
    document.body.classList.remove("dark-mode");
    toggleDarkMode.innerHTML = '🌙 Dark Mode';
    localStorage.setItem('theme', 'light');
  }
}

// Check system preference or saved preference
(function() {
  const userPref = localStorage.getItem('theme');
  if (userPref) {
    setTheme(userPref);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  }
})();

toggleDarkMode.addEventListener("click", () => {
  const currentlyDark = document.body.classList.contains("dark-mode");
  setTheme(currentlyDark ? 'light' : 'dark');
  playSwitchSound();
  animatedThemeTransition();
});

function animatedThemeTransition() {
  document.body.classList.add('theme-transition');
  setTimeout(() => document.body.classList.remove('theme-transition'), 500);
}

function playSwitchSound() {
  // Only play in modern browsers for interactivity (silent fallback)
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    o.type = 'square';
    o.frequency.value = 800; // Hz
    const g = ctx.createGain();
    g.gain.value = 0.05;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, 80);
  } catch (e) {}
}

// --- ✨ Enhanced Toast Notification ---
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast align-items-center glass-toast text-white bg-${type} border-0 show mb-2`;
  toast.role = "alert";
  toast.style.animation = 'toast-pop 0.35s';
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>`;
  toast.querySelector(".btn-close").onclick = () => toast.remove();
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

// --- 🥳 Table Row Animation & Tooltips ---
async function loadStudents() {
  const res = await fetch(API_URL);
  const students = await res.json();
  tableBody.innerHTML = "";

  if (students.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `<td colspan="6" class="text-center text-muted py-4">No students found. Add your first student!</td>`;
    tableBody.appendChild(emptyRow);
    return;
  }

  students.forEach((s, idx) => {
    const row = document.createElement("tr");
    row.classList.add("fade-in-row");
    row.style.animationDelay = (idx * 60) + "ms";
    row.innerHTML = `
      <td>
        <span class="profile-initial" style="background:${hashColor(s.name)}" title="Student Initial">${getInitials(s.name)}</span>
        ${s.name}
      </td>
      <td>${s.rollNumber}</td>
      <td>
        <a href="mailto:${s.email}" class="text-decoration-none">
          <i class="bi bi-envelope-fill"></i> ${s.email}
        </a>
      </td>
      <td>
        <span class="badge bg-gradient">${s.department}</span>
      </td>
      <td>${s.year}</td>
      <td>
        <button class="btn btn-warning btn-sm me-2" title="Edit this student" onclick="editStudent('${s._id}')"><i class="bi bi-pencil"></i> Edit</button>
        <button class="btn btn-danger btn-sm" title="Delete this student" onclick="deleteStudent('${s._id}')"><i class="bi bi-trash"></i> Delete</button>
      </td>`;
    tableBody.appendChild(row);
  });
}

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
}
function hashColor(str) {
  // Generate deterministic pastel color from string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h},68%,80%)`;
}

// ➕ Add or ✏️ Edit student (with visual feedback and loading state)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving...';

  const student = {
    name: form.name.value,
    rollNumber: form.rollNumber.value,
    email: form.email.value,
    department: form.department.value,
    year: parseInt(form.year.value)
  };

  const id = form.studentId.value;
  const method = id ? "PUT" : "POST";
  const url = id ? `${API_URL}/${id}` : API_URL;

  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(student)
    });

    if (res.ok) {
      showToast(id ? "✅ Student updated successfully!" : "🎉 Student added successfully!");
      form.reset();
      form.studentId.value = "";
      submitBtn.textContent = "Add Student";
      cancelEditBtn.classList.add("d-none");
      formTitle.innerHTML = `Add New Student <i class="bi bi-people"></i>`;
      loadStudents();
    } else {
      showToast("❌ Operation failed. Please check your input.", "danger");
    }
  } catch (err) {
    showToast("❌ Network error. Please try again.", "danger");
  }
  submitBtn.disabled = false;
  submitBtn.textContent = id ? "Update Student" : "Add Student";
});

// ✏️ Edit student (with highlight & scroll-to-form)
async function editStudent(id) {
  const res = await fetch(`${API_URL}/${id}`);
  const s = await res.json();

  form.name.value = s.name;
  form.rollNumber.value = s.rollNumber;
  form.email.value = s.email;
  form.department.value = s.department;
  form.year.value = s.year;
  form.studentId.value = s._id;

  formTitle.innerHTML = `Edit Student <i class="bi bi-pencil-square text-warning"></i>`;
  submitBtn.textContent = "Update Student";
  cancelEditBtn.classList.remove("d-none");

  window.scrollTo({ top: form.offsetTop - 24, behavior: "smooth" });
  flashForm();
}

function flashForm() {
  form.classList.add("highlight-form");
  setTimeout(() => form.classList.remove("highlight-form"), 700);
}

// ❌ Delete student (with animated row removal)
async function deleteStudent(id) {
  if (!confirm("Are you sure you want to delete this student?")) return;

  // Animate out the student row
  const row = Array.from(tableBody.querySelectorAll("tr")).find(tr => tr.innerHTML.includes(id));
  if (row) {
    row.classList.add("fade-out-row");
  }

  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (res.ok) {
    setTimeout(() => {
      showToast("🗑️ Student deleted successfully!", "warning");
      loadStudents();
    }, 300);
  } else {
    showToast("Failed to delete student ❌", "danger");
    if (row) row.classList.remove("fade-out-row");
  }
}

// 🔄 Cancel Edit (with animation)
cancelEditBtn.addEventListener("click", () => {
  form.reset();
  form.studentId.value = "";
  formTitle.innerHTML = `Add New Student <i class="bi bi-people"></i>`;
  submitBtn.textContent = "Add Student";
  cancelEditBtn.classList.add("d-none");
  flashForm();
});

// 🚀 Initial load (with loading effect)
async function initialLoad() {
  tableBody.innerHTML = `<tr><td colspan="6" class="text-center">
    <div class="spinner-grow text-primary" style="width:3rem;height:3rem"></div>
    <p class="mt-2 mb-0 fw-bold text-muted">Loading students...</p>
  </td></tr>`;
  await loadStudents();
}
initialLoad();

// --- 💡 Extra interactivity: Keyboard shortcut for dark mode ---
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
    e.preventDefault();
    toggleDarkMode.click();
    showToast('Toggled dark mode (Ctrl+D)', 'info');
  }
});

// --- 💅 Dynamic CSS for animations and dark mode improvements ---
// (You may want to move this to your CSS file; included here for completeness)
const style = document.createElement("style");
style.innerHTML = `
  body.theme-transition { transition: background 0.5s, color 0.5s; }
  .fade-in-row { animation: fadeInUp 0.6s; }
  .fade-out-row { animation: fadeOutLeft 0.5s forwards; }
  @keyframes fadeInUp { from{opacity:0;transform:translateY(25px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeOutLeft { 100%{opacity:0;transform:translateX(-60px)} }
  @keyframes toast-pop { 0%{transform:scale(0.7);opacity:0;} 100%{transform:scale(1);opacity:1;} }
  .highlight-form { box-shadow:0 0 0 3px #ffd60050 !important; transition: box-shadow 0.6s;}
  .dark-mode {
    background: #1b2331 !important;
    color: #f1f5f9 !important;
  }
  .dark-mode .table,
  .dark-mode .table-striped > tbody > tr:nth-of-type(odd) {
    background: #202c3c !important;
    color: #f1f5f9 !important;
  }
  .dark-mode .toast { background: #2d3855 !important; }
  .glass-toast {
    background: rgba(41,41,60,0.95) !important;
    backdrop-filter: blur(3px) saturate(1.12);
    border-radius: 14px;
    box-shadow: 0 8px 28px #232a3b40;
  }
  .profile-initial {
    display:inline-flex;align-items:center;justify-content:center;
    border-radius:50%;width:2rem;height:2rem;margin-right:0.5rem;font-weight:bold;
    color:#fff;font-size:1rem;vertical-align:middle;
    filter:drop-shadow(0 0 7px #2222);
    box-shadow: 0 0 0 2px #fff4;
    border:2px solid #f5f6fa33;
  }
  .badge.bg-gradient {
    background: linear-gradient(90deg, #6cb8ff80 0%, #a988ff80 100%);
    color: #232c3f; font-weight: 500;
    border-radius: 7px;
    padding: .35em .7em;
  }
  .dark-mode .badge.bg-gradient { background: linear-gradient(90deg,#384149 0%,#2c253d 100%); color: #e6e1fe }
  .dark-mode .profile-initial { box-shadow:0 0 0 2px #3338 }
`;
document.head.appendChild(style);


const API_URL = "http://localhost:5000/api/students";
const form = document.getElementById("studentForm");
const formTitle = document.getElementById("formTitle");
const submitBtn = document.getElementById("submitBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const tableBody = document.querySelector("#studentTable tbody");
const toastContainer = document.getElementById("toastContainer");
const toggleDarkMode = document.getElementById("toggleDarkMode");

// 🌙 Dark Mode Toggle
toggleDarkMode.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  if (document.body.classList.contains("dark-mode")) {
    toggleDarkMode.textContent = "☀️ Light Mode";
  } else {
    toggleDarkMode.textContent = "🌙 Dark Mode";
  }
});

// 🔔 Toast Notification
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-white bg-${type} border-0 show mb-2`;
  toast.role = "alert";
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>`;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// 📋 Load all students
async function loadStudents() {
  const res = await fetch(API_URL);
  const students = await res.json();
  tableBody.innerHTML = "";

  students.forEach((s) => {
    const row = document.createElement("tr");
    row.classList.add("fade-in");
    row.innerHTML = `
      <td>${s.name}</td>
      <td>${s.rollNumber}</td>
      <td>${s.email}</td>
      <td>${s.department}</td>
      <td>${s.year}</td>
      <td>
        <button class="btn btn-warning btn-sm me-2" onclick="editStudent('${s._id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteStudent('${s._id}')">Delete</button>
      </td>`;
    tableBody.appendChild(row);
  });
}

// ➕ Add or ✏️ Edit student
form.addEventListener("submit", async (e) => {
  e.preventDefault();

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

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student)
  });

  if (res.ok) {
    showToast(id ? "✅ Student updated successfully" : "🎉 Student added successfully");
    form.reset();
    form.studentId.value = "";
    submitBtn.textContent = "Add Student";
    cancelEditBtn.classList.add("d-none");
    formTitle.textContent = "Add New Student";
    loadStudents();
  } else {
    showToast("❌ Operation failed", "danger");
  }
});

// ✏️ Edit student
async function editStudent(id) {
  const res = await fetch(`${API_URL}/${id}`);
  const s = await res.json();

  form.name.value = s.name;
  form.rollNumber.value = s.rollNumber;
  form.email.value = s.email;
  form.department.value = s.department;
  form.year.value = s.year;
  form.studentId.value = s._id;

  formTitle.textContent = "Edit Student";
  submitBtn.textContent = "Update Student";
  cancelEditBtn.classList.remove("d-none");
}

// ❌ Delete student
async function deleteStudent(id) {
  if (!confirm("Are you sure you want to delete this student?")) return;

  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (res.ok) {
    showToast("🗑️ Student deleted successfully", "warning");
    loadStudents();
  } else {
    showToast("Failed to delete student ❌", "danger");
  }
}

// 🔄 Cancel Edit
cancelEditBtn.addEventListener("click", () => {
  form.reset();
  form.studentId.value = "";
  formTitle.textContent = "Add New Student";
  submitBtn.textContent = "Add Student";
  cancelEditBtn.classList.add("d-none");
});

// 🚀 Initial load
loadStudents();

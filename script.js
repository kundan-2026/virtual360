// Hospital Management System JavaScript

class HospitalManagement {
  constructor() {
    this.patients = JSON.parse(localStorage.getItem("patients")) || [];
    this.appointments = JSON.parse(localStorage.getItem("appointments")) || [];
    this.doctors = [
      {
        id: 1,
        name: "Dr. Ravi Kumar",
        specialty: "Physiotherapy",
        phone: "+91 9708059085",
      },
      {
        id: 2,
        name: "Dr. Puja Bharti",
        specialty: "Physiotherapy",
        phone: "+91 8789400851",
      },
      {
        id: 3,
        name: "Dr. Supriya",
        specialty: "Physiotherapy",
        phone: "+91 9006366595",
      },
      {
        id: 4,
        name: "Dr. Laxmi",
        specialty: "Orthopedics",
        phone: "+91 6206287723",
      },
      {
        id: 5,
        name: "Dr. kundan",
        specialty: "Fake Engineer",
        phone: "+91 8292837214",
      },
    ];

    this.currentEditingPatient = null;
    this.currentEditingAppointment = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateDashboard();
    this.renderPatients();
    this.renderAppointments();
    this.renderDoctors();
    this.populatePatientDropdown();

    // Set minimum date for appointments to today
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("appointment-date").min = today;
  }

  setupEventListeners() {
    // Navigation
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        this.showSection(link.dataset.section);

        // Update active nav link
        document
          .querySelectorAll(".nav-link")
          .forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
      });
    });

    // Patient management
    document.getElementById("add-patient-btn").addEventListener("click", () => {
      this.showPatientModal();
    });

    document.getElementById("patient-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.savePatient();
    });

    document
      .getElementById("close-patient-modal")
      .addEventListener("click", () => {
        this.hidePatientModal();
      });

    document.getElementById("cancel-patient").addEventListener("click", () => {
      this.hidePatientModal();
    });

    // Appointment management
    document
      .getElementById("add-appointment-btn")
      .addEventListener("click", () => {
        this.showAppointmentModal();
      });

    document
      .getElementById("appointment-form")
      .addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveAppointment();
      });

    document
      .getElementById("close-appointment-modal")
      .addEventListener("click", () => {
        this.hideAppointmentModal();
      });

    document
      .getElementById("cancel-appointment")
      .addEventListener("click", () => {
        this.hideAppointmentModal();
      });

    // Search functionality
    document.getElementById("patient-search").addEventListener("input", (e) => {
      this.searchPatients(e.target.value);
    });

    // Appointment filter
    document
      .getElementById("appointment-filter")
      .addEventListener("change", (e) => {
        this.filterAppointments(e.target.value);
      });

    // Modal close on outside click
    window.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        e.target.classList.remove("show");
      }
    });
  }

  showSection(sectionId) {
    document.querySelectorAll(".section").forEach((section) => {
      section.classList.remove("active");
    });
    document.getElementById(sectionId).classList.add("active");
  }

  // Patient Management
  showPatientModal(patient = null) {
    const modal = document.getElementById("patient-modal");
    const title = document.getElementById("patient-modal-title");

    if (patient) {
      title.textContent = "Edit Patient";
      this.currentEditingPatient = patient;
      this.populatePatientForm(patient);
    } else {
      title.textContent = "Add New Patient";
      this.currentEditingPatient = null;
      document.getElementById("patient-form").reset();
    }

    modal.classList.add("show");
  }

  hidePatientModal() {
    document.getElementById("patient-modal").classList.remove("show");
    this.currentEditingPatient = null;
    document.getElementById("patient-form").reset();
  }

  populatePatientForm(patient) {
    document.getElementById("patient-name").value = patient.name;
    document.getElementById("patient-age").value = patient.age;
    document.getElementById("patient-gender").value = patient.gender;
    document.getElementById("patient-phone").value = patient.phone;
    document.getElementById("patient-email").value = patient.email;
    document.getElementById("patient-address").value = patient.address || "";
    document.getElementById("patient-medical-history").value =
      patient.medicalHistory || "";
  }

  savePatient() {
    const formData = {
      name: document.getElementById("patient-name").value,
      age: parseInt(document.getElementById("patient-age").value),
      gender: document.getElementById("patient-gender").value,
      phone: document.getElementById("patient-phone").value,
      email: document.getElementById("patient-email").value,
      address: document.getElementById("patient-address").value,
      medicalHistory: document.getElementById("patient-medical-history").value,
      registrationDate: new Date().toISOString().split("T")[0],
    };

    if (this.currentEditingPatient) {
      // Update existing patient
      const index = this.patients.findIndex(
        (p) => p.id === this.currentEditingPatient.id
      );
      this.patients[index] = { ...this.currentEditingPatient, ...formData };
      this.addActivity(`Updated patient: ${formData.name}`);
    } else {
      // Add new patient
      const newPatient = {
        id: Date.now(),
        ...formData,
      };
      this.patients.push(newPatient);
      this.addActivity(`New patient registered: ${formData.name}`);
    }

    this.saveToLocalStorage();
    this.renderPatients();
    this.updateDashboard();
    this.populatePatientDropdown();
    this.hidePatientModal();
  }

  deletePatient(patientId) {
    if (confirm("Are you sure you want to delete this patient?")) {
      const patient = this.patients.find((p) => p.id === patientId);
      this.patients = this.patients.filter((p) => p.id !== patientId);

      // Also remove related appointments
      this.appointments = this.appointments.filter(
        (a) => a.patientId !== patientId
      );

      this.addActivity(`Deleted patient: ${patient.name}`);
      this.saveToLocalStorage();
      this.renderPatients();
      this.renderAppointments();
      this.updateDashboard();
      this.populatePatientDropdown();
    }
  }

  searchPatients(query) {
    const filteredPatients = this.patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(query.toLowerCase()) ||
        patient.email.toLowerCase().includes(query.toLowerCase()) ||
        patient.phone.includes(query)
    );
    this.renderPatients(filteredPatients);
  }

  renderPatients(patientsToRender = this.patients) {
    const tbody = document.getElementById("patients-table");
    tbody.innerHTML = "";

    patientsToRender.forEach((patient) => {
      const row = document.createElement("tr");
      row.innerHTML = `
                <td>#${patient.id}</td>
                <td>${patient.name}</td>
                <td>${patient.age}</td>
                <td>${patient.gender}</td>
                <td>${patient.phone}</td>
                <td>${patient.email}</td>
                <td>
                    <button class="btn btn-secondary" onclick="hospital.showPatientModal(${JSON.stringify(
                      patient
                    ).replace(/"/g, "&quot;")})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="hospital.deletePatient(${
                      patient.id
                    })">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
      tbody.appendChild(row);
    });
  }

  // Appointment Management
  showAppointmentModal(appointment = null) {
    const modal = document.getElementById("appointment-modal");
    const title = document.getElementById("appointment-modal-title");

    if (appointment) {
      title.textContent = "Edit Appointment";
      this.currentEditingAppointment = appointment;
      this.populateAppointmentForm(appointment);
    } else {
      title.textContent = "Schedule Appointment";
      this.currentEditingAppointment = null;
      document.getElementById("appointment-form").reset();
    }

    modal.classList.add("show");
  }

  hideAppointmentModal() {
    document.getElementById("appointment-modal").classList.remove("show");
    this.currentEditingAppointment = null;
    document.getElementById("appointment-form").reset();
  }

  populateAppointmentForm(appointment) {
    document.getElementById("appointment-patient").value =
      appointment.patientId;
    document.getElementById("appointment-doctor").value = appointment.doctor;
    document.getElementById("appointment-date").value = appointment.date;
    document.getElementById("appointment-time").value = appointment.time;
    document.getElementById("appointment-reason").value =
      appointment.reason || "";
  }

  saveAppointment() {
    const patientId = parseInt(
      document.getElementById("appointment-patient").value
    );
    const patient = this.patients.find((p) => p.id === patientId);

    const formData = {
      patientId: patientId,
      patientName: patient.name,
      doctor: document.getElementById("appointment-doctor").value,
      date: document.getElementById("appointment-date").value,
      time: document.getElementById("appointment-time").value,
      reason: document.getElementById("appointment-reason").value,
      status: "scheduled",
    };

    if (this.currentEditingAppointment) {
      // Update existing appointment
      const index = this.appointments.findIndex(
        (a) => a.id === this.currentEditingAppointment.id
      );
      this.appointments[index] = {
        ...this.currentEditingAppointment,
        ...formData,
      };
      this.addActivity(`Updated appointment for ${formData.patientName}`);
    } else {
      // Add new appointment
      const newAppointment = {
        id: Date.now(),
        ...formData,
      };
      this.appointments.push(newAppointment);
      this.addActivity(
        `Scheduled appointment for ${formData.patientName} with ${formData.doctor}`
      );
    }

    this.saveToLocalStorage();
    this.renderAppointments();
    this.updateDashboard();
    this.hideAppointmentModal();
  }

  deleteAppointment(appointmentId) {
    if (confirm("Are you sure you want to delete this appointment?")) {
      const appointment = this.appointments.find((a) => a.id === appointmentId);
      this.appointments = this.appointments.filter(
        (a) => a.id !== appointmentId
      );

      this.addActivity(`Cancelled appointment for ${appointment.patientName}`);
      this.saveToLocalStorage();
      this.renderAppointments();
      this.updateDashboard();
    }
  }

  updateAppointmentStatus(appointmentId, status) {
    const appointment = this.appointments.find((a) => a.id === appointmentId);
    if (appointment) {
      appointment.status = status;
      this.addActivity(
        `Marked appointment as ${status}: ${appointment.patientName}`
      );
      this.saveToLocalStorage();
      this.renderAppointments();
      this.updateDashboard();
    }
  }

  filterAppointments(filter) {
    let filteredAppointments = [...this.appointments];
    const today = new Date().toISOString().split("T")[0];

    switch (filter) {
      case "today":
        filteredAppointments = this.appointments.filter(
          (a) => a.date === today
        );
        break;
      case "upcoming":
        filteredAppointments = this.appointments.filter(
          (a) => a.date >= today && a.status === "scheduled"
        );
        break;
      case "completed":
        filteredAppointments = this.appointments.filter(
          (a) => a.status === "completed"
        );
        break;
    }

    this.renderAppointments(filteredAppointments);
  }

  renderAppointments(appointmentsToRender = this.appointments) {
    const tbody = document.getElementById("appointments-table");
    tbody.innerHTML = "";

    appointmentsToRender.forEach((appointment) => {
      const row = document.createElement("tr");
      const statusClass = `status-${appointment.status}`;

      row.innerHTML = `
                <td>#${appointment.id}</td>
                <td>${appointment.patientName}</td>
                <td>${appointment.doctor}</td>
                <td>${appointment.date}</td>
                <td>${appointment.time}</td>
                <td><span class="status-badge ${statusClass}">${
        appointment.status
      }</span></td>
                <td>
                    <button class="btn btn-secondary" onclick="hospital.showAppointmentModal(${JSON.stringify(
                      appointment
                    ).replace(/"/g, "&quot;")})">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${
                      appointment.status === "scheduled"
                        ? `<button class="btn btn-success" onclick="hospital.updateAppointmentStatus(${appointment.id}, 'completed')">
                            <i class="fas fa-check"></i>
                        </button>`
                        : ""
                    }
                    <button class="btn btn-danger" onclick="hospital.deleteAppointment(${
                      appointment.id
                    })">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
      tbody.appendChild(row);
    });
  }

  // Doctor Management
  renderDoctors() {
    const grid = document.getElementById("doctors-grid");
    grid.innerHTML = "";

    this.doctors.forEach((doctor) => {
      const card = document.createElement("div");
      card.className = "doctor-card";
      card.innerHTML = `
                <div class="doctor-avatar">
                    <i class="fas fa-user-md"></i>
                </div>
                <h3>${doctor.name}</h3>
                <p>${doctor.specialty}</p>
                <p><i class="fas fa-phone"></i> ${doctor.phone}</p>
                <div style="margin-top: 1rem;">
                    <span class="status-badge status-scheduled">Available</span>
                </div>
            `;
      grid.appendChild(card);
    });
  }

  // Dashboard and Utilities
  updateDashboard() {
    document.getElementById("total-patients").textContent =
      this.patients.length;

    const today = new Date().toISOString().split("T")[0];
    const todayAppointments = this.appointments.filter((a) => a.date === today);
    document.getElementById("total-appointments").textContent =
      todayAppointments.length;

    this.renderRecentActivities();
  }

  populatePatientDropdown() {
    const select = document.getElementById("appointment-patient");
    select.innerHTML = '<option value="">Select Patient</option>';

    this.patients.forEach((patient) => {
      const option = document.createElement("option");
      option.value = patient.id;
      option.textContent = `${patient.name} - ${patient.phone}`;
      select.appendChild(option);
    });
  }

  addActivity(activity) {
    const activities = JSON.parse(localStorage.getItem("activities")) || [];
    activities.unshift({
      id: Date.now(),
      text: activity,
      timestamp: new Date().toLocaleString(),
    });

    // Keep only last 10 activities
    if (activities.length > 10) {
      activities.splice(10);
    }

    localStorage.setItem("activities", JSON.stringify(activities));
  }

  renderRecentActivities() {
    const activities = JSON.parse(localStorage.getItem("activities")) || [];
    const container = document.getElementById("recent-activities");

    if (activities.length === 0) {
      container.innerHTML =
        '<p style="color: #7f8c8d; text-align: center; padding: 2rem;">No recent activities</p>';
      return;
    }

    container.innerHTML = activities
      .map(
        (activity) => `
            <div class="activity-item">
                <div>${activity.text}</div>
                <div class="activity-time">${activity.timestamp}</div>
            </div>
        `
      )
      .join("");
  }

  saveToLocalStorage() {
    localStorage.setItem("patients", JSON.stringify(this.patients));
    localStorage.setItem("appointments", JSON.stringify(this.appointments));
  }
}

// Initialize the application
const hospital = new HospitalManagement();

// Add some sample data if none exists
if (hospital.patients.length === 0) {
  const samplePatients = [
    {
      id: 1,
      name: "Vikshit Rajpoot",
      age: 21,
      gender: "Male",
      phone: "+91 821891138",
      email: "vikshitrajpoot@gmail.com",
      address: "123 Main St, City, State",
      medicalHistory: "No significant medical history",
      registrationDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Reshma",
      age: 22,
      gender: "Female",
      phone: "+91 912345678",
      email: "reshma@gmail.com",
      address: "456 Oak Ave, City, UP",
      medicalHistory: "Allergic to penicillin",
      registrationDate: "2024-01-20",
    },
  ];

  const sampleAppointments = [
    {
      id: 1,
      patientId: 1,
      patientName: "kundan kumar",
      doctor: "Dr. Ravi Kumar",
      date: new Date().toISOString().split("T")[0],
      time: "10:00",
      reason: "Leg pain",
      status: "scheduled",
    },
  ];

  hospital.patients = samplePatients;
  hospital.appointments = sampleAppointments;
  hospital.saveToLocalStorage();
  hospital.updateDashboard();
  hospital.renderPatients();
  hospital.renderAppointments();
  hospital.populatePatientDropdown();

  hospital.addActivity("Sample data loaded");
}

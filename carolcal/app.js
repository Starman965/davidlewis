// CarolCal Web - vanilla JS + Firebase (modular SDK)
// This web app shares the same Firestore data as the iOS app.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// IMPORTANT: replace these placeholders with your Firebase Web App config
// from the Firebase console (Project Settings → General → Your apps → Web app).
// This should point to the same Firebase project used by the iOS app.
const firebaseConfig = {
  apiKey: "AIzaSyBCpoU5xEXkqP9OgCw4JWi8q32lLBnn6D4",
  authDomain: "carolcal.firebaseapp.com",
  projectId: "carolcal",
  storageBucket: "carolcal.firebasestorage.app",
  messagingSenderId: "736990550141",
  appId: "1:736990550141:web:aafb9a0f72a0c28fe73914",
};

// --- Firebase setup ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// --- DOM helpers ---
const $ = (id) => document.getElementById(id);

const authSection = $("auth-section");
const appSection = $("app-section");
const authErrorEl = $("auth-error");
const globalErrorEl = $("global-error");

const userInfoEl = $("user-info");
const userDisplayNameEl = $("user-display-name");
const userEmailEl = $("user-email");
const userRolePillEl = $("user-role-pill");

const signOutBtn = $("sign-out-btn");
const settingsSignOutBtn = $("settings-sign-out-btn");

const tabAppointmentsBtn = $("tab-appointments");
const tabSettingsBtn = $("tab-settings");
const appointmentsView = $("appointments-view");
const settingsView = $("settings-view");

const appointmentsListEl = $("appointments-list");
const addAppointmentBtn = $("add-appointment-btn");

const filterUpcomingBtn = $("filter-upcoming");
const filterPastBtn = $("filter-past");

const settingsNameEl = $("settings-name");
const settingsEmailEl = $("settings-email");
const settingsRoleEl = $("settings-role");

// Modal + form elements
const appointmentModal = $("appointment-modal");
const appointmentModalTitle = $("appointment-modal-title");
const closeAppointmentModalBtn = $("close-appointment-modal");
const appointmentForm = $("appointment-form");
const appointmentFormErrorEl = $("appointment-form-error");
const cancelAppointmentBtn = $("appointment-cancel-btn");

const fieldName = $("field-name");
const fieldDate = $("field-date");
const fieldPickupTime = $("field-pickup-time");
const fieldAppointmentTime = $("field-appointment-time");
const fieldLocation = $("field-location");
const fieldDriverName = $("field-driver-name");
const fieldNotes = $("field-notes");

const ET_TIMEZONE = "America/New_York";

// --- Application state ---
let currentUser = null;
let userProfile = null;
let appointments = [];
let appointmentsUnsubscribe = null;
let currentFilter = "upcoming"; // "upcoming" | "past"
let editingAppointmentId = null;

// --- Utility functions ---
function setHidden(el, hidden) {
  if (!el) return;
  el.classList.toggle("hidden", hidden);
}

function showAuthError(message) {
  if (!message) {
    setHidden(authErrorEl, true);
    authErrorEl.textContent = "";
    return;
  }
  authErrorEl.textContent = message;
  setHidden(authErrorEl, false);
}

function showGlobalError(message) {
  if (!message) {
    setHidden(globalErrorEl, true);
    globalErrorEl.textContent = "";
    return;
  }
  globalErrorEl.textContent = message;
  setHidden(globalErrorEl, false);
}

function showFormError(message) {
  if (!message) {
    setHidden(appointmentFormErrorEl, true);
    appointmentFormErrorEl.textContent = "";
    return;
  }
  appointmentFormErrorEl.textContent = message;
  setHidden(appointmentFormErrorEl, false);
}

const etDisplayDateFormatter = new Intl.DateTimeFormat(undefined, {
  timeZone: ET_TIMEZONE,
  weekday: "short",
  month: "short",
  day: "numeric",
});

const etDisplayTimeFormatter = new Intl.DateTimeFormat(undefined, {
  timeZone: ET_TIMEZONE,
  hour: "numeric",
  minute: "2-digit",
});

const etDateOnlyFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: ET_TIMEZONE,
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const etTimeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: ET_TIMEZONE,
  hour: "numeric",
  minute: "numeric",
  hour12: false,
});

function formatDateDisplay(date) {
  if (!date) return "";
  return etDisplayDateFormatter.format(date);
}

function formatTimeDisplay(date) {
  if (!date) return "";
  return etDisplayTimeFormatter.format(date);
}

function getEtDateParts(date) {
  const parts = etDateOnlyFormatter.formatToParts(date);
  let year = 0;
  let month = 0;
  let day = 0;
  for (const p of parts) {
    if (p.type === "year") year = parseInt(p.value, 10);
    if (p.type === "month") month = parseInt(p.value, 10);
    if (p.type === "day") day = parseInt(p.value, 10);
  }
  return { year, month, day };
}

function getEtTimeParts(date) {
  const parts = etTimeFormatter.formatToParts(date);
  let hour = 0;
  let minute = 0;
  for (const p of parts) {
    if (p.type === "hour") hour = parseInt(p.value, 10);
    if (p.type === "minute") minute = parseInt(p.value, 10);
  }
  return { hour, minute };
}

function startOfDay(date) {
  const { year, month, day } = getEtDateParts(date);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function combineDateAndTime(date, time) {
  if (!date || !time) return date || time;
  const { year, month, day } = getEtDateParts(date);
  const { hour, minute } = getEtTimeParts(time);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

// Create a Date that represents the given Eastern Time components (year, month, day, hour, minute)
// regardless of the browser's local timezone. This mirrors how the iOS app uses ET.
function makeEtDate(year, month, day, hour, minute) {
  // First, create a UTC date with the raw components
  const tmpUtc = new Date(Date.UTC(year, month - 1, day, hour, minute));

  // Determine whether that instant falls under EST (UTC-5) or EDT (UTC-4)
  const tzParts = new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TIMEZONE,
    timeZoneName: "short",
  }).formatToParts(tmpUtc);

  const tzNamePart = tzParts.find((p) => p.type === "timeZoneName");
  const isDst = tzNamePart && tzNamePart.value === "EDT";
  const offsetHours = isDst ? 4 : 5; // ET is UTC-4 in DST, UTC-5 otherwise

  // Shift by the offset so that ET wall-clock time matches the requested components
  return new Date(Date.UTC(year, month - 1, day, hour + offsetHours, minute));
}

function determineUserRole(email) {
  const lower = (email || "").toLowerCase();
  if (
    lower === "susan.hardy96@gmail.com" ||
    lower === "demandgendave@gmail.com"
  ) {
    return "admin";
  }
  if (lower === "carolblewis13@gmail.com") {
    return "carol";
  }
  return "carol";
}

function roleDisplay(role) {
  if (role === "admin") return "Admin";
  if (role === "carol") return "Viewer";
  return role || "Viewer";
}

function canEditAppointment(appointment) {
  // Web app now matches Firestore rules: any signed-in user can edit/delete.
  // (Firestore enforces auth; this is just UI gating.)
  return !!currentUser;
}

// --- Firebase: auth flow ---
async function handleSignInWithGoogle() {
  showAuthError(null);
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    console.error("Sign-in failed", err);
    showAuthError("Sign in failed. Please try again.");
  }
}

async function handleSignOut() {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Sign-out failed", err);
    showGlobalError("Sign out failed. Please try again.");
  }
}

async function ensureUserProfile(user) {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const role = determineUserRole(user.email || "");
    const newProfile = {
      email: user.email || "",
      displayName: user.displayName || "User",
      role,
      createdAt: new Date(),
    };
    await setDoc(userRef, newProfile);

    const settingsRef = doc(db, "settings", user.uid);
    const now = new Date();
    const eightAm = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      8,
      0,
      0,
      0
    );
    await setDoc(settingsRef, {
      userId: user.uid,
      weekBeforeEnabled: true,
      dayBeforeEnabled: true,
      appointmentCreatedEnabled: true,
      appointmentEditedEnabled: true,
      appointmentDeletedEnabled: true,
      notificationTime: eightAm,
    });

    userProfile = { id: user.uid, ...newProfile };
    return userProfile;
  } else {
    const data = snap.data();
    userProfile = {
      id: snap.id,
      email: data.email,
      displayName: data.displayName,
      role: data.role,
      createdAt: data.createdAt?.toDate
        ? data.createdAt.toDate()
        : data.createdAt || new Date(),
    };
    return userProfile;
  }
}

function renderUserProfile() {
  if (!currentUser || !userProfile) {
    setHidden(userInfoEl, true);
    return;
  }
  userDisplayNameEl.textContent = userProfile.displayName || "User";
  userEmailEl.textContent = userProfile.email || "";
  userRolePillEl.textContent = roleDisplay(userProfile.role);
  setHidden(userInfoEl, false);

  settingsNameEl.textContent = userProfile.displayName || "User";
  settingsEmailEl.textContent = userProfile.email || "";
  settingsRoleEl.textContent = roleDisplay(userProfile.role);
}

function onAuthChanged(user) {
  currentUser = user;
  if (!user) {
    userProfile = null;
    appointments = [];
    if (appointmentsUnsubscribe) {
      appointmentsUnsubscribe();
      appointmentsUnsubscribe = null;
    }
    renderAppointments();
    renderUserProfile();
    setHidden(appSection, true);
    setHidden(authSection, false);
    setHidden(signOutBtn, true);
    setHidden(settingsSignOutBtn, true);
    return;
  }

  setHidden(authSection, true);
  setHidden(appSection, false);
  setHidden(signOutBtn, false);
  setHidden(settingsSignOutBtn, false);

  ensureUserProfile(user)
    .then(() => {
      renderUserProfile();
      startAppointmentsListener();
    })
    .catch((err) => {
      console.error("Failed to load profile", err);
      showGlobalError("Error loading your profile. Try refreshing the page.");
    });
}

// --- Firebase: appointments listener + CRUD ---
function normalizeDateField(value) {
  if (!value) return null;
  if (value.toDate) return value.toDate();
  if (value instanceof Date) return value;
  return new Date(value);
}

function startAppointmentsListener() {
  if (appointmentsUnsubscribe) {
    appointmentsUnsubscribe();
  }

  const q = query(collection(db, "appointments"), orderBy("date", "asc"));
  appointmentsUnsubscribe = onSnapshot(
    q,
    (snapshot) => {
      appointments = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const docId = docSnap.id;
        const date = normalizeDateField(data.date);
        const appointmentTime = normalizeDateField(
          data.appointmentTime || data.date
        );
        const pickupTime = normalizeDateField(
          data.pickupTime || data.appointmentTime || data.date
        );

        return {
          // Normalize to the document ID so writes satisfy:
          // `request.resource.data.id == appointmentId`
          id: docId,
          documentId: docId,
          name: data.name || "Appointment",
          date,
          appointmentTime,
          pickupTime,
          location: data.location || "Unknown location",
          driverName: data.driverName || data.driver || data.otherDriverName,
          notes: data.notes || "",
          createdBy: data.createdBy || null,
          createdByName: data.createdByName || null,
          createdByEmail: data.createdByEmail || null,
          createdAt: normalizeDateField(data.createdAt),
          updatedBy: data.updatedBy || null,
          updatedByName: data.updatedByName || null,
          updatedByEmail: data.updatedByEmail || null,
          updatedAt: normalizeDateField(data.updatedAt),
        };
      });
      showGlobalError(null);
      renderAppointments();
    },
    (err) => {
      console.error("Error listening to appointments", err);
      showGlobalError("Error loading appointments. Check your connection.");
    }
  );
}

async function saveAppointmentFromForm(event) {
  event.preventDefault();
  if (!currentUser) {
    showFormError("You must be signed in.");
    return;
  }

  const name = fieldName.value.trim();
  const dateStr = fieldDate.value;
  const pickupTimeStr = fieldPickupTime.value;
  const appointmentTimeStr = fieldAppointmentTime.value;
  const location = fieldLocation.value.trim();
  const driverName = fieldDriverName.value.trim();
  const notes = fieldNotes.value.trim();

  if (!name || !dateStr || !pickupTimeStr || !appointmentTimeStr) {
    showFormError("Please fill in the event name, date, and times.");
    return;
  }

  const [year, month, day] = dateStr.split("-").map((n) => parseInt(n, 10));

  function buildTime(timeStr) {
    const [hStr, mStr] = timeStr.split(":");
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    return makeEtDate(year, month, day, h, m);
  }

  const date = makeEtDate(year, month, day, 12, 0);
  const pickupTime = buildTime(pickupTimeStr);
  const appointmentTime = buildTime(appointmentTimeStr);

  const now = new Date();
  const baseAppointment = {
    name,
    date,
    appointmentTime,
    pickupTime,
    location,
    driverName: driverName || null,
    notes: notes || null,
  };

  try {
    if (editingAppointmentId) {
      const existing = appointments.find((a) => a.id === editingAppointmentId);
      if (!existing) {
        showFormError("Could not find this appointment to update.");
        return;
      }
      if (!canEditAppointment(existing)) return;

      const editorName =
        (userProfile && userProfile.displayName) ||
        currentUser.displayName ||
        "Someone";
      const editorEmail = currentUser.email || (userProfile && userProfile.email) || null;

      const updated = { ...existing, ...baseAppointment, updatedAt: now };

      const docId = existing.documentId || existing.id;
      await setDoc(
        doc(db, "appointments", docId),
        {
          id: docId,
          name: updated.name,
          date: updated.date,
          appointmentTime: updated.appointmentTime,
          pickupTime: updated.pickupTime,
          location: updated.location,
          driverName: updated.driverName,
          notes: updated.notes,

          // keep creator immutable
          createdBy: updated.createdBy || null,
          createdByName: updated.createdByName || null,
          createdByEmail: updated.createdByEmail || null,
          createdAt: updated.createdAt || null,

          // stamp editor
          updatedBy: currentUser.uid,
          updatedByName: editorName,
          updatedByEmail: editorEmail,
          updatedAt: updated.updatedAt,
        },
        { merge: true }
      );
    } else {
      const id =
        (self.crypto && self.crypto.randomUUID && self.crypto.randomUUID()) ||
        Math.random().toString(36).slice(2);

      const createdByName =
        (userProfile && userProfile.displayName) ||
        currentUser.displayName ||
        "Someone";
      const createdByEmail = currentUser.email || (userProfile && userProfile.email) || null;

      const newAppointment = {
        id,
        name: baseAppointment.name,
        date: baseAppointment.date,
        appointmentTime: baseAppointment.appointmentTime,
        pickupTime: baseAppointment.pickupTime,
        location: baseAppointment.location,
        driverName: baseAppointment.driverName,
        notes: baseAppointment.notes,
        createdBy: currentUser.uid,
        createdByName,
        createdByEmail,
        createdAt: now,
        updatedBy: currentUser.uid,
        updatedByName: createdByName,
        updatedByEmail: createdByEmail,
        updatedAt: now,
      };

      await setDoc(doc(db, "appointments", id), newAppointment, { merge: true });
    }

    closeAppointmentModal();
  } catch (err) {
    console.error("Error saving appointment", err);
    showFormError("Error saving appointment. Please try again.");
  }
}

async function deleteAppointment(id) {
  const appointment = appointments.find((a) => a.id === id);
  if (!appointment) return;
  if (!canEditAppointment(appointment)) return;
  const confirmed = confirm(
    `Delete "${appointment.name}" on ${formatDateDisplay(
      appointment.date
    )}? This cannot be undone.`
  );
  if (!confirmed) return;

  try {
    const docId = appointment.documentId || appointment.id;
    await deleteDoc(doc(db, "appointments", docId));
  } catch (err) {
    console.error("Error deleting appointment", err);
    showGlobalError("Error deleting appointment. Please try again.");
  }
}

// --- Rendering ---
function renderAppointments() {
  appointmentsListEl.innerHTML = "";

  if (!appointments.length) {
    const empty = document.createElement("div");
    empty.className = "appointment-empty";
    empty.textContent =
      currentFilter === "upcoming"
        ? "No upcoming appointments."
        : "No past appointments in the last 7 days.";
    appointmentsListEl.appendChild(empty);
    return;
  }

  const now = new Date();
  const today = startOfDay(now);
  const sevenDaysAgo = addDays(today, -7);

  const filtered = appointments
    .filter((appt) => {
      if (!appt.date) return false;
      const apptDay = startOfDay(appt.date);
      if (currentFilter === "upcoming") {
        return apptDay >= today;
      } else {
        return apptDay < today && apptDay >= sevenDaysAgo;
      }
    })
    .sort((a, b) => {
      const aCombined = combineDateAndTime(a.date, a.appointmentTime);
      const bCombined = combineDateAndTime(b.date, b.appointmentTime);
      if (currentFilter === "upcoming") {
        return aCombined - bCombined;
      } else {
        return bCombined - aCombined;
      }
    });

  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "appointment-empty";
    empty.textContent =
      currentFilter === "upcoming"
        ? "No upcoming appointments."
        : "No past appointments in the last 7 days.";
    appointmentsListEl.appendChild(empty);
    return;
  }

  filtered.forEach((appt) => {
    const card = document.createElement("article");
    card.className = "appointment-card" + (currentFilter === "past" ? " past" : "");

    const main = document.createElement("div");
    main.className = "appointment-main";

    const titleRow = document.createElement("div");
    titleRow.className = "appointment-title-row";

    const nameEl = document.createElement("div");
    nameEl.className = "appointment-name";
    nameEl.textContent = appt.name;
    titleRow.appendChild(nameEl);

    const badge = document.createElement("div");
    badge.className = "appointment-badge";
    badge.textContent = currentFilter === "past" ? "Completed" : "Scheduled";
    titleRow.appendChild(badge);

    main.appendChild(titleRow);

    const meta = document.createElement("div");
    meta.className = "appointment-meta";
    const dateSpan = document.createElement("span");
    dateSpan.textContent = formatDateDisplay(appt.date);
    meta.appendChild(dateSpan);

    const timeSpan = document.createElement("span");
    timeSpan.textContent = formatTimeDisplay(appt.appointmentTime);
    meta.appendChild(timeSpan);

    if (appt.createdByName) {
      const bySpan = document.createElement("span");
      bySpan.textContent = `Added by ${appt.createdByName}`;
      meta.appendChild(bySpan);
    }

    main.appendChild(meta);

    const detailRow = document.createElement("div");
    detailRow.className = "appointment-detail-row";

    const locationChip = document.createElement("div");
    locationChip.className = "chip";
    locationChip.innerHTML = `<span class="chip-icon">📍</span><span>${
      appt.location || "Location TBD"
    }</span>`;
    detailRow.appendChild(locationChip);

    const driverChip = document.createElement("div");
    driverChip.className = "chip";
    driverChip.innerHTML = `<span class="chip-icon">🚗</span><span>Driver: ${
      appt.driverName || "TBD"
    }</span>`;
    detailRow.appendChild(driverChip);

    const pickupChip = document.createElement("div");
    pickupChip.className = "chip";
    pickupChip.innerHTML = `<span class="chip-icon">⏱</span><span>Pickup: ${formatTimeDisplay(
      appt.pickupTime
    )}</span>`;
    detailRow.appendChild(pickupChip);

    main.appendChild(detailRow);

    if (appt.notes) {
      const notesEl = document.createElement("div");
      notesEl.className = "appointment-notes";
      notesEl.textContent = appt.notes;
      main.appendChild(notesEl);
    }

    const actions = document.createElement("div");
    actions.className = "appointment-actions";

    if (canEditAppointment(appt)) {
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className = "pill-btn pill-btn-edit";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openAppointmentModal(appt.id));

      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "pill-btn pill-btn-delete";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => deleteAppointment(appt.id));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
    } else {
      const badgeEl = document.createElement("div");
      badgeEl.className = "pill-badge";
      badgeEl.textContent = "View only";
      actions.appendChild(badgeEl);
    }

    card.appendChild(main);
    card.appendChild(actions);

    appointmentsListEl.appendChild(card);
  });
}

// --- Modal handling ---
function resetAppointmentForm() {
  appointmentForm.reset();
  showFormError(null);
}

function openAppointmentModal(appointmentId = null) {
  editingAppointmentId = appointmentId;
  resetAppointmentForm();

  if (appointmentId) {
    const appt = appointments.find((a) => a.id === appointmentId);
    if (!appt) {
      showGlobalError("Could not find this appointment.");
      return;
    }
    appointmentModalTitle.textContent = "Edit appointment";
    fieldName.value = appt.name || "";

    if (appt.date instanceof Date) {
      const y = appt.date.getFullYear();
      const m = String(appt.date.getMonth() + 1).padStart(2, "0");
      const d = String(appt.date.getDate()).padStart(2, "0");
      fieldDate.value = `${y}-${m}-${d}`;
    }

    if (appt.pickupTime instanceof Date) {
      const { hour, minute } = getEtTimeParts(appt.pickupTime);
      const h = String(hour).padStart(2, "0");
      const m = String(minute).padStart(2, "0");
      fieldPickupTime.value = `${h}:${m}`;
    }

    if (appt.appointmentTime instanceof Date) {
      const { hour, minute } = getEtTimeParts(appt.appointmentTime);
      const h = String(hour).padStart(2, "0");
      const m = String(minute).padStart(2, "0");
      fieldAppointmentTime.value = `${h}:${m}`;
    }

    fieldLocation.value = appt.location || "";
    fieldDriverName.value = appt.driverName || "";
    fieldNotes.value = appt.notes || "";
  } else {
    appointmentModalTitle.textContent = "New appointment";
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    fieldDate.value = `${y}-${m}-${d}`;

    const pickup = new Date(now.getTime() + 60 * 60 * 1000);
    const apptTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    fieldPickupTime.value = `${String(pickup.getHours()).padStart(
      2,
      "0"
    )}:${String(pickup.getMinutes()).padStart(2, "0")}`;
    fieldAppointmentTime.value = `${String(apptTime.getHours()).padStart(
      2,
      "0"
    )}:${String(apptTime.getMinutes()).padStart(2, "0")}`;
  }

  appointmentModal.setAttribute("aria-hidden", "false");
  setHidden(appointmentModal, false);
  fieldName.focus();
}

function closeAppointmentModal() {
  appointmentModal.setAttribute("aria-hidden", "true");
  setHidden(appointmentModal, true);
  editingAppointmentId = null;
}

// --- Tabs & filters ---
function activateTab(tabName) {
  const isAppointments = tabName === "appointments";
  tabAppointmentsBtn.classList.toggle("active", isAppointments);
  tabSettingsBtn.classList.toggle("active", !isAppointments);
  appointmentsView.classList.toggle("tab-view-active", isAppointments);
  settingsView.classList.toggle("tab-view-active", !isAppointments);
}

function setFilter(filterName) {
  currentFilter = filterName;
  filterUpcomingBtn.classList.toggle("active", filterName === "upcoming");
  filterPastBtn.classList.toggle("active", filterName === "past");
  renderAppointments();
}

// --- Event wiring ---
function attachEventListeners() {
  $("google-signin-btn").addEventListener("click", handleSignInWithGoogle);
  signOutBtn.addEventListener("click", handleSignOut);
  settingsSignOutBtn.addEventListener("click", handleSignOut);

  tabAppointmentsBtn.addEventListener("click", () => activateTab("appointments"));
  tabSettingsBtn.addEventListener("click", () => activateTab("settings"));

  filterUpcomingBtn.addEventListener("click", () => setFilter("upcoming"));
  filterPastBtn.addEventListener("click", () => setFilter("past"));

  addAppointmentBtn.addEventListener("click", () => openAppointmentModal(null));

  closeAppointmentModalBtn.addEventListener("click", closeAppointmentModal);
  cancelAppointmentBtn.addEventListener("click", closeAppointmentModal);
  appointmentModal.addEventListener("click", (e) => {
    if (e.target === appointmentModal) {
      closeAppointmentModal();
    }
  });

  appointmentForm.addEventListener("submit", saveAppointmentFromForm);
}

// --- Initialize app ---
function init() {
  attachEventListeners();
  onAuthStateChanged(auth, onAuthChanged);
}

init();



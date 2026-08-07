const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGO_URI || 
  'mongodb://clinic_admin:p%40ssw0rd_db_user@mongodb:27017/liveclinic?authSource=liveclinic';

// Microservice internal Docker URL
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://clinic-notification:5001';

// Helper function to dispatch notification events safely without blocking primary responses
const sendNotification = async (endpoint, payload) => {
  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}${endpoint}`, payload);
  } catch (err) {
    console.error(`⚠️ Notification dispatch to ${endpoint} failed:`, err.message);
  }
};

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, default: "", trim: true }, // Added email field
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  role: { type: String, enum: ['patient', 'doctor', 'admin'], required: true }, 
  symptoms: { type: String, default: "" },
  age: String,      
  location: String, 
  diagnosis: { type: String, default: "" },
  prescription: { type: String, default: "" },
  assignedDoctor: { type: String, default: null },
  status: { type: String, default: 'Pending' }, 
  createdAt: { type: Date, default: Date.now }
}, {
  collation: { locale: 'en', strength: 2 }
});

const User = mongoose.model('User', UserSchema);

// Helper function to generate unique username suggestions
const generateUniqueUsername = async (fullName) => {
  if (!fullName) return "";
  let base = fullName.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!base) base = "user";
  
  let candidate = base;
  let counter = 101;

  while (await User.findOne({ username: candidate }).collation({ locale: 'en', strength: 2 })) {
    candidate = `${base}${counter}`;
    counter++;
  }
  return candidate;
};

// Seed initial staff members if not present
const seedUsers = async () => {
  try {
    const doctors = [
      { fullName: 'Jonah Irande', username: 'jonahirande', email: 'jonah@example.com' },
      { fullName: 'Oluwatosin Daniel', username: 'otdaniel', email: 'tosin@example.com' },
      { fullName: 'Faith Bitrus', username: 'faithbitrus', email: 'faith@example.com' }
    ];

    for (let doc of doctors) {
      const exists = await User.findOne({ username: doc.username }).collation({ locale: 'en', strength: 2 });
      if (!exists) {
        await User.create({ 
          fullName: doc.fullName, 
          username: doc.username, 
          email: doc.email,
          role: 'doctor', 
          password: 'p@ssw0rd' 
        });
      }
    }

    const adminExists = await User.findOne({ username: 'admin' }).collation({ locale: 'en', strength: 2 });
    if (!adminExists) {
      await User.create({ 
        fullName: 'System Administrator', 
        username: 'admin', 
        email: 'admin@example.com',
        role: 'admin', 
        password: 'p@ssw0rd' 
      });
    }
  } catch (err) { console.error('Seed error:', err); }
};

mongoose.connect(mongoURI).then(() => seedUsers());

// --- ROUTES ---

// Auto-suggest unique username route
app.post('/api/suggest-username', async (req, res) => {
  try {
    const { fullName } = req.body;
    if (!fullName) return res.status(400).send({ error: "Full name required" });
    const suggestedUsername = await generateUniqueUsername(fullName);
    res.json({ suggestedUsername });
  } catch (err) {
    res.status(500).send({ error: "Failed to generate username" });
  }
});

// Login via Unique Username
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send({ error: "Missing fields" });

    const normalizedUser = username.trim();
    const user = await User.findOne({ username: normalizedUser }).collation({ locale: 'en', strength: 2 });

    if (!user || user.password !== password) {
      return res.status(401).send({ error: "Invalid Credentials" });
    }

    res.json({ 
      _id: user._id, 
      fullName: user.fullName, 
      username: user.username, 
      email: user.email,
      role: user.role 
    });
  } catch (err) { res.status(500).send({ error: "Login failed" }); }
});

// Patient Consultation Registration
app.post('/api/register', async (req, res) => {
  try {
    const { fullName, username, email, password, phone, symptoms, age, location } = req.body;
    
    if (!fullName || !username || !password) {
      return res.status(400).send({ error: "Full name, username, and password are required." });
    }

    const cleanUsername = username.trim();

    const existingUser = await User.findOne({ username: cleanUsername }).collation({ locale: 'en', strength: 2 });
    if (existingUser) {
      return res.status(400).send({ error: "Username already taken. Please enter a different unique username." });
    }

    const newUser = new User({ 
      fullName: fullName.trim(),
      username: cleanUsername, 
      email: email ? email.trim() : "",
      password, 
      phone, 
      symptoms, 
      age, 
      location, 
      role: 'patient' 
    });

    await newUser.save();

    // Trigger Notification: Welcome Email
    if (newUser.email) {
      sendNotification('/api/notify/welcome', {
        email: newUser.email,
        fullName: newUser.fullName
      });
    }

    res.status(201).send(newUser);
  } catch (err) { 
    if (err.code === 11000) {
      return res.status(400).send({ error: "Username already exists." });
    }
    res.status(500).send({ error: "Registration failed" }); 
  }
});

// ADMIN: Add New Doctor
app.post('/api/doctors', async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;
    const cleanUsername = username ? username.trim() : "";

    if (!fullName || !cleanUsername || !password) {
      return res.status(400).send({ error: "Full Name, Username, and Password are required" });
    }

    const existingUser = await User.findOne({ username: cleanUsername }).collation({ locale: 'en', strength: 2 });
    if (existingUser) {
      return res.status(400).send({ error: "A staff member with this username already exists" });
    }

    const newDoctor = new User({ 
      fullName: fullName.trim(), 
      username: cleanUsername, 
      email: email ? email.trim() : "",
      password, 
      role: 'doctor' 
    });

    await newDoctor.save();
    res.status(201).send({ msg: 'Doctor created successfully', doctor: newDoctor });
  } catch (err) { res.status(500).send({ error: "Failed to add doctor" }); }
});

// GET: All Doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json(doctors);
  } catch (err) { res.status(500).send({ error: "Failed to fetch doctors" }); }
});

// GET: All Patients
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) { res.status(500).send({ error: "Fetch failed" }); }
});

// Assign Doctor to Patient
app.put('/api/assign', async (req, res) => {
  try {
    const { patientId, doctorUsername } = req.body;

    const patient = await User.findById(patientId);
    const doctor = await User.findOne({ username: doctorUsername, role: 'doctor' });

    if (!patient || !doctor) {
      return res.status(404).send({ error: "Patient or Doctor not found" });
    }

    patient.assignedDoctor = doctor.username;
    patient.status = 'Assigned';
    await patient.save();

    // Trigger Notifications
    if (patient.email) {
      sendNotification('/api/notify/patient-doctor-assigned', {
        email: patient.email,
        fullName: patient.fullName,
        doctorName: doctor.fullName
      });
    }

    if (doctor.email) {
      sendNotification('/api/notify/doctor-patient-assigned', {
        doctorEmail: doctor.email,
        doctorName: doctor.fullName,
        patientName: patient.fullName,
        reason: patient.symptoms
      });
    }

    res.send({ msg: 'Assigned' });
  } catch (err) { res.status(500).send({ error: "Assign failed" }); }
});

// ADMIN: Reset Patient Password
app.put('/api/reset-password', async (req, res) => {
  try {
    const { patientId, newPassword } = req.body;
    const updated = await User.findByIdAndUpdate(patientId, { password: newPassword }, { new: true });
    if (!updated) return res.status(404).send({ error: "Patient not found" });
    res.send({ msg: 'Password Reset Successful' });
  } catch (err) { res.status(500).send({ error: "Reset failed" }); }
});

// USER SELF-SERVICE: Password Reset via Username
app.put('/api/user/reset-password', async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    if (!username || !newPassword) return res.status(400).send({ error: "All fields required" });

    const cleanUsername = username.trim();
    const user = await User.findOne({ username: cleanUsername }).collation({ locale: 'en', strength: 2 });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    user.password = newPassword;
    await user.save();
    res.send({ msg: 'Password updated successfully' });
  } catch (err) { res.status(500).send({ error: "Password reset failed" }); }
});

// Finalize Doctor Consultation
app.put('/api/diagnose', async (req, res) => {
  try {
    const { patientId, diagnosis, prescription } = req.body;

    const patient = await User.findById(patientId);
    if (!patient) return res.status(404).send({ error: "Patient not found" });

    patient.diagnosis = diagnosis;
    patient.prescription = prescription;
    patient.status = 'Completed';
    await patient.save();

    // Trigger Notification: Prescription
    if (patient.email) {
      let doctorName = 'Your assigned doctor';
      if (patient.assignedDoctor) {
        const doc = await User.findOne({ username: patient.assignedDoctor });
        if (doc) doctorName = doc.fullName;
      }

      sendNotification('/api/notify/prescription', {
        email: patient.email,
        fullName: patient.fullName,
        doctorName: doctorName,
        details: prescription
      });
    }

    res.send({ msg: 'Finalized' });
  } catch (err) { res.status(500).send({ error: "Diagnosis failed" }); }
});

// Delete Patient
app.delete('/api/patients/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.send({ msg: 'Deleted' });
  } catch (err) { res.status(500).send({ error: "Delete failed" }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`📡 Server active on ${PORT}`));
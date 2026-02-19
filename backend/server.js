const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Database Connection String
const mongoURI = process.env.MONGO_URI || 'mongodb://clinic_admin:p@ssw0rd_db_user@mongodb:27017/liveclinic?authSource=liveclinic';

// --- Updated Schema Definition ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true }, // Added password field
  role: { type: String, enum: ['patient', 'doctor', 'admin'] }, 
  symptoms: { type: String, default: "" },
  age: String,      
  location: String, 
  diagnosis: { type: String, default: "" },
  prescription: { type: String, default: "" },
  assignedDoctor: { type: String, default: null },
  status: { type: String, default: 'Pending' }, 
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Seed Logic (Ensures staff exist in the DB with the default password)
const seedUsers = async () => {
  try {
    const doctors = ['Jonah Irande', 'Oluwatosin Daniel', 'Faith Bitrus'];
    for (let name of doctors) {
      await User.updateOne(
        { username: name }, 
        { role: 'doctor', password: 'p@ssw0rd' }, // Default staff password
        { upsert: true }
      );
    }
    await User.updateOne(
      { username: 'admin' }, 
      { role: 'admin', password: 'p@ssw0rd' }, // Default staff password
      { upsert: true }
    );
    console.log('✅ Database seeded with doctors and admin.');
  } catch (err) {
    console.error('❌ Error seeding database:', err);
  }
};

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => {
    console.log('🚀 Connected to MongoDB successfully');
    seedUsers();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// --- API Routes ---

/**
 * 1. Register Patient
 * Now receives and saves the password chosen by the patient.
 */
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, symptoms, age, location } = req.body;
    console.log(`📥 New Patient Registration: ${username}`);
    
    const newUser = new User({ 
      username, 
      password, // Save the unique password
      symptoms, 
      age, 
      location, 
      role: 'patient',
      status: 'Pending' 
    });
    
    await newUser.save();
    res.status(201).send(newUser);
  } catch (err) {
    console.error('❌ Registration Error:', err);
    res.status(500).send({ error: "Failed to register patient" });
  }
});

/**
 * 2. Get All Patients
 * Now returns the password field so the frontend can verify login.
 */
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).send({ error: "Error fetching patient list" });
  }
});

/**
 * 3. Assign Specialist
 */
app.put('/api/assign', async (req, res) => {
  try {
    const { patientId, doctorName } = req.body;
    await User.findByIdAndUpdate(patientId, { 
      assignedDoctor: doctorName, 
      status: 'Assigned' 
    });
    console.log(`👨‍⚕️ Patient ${patientId} assigned to ${doctorName}`);
    res.send({ msg: 'Assigned successfully' });
  } catch (err) {
    res.status(500).send({ error: "Assignment failed" });
  }
});

/**
 * 4. Submit Diagnosis/Prescription
 */
app.put('/api/diagnose', async (req, res) => {
  try {
    const { patientId, diagnosis, prescription } = req.body;
    await User.findByIdAndUpdate(patientId, { 
      diagnosis, 
      prescription, 
      status: 'Completed' 
    });
    console.log(`💊 Treatment completed for Patient ${patientId}`);
    res.send({ msg: 'Treatment finalized' });
  } catch (err) {
    res.status(500).send({ error: "Diagnosis submission failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`📡 Backend Server active on port ${PORT}`));
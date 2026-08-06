const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGO_URI || 'mongodb://mongodb:27017/liveclinic';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" },
  role: { type: String, enum: ['patient', 'doctor', 'admin'] }, 
  symptoms: { type: String, default: "" },
  age: String,      
  location: String, 
  diagnosis: { type: String, default: "" },
  prescription: { type: String, default: "" },
  assignedDoctor: { type: String, default: null },
  status: { type: String, default: 'Pending' }, 
  createdAt: { type: Date, default: Date.now }
}, {
  // Enables case-insensitive queries by default for string indexes
  collation: { locale: 'en', strength: 2 }
});

const User = mongoose.model('User', UserSchema);

const seedUsers = async () => {
  try {
    const doctors = ['Jonah Irande', 'Oluwatosin Daniel', 'Faith Bitrus'];
    for (let name of doctors) {
      const exists = await User.findOne({ username: name }).collation({ locale: 'en', strength: 2 });
      if (!exists) {
        await User.create({ username: name, role: 'doctor', password: 'p@ssw0rd' });
      }
    }
    const adminExists = await User.findOne({ username: 'admin' }).collation({ locale: 'en', strength: 2 });
    if (!adminExists) {
      await User.create({ username: 'admin', role: 'admin', password: 'p@ssw0rd' });
    }
  } catch (err) { console.error('Seed error:', err); }
};

mongoose.connect(mongoURI).then(() => seedUsers());

// --- ROUTES ---

// Unified Login Endpoint (Case-Insensitive Username Check)
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send({ error: "Missing fields" });

    const normalizedUser = username.trim();
    const user = await User.findOne({ username: normalizedUser }).collation({ locale: 'en', strength: 2 });

    if (!user || user.password !== password) {
      return res.status(401).send({ error: "Invalid Credentials" });
    }

    res.json({ _id: user._id, username: user.username, role: user.role });
  } catch (err) { res.status(500).send({ error: "Login failed" }); }
});

// Patient Registration (Checks for duplicate case-insensitive username)
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, phone, symptoms, age, location } = req.body;
    const cleanUsername = username ? username.trim() : "";

    const existingUser = await User.findOne({ username: cleanUsername }).collation({ locale: 'en', strength: 2 });
    if (existingUser) {
      return res.status(400).send({ error: "Username already exists. Please pick another." });
    }

    const newUser = new User({ 
      username: cleanUsername, 
      password, 
      phone, 
      symptoms, 
      age, 
      location, 
      role: 'patient' 
    });
    await newUser.save();
    res.status(201).send(newUser);
  } catch (err) { 
    if (err.code === 11000) {
      return res.status(400).send({ error: "Username already exists." });
    }
    res.status(500).send({ error: "Register failed" }); 
  }
});

// ADMIN: Add New Doctor
app.post('/api/doctors', async (req, res) => {
  try {
    const { username, password } = req.body;
    const cleanUsername = username ? username.trim() : "";

    if (!cleanUsername || !password) {
      return res.status(400).send({ error: "Username and password are required" });
    }

    const existingUser = await User.findOne({ username: cleanUsername }).collation({ locale: 'en', strength: 2 });
    if (existingUser) {
      return res.status(400).send({ error: "A user with this username already exists" });
    }

    const newDoctor = new User({ username: cleanUsername, password, role: 'doctor' });
    await newDoctor.save();
    res.status(201).send({ msg: 'Doctor created successfully', doctor: newDoctor });
  } catch (err) { res.status(500).send({ error: "Failed to add doctor" }); }
});

// GET: All Doctors (for Admin assignment list)
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json(doctors);
  } catch (err) { res.status(500).send({ error: "Failed to fetch doctors" }); }
});

app.get('/api/patients', async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) { res.status(500).send({ error: "Fetch failed" }); }
});

app.put('/api/assign', async (req, res) => {
  try {
    const { patientId, doctorName } = req.body;
    await User.findByIdAndUpdate(patientId, { assignedDoctor: doctorName, status: 'Assigned' });
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

app.put('/api/diagnose', async (req, res) => {
  try {
    const { patientId, diagnosis, prescription } = req.body;
    await User.findByIdAndUpdate(patientId, { diagnosis, prescription, status: 'Completed' });
    res.send({ msg: 'Finalized' });
  } catch (err) { res.status(500).send({ error: "Diagnosis failed" }); }
});

app.delete('/api/patients/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.send({ msg: 'Deleted' });
  } catch (err) { res.status(500).send({ error: "Delete failed" }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`📡 Server active on ${PORT}`));

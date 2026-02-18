const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Database Connection (Environment variable for OpenShift/Docker)
const mongoURI = process.env.MONGO_URI || 'mongodb://clinic_admin:p@ssw0rd_db_user@mongodb:27017/liveclinic';
mongoose.connect(mongoURI);

// Schema
const UserSchema = new mongoose.Schema({
  username: String,
  role: String, // 'patient', 'doctor', 'admin'
  symptoms: String,
  diagnosis: String,
  prescription: String,
  assignedDoctor: String,
  status: { type: String, default: 'Pending' }
});

const User = mongoose.model('User', UserSchema);

// Seed Doctors and Admin (For Demo Purposes)
const seedUsers = async () => {
  const doctors = ['Jonah Irande', 'Oluwatosin Daniel', 'Faith Bitrus'];
  for (let name of doctors) {
    await User.updateOne({ username: name }, { role: 'doctor' }, { upsert: true });
  }
  await User.updateOne({ username: 'admin' }, { role: 'admin' }, { upsert: true });
};
seedUsers();

// Routes
app.post('/api/register', async (req, res) => {
  const newUser = new User({ ...req.body, role: 'patient' });
  await newUser.save();
  res.send(newUser);
});

app.get('/api/patients', async (req, res) => {
  const patients = await User.find({ role: 'patient' });
  res.json(patients);
});

app.put('/api/assign', async (req, res) => {
  const { patientId, doctorName } = req.body;
  await User.findByIdAndUpdate(patientId, { assignedDoctor: doctorName, status: 'Assigned' });
  res.send({ msg: 'Assigned' });
});

app.put('/api/diagnose', async (req, res) => {
  const { patientId, diagnosis, prescription } = req.body;
  await User.findByIdAndUpdate(patientId, { diagnosis, prescription, status: 'Completed' });
  res.send({ msg: 'Treated' });
});

app.listen(5000, () => console.log('Server running on port 5000'));
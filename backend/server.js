const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGO_URI || 'mongodb://mongodb:27017/liveclinic';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
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
});

const User = mongoose.model('User', UserSchema);

const seedUsers = async () => {
  try {
    const doctors = ['Jonah Irande', 'Oluwatosin Daniel', 'Faith Bitrus'];
    for (let name of doctors) {
      await User.updateOne(
        { username: name }, 
        { role: 'doctor', password: 'p@ssw0rd' },
        { upsert: true }
      );
    }
    await User.updateOne(
      { username: 'admin' }, 
      { role: 'admin', password: 'p@ssw0rd' },
      { upsert: true }
    );
    console.log('✅ Database seeded with doctors and admin.');
  } catch (err) {
    console.error('❌ Error seeding database:', err);
  }
};

mongoose.connect(mongoURI)
  .then(() => {
    console.log('🚀 Connected to MongoDB successfully');
    seedUsers();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, symptoms, age, location } = req.body;
    const newUser = new User({ 
      username, 
      password,
      phone, 
      symptoms, 
      age, 
      location, 
      role: 'patient', 
      status: 'Pending' 
    });
    await newUser.save();
    res.status(201).send(newUser);
  } catch (err) {
    res.status(500).send({ error: "Failed to register patient" });
  }
});

app.get('/api/patients', async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' }).sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).send({ error: "Error fetching patient list" });
  }
});

app.put('/api/assign', async (req, res) => {
  try {
    const { patientId, doctorName } = req.body;
    await User.findByIdAndUpdate(patientId, { assignedDoctor: doctorName, status: 'Assigned' });
    res.send({ msg: 'Assigned successfully' });
  } catch (err) {
    res.status(500).send({ error: "Assignment failed" });
  }
});

app.put('/api/diagnose', async (req, res) => {
  try {
    const { patientId, diagnosis, prescription } = req.body;
    await User.findByIdAndUpdate(patientId, { diagnosis, prescription, status: 'Completed' });
    res.send({ msg: 'Treatment finalized' });
  } catch (err) {
    res.status(500).send({ error: "Diagnosis submission failed" });
  }
});

// --- NEW DELETE ROUTE FOR ADMIN ---
app.delete('/api/patients/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.send({ msg: 'Record deleted' });
  } catch (err) {
    res.status(500).send({ error: "Delete failed" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`📡 Backend Server active on port ${PORT}`));
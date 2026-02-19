const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Database Connection String (Prioritizing Environment Variable)
const mongoURI = process.env.MONGO_URI || 'mongodb://clinic_admin:p@ssw0rd_db_user@mongodb:27017/liveclinic?authSource=liveclinic';

// Schema Definition
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

// Seed Logic: Now wrapped in an async function to be called AFTER connection
const seedUsers = async () => {
  try {
    const doctors = ['Jonah Irande', 'Oluwatosin Daniel', 'Faith Bitrus'];
    for (let name of doctors) {
      await User.updateOne(
        { username: name }, 
        { role: 'doctor' }, 
        { upsert: true }
      );
    }
    await User.updateOne(
      { username: 'admin' }, 
      { role: 'admin' }, 
      { upsert: true }
    );
    console.log('✅ Database seeded with doctors and admin.');
  } catch (err) {
    console.error('❌ Error seeding database:', err);
  }
};

// Connect to MongoDB and start the seed process
mongoose.connect(mongoURI)
  .then(() => {
    console.log('🚀 Connected to MongoDB successfully');
    seedUsers(); // Seeding only happens once the connection is alive
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1); // Tell OpenShift the pod failed so it can restart
  });

// --- API Routes ---

app.post('/api/register', async (req, res) => {
  try {
    const newUser = new User({ ...req.body, role: 'patient' });
    await newUser.save();
    res.status(201).send(newUser);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.get('/api/patients', async (req, res) => {
  try {
    const patients = await User.find({ role: 'patient' });
    res.json(patients);
  } catch (err) {
    res.status(500).send(err);
  }
});

app.put('/api/assign', async (req, res) => {
  try {
    const { patientId, doctorName } = req.body;
    await User.findByIdAndUpdate(patientId, { 
      assignedDoctor: doctorName, 
      status: 'Assigned' 
    });
    res.send({ msg: 'Assigned' });
  } catch (err) {
    res.status(500).send(err);
  }
});

app.put('/api/diagnose', async (req, res) => {
  try {
    const { patientId, diagnosis, prescription } = req.body;
    await User.findByIdAndUpdate(patientId, { 
      diagnosis, 
      prescription, 
      status: 'Completed' 
    });
    res.send({ msg: 'Treated' });
  } catch (err) {
    res.status(500).send(err);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`📡 Server running on port ${PORT}`));
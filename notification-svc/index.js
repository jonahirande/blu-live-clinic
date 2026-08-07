const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

// Transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Helper mailer
const sendMail = async (to, subject, html) => {
  return transporter.sendMail({
    from: `"Blu Live Clinic" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

// --- API Endpoints ---

// 1. Patient Registration Notification
app.post('/api/notify/welcome', async (req, res) => {
  const { email, fullName } = req.body;
  try {
    await sendMail(
      email,
      'Welcome to Blu Live Clinic!',
      `<h2>Welcome ${fullName}!</h2><p>Your registration was successful.</p>`
    );
    res.status(200).json({ status: 'sent' });
  } catch (err) {
    console.error('Welcome email error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 2. Patient Assigned Doctor
app.post('/api/notify/patient-doctor-assigned', async (req, res) => {
  const { email, fullName, doctorName } = req.body;
  try {
    await sendMail(
      email,
      'Doctor Assigned',
      `<h2>Hello ${fullName}</h2><p>Dr. ${doctorName} has been assigned to your consultation.</p>`
    );
    res.status(200).json({ status: 'sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Doctor Assigned Patient
app.post('/api/notify/doctor-patient-assigned', async (req, res) => {
  const { doctorEmail, doctorName, patientName, reason } = req.body;
  try {
    await sendMail(
      doctorEmail,
      'New Patient Assigned',
      `<h2>Hello Dr. ${doctorName}</h2><p>You have a new patient: <strong>${patientName}</strong>.</p><p>Reason: ${reason || 'N/A'}</p>`
    );
    res.status(200).json({ status: 'sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Prescription Issued
app.post('/api/notify/prescription', async (req, res) => {
  const { email, fullName, doctorName, details } = req.body;
  try {
    await sendMail(
      email,
      'New Prescription Available',
      `<h2>Hello ${fullName}</h2><p>Dr. ${doctorName} prescribed:</p><blockquote>${details}</blockquote>`
    );
    res.status(200).json({ status: 'sent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🔔 Notification Service running on port ${PORT}`);
});

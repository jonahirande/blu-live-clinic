const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

// Transporter configuration with connection timeouts and IPv4 forcing
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // false for 587, true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // 16-character App Password
  },
  family: 4, // Force IPv4 to prevent hanging on IPv6 lookups inside Docker
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
  tls: {
    rejectUnauthorized: false // Prevents local SSL handshaking timeouts
  }
});

// Helper mailer
const sendMail = async (to, subject, html) => {
  if (!to) throw new Error('Recipient email is missing');
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
    console.log(`✅ Welcome email sent to ${email}`);
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
    console.log(`✅ Assignment email sent to patient: ${email}`);
    res.status(200).json({ status: 'sent' });
  } catch (err) {
    console.error('Patient assignment email error:', err.message);
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
    console.log(`✅ Assignment email sent to doctor: ${doctorEmail}`);
    res.status(200).json({ status: 'sent' });
  } catch (err) {
    console.error('Doctor assignment email error:', err.message);
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
    console.log(`✅ Prescription email sent to ${email}`);
    res.status(200).json({ status: 'sent' });
  } catch (err) {
    console.error('Prescription email error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🔔 Notification Service running on port ${PORT}`);
});

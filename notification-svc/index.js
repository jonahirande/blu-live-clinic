const express = require('express');
const nodemailer = require('nodemailer');
const amqp = require('amqplib');

const app = express();
app.use(express.json());

// Determine port and security settings dynamically
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const isSecure = process.env.SMTP_SECURE !== undefined 
  ? process.env.SMTP_SECURE === 'true' 
  : smtpPort === 465;

// Transporter configuration with connection timeouts and IPv4 forcing
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: smtpPort,
  secure: isSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // 16-character App Password
  },
  family: 4, // Force IPv4 to prevent hanging on IPv6 lookups
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  tls: {
    rejectUnauthorized: false
  }
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Error:', error.message);
  } else {
    console.log('⚡ SMTP Server connection verified and ready!');
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

// --- RabbitMQ Consumer Implementation ---
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:ClinicAdmin2026!@rabbitmq:5672';
const QUEUE_NAME = 'NOTIFICATIONS_QUEUE';

const startConsumer = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });

    // Process 1 message at a time per pod worker
    channel.prefetch(1);
    console.log('📬 Notification Consumer listening on RabbitMQ queue...');

    channel.consume(QUEUE_NAME, async (msg) => {
      if (msg !== null) {
        try {
          const { type, payload } = JSON.parse(msg.content.toString());
          console.log(`📩 Processing queued notification event: ${type}`);

          switch (type) {
            case 'WELCOME_EMAIL':
              await sendMail(
                payload.email,
                'Welcome to Blu Live Clinic!',
                `<h2>Welcome ${payload.fullName}!</h2><p>Your registration was successful.</p>`
              );
              console.log(`✅ Welcome email dispatched to ${payload.email}`);
              break;

            case 'PATIENT_ASSIGNED':
              await sendMail(
                payload.email,
                'Doctor Assigned',
                `<h2>Hello ${payload.fullName}</h2><p>Dr. ${payload.doctorName} has been assigned to your consultation.</p>`
              );
              console.log(`✅ Patient assignment email dispatched to ${payload.email}`);
              break;

            case 'DOCTOR_ASSIGNED':
              await sendMail(
                payload.doctorEmail,
                'New Patient Assigned',
                `<h2>Hello Dr. ${payload.doctorName}</h2><p>You have a new patient: <strong>${payload.patientName}</strong>.</p><p>Reason: ${payload.reason || 'N/A'}</p>`
              );
              console.log(`✅ Doctor assignment email dispatched to ${payload.doctorEmail}`);
              break;

            case 'PRESCRIPTION_ISSUED':
              await sendMail(
                payload.email,
                'New Prescription Available',
                `<h2>Hello ${payload.fullName}</h2><p>Dr. ${payload.doctorName} prescribed:</p><blockquote>${payload.details}</blockquote>`
              );
              console.log(`✅ Prescription email dispatched to ${payload.email}`);
              break;

            default:
              console.warn(`⚠️ Unrecognized event type: ${type}`);
          }

          // Acknowledge message processed successfully
          channel.ack(msg);
        } catch (err) {
          console.error('❌ Error processing notification event:', err.message);
          // Requeue message for retry if SMTP fails temporarily
          channel.nack(msg, false, true);
        }
      }
    });

    connection.on('error', (err) => {
      console.error('❌ Consumer RabbitMQ Error:', err.message);
      setTimeout(startConsumer, 5000);
    });

    connection.on('close', () => {
      console.warn('⚠️ Consumer RabbitMQ connection closed. Reconnecting...');
      setTimeout(startConsumer, 5000);
    });

  } catch (err) {
    console.error('❌ Failed to start RabbitMQ consumer:', err.message);
    setTimeout(startConsumer, 5000);
  }
};

// Start RabbitMQ queue listener
startConsumer();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🔔 Notification Service running on port ${PORT}`);
});

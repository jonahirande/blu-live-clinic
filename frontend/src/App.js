import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env?.VITE_API_URL || "/api";

const doctorPhotos = {
  "admin": "https://cdn-icons-png.flaticon.com/512/6024/6024190.png"
};

const healthTips = [
  { title: "Stay Hydrated", text: "Drinking at least 8 glasses of water daily helps maintain energy levels and skin health." },
  { title: "Rest Well", text: "Aim for 7-9 hours of sleep to allow your body to repair tissues and consolidate memory." },
  { title: "Move More", text: "Just 30 minutes of brisk walking can significantly improve cardiovascular health." },
  { title: "Fiber First", text: "Adding more greens and whole grains to your diet aids digestion and stabilizes blood sugar." }
];

function App() {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [view, setView] = useState('landing'); 
  const [loginErr, setLoginErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  
  // Registration and Form States (Included email)
  const [regData, setRegData] = useState({ 
    fullName: '', 
    username: '', 
    email: '', 
    password: '', 
    age: 'Adult (20-64)', 
    location: '', 
    symptoms: '' 
  });
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [resetData, setResetData] = useState({ username: '', newPassword: '' });
  const [newDoctorData, setNewDoctorData] = useState({ fullName: '', username: '', email: '', password: '' });
  const [showAddDoctor, setShowAddDoctor] = useState(false);

  const theme = { primary: '#1e40af', secondary: '#3b82f6', accent: '#10b981', danger: '#ef4444', bg: '#f8fafc', textDark: '#1e293b' };

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [pRes, dRes] = await Promise.all([
        axios.get(`${API}/patients`),
        axios.get(`${API}/doctors`)
      ]);
      setPatients(pRes.data);
      setDoctorsList(dRes.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 5000); 
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 3000);
  };

  // Auto suggest username when user types full name
  const handleFullNameChange = async (nameVal) => {
    setRegData(prev => ({ ...prev, fullName: nameVal }));
    if (nameVal.trim().length >= 2) {
      try {
        const res = await axios.post(`${API}/suggest-username`, { fullName: nameVal });
        setRegData(prev => ({ ...prev, fullName: nameVal, username: res.data.suggestedUsername }));
      } catch (err) {
        console.error("Auto-suggest error", err);
      }
    }
  };

  const handleDoctorFullNameChange = async (nameVal) => {
    setNewDoctorData(prev => ({ ...prev, fullName: nameVal }));
    if (nameVal.trim().length >= 2) {
      try {
        const res = await axios.post(`${API}/suggest-username`, { fullName: nameVal });
        setNewDoctorData(prev => ({ ...prev, fullName: nameVal, username: res.data.suggestedUsername }));
      } catch (err) {
        console.error("Doctor auto-suggest error", err);
      }
    }
  };

  const exportPatientReceipt = (p) => {
    const date = new Date().toLocaleDateString('en-GB');
    const reportTemplate = `
==========================================
        BLUCLINIC MEDICAL REPORT
==========================================
Date: ${date}
Patient Name: ${p.fullName} (@${p.username})
Email: ${p.email || 'N/A'}
Age Group: ${p.age}
Location: ${p.location}
------------------------------------------
Attending Doctor: ${p.assignedDoctor || 'N/A'}
------------------------------------------
SYMPTOMS REPORTED:
${p.symptoms}

DIAGNOSIS:
${p.diagnosis || 'Pending Assessment'}

PRESCRIPTION:
${p.prescription || 'N/A'}
------------------------------------------
This is a computer-generated medical record.
==========================================`;

    const file = new Blob([reportTemplate], {type: 'text/plain'});
    const element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = `Medical_Report_${p.username}.txt`;
    element.click();
    showToast("Professional Report Downloaded");
  };

  const downloadCSV = () => {
    const headers = "Full Name,Username,Email,Age,Location,Status,Doctor,Diagnosis\n";
    const rows = patients.map(p => `"${p.fullName}","${p.username}","${p.email || ''}","${p.age}","${p.location}","${p.status}","${p.assignedDoctor || 'N/A'}","${p.diagnosis || 'N/A'}"`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BluClinic_Activities.csv';
    a.click();
  };

  const adminResetPassword = async (id) => {
    const newPass = prompt("Enter new password for patient:");
    if (!newPass) return;
    try {
      await axios.put(`${API}/reset-password`, { patientId: id, newPassword: newPass });
      showToast("Password Reset Successfully");
      loadData(true);
    } catch (err) { showToast("Reset Failed", "danger"); }
  };

  const handleSelfResetPassword = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/user/reset-password`, resetData);
      showToast("Password updated successfully! Please login.");
      setView('login');
      setResetData({ username: '', newPassword: '' });
    } catch (err) {
      showToast(err.response?.data?.error || "Reset Failed", "danger");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/register`, regData);
      showToast("Consultation Submitted!");
      setView('login');
      setRegData({ fullName: '', username: '', email: '', password: '', age: 'Adult (20-64)', location: '', symptoms: '' });
    } catch (err) { 
      showToast(err.response?.data?.error || "Error connecting to server", "danger"); 
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/login`, loginData);
      setUser({ 
        fullName: res.data.fullName, 
        username: res.data.username, 
        email: res.data.email,
        role: res.data.role, 
        id: res.data._id 
      });
      setLoginErr("");
    } catch (err) {
      setLoginErr(err.response?.data?.error || "Invalid Credentials");
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/doctors`, newDoctorData);
      showToast("Doctor Added Successfully!");
      setNewDoctorData({ fullName: '', username: '', email: '', password: '' });
      setShowAddDoctor(false);
      loadData(true);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to add doctor", "danger");
    }
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: theme.bg }}><div className="spinner"></div><style>{`.spinner{width:40px;height:40px;border:4px solid #ddd;border-top-color:${theme.primary};border-radius:50%;animation:s 1s linear infinite}@keyframes s{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {toast.show && <div style={{ position: 'fixed', top: 20, right: 20, background: toast.type==='success'?theme.accent:theme.danger, color:'white', padding:'12px 24px', borderRadius:8, zIndex:1000 }}>{toast.msg}</div>}

      <nav style={{ background: 'white', padding: '0 5%', height: '75px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setView('landing')}>
          <div style={{ background: theme.primary, width: 35, height: 35, borderRadius: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>B</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>BLUCLINIC+</h2>
        </div>
        
        {/* LOGGED IN USER PROFILE DISPLAY IN NAVBAR */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <img src={doctorPhotos[user.username] || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="User" style={{ width: 42, height: 42, borderRadius: '50%', border: `2px solid ${theme.primary}`, objectFit: 'cover' }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontWeight: 700, fontSize: '15px', color: theme.textDark }}>{user.fullName}</span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>@{user.username}</span>
              <span style={{ fontSize: '11px', textTransform: 'capitalize', fontWeight: 'bold', color: theme.primary }}>
                {user.role}
              </span>
            </div>
            <button onClick={() => {setUser(null); setView('landing');}} style={{ background: '#fef2f2', color: theme.danger, border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', marginLeft: 10 }}>Sign Out</button>
          </div>
        )}
      </nav>

      <main style={{ padding: '40px 5%' }}>
        
        {!user && view === 'landing' && (
          <div style={{ maxWidth: '1000px', margin: 'auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 style={{ fontSize: '60px', fontWeight: 900, marginBottom: '20px' }}>Your Health, <span style={{color: theme.secondary}}>Simplified.</span></h1>
                <p style={{ fontSize: '20px', color: '#64748b', marginBottom: '40px' }}>Professional medical care and records at your fingertips.</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                    <button onClick={() => setView('register')} style={{ padding: '18px 36px', background: theme.primary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Start Consultation</button>
                    <button onClick={() => setView('login')} style={{ padding: '18px 36px', background: 'white', color: theme.primary, border: `2px solid ${theme.primary}`, borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Patient Login</button>
                    <button onClick={() => setView('login')} style={{ padding: '18px 36px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Staff Portal</button>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                {healthTips.map((tip, i) => (
                    <div key={i} style={{ background: 'white', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ color: theme.primary, marginTop: 0 }}>{tip.title}</h4>
                        <p style={{ fontSize: '14px', margin: 0, color: '#64748b' }}>{tip.text}</p>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* CONSULTATION REGISTRATION */}
        {!user && view === 'register' && (
          <div style={{ maxWidth: 550, margin: 'auto', background: 'white', padding: 40, borderRadius: 24, boxShadow: '0 20px 25px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginBottom: '25px' }}>New Consultation</h2>
            <form onSubmit={handleRegister} style={{ display: 'grid', gap: 18 }}>
              <input 
                placeholder="Full Name" 
                required 
                value={regData.fullName}
                style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} 
                onChange={e => handleFullNameChange(e.target.value)} 
              />
              
              {/* EMAIL INPUT FIELD */}
              <input 
                type="email" 
                placeholder="Email Address (for Notifications)" 
                required 
                value={regData.email}
                style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} 
                onChange={e => setRegData({...regData, email: e.target.value})} 
              />

              <div>
                <input 
                  placeholder="Unique Username" 
                  required 
                  value={regData.username}
                  style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd', width: '100%', boxSizing: 'border-box' }} 
                  onChange={e => setRegData({...regData, username: e.target.value})} 
                />
                <small style={{ color: '#64748b', fontSize: 12, marginTop: 4, display: 'block' }}>
                  System suggested a unique username. You can modify it if you prefer.
                </small>
              </div>

              <input type="password" placeholder="Password" required style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} onChange={e => setRegData({...regData, password: e.target.value})} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <select style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} value={regData.age} onChange={e => setRegData({...regData, age: e.target.value})}>
                  <option value="Infant (0-2)">Infant (0-2)</option>
                  <option value="Child (3-12)">Child (3-12)</option>
                  <option value="Teenager (13-19)">Teenager (13-19)</option>
                  <option value="Adult (20-64)">Adult (20-64)</option>
                  <option value="Senior (65+)">Senior (65+)</option>
                </select>
                <input placeholder="Location" required style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} onChange={e => setRegData({...regData, location: e.target.value})} />
              </div>
              <textarea placeholder="Describe your symptoms..." required style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd', height: 120 }} onChange={e => setRegData({...regData, symptoms: e.target.value})} />
              <button type="submit" style={{ padding: 18, background: theme.accent, color: 'white', border: 'none', borderRadius: 12, fontWeight: 'bold', cursor: 'pointer' }}>Submit Consultation</button>
              <p onClick={() => setView('landing')} style={{ textAlign: 'center', color: '#64748b', cursor: 'pointer' }}>Cancel</p>
            </form>
          </div>
        )}

        {/* LOGIN VIEW */}
        {!user && view === 'login' && (
          <div style={{ maxWidth: 400, margin: 'auto', background: 'white', padding: 40, borderRadius: 24, boxShadow: '0 20px 25px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: 25 }}>Access Portal</h2>
            {loginErr && <div style={{ color: theme.danger, marginBottom: 15, textAlign: 'center' }}>{loginErr}</div>}
            <form onSubmit={handleLogin} style={{ display: 'grid', gap: 15 }}>
                <input placeholder="Unique Username" required style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} onChange={e => setLoginData({...loginData, username: e.target.value})} />
                <input type="password" placeholder="Password" required style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} onChange={e => setLoginData({...loginData, password: e.target.value})} />
                <button type="submit" style={{ padding: 16, background: theme.primary, color: 'white', border: 'none', borderRadius: 12, fontWeight: '700', cursor: 'pointer' }}>Login</button>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span onClick={() => setView('forgot-pass')} style={{ color: theme.secondary, cursor: 'pointer' }}>Forgot Password?</span>
                  <span onClick={() => setView('landing')} style={{ color: '#64748b', cursor: 'pointer' }}>Back</span>
                </div>
            </form>
          </div>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {!user && view === 'forgot-pass' && (
          <div style={{ maxWidth: 400, margin: 'auto', background: 'white', padding: 40, borderRadius: 24, boxShadow: '0 20px 25px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: 25 }}>Reset Password</h2>
            <form onSubmit={handleSelfResetPassword} style={{ display: 'grid', gap: 15 }}>
                <input placeholder="Your Unique Username" required style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} onChange={e => setResetData({...resetData, username: e.target.value})} />
                <input type="password" placeholder="New Password" required style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} onChange={e => setResetData({...resetData, new
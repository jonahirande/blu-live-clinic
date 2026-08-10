import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env?.VITE_API_URL || "/api";

const doctorPhotos = {
  "admin": "https://cdn-icons-png.flaticon.com/512/6024/6024190.png"
};

// 20 Curated Health Tips Across 5 Categories
const expandedHealthTips = [
  { id: 1, category: "Lifestyle", title: "Hydrate Daily", text: "Drink at least 8 glasses of water daily to maintain cognitive focus and cellular health.", icon: "💧" },
  { id: 2, category: "Lifestyle", title: "Prioritize Sleep", text: "Target 7–9 hours of deep sleep daily to support immune function and memory retention.", icon: "🌙" },
  { id: 3, category: "Exercise", title: "Daily Movement", text: "30 minutes of moderate physical activity significantly boosts cardiovascular resilience.", icon: "🏃" },
  { id: 4, category: "Nutrition", title: "Fiber First", text: "Integrate whole grains and greens to balance glucose levels and improve digestion.", icon: "🥗" },
  { id: 5, category: "Mental Health", title: "Mindful Breathing", text: "Practice 5-minute deep breathing exercises daily to lower stress and cortisol levels.", icon: "🧘" },
  { id: 6, category: "Eye Health", title: "20-20-20 Rule", text: "Every 20 minutes on screens, look 20 feet away for 20 seconds to prevent digital strain.", icon: "👁️" },
  { id: 7, category: "Nutrition", title: "Cut Refined Sugar", text: "Swap processed sodas and sweets with fresh fruits to stabilize your energy levels.", icon: "🍎" },
  { id: 8, category: "Mental Health", title: "Sunlight Exposure", text: "Get 15 minutes of direct morning sunlight to calibrate your circadian sleep rhythm.", icon: "☀️" },
  { id: 9, category: "Lifestyle", title: "Posture Check", text: "Keep your spine aligned and shoulders relaxed while seated to reduce back tension.", icon: "🪑" },
  { id: 10, category: "Exercise", title: "Strength Training", text: "Engage in resistance training twice weekly to preserve bone density and strength.", icon: "🏋️" },
  { id: 11, category: "Nutrition", title: "Healthy Fats", text: "Consume avocados, seeds, and olive oil to promote brain and heart longevity.", icon: "🥑" },
  { id: 12, category: "Lifestyle", title: "Limit Alcohol", text: "Reduce alcohol intake to protect liver function and improve sleep recovery quality.", icon: "🍷" },
  { id: 13, category: "Mental Health", title: "Digital Detox", text: "Disconnect from screen notifications 1 hour before sleep for restorative rest.", icon: "📱" },
  { id: 14, category: "Nutrition", title: "Probiotic Boost", text: "Incorporate fermented foods like yogurt to strengthen your gut microbiome.", icon: "🥛" },
  { id: 15, category: "Lifestyle", title: "Hand Hygiene", text: "Wash hands for 20 seconds with soap to prevent seasonal respiratory infections.", icon: "🧼" },
  { id: 16, category: "Exercise", title: "Stretching Routine", text: "Perform light hamstring and hip mobility stretches daily to increase flexibility.", icon: "🤸" },
  { id: 17, category: "Nutrition", title: "Reduce Sodium", text: "Keep daily sodium under 2,300mg to maintain optimal blood pressure levels.", icon: "🧂" },
  { id: 18, category: "Mental Health", title: "Social Connection", text: "Regular meaningful social interactions significantly lower cognitive decline risk.", icon: "🤝" },
  { id: 19, category: "Lifestyle", title: "Regular Checkups", text: "Schedule annual preventive diagnostic screenings to catch potential issues early.", icon: "🩺" },
  { id: 20, category: "Nutrition", title: "Green Tea Boost", text: "Switch to green tea for high antioxidant intake and calm, focused caffeine delivery.", icon: "🍵" }
];

function App() {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctorsList, setDoctorsList] = useState([]);
  const [view, setView] = useState('landing'); 
  const [loginErr, setLoginErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  
  // Landing Page Filter State
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Admin View Navigation State
  const [adminTab, setAdminTab] = useState('overview');

  // Form States
  const [regData, setRegData] = useState({ 
    fullName: '', username: '', email: '', password: '', age: 'Adult (20-64)', location: '', symptoms: '' 
  });
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [resetData, setResetData] = useState({ username: '', newPassword: '' });
  const [newDoctorData, setNewDoctorData] = useState({ fullName: '', username: '', email: '', password: '' });
  const [showAddDoctor, setShowAddDoctor] = useState(false);

  // Doctor Consultation Modal State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [diagData, setDiagData] = useState({ diagnosis: '', prescription: '' });

  const theme = { 
    primary: '#1e40af', 
    secondary: '#3b82f6', 
    accent: '#10b981', 
    danger: '#ef4444', 
    bg: '#f8fafc', 
    textDark: '#0f172a' 
  };

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [pRes, dRes] = await Promise.all([
        axios.get(`${API}/patients`),
        axios.get(`${API}/doctors`)
      ]);
      setPatients(pRes.data);
      setDoctorsList(dRes.data);
    } catch (err) { 
      console.error(err); 
    } finally { 
      if (!isSilent) setLoading(false); 
    }
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

  // API Call Actions
  const handleAssignDoctor = async (patientId, doctorUsername) => {
    if (!doctorUsername) return;
    try {
      await axios.put(`${API}/assign`, { patientId, doctorUsername });
      showToast("Doctor assigned successfully!");
      loadData(true);
    } catch (err) {
      showToast(err.response?.data?.error || "Assignment Failed", "danger");
    }
  };

  const handleFinalizeDiagnosis = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    try {
      await axios.put(`${API}/diagnose`, {
        patientId: selectedPatient._id,
        diagnosis: diagData.diagnosis,
        prescription: diagData.prescription
      });
      showToast("Consultation finalized & notification dispatched!");
      setSelectedPatient(null);
      setDiagData({ diagnosis: '', prescription: '' });
      loadData(true);
    } catch (err) {
      showToast(err.response?.data?.error || "Diagnosis submission failed", "danger");
    }
  };

  const handleFullNameChange = async (nameVal) => {
    setRegData(prev => ({ ...prev, fullName: nameVal }));
    if (nameVal.trim().length >= 2) {
      try {
        const res = await axios.post(`${API}/suggest-username`, { fullName: nameVal });
        setRegData(prev => ({ ...prev, fullName: nameVal, username: res.data.suggestedUsername }));
      } catch (err) { console.error("Auto-suggest error", err); }
    }
  };

  const handleDoctorFullNameChange = async (nameVal) => {
    setNewDoctorData(prev => ({ ...prev, fullName: nameVal }));
    if (nameVal.trim().length >= 2) {
      try {
        const res = await axios.post(`${API}/suggest-username`, { fullName: nameVal });
        setNewDoctorData(prev => ({ ...prev, fullName: nameVal, username: res.data.suggestedUsername }));
      } catch (err) { console.error("Doctor auto-suggest error", err); }
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
This is an automated computer-generated record.
==========================================`;

    const file = new Blob([reportTemplate], {type: 'text/plain'});
    const element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = `Medical_Report_${p.username}.txt`;
    element.click();
    showToast("Report Downloaded Successfully");
  };

  const downloadCSV = () => {
    const headers = "Full Name,Username,Email,Age,Location,Status,Doctor,Diagnosis,Created Date\n";
    const rows = patients.map(p => `"${p.fullName}","${p.username}","${p.email || ''}","${p.age}","${p.location}","${p.status}","${p.assignedDoctor || 'N/A'}","${p.diagnosis || 'N/A'}","${p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB') : 'N/A'}"`).join("\n");
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

  // Helper Analytics Methods
  const getPatientStatus = (p) => {
    if (!p.assignedDoctor || p.assignedDoctor === 'Unassigned') {
      return { key: 'unassigned', label: 'Waiting Doctor Assignment', bg: '#fef3c7', color: '#b45309' };
    }
    if (p.status === 'Completed' || p.diagnosis) {
      return { key: 'completed', label: 'Consultation Completed', bg: '#dcfce7', color: '#15803d' };
    }
    return { key: 'awaiting_doc', label: 'Awaiting Doctor Assessment', bg: '#e0f2fe', color: '#0369a1' };
  };

  const getDailyRegistrations = () => {
    const dailyMap = {};
    patients.forEach(p => {
      const dateKey = p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-GB') : 'Recent Logs';
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { total: 0, unassigned: 0, awaiting_doc: 0, completed: 0, items: [] };
      }
      const statusInfo = getPatientStatus(p);
      dailyMap[dateKey].total += 1;
      dailyMap[dateKey][statusInfo.key] += 1;
      dailyMap[dateKey].items.push(p);
    });
    return dailyMap;
  };

  const filteredTips = selectedCategory === "All" 
    ? expandedHealthTips 
    : expandedHealthTips.filter(t => t.category === selectedCategory);

  const marqueeTips = [...filteredTips, ...filteredTips];

  if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: theme.bg }}><div className="spinner"></div><style>{`.spinner{width:40px;height:40px;border:4px solid #ddd;border-top-color:${theme.primary};border-radius:50%;animation:s 1s linear infinite}@keyframes s{to{transform:rotate(360deg)}}`}</style></div>;

  const dailyData = getDailyRegistrations();

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Styles for Infinite Marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          gap: 20px;
          width: max-content;
          animation: marquee 35s linear infinite;
        }
        .marquee-container:hover .marquee-track {
          animation-play-state: paused;
        }
        .tip-card {
          transition: all 0.3s ease;
        }
        .tip-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.15);
        }
      `}</style>

      {toast.show && <div style={{ position: 'fixed', top: 20, right: 20, background: toast.type==='success'?theme.accent:theme.danger, color:'white', padding:'12px 24px', borderRadius:8, zIndex:1000 }}>{toast.msg}</div>}

      <nav style={{ background: 'white', padding: '0 5%', height: '75px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setView('landing')}>
          <div style={{ background: theme.primary, width: 38, height: 38, borderRadius: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold', fontSize: 20 }}>B</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>BLUCLINIC+</h2>
        </div>
        
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <img src={doctorPhotos[user.username] || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} alt="User" style={{ width: 42, height: 42, borderRadius: '50%', border: `2px solid ${theme.primary}`, objectFit: 'cover' }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ fontWeight: 700, fontSize: '15px', color: theme.textDark }}>{user.fullName}</span>
              <span style={{ fontSize: '13px', color: '#64748b' }}>@{user.username}</span>
            </div>
            <button onClick={() => {setUser(null); setView('landing');}} style={{ background: '#fef2f2', color: theme.danger, border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', marginLeft: 10 }}>Sign Out</button>
          </div>
        )}
      </nav>

      <main style={{ padding: user ? '40px 5%' : '0' }}>
        
        {/* ENHANCED LANDING PAGE VIEW */}
        {!user && view === 'landing' && (
          <div style={{ width: '100%', overflowX: 'hidden' }}>
            
            {/* HERO SECTION */}
            <div style={{ maxWidth: '1100px', margin: 'auto', textAlign: 'center', padding: '60px 20px 40px' }}>
                <span style={{ background: '#dbeafe', color: theme.primary, padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  🏥 Next-Gen Digital Healthcare Portal
                </span>
                <h1 style={{ fontSize: '64px', fontWeight: 900, marginTop: '20px', marginBottom: '15px', color: theme.textDark, lineHeight: 1.1 }}>
                  Your Health, <span style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Simplified.</span>
                </h1>
                <p style={{ fontSize: '20px', color: '#64748b', maxWidth: '680px', margin: '0 auto 35px', lineHeight: 1.5 }}>
                  Seamless consultations, instant doctor triage, automated diagnostics dispatch, and real-time medical tracking.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
                    <button onClick={() => setView('register')} style={{ padding: '16px 36px', background: theme.primary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 20px -5px rgba(30, 64, 175, 0.4)' }}>
                      🚀 Start Consultation
                    </button>
                    <button onClick={() => setView('login')} style={{ padding: '16px 36px', background: 'white', color: theme.primary, border: `2px solid ${theme.primary}`, borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
                      Patient Login
                    </button>
                    <button onClick={() => setView('login')} style={{ padding: '16px 36px', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
                      Staff Portal
                    </button>
                </div>
            </div>

            {/* DYNAMIC HEALTH TICKER SECTION */}
            <div style={{ marginTop: '20px', background: 'white', padding: '40px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
              
              <div style={{ maxWidth: '1100px', margin: '0 auto 20px', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 15 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: theme.textDark }}>💡 Daily Preventive Health Guide</h3>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 14 }}>Hover over any card to pause scrolling & read details.</p>
                </div>

                {/* Category Filter Pills */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {["All", "Lifestyle", "Exercise", "Nutrition", "Mental Health"].map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setSelectedCategory(cat)}
                      style={{ 
                        padding: '6px 14px', 
                        borderRadius: 20, 
                        border: 'none', 
                        fontSize: 13, 
                        fontWeight: 'bold', 
                        cursor: 'pointer',
                        background: selectedCategory === cat ? theme.primary : '#f1f5f9',
                        color: selectedCategory === cat ? 'white' : '#64748b'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* MOVING MARQUEE TRACK */}
              <div className="marquee-container" style={{ width: '100%', overflow: 'hidden', cursor: 'grab' }}>
                <div className="marquee-track">
                  {marqueeTips.map((tip, idx) => (
                    <div 
                      key={`${tip.id}-${idx}`} 
                      className="tip-card" 
                      style={{ 
                        width: '300px', 
                        background: '#f8fafc', 
                        padding: '22px', 
                        borderRadius: '16px', 
                        border: '1px solid #e2e8f0',
                        flexShrink: 0 
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span style={{ fontSize: 28 }}>{tip.icon}</span>
                        <span style={{ fontSize: 11, fontWeight: 'bold', background: '#dbeafe', color: theme.primary, padding: '3px 8px', borderRadius: 6 }}>
                          {tip.category}
                        </span>
                      </div>
                      <h4 style={{ margin: '0 0 8px', fontSize: 16, color: theme.textDark }}>{tip.title}</h4>
                      <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{tip.text}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* CONSULTATION REGISTRATION FORM */}
        {!user && view === 'register' && (
          <div style={{ maxWidth: 550, margin: '40px auto', background: 'white', padding: 40, borderRadius: 24, boxShadow: '0 20px 25px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginBottom: '25px' }}>New Consultation</h2>
            <form onSubmit={handleRegister} style={{ display: 'grid', gap: 18 }}>
              <input 
                placeholder="Full Name" 
                required 
                value={regData.fullName}
                style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} 
                onChange={e => handleFullNameChange(e.target.value)} 
              />
              
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
                  System auto-suggested a unique username. Modify if preferred.
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
          <div style={{ maxWidth: 400, margin: '40px auto', background: 'white', padding: 40, borderRadius: 24, boxShadow: '0 20px 25px rgba(0,0,0,0.05)' }}>
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
          <div style={{ maxWidth: 400, margin: '40px auto', background: 'white', padding: 40, borderRadius: 24, boxShadow: '0 20px 25px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: 25 }}>Reset Password</h2>
            <form onSubmit={handleSelfResetPassword} style={{ display: 'grid', gap: 15 }}>
                <input placeholder="Your Unique Username" required style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} onChange={e => setResetData({...resetData, username: e.target.value})} />
                <input type="password" placeholder="New Password" required style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} onChange={e => setResetData({...resetData, newPassword: e.target.value})} />
                <button type="submit" style={{ padding: 16, background: theme.primary, color: 'white', border: 'none', borderRadius: 12, fontWeight: '700', cursor: 'pointer' }}>Update Password</button>
                <p onClick={() => setView('login')} style={{ textAlign: 'center', color: '#64748b', cursor: 'pointer' }}>Back to Login</p>
            </form>
          </div>
        )}

        {/* ADMIN DASHBOARD */}
        {user && user.role === 'admin' && (
          <div style={{ display: 'grid', gap: 25 }}>
            
            {/* Header & Main Actions */}
            <div style={{ background: 'white', padding: 25, borderRadius: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Admin Executive Portal</h1>
                <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: 14 }}>Real-time clinic metrics, doctor workload, and patient status monitoring.</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowAddDoctor(!showAddDoctor)} style={{ padding: '12px 20px', background: theme.primary, color: 'white', border: 'none', borderRadius: 10, fontWeight: 'bold', cursor: 'pointer' }}>
                  {showAddDoctor ? "Close Form" : "+ Add Doctor"}
                </button>
                <button onClick={downloadCSV} style={{ padding: '12px 20px', background: theme.accent, color: 'white', border: 'none', borderRadius: 10, fontWeight: 'bold', cursor: 'pointer' }}>
                  Export Activity CSV
                </button>
              </div>
            </div>

            {/* Add Doctor Form Collapsible */}
            {showAddDoctor && (
              <form onSubmit={handleAddDoctor} style={{ display: 'grid', gap: 12, background: 'white', padding: 25, borderRadius: 20, border: `2px solid ${theme.primary}` }}>
                <h3 style={{ margin: 0, color: theme.primary }}>Register New Medical Doctor</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <input placeholder="Full Name" required value={newDoctorData.fullName} onChange={e => handleDoctorFullNameChange(e.target.value)} style={{ padding: 12, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                  <input placeholder="Email" type="email" required value={newDoctorData.email} onChange={e => setNewDoctorData({...newDoctorData, email: e.target.value})} style={{ padding: 12, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                  <input placeholder="Username" required value={newDoctorData.username} onChange={e => setNewDoctorData({...newDoctorData, username: e.target.value})} style={{ padding: 12, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                  <input placeholder="Password" type="password" required value={newDoctorData.password} onChange={e => setNewDoctorData({...newDoctorData, password: e.target.value})} style={{ padding: 12, borderRadius: 8, border: '1px solid #cbd5e1' }} />
                </div>
                <button type="submit" style={{ padding: 12, background: theme.primary, color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', width: '200px' }}>Save Doctor Profile</button>
              </form>
            )}

            {/* TOP METRIC CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
              <div style={{ background: 'white', padding: 20, borderRadius: 16, borderLeft: `6px solid ${theme.primary}` }}>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 'bold' }}>TOTAL PATIENTS</span>
                <div style={{ fontSize: 28, fontWeight: 900, color: theme.textDark, marginTop: 4 }}>{patients.length}</div>
              </div>
              <div style={{ background: 'white', padding: 20, borderRadius: 16, borderLeft: `6px solid #b45309` }}>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 'bold' }}>WAITING FOR DOCTOR</span>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#b45309', marginTop: 4 }}>
                  {patients.filter(p => !p.assignedDoctor || p.assignedDoctor === 'Unassigned').length}
                </div>
              </div>
              <div style={{ background: 'white', padding: 20, borderRadius: 16, borderLeft: `6px solid #0369a1` }}>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 'bold' }}>AWAITING DIAGNOSIS</span>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#0369a1', marginTop: 4 }}>
                  {patients.filter(p => p.assignedDoctor && p.assignedDoctor !== 'Unassigned' && p.status !== 'Completed' && !p.diagnosis).length}
                </div>
              </div>
              <div style={{ background: 'white', padding: 20, borderRadius: 16, borderLeft: `6px solid ${theme.accent}` }}>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 'bold' }}>COMPLETED</span>
                <div style={{ fontSize: 28, fontWeight: 900, color: theme.accent, marginTop: 4 }}>
                  {patients.filter(p => p.status === 'Completed' || p.diagnosis).length}
                </div>
              </div>
              <div style={{ background: 'white', padding: 20, borderRadius: 16, borderLeft: `6px solid #8b5cf6` }}>
                <span style={{ fontSize: 13, color: '#64748b', fontWeight: 'bold' }}>ACTIVE DOCTORS</span>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#8b5cf6', marginTop: 4 }}>{doctorsList.length}</div>
              </div>
            </div>

            {/* TAB NAVIGATION */}
            <div style={{ display: 'flex', gap: 10, borderBottom: '2px solid #e2e8f0', paddingBottom: 10 }}>
              <button 
                onClick={() => setAdminTab('overview')} 
                style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: adminTab==='overview'?theme.primary:'#e2e8f0', color: adminTab==='overview'?'white':theme.textDark, fontWeight: 'bold', cursor: 'pointer' }}
              >
                📊 Daily Analytics & Status Breakdown
              </button>
              <button 
                onClick={() => setAdminTab('doctors')} 
                style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: adminTab==='doctors'?theme.primary:'#e2e8f0', color: adminTab==='doctors'?'white':theme.textDark, fontWeight: 'bold', cursor: 'pointer' }}
              >
                👨‍⚕️ Doctors Workload ({doctorsList.length})
              </button>
              <button 
                onClick={() => setAdminTab('patients')} 
                style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: adminTab==='patients'?theme.primary:'#e2e8f0', color: adminTab==='patients'?'white':theme.textDark, fontWeight: 'bold', cursor: 'pointer' }}
              >
                📋 All Patient Records ({patients.length})
              </button>
            </div>

            {/* TAB 1: DAILY REGISTRATION & STATUS BREAKDOWN */}
            {adminTab === 'overview' && (
              <div style={{ background: 'white', padding: 25, borderRadius: 20 }}>
                <h3 style={{ margin: '0 0 15px' }}>Daily Registrations & Pipeline Breakdown</h3>
                {Object.keys(dailyData).length === 0 ? (
                  <p style={{ color: '#64748b' }}>No patient records available.</p>
                ) : (
                  <div style={{ display: 'grid', gap: 20 }}>
                    {Object.entries(dailyData).map(([date, data]) => (
                      <div key={date} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
                          <span style={{ fontSize: 18, fontWeight: 'bold', color: theme.primary }}>🗓️ Date: {date}</span>
                          <span style={{ background: '#f1f5f9', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 'bold' }}>
                            Total Registered: {data.total} Patients
                          </span>
                        </div>

                        {/* Status Counters */}
                        <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap', marginBottom: 15 }}>
                          <span style={{ padding: '6px 12px', background: '#fef3c7', color: '#b45309', borderRadius: 8, fontSize: 13, fontWeight: 'bold' }}>
                            ⏳ Waiting Assignment: {data.unassigned}
                          </span>
                          <span style={{ padding: '6px 12px', background: '#e0f2fe', color: '#0369a1', borderRadius: 8, fontSize: 13, fontWeight: 'bold' }}>
                            🩺 Waiting Doctor Assessment: {data.awaiting_doc}
                          </span>
                          <span style={{ padding: '6px 12px', background: '#dcfce7', color: '#15803d', borderRadius: 8, fontSize: 13, fontWeight: 'bold' }}>
                            ✅ Completed: {data.completed}
                          </span>
                        </div>

                        {/* Patient List */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                          <thead>
                            <tr style={{ textAlign: 'left', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                              <th style={{ padding: 8 }}>Patient</th>
                              <th style={{ padding: 8 }}>Email</th>
                              <th style={{ padding: 8 }}>Assigned Doctor</th>
                              <th style={{ padding: 8 }}>Current Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.items.map(p => {
                              const s = getPatientStatus(p);
                              return (
                                <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                  <td style={{ padding: 8, fontWeight: 600 }}>{p.fullName} (@{p.username})</td>
                                  <td style={{ padding: 8 }}>{p.email || 'N/A'}</td>
                                  <td style={{ padding: 8 }}>{p.assignedDoctor || 'Unassigned'}</td>
                                  <td style={{ padding: 8 }}>
                                    <span style={{ padding: '3px 8px', borderRadius: 6, fontSize: 12, fontWeight: 'bold', background: s.bg, color: s.color }}>
                                      {s.label}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: DOCTORS & WORKLOAD */}
            {adminTab === 'doctors' && (
              <div style={{ background: 'white', padding: 25, borderRadius: 20 }}>
                <h3 style={{ margin: '0 0 15px' }}>Doctor Workload & Patient Allocation</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                  {doctorsList.map(doc => {
                    const assignedList = patients.filter(p => (p.assignedDoctor || '').toLowerCase() === doc.username.toLowerCase());
                    return (
                      <div key={doc._id || doc.username} style={{ border: '1px solid #cbd5e1', borderRadius: 16, padding: 20, background: '#f8fafc' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <img src="https://cdn-icons-png.flaticon.com/512/6024/6024190.png" alt="Doctor" style={{ width: 45, height: 45, borderRadius: '50%' }} />
                          <div>
                            <h4 style={{ margin: 0, fontSize: 16 }}>Dr. {doc.fullName}</h4>
                            <span style={{ fontSize: 12, color: '#64748b' }}>@{doc.username} | {doc.email}</span>
                          </div>
                        </div>

                        <div style={{ background: theme.primary, color: 'white', padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 }}>
                          Assigned Patients: {assignedList.length}
                        </div>

                        {assignedList.length === 0 ? (
                          <p style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>No patients assigned yet.</p>
                        ) : (
                          <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: theme.textDark }}>
                            {assignedList.map(p => (
                              <li key={p._id} style={{ marginBottom: 6 }}>
                                <strong>{p.fullName}</strong> - <span style={{ color: p.status === 'Completed' ? theme.accent : '#b45309' }}>{p.status}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: ALL PATIENT DIRECTORY */}
            {adminTab === 'patients' && (
              <div style={{ background: 'white', padding: 25, borderRadius: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <h3 style={{ margin: 0 }}>All Registered Patients Directory</h3>
                  <input 
                    placeholder="Search patient name..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                  />
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '2px solid #edf2f7' }}>
                      <th style={{ padding: 10 }}>Patient Name</th>
                      <th style={{ padding: 10 }}>Email</th>
                      <th style={{ padding: 10 }}>Status</th>
                      <th style={{ padding: 10 }}>Assign Doctor</th>
                      <th style={{ padding: 10 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients
                      .filter(p => p.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(p => (
                        <tr key={p._id} style={{ borderBottom: '1px solid #edf2f7' }}>
                          <td style={{ padding: 10, fontWeight: 600 }}>{p.fullName} (@{p.username})</td>
                          <td style={{ padding: 10 }}>{p.email || 'N/A'}</td>
                          <td style={{ padding: 10 }}>
                            <span style={{ padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 'bold', background: p.status === 'Completed' ? '#dcfce7' : '#fef3c7', color: p.status === 'Completed' ? '#166534' : '#92400e' }}>
                              {p.status}
                            </span>
                          </td>
                          <td style={{ padding: 10 }}>
                            <select 
                              value={p.assignedDoctor || ""} 
                              onChange={(e) => handleAssignDoctor(p._id, e.target.value)}
                              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', cursor: 'pointer' }}
                            >
                              <option value="" disabled>-- Select Doctor --</option>
                              {doctorsList.map(doc => (
                                <option key={doc._id || doc.username} value={doc.username}>
                                  Dr. {doc.fullName} (@{doc.username})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: 10 }}>
                            <button onClick={() => adminResetPassword(p._id)} style={{ padding: '4px 8px', background: '#e2e8f0', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Reset Pass</button>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        )}

        {/* DOCTOR DASHBOARD */}
        {user && user.role === 'doctor' && (
          <div style={{ background: 'white', padding: 30, borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2>Doctor Portal: Assigned Consultations</h2>
              <input 
                placeholder="Search patient name..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
                style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #cbd5e1' }}
              />
            </div>

            {selectedPatient && (
              <div style={{ background: '#f1f5f9', padding: 20, borderRadius: 12, marginBottom: 25, border: `2px solid ${theme.primary}` }}>
                <h3 style={{ marginTop: 0 }}>Treat Patient: {selectedPatient.fullName}</h3>
                <p style={{ fontSize: 14 }}><strong>Reported Symptoms:</strong> {selectedPatient.symptoms}</p>
                <form onSubmit={handleFinalizeDiagnosis} style={{ display: 'grid', gap: 12 }}>
                  <textarea 
                    placeholder="Enter Medical Diagnosis..." 
                    required 
                    value={diagData.diagnosis}
                    onChange={e => setDiagData({...diagData, diagnosis: e.target.value})}
                    style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc', minHeight: 70 }}
                  />
                  <textarea 
                    placeholder="Enter Prescription Details..." 
                    required 
                    value={diagData.prescription}
                    onChange={e => setDiagData({...diagData, prescription: e.target.value})}
                    style={{ padding: 10, borderRadius: 8, border: '1px solid #ccc', minHeight: 70 }}
                  />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" style={{ padding: '10px 20px', background: theme.accent, color: 'white', border: 'none', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>
                      Finalize & Send Prescription
                    </button>
                    <button type="button" onClick={() => setSelectedPatient(null)} style={{ padding: '10px 20px', background: '#cbd5e1', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid #edf2f7' }}>
                  <th style={{ padding: 10 }}>Patient Name</th>
                  <th style={{ padding: 10 }}>Age</th>
                  <th style={{ padding: 10 }}>Location</th>
                  <th style={{ padding: 10 }}>Symptoms</th>
                  <th style={{ padding: 10 }}>Status</th>
                  <th style={{ padding: 10 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {patients
                  .filter(p => (p.assignedDoctor || '').toLowerCase() === user.username.toLowerCase())
                  .filter(p => p.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #edf2f7' }}>
                      <td style={{ padding: 10, fontWeight: 600 }}>{p.fullName} (@{p.username})</td>
                      <td style={{ padding: 10 }}>{p.age}</td>
                      <td style={{ padding: 10 }}>{p.location}</td>
                      <td style={{ padding: 10, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.symptoms}</td>
                      <td style={{ padding: 10 }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: 6, 
                          fontSize: 12, 
                          fontWeight: 'bold',
                          background: p.status === 'Completed' ? '#dcfce7' : '#fef3c7',
                          color: p.status === 'Completed' ? '#166534' : '#92400e'
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: 10 }}>
                        <button 
                          onClick={() => {
                            setSelectedPatient(p);
                            setDiagData({ diagnosis: p.diagnosis || '', prescription: p.prescription || '' });
                          }} 
                          style={{ padding: '6px 12px', background: theme.primary, color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                        >
                          {p.status === 'Completed' ? 'Edit Diagnosis' : 'Attend Patient'}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {patients.filter(p => (p.assignedDoctor || '').toLowerCase() === user.username.toLowerCase()).length === 0 && (
              <p style={{ textAlign: 'center', color: '#64748b', marginTop: 30 }}>No patients currently assigned to you.</p>
            )}
          </div>
        )}

        {/* PATIENT DASHBOARD */}
        {user && user.role === 'patient' && (
          <div style={{ maxWidth: 600, margin: 'auto', background: 'white', padding: 30, borderRadius: 20 }}>
            <h2>My Consultation Status</h2>
            {patients.filter(p => p.username === user.username).map(p => (
              <div key={p._id} style={{ marginTop: 20, padding: 20, border: '1px solid #e2e8f0', borderRadius: 12 }}>
                <p><strong>Status:</strong> {p.status}</p>
                <p><strong>Symptoms:</strong> {p.symptoms}</p>
                <p><strong>Diagnosis:</strong> {p.diagnosis || 'Awaiting assessment...'}</p>
                <p><strong>Prescription:</strong> {p.prescription || 'N/A'}</p>
                <button onClick={() => exportPatientReceipt(p)} style={{ marginTop: 10, padding: '10px 16px', background: theme.primary, color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>Download Report</button>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}

export default App;

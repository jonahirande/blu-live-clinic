import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = "https://backend-url-blu-live-clinic.apps.lab.ocp.bludive/api";

function App() {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [view, setView] = useState('landing'); 
  const [loginErr, setLoginErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const [regData, setRegData] = useState({ username: '', password: '', age: 'Adult (18-64)', location: '', symptoms: '' });

  const theme = {
    primary: '#2563eb', // Modern Electric Blue
    dark: '#1e293b',    // Slate Dark
    accent: '#10b981',  // Emerald Green
    danger: '#ef4444',
    bg: '#f1f5f9'
=======

  // Form State for Registration
  const [regData, setRegData] = useState({
    username: '', password: '', age: 'Adult (18-64)', 
    location: '', symptoms: ''
  });

  const theme = {
    primary: '#1e40af', secondary: '#3b82f6', accent: '#10b981', 
    bg: '#f8fafc', white: '#ffffff', textDark: '#1e293b', 
    textLight: '#64748b', danger: '#ef4444', warning: '#f59e0b'
>>>>>>> 41df883fc09165966094230c12e2d48fdd803c48
  };

  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await axios.get(`${API}/patients`);
      setPatients(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), 5000); 
    return () => clearInterval(interval);
  }, []);

<<<<<<< HEAD
  const showToast = (msg, type = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 3000);
  };

  const exportPatientReceipt = (p) => {
    const text = `BLUCLINIC REPORT\nPatient: ${p.username}\nDiagnosis: ${p.diagnosis}\nPrescription: ${p.prescription}`;
    const file = new Blob([text], {type: 'text/plain'});
    const element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = `Report_${p.username}.txt`;
    element.click();
    showToast("Report Downloaded");
  };

=======
  // --- HANDLERS ---
>>>>>>> 41df883fc09165966094230c12e2d48fdd803c48
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/register`, regData);
<<<<<<< HEAD
      showToast("Consultation Submitted!");
      setView('login');
    } catch (err) { showToast("Error connecting to server", "danger"); }
=======
      alert("Registration Successful! Please login.");
      setView('login');
    } catch (err) { alert("Registration failed."); }
>>>>>>> 41df883fc09165966094230c12e2d48fdd803c48
  };

  const handleLogin = () => {
    const name = document.getElementById('l-name').value;
    const pass = document.getElementById('l-pass').value;
    if (name === 'admin' && pass === 'p@ssw0rd') return setUser({ name: 'admin', role: 'admin' });
    const doctors = ['Jonah Irande', 'Oluwatosin Daniel', 'Faith Bitrus'];
    if (doctors.includes(name) && pass === 'p@ssw0rd') return setUser({ name: name, role: 'doctor' });
<<<<<<< HEAD
    const found = patients.find(p => p.username === name && p.password === pass);
    if (found) { setUser({ name: found.username, role: 'patient' }); setLoginErr(""); } 
    else { setLoginErr("Invalid Credentials"); }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: theme.bg }}>
      <div className="spinner"></div>
      <style>{`.spinner{width:40px;height:40px;border:4px solid #ddd;border-top-color:${theme.primary};border-radius:50%;animation:s 1s linear infinite}@keyframes s{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
=======
    
    const found = patients.find(p => p.username === name && p.password === pass);
    if (found) {
        setUser({ name: found.username, role: 'patient' });
        setLoginErr("");
    } else {
        setLoginErr("Access Denied: Invalid Credentials");
    }
  };

  const exportPatientReceipt = (p) => {
    const text = `BLUCLINIC REPORT\nPatient: ${p.username}\nDiagnosis: ${p.diagnosis}\nPrescription: ${p.prescription}`;
    const file = new Blob([text], {type: 'text/plain'});
    const element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = `Report_${p.username}.txt`;
    element.click();
  };
>>>>>>> 41df883fc09165966094230c12e2d48fdd803c48

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: theme.bg }}>
        <div className="spinner"></div>
        <p style={{ marginTop: '20px', color: theme.textLight, fontWeight: '600', fontFamily: 'Inter' }}>Securely connecting to BluClinic...</p>
        <style>{`.spinner { width: 50px; height: 50px; border: 5px solid #e2e8f0; border-top: 5px solid ${theme.primary}; border-radius: 50%; animation: spin 1s linear infinite; } @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* GLOBAL TOAST */}
      {toast.show && <div style={{ position: 'fixed', top: 20, right: 20, background: toast.type==='success'?theme.accent:theme.danger, color:'white', padding:'12px 24px', borderRadius:8, zIndex:1000, boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)' }}>{toast.msg}</div>}

      {/* TOP NAV */}
      <nav style={{ background: 'white', padding: '0 5%', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setView('landing')}>
          <div style={{ background: theme.primary, width: 32, height: 32, borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>B</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: theme.dark, margin: 0 }}>BLUCLINIC+</h2>
        </div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: theme.dark }}>{user.name}</span>
            <button onClick={() => {setUser(null); setView('landing');}} style={{ background: '#fef2f2', color: theme.danger, border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Sign Out</button>
          </div>
        ) : (
          <button onClick={() => setView('login')} style={{ background: theme.primary, color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Portal Login</button>
        )}
      </nav>

      <main style={{ padding: '40px 5%' }}>
        
        {/* LANDING PAGE - UPDATED UI */}
        {!user && view === 'landing' && (
          <div style={{ maxWidth: 1000, margin: 'auto', textAlign: 'center' }}>
            <span style={{ background: '#dbeafe', color: theme.primary, padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>24/7 VIRTUAL CARE</span>
            <h1 style={{ fontSize: 64, fontWeight: 900, color: theme.dark, margin: '20px 0' }}>Modern healthcare <br/>for a <span style={{color: theme.primary}}>digital world.</span></h1>
            <p style={{ fontSize: 18, color: '#64748b', maxWidth: 600, margin: 'auto' }}>Experience the future of medicine. Licensed doctors, instant prescriptions, and secure health records in one dashboard.</p>
            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button onClick={() => setView('register')} style={{ padding: '16px 32px', background: theme.primary, color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}>Start Free Consultation</button>
              <button onClick={() => setView('login')} style={{ padding: '16px 32px', background: 'white', color: theme.dark, border: '1px solid #e2e8f0', borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>View Medical Records</button>
=======
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: theme.textDark }}>
      
      {/* NAV */}
      <nav style={{ backgroundColor: theme.white, padding: '1rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setView('landing')}>
            <div style={{ background: theme.primary, color: 'white', width: '30px', height: '30px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>B</div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>BLUCLINIC</h2>
        </div>
        {user && <button onClick={() => {setUser(null); setView('landing');}} style={{ background: '#fee2e2', color: theme.danger, border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Logout</button>}
      </nav>

      <main style={{ padding: '2rem 5%' }}>
        
        {/* LANDING */}
        {!user && view === 'landing' && (
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '60px auto' }}>
            <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Your Health, <span style={{color: theme.secondary}}>Simplified.</span></h1>
            <p style={{ fontSize: '18px', color: theme.textLight, marginBottom: '40px' }}>The modern way to consult doctors and manage your medical records online.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <button onClick={() => setView('register')} style={{ padding: '15px 30px', background: theme.primary, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>New Consultation</button>
                <button onClick={() => setView('login')} style={{ padding: '15px 30px', background: 'white', color: theme.primary, border: `2px solid ${theme.primary}`, borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Patient Login</button>
>>>>>>> 41df883fc09165966094230c12e2d48fdd803c48
            </div>
          </div>
        )}

<<<<<<< HEAD
        {/* REGISTRATION - UPDATED UI */}
        {!user && view === 'register' && (
          <div style={{ maxWidth: 500, margin: 'auto', background: 'white', padding: 40, borderRadius: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
            <h2 style={{ margin: '0 0 8px 0' }}>Create Consultation</h2>
            <p style={{ color: '#64748b', marginBottom: 24 }}>Enter your details for immediate triage.</p>
            <form onSubmit={handleRegister} style={{ display: 'grid', gap: 16 }}>
              <input placeholder="Full Name" required style={{ padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }} onChange={e => setRegData({...regData, username: e.target.value})} />
              <input type="password" placeholder="Set Password" required style={{ padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }} onChange={e => setRegData({...regData, password: e.target.value})} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <select style={{ padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }} onChange={e => setRegData({...regData, age: e.target.value})}>
                  <option>Child (0-17)</option><option selected>Adult (18-64)</option><option>Senior (65+)</option>
                </select>
                <input placeholder="Location" required style={{ padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }} onChange={e => setRegData({...regData, location: e.target.value})} />
              </div>
              <textarea placeholder="Tell us your symptoms..." required style={{ padding: 14, borderRadius: 12, border: '1px solid #e2e8f0', height: 100 }} onChange={e => setRegData({...regData, symptoms: e.target.value})} />
              <button type="submit" style={{ padding: 16, background: theme.primary, color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Submit to Doctor</button>
              <button type="button" onClick={() => setView('landing')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>Go Back</button>
=======
        {/* REGISTER VIEW */}
        {!user && view === 'register' && (
          <div style={{ maxWidth: '500px', margin: 'auto', background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            <h2>Patient Registration</h2>
            <form onSubmit={handleRegister} style={{ display: 'grid', gap: '15px' }}>
              <input placeholder="Full Name" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={e => setRegData({...regData, username: e.target.value})} />
              <input type="password" placeholder="Create Password" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={e => setRegData({...regData, password: e.target.value})} />
              <select style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={e => setRegData({...regData, age: e.target.value})}>
                <option>Child (0-17)</option><option>Adult (18-64)</option><option>Senior (65+)</option>
              </select>
              <input placeholder="Location (City/State)" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={e => setRegData({...regData, location: e.target.value})} />
              <textarea placeholder="Describe your symptoms..." required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', height: '100px' }} onChange={e => setRegData({...regData, symptoms: e.target.value})} />
              <button type="submit" style={{ padding: '15px', background: theme.accent, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Submit for Triage</button>
              <p onClick={() => setView('landing')} style={{ textAlign: 'center', color: theme.textLight, cursor: 'pointer' }}>Cancel</p>
>>>>>>> 41df883fc09165966094230c12e2d48fdd803c48
            </form>
          </div>
        )}

<<<<<<< HEAD
        {/* LOGIN - UPDATED UI */}
        {!user && view === 'login' && (
          <div style={{ maxWidth: 400, margin: '60px auto', background: 'white', padding: 40, borderRadius: 24, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center' }}>Portal Login</h2>
            <div style={{ display: 'grid', gap: 16, marginTop: 24 }}>
              <input id="l-name" placeholder="Full Name" style={{ padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }} />
              <input id="l-pass" type="password" placeholder="Password" style={{ padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }} />
              {loginErr && <p style={{ color: theme.danger, fontSize: 13, textAlign: 'center' }}>{loginErr}</p>}
              <button onClick={handleLogin} style={{ padding: 16, background: theme.primary, color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Sign In</button>
=======
        {/* LOGIN VIEW */}
        {!user && view === 'login' && (
          <div style={{ maxWidth: '400px', margin: 'auto', background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center' }}>Login</h2>
            <div style={{ display: 'grid', gap: '15px' }}>
                <input id="l-name" placeholder="Full Name" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
                <input id="l-pass" type="password" placeholder="Password" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} />
                {loginErr && <p style={{ color: theme.danger, fontSize: '13px' }}>{loginErr}</p>}
                <button onClick={handleLogin} style={{ padding: '15px', background: theme.primary, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Enter Dashboard</button>
                <p onClick={() => setView('landing')} style={{ textAlign: 'center', color: theme.textLight, cursor: 'pointer' }}>Back</p>
>>>>>>> 41df883fc09165966094230c12e2d48fdd803c48
            </div>
          </div>
        )}

<<<<<<< HEAD
        {/* DASHBOARDS - UNIFIED CARD STYLE */}
        {user && (
          <div style={{ maxWidth: 1000, margin: 'auto' }}>
            <h1 style={{ marginBottom: 32 }}>{user.role === 'admin' ? 'Triage Management' : user.role === 'doctor' ? `Dr. ${user.name}'s Panel` : 'My Medical History'}</h1>
            
            {/* ADMIN TABLE */}
            {user.role === 'admin' && (
              <div style={{ background: 'white', borderRadius: 24, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: 24, borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}>
                  <input placeholder="Search patients..." style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #e2e8f0', width: 300 }} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr><th style={{ padding: 20, textAlign: 'left' }}>Patient</th><th style={{ padding: 20, textAlign: 'left' }}>Status</th><th style={{ padding: 20, textAlign: 'left' }}>Assign Doctor</th><th style={{ padding: 20, textAlign: 'left' }}>Action</th></tr>
                  </thead>
                  <tbody>
                    {patients.filter(p => p.username.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                      <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: 20 }}><strong>{p.username}</strong><br/><small>{p.age} | {p.location}</small></td>
                        <td style={{ padding: 20 }}><span style={{ color: p.status==='Pending'?theme.danger:theme.accent, fontWeight: 700 }}>{p.status}</span></td>
                        <td style={{ padding: 20 }}>
                          {p.status === 'Pending' ? (
                            <select style={{ padding: 8, borderRadius: 8 }} onChange={e => axios.put(`${API}/assign`, { patientId: p._id, doctorName: e.target.value }).then(() => {loadData(true); showToast("Doctor Assigned")})}>
                              <option>Choose Doctor...</option>
                              <option value="Jonah Irande">Dr. Jonah</option><option value="Oluwatosin Daniel">Dr. Daniel</option><option value="Faith Bitrus">Dr. Faith</option>
                            </select>
                          ) : p.assignedDoctor}
                        </td>
                        <td style={{ padding: 20 }}><button onClick={() => axios.delete(`${API}/patients/${p._id}`).then(() => loadData(true))} style={{ color: theme.danger, border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* DOCTOR/PATIENT CARDS */}
            <div style={{ display: 'grid', gap: 24 }}>
              {user.role === 'patient' && patients.filter(p => p.username === user.name).map(p => (
                <div key={p._id} style={{ background: 'white', padding: 32, borderRadius: 24, border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <span style={{ background: '#dcfce7', color: theme.accent, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>{p.status}</span>
                    {p.status === 'Completed' && <button onClick={() => exportPatientReceipt(p)} style={{ background: theme.primary, color: 'white', border: 'none', padding: '8px 20px', borderRadius: 8, cursor: 'pointer' }}>Download Report</button>}
                  </div>
                  <h3>Consultation on {new Date(p.createdAt).toLocaleDateString()}</h3>
                  <p><strong>Symptoms:</strong> {p.symptoms}</p>
                  {p.status === 'Completed' && <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, marginTop: 20 }}>
                    <p><strong>Diagnosis:</strong> {p.diagnosis}</p>
                    <p><strong>Prescription:</strong> {p.prescription}</p>
                  </div>}
                </div>
              ))}

              {user.role === 'doctor' && patients.filter(p => p.assignedDoctor === user.name && p.status === 'Assigned').map(p => (
                <div key={p._id} style={{ background: 'white', padding: 32, borderRadius: 24, border: '1px solid #e2e8f0' }}>
                  <h3>Patient: {p.username}</h3>
                  <p style={{ background: '#f1f5f9', padding: 16, borderRadius: 12 }}>{p.symptoms}</p>
                  <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
                    <input id={`diag-${p._id}`} placeholder="Diagnosis" style={{ padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                    <textarea id={`pres-${p._id}`} placeholder="Prescription" style={{ padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                    <button onClick={async () => {
                      const d = document.getElementById(`diag-${p._id}`).value;
                      const pr = document.getElementById(`pres-${p._id}`).value;
                      await axios.put(`${API}/diagnose`, { patientId: p._id, diagnosis: d, prescription: pr });
                      loadData(true); showToast("Consultation Finished");
                    }} style={{ padding: 16, background: theme.primary, color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Complete Case</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

=======
        {/* PATIENT DASHBOARD */}
        {user?.role === 'patient' && (
           <div style={{ maxWidth: '800px', margin: 'auto' }}>
                <h1>My Health Record</h1>
                {patients.filter(p => p.username === user.name).map(p => (
                    <div key={p._id} style={{ background: 'white', padding: '30px', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: theme.primary, fontWeight: 'bold' }}>Status: {p.status}</span>
                            {p.status === 'Completed' && <button onClick={() => exportPatientReceipt(p)} style={{ background: theme.accent, color: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}>Download Report</button>}
                        </div>
                        <p><strong>Symptoms:</strong> {p.symptoms}</p>
                        {p.status === 'Completed' && (
                            <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                <p><strong>Diagnosis:</strong> {p.diagnosis}</p>
                                <p><strong>Prescription:</strong> {p.prescription}</p>
                                <p><small>Doctor: Dr. {p.assignedDoctor}</small></p>
                            </div>
                        )}
                    </div>
                ))}
           </div>
        )}

        {/* ADMIN DASHBOARD */}
        {user?.role === 'admin' && (
            <div style={{ maxWidth: '1000px', margin: 'auto' }}>
                <h1>Admin Triage</h1>
                <input placeholder="Search patients..." style={{ marginBottom: '20px', padding: '10px', width: '300px', borderRadius: '8px', border: '1px solid #ddd' }} onChange={e => setSearchTerm(e.target.value)} />
                <div style={{ background: 'white', borderRadius: '15px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f1f5f9' }}>
                            <tr><th style={{ padding: '15px' }}>Patient</th><th style={{ padding: '15px' }}>Status</th><th style={{ padding: '15px' }}>Assign</th><th style={{ padding: '15px' }}>Action</th></tr>
                        </thead>
                        <tbody>
                            {patients.filter(p => p.username.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px' }}>{p.username}</td>
                                    <td style={{ padding: '15px' }}>{p.status}</td>
                                    <td style={{ padding: '15px' }}>
                                        {p.status === 'Pending' ? (
                                            <select onChange={e => axios.put(`${API}/assign`, { patientId: p._id, doctorName: e.target.value }).then(() => loadData(true))}>
                                                <option>Select Dr...</option>
                                                <option value="Jonah Irande">Dr. Jonah</option>
                                                <option value="Oluwatosin Daniel">Dr. Daniel</option>
                                            </select>
                                        ) : p.assignedDoctor}
                                    </td>
                                    <td style={{ padding: '15px' }}><button onClick={() => axios.delete(`${API}/patients/${p._id}`).then(() => loadData(true))} style={{ color: theme.danger, border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* DOCTOR DASHBOARD */}
        {user?.role === 'doctor' && (
            <div style={{ maxWidth: '800px', margin: 'auto' }}>
                <h1>Doctor's Panel: {user.name}</h1>
                {patients.filter(p => p.assignedDoctor === user.name && p.status === 'Assigned').map(p => (
                    <div key={p._id} style={{ background: 'white', padding: '30px', borderRadius: '20px', marginBottom: '20px' }}>
                        <h3>Patient: {p.username}</h3>
                        <p><strong>Symptoms:</strong> {p.symptoms}</p>
                        <textarea id={`diag-${p._id}`} placeholder="Diagnosis" style={{ width: '100%', marginBottom: '10px', padding: '10px' }} />
                        <textarea id={`pres-${p._id}`} placeholder="Prescription" style={{ width: '100%', marginBottom: '10px', padding: '10px' }} />
                        <button onClick={async () => {
                            const d = document.getElementById(`diag-${p._id}`).value;
                            const pr = document.getElementById(`pres-${p._id}`).value;
                            await axios.put(`${API}/diagnose`, { patientId: p._id, diagnosis: d, prescription: pr });
                            loadData(true);
                        }} style={{ background: theme.primary, color: 'white', padding: '10px 20px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Complete Case</button>
                    </div>
                ))}
            </div>
        )}

>>>>>>> 41df883fc09165966094230c12e2d48fdd803c48
      </main>
    </div>
  );
}

export default App;
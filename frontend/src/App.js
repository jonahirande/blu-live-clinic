import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = "https://backend-url-blu-live-clinic.apps.lab.ocp.bludive/api";

// --- PHOTO MAPPING (Google Drive Direct Link Format) ---
const doctorPhotos = {
  "Faith Bitrus": "https://lh3.googleusercontent.com/d/140WAJOrcnvvZlj9Wb5WYXz1tj7vwWj8E", 
  "Jonah Irande": "https://lh3.googleusercontent.com/d/1nbqutYXkbCL7ZS43ifUEUTr_fbboVY7l",
  "Oluwatosin Daniel": "https://lh3.googleusercontent.com/d/1P0dxXfDuOyA1Qel5NGGXHhjvDDhVVqkk",
  "admin": "https://cdn-icons-png.flaticon.com/512/6024/6024190.png"
};

function App() {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [view, setView] = useState('landing'); 
  const [loginErr, setLoginErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const [regData, setRegData] = useState({ username: '', password: '', age: 'Adult (18-64)', location: '', symptoms: '' });

  const theme = {
    primary: '#1e40af', secondary: '#3b82f6', accent: '#10b981', danger: '#ef4444', bg: '#f8fafc', textDark: '#1e293b'
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

  const downloadCSV = () => {
    const headers = "Patient,Age,Location,Status,Doctor,Diagnosis\n";
    const rows = patients.map(p => `${p.username},${p.age},${p.location},${p.status},${p.assignedDoctor || 'N/A'},${p.diagnosis || 'N/A'}`).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'BluClinic_Activities.csv';
    a.click();
    showToast("Activities CSV Downloaded");
  };

  const resetPassword = async (id) => {
    const newPass = prompt("Enter new password for patient:");
    if (!newPass) return;
    try {
      await axios.put(`${API}/patients/${id}`, { password: newPass });
      showToast("Password Reset Successfully");
      loadData(true);
    } catch (err) { showToast("Reset Failed", "danger"); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/register`, regData);
      showToast("Consultation Submitted!");
      setView('login');
    } catch (err) { showToast("Registration Error", "danger"); }
  };

  const handleLogin = () => {
    const name = document.getElementById('l-name').value;
    const pass = document.getElementById('l-pass').value;
    if (name === 'admin' && pass === 'p@ssw0rd') return setUser({ name: 'admin', role: 'admin' });
    const doctors = ['Jonah Irande', 'Oluwatosin Daniel', 'Faith Bitrus'];
    if (doctors.includes(name) && pass === 'p@ssw0rd') return setUser({ name: name, role: 'doctor' });
    const found = patients.find(p => p.username === name && p.password === pass);
    if (found) { setUser({ name: found.username, role: 'patient' }); setLoginErr(""); } 
    else { setLoginErr("Access Denied: Invalid Credentials"); }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: theme.bg }}>
      <div className="spinner"></div>
      <p style={{ marginTop: '15px', fontWeight: '600' }}>Connecting to BluClinic Secure Server...</p>
      <style>{`.spinner{width:40px;height:40px;border:4px solid #ddd;border-top-color:${theme.primary};border-radius:50%;animation:s 1s linear infinite}@keyframes s{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: theme.textDark }}>
      
      {toast.show && (
        <div style={{ position: 'fixed', top: 20, right: 20, background: toast.type==='success'?theme.accent:theme.danger, color:'white', padding:'12px 24px', borderRadius:8, zIndex:1000, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          {toast.msg}
        </div>
      )}

      <nav style={{ background: 'white', padding: '0 5%', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', sticky: 'top', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setView('landing')}>
          <div style={{ background: theme.primary, width: 35, height: 35, borderRadius: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>B</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>BLUCLINIC+</h2>
        </div>
        
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
            <img 
              src={doctorPhotos[user.name] || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
              onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png" }}
              alt="Profile" 
              style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${theme.primary}` }} 
            />
            <span style={{ fontWeight: 600 }}>{user.name}</span>
            <button onClick={() => {setUser(null); setView('landing');}} style={{ background: '#fef2f2', color: theme.danger, border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Logout</button>
          </div>
        )}
      </nav>

      <main style={{ padding: '40px 5%' }}>
        
        {/* LANDING PAGE (REVERTED) */}
        {!user && view === 'landing' && (
          <div style={{ maxWidth: '850px', margin: '60px auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '60px', fontWeight: 900, marginBottom: '20px', letterSpacing: '-1.5px' }}>Your Health, <span style={{color: theme.secondary}}>Simplified.</span></h1>
            <p style={{ fontSize: '20px', color: '#64748b', marginBottom: '40px' }}>The modern way to consult doctors and manage your medical records online.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                <button onClick={() => setView('register')} style={{ padding: '18px 36px', background: theme.primary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>New Consultation</button>
                <button onClick={() => setView('login')} style={{ padding: '18px 36px', background: 'white', color: theme.primary, border: `2px solid ${theme.primary}`, borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>Patient Login</button>
            </div>
          </div>
        )}

        {/* REGISTRATION (RESTORED AGE GROUP) */}
        {!user && view === 'register' && (
          <div style={{ maxWidth: 550, margin: 'auto', background: 'white', padding: 40, borderRadius: 24, boxShadow: '0 20px 25px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginBottom: '25px' }}>Patient Registration</h2>
            <form onSubmit={handleRegister} style={{ display: 'grid', gap: 18 }}>
              <input placeholder="Full Name" required style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} onChange={e => setRegData({...regData, username: e.target.value})} />
              <input type="password" placeholder="Create Password" required style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} onChange={e => setRegData({...regData, password: e.target.value})} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <select style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} onChange={e => setRegData({...regData, age: e.target.value})}>
                  <option>Child (0-17)</option>
                  <option selected>Adult (18-64)</option>
                  <option>Senior (65+)</option>
                </select>
                <input placeholder="Location" required style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} onChange={e => setRegData({...regData, location: e.target.value})} />
              </div>
              <textarea placeholder="Describe your symptoms..." required style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd', height: 120 }} onChange={e => setRegData({...regData, symptoms: e.target.value})} />
              <button type="submit" style={{ padding: 18, background: theme.accent, color: 'white', border: 'none', borderRadius: 12, fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>Submit for Triage</button>
              <p onClick={() => setView('landing')} style={{ textAlign: 'center', color: '#64748b', cursor: 'pointer' }}>Back to Home</p>
            </form>
          </div>
        )}

        {/* LOGIN */}
        {!user && view === 'login' && (
          <div style={{ maxWidth: 400, margin: 'auto', background: 'white', padding: 40, borderRadius: 24, boxShadow: '0 20px 25px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: 25 }}>Access Portal</h2>
            <div style={{ display: 'grid', gap: 15 }}>
                <input id="l-name" placeholder="Full Name" style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} />
                <input id="l-pass" type="password" placeholder="Password" style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} />
                {loginErr && <p style={{ color: theme.danger, textAlign: 'center', fontSize: '13px' }}>{loginErr}</p>}
                <button onClick={handleLogin} style={{ padding: 16, background: theme.primary, color: 'white', border: 'none', borderRadius: 12, fontWeight: '700', cursor: 'pointer' }}>Sign In</button>
                <p onClick={() => setView('landing')} style={{ textAlign: 'center', color: theme.secondary, cursor: 'pointer' }}>Cancel</p>
            </div>
          </div>
        )}

        {/* ADMIN DASHBOARD (RESTORED CSV & RESET) */}
        {user?.role === 'admin' && (
            <div style={{ maxWidth: 1100, margin: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
                    <h1>Admin Triage</h1>
                    <button onClick={downloadCSV} style={{ background: theme.accent, color: 'white', border: 'none', padding: '12px 24px', borderRadius: 10, fontWeight: 'bold', cursor: 'pointer' }}>Download Activities (CSV)</button>
                </div>
                <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <div style={{ padding: 15, borderBottom: '1px solid #eee' }}>
                        <input placeholder="Search triage list..." style={{ padding: '10px 15px', width: '300px', borderRadius: 10, border: '1px solid #ddd' }} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                              <th style={{ padding: 20, textAlign: 'left' }}>Patient</th>
                              <th style={{ padding: 20, textAlign: 'left' }}>Assign Doctor</th>
                              <th style={{ padding: 20, textAlign: 'left' }}>Control</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.filter(p => p.username.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: 20 }}><strong>{p.username}</strong><br/><small>{p.status}</small></td>
                                    <td style={{ padding: 20 }}>
                                        {p.status === 'Pending' ? (
                                            <select style={{ padding: 8, borderRadius: 8 }} onChange={e => axios.put(`${API}/assign`, { patientId: p._id, doctorName: e.target.value }).then(() => {loadData(true); showToast("Assigned Successfully")})}>
                                                <option>Choose Doctor...</option>
                                                <option value="Jonah Irande">Dr. Jonah</option>
                                                <option value="Oluwatosin Daniel">Dr. Daniel</option>
                                                <option value="Faith Bitrus">Dr. Faith</option>
                                            </select>
                                        ) : p.assignedDoctor}
                                    </td>
                                    <td style={{ padding: 20, display: 'flex', gap: 10 }}>
                                        <button onClick={() => resetPassword(p._id)} style={{ color: theme.primary, background: 'none', border: `1px solid ${theme.primary}`, padding: '6px 12px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>Reset Pass</button>
                                        <button onClick={() => axios.delete(`${API}/patients/${p._id}`).then(() => loadData(true))} style={{ color: theme.danger, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* DOCTOR DASHBOARD (RESTORED HISTORY & SEARCH) */}
        {user?.role === 'doctor' && (
            <div style={{ maxWidth: 900, margin: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
                     <img src={doctorPhotos[user.name]} alt="Doc" style={{ width: 100, height: 100, borderRadius: 25, objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                     <div>
                        <h1 style={{ margin: 0, letterSpacing: '-1px' }}>Dr. {user.name}</h1>
                        <p style={{ color: '#64748b', fontSize: '18px' }}>Licensed Medical Professional</p>
                     </div>
                </div>
                
                <h3 style={{ marginBottom: 20 }}>Assigned Patients</h3>
                {patients.filter(p => p.assignedDoctor === user.name && p.status === 'Assigned').map(p => (
                    <div key={p._id} style={{ background: 'white', padding: 30, borderRadius: 24, marginBottom: 25, border: '1px solid #e2e8f0' }}>
                        <h4>Patient: {p.username}</h4>
                        <p style={{ background: '#f8fafc', padding: 15, borderRadius: 12 }}><strong>Symptoms:</strong> {p.symptoms}</p>
                        <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
                            <input id={`diag-${p._id}`} placeholder="Diagnosis" style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} />
                            <textarea id={`pres-${p._id}`} placeholder="Prescription" style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd', height: 80 }} />
                            <button onClick={async () => {
                                const d = document.getElementById(`diag-${p._id}`).value;
                                const pr = document.getElementById(`pres-${p._id}`).value;
                                await axios.put(`${API}/diagnose`, { patientId: p._id, diagnosis: d, prescription: pr });
                                loadData(true); showToast("Consultation Finalized");
                            }} style={{ background: theme.primary, color: 'white', padding: '16px', border: 'none', borderRadius: 12, fontWeight: 'bold', cursor: 'pointer' }}>Complete Case</button>
                        </div>
                    </div>
                ))}

                <div style={{ margin: '60px 0 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3>Treated History</h3>
                    <input 
                        placeholder="Search history by name..." 
                        style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid #ddd', width: '300px' }} 
                        onChange={(e) => setHistorySearch(e.target.value)}
                    />
                </div>
                
                <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr><th style={{ padding: 15, textAlign: 'left' }}>Patient</th><th style={{ padding: 15, textAlign: 'left' }}>Diagnosis</th><th style={{ padding: 15, textAlign: 'left' }}>Records</th></tr>
                        </thead>
                        <tbody>
                            {patients
                                .filter(p => p.assignedDoctor === user.name && p.status === 'Completed' && p.username.toLowerCase().includes(historySearch.toLowerCase()))
                                .map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: 15 }}><strong>{p.username}</strong></td>
                                    <td style={{ padding: 15 }}>{p.diagnosis}</td>
                                    <td style={{ padding: 15 }}>
                                        <button onClick={() => exportPatientReceipt(p)} style={{ color: theme.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Download Report</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* PATIENT DASHBOARD */}
        {user?.role === 'patient' && (
            <div style={{ maxWidth: 850, margin: 'auto' }}>
                <h1 style={{ marginBottom: 30 }}>My Medical Records</h1>
                {patients.filter(p => p.username === user.name).map(p => (
                    <div key={p._id} style={{ background: 'white', padding: 30, borderRadius: 24, marginBottom: 25, boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #edf2f7' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                            <span style={{ background: '#dcfce7', color: theme.accent, padding: '6px 16px', borderRadius: 20, fontSize: '13px', fontWeight: 'bold' }}>{p.status.toUpperCase()}</span>
                            {p.status === 'Completed' && <button onClick={() => exportPatientReceipt(p)} style={{ background: theme.primary, color: 'white', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 'bold', cursor: 'pointer' }}>Download Report</button>}
                        </div>
                        <p><strong>Initial Symptoms:</strong> {p.symptoms}</p>
                        {p.status === 'Completed' && (
                            <div style={{ borderTop: '1px solid #eee', paddingTop: 20, marginTop: 20 }}>
                                <h4 style={{ color: theme.primary, margin: '0 0 10px 0' }}>Diagnosis & Treatment</h4>
                                <p><strong>Assessment:</strong> {p.diagnosis}</p>
                                <p><strong>Prescription:</strong> {p.prescription}</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )}

      </main>
    </div>
  );
}

export default App;
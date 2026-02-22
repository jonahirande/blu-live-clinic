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
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const [regData, setRegData] = useState({ username: '', password: '', age: 'Adult (18-64)', location: '', symptoms: '' });

  const theme = {
    primary: '#2563eb', dark: '#1e293b', accent: '#10b981', danger: '#ef4444', bg: '#f1f5f9'
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

  // --- REVERTED REPORT PATTERN ---
  const exportPatientReceipt = (p) => {
    const text = `BLUCLINIC REPORT\nPatient: ${p.username}\nDiagnosis: ${p.diagnosis}\nPrescription: ${p.prescription}`;
    const file = new Blob([text], {type: 'text/plain'});
    const element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = `Report_${p.username}.txt`;
    element.click();
    showToast("Report Downloaded");
  };

  // --- RESTORED CSV EXPORT ---
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

  // --- RESTORED PASSWORD RESET ---
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
    } catch (err) { showToast("Error connecting to server", "danger"); }
  };

  const handleLogin = () => {
    const name = document.getElementById('l-name').value;
    const pass = document.getElementById('l-pass').value;
    if (name === 'admin' && pass === 'p@ssw0rd') return setUser({ name: 'admin', role: 'admin' });
    const doctors = ['Jonah Irande', 'Oluwatosin Daniel', 'Faith Bitrus'];
    if (doctors.includes(name) && pass === 'p@ssw0rd') return setUser({ name: name, role: 'doctor' });
    const found = patients.find(p => p.username === name && p.password === pass);
    if (found) { setUser({ name: found.username, role: 'patient' }); setLoginErr(""); } 
    else { setLoginErr("Invalid Credentials"); }
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: theme.bg }}><div className="spinner"></div></div>;

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      {toast.show && <div style={{ position: 'fixed', top: 20, right: 20, background: toast.type==='success'?theme.accent:theme.danger, color:'white', padding:'12px 24px', borderRadius:8, zIndex:1000 }}>{toast.msg}</div>}

      <nav style={{ background: 'white', padding: '0 5%', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => setView('landing')}>
          <div style={{ background: theme.primary, width: 32, height: 32, borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold' }}>B</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>BLUCLINIC+</h2>
        </div>
        {user && <button onClick={() => {setUser(null); setView('landing');}} style={{ background: '#fef2f2', color: theme.danger, border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Sign Out</button>}
      </nav>

      <main style={{ padding: '40px 5%' }}>
        
        {/* LANDING & LOGIN (Omitted for brevity, keep previous version logic here) */}
        {!user && view === 'landing' && (
             <div style={{ maxWidth: 1000, margin: 'auto', textAlign: 'center' }}>
                <h1 style={{ fontSize: 64, fontWeight: 900, color: theme.dark }}>Digital Healthcare <span style={{color: theme.primary}}>Evolved.</span></h1>
                <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 16 }}>
                    <button onClick={() => setView('register')} style={{ padding: '16px 32px', background: theme.primary, color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>New Consultation</button>
                    <button onClick={() => setView('login')} style={{ padding: '16px 32px', background: 'white', border: '1px solid #ddd', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Portal Login</button>
                </div>
             </div>
        )}

        {/* REGISTRATION */}
        {!user && view === 'register' && (
            <div style={{ maxWidth: 500, margin: 'auto', background: 'white', padding: 40, borderRadius: 24 }}>
                <h2>Registration</h2>
                <form onSubmit={handleRegister} style={{ display: 'grid', gap: 16 }}>
                    <input placeholder="Full Name" required style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} onChange={e => setRegData({...regData, username: e.target.value})} />
                    <input type="password" placeholder="Password" required style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} onChange={e => setRegData({...regData, password: e.target.value})} />
                    <input placeholder="Location" required style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd' }} onChange={e => setRegData({...regData, location: e.target.value})} />
                    <textarea placeholder="Symptoms" required style={{ padding: 14, borderRadius: 12, border: '1px solid #ddd', height: 100 }} onChange={e => setRegData({...regData, symptoms: e.target.value})} />
                    <button type="submit" style={{ padding: 16, background: theme.primary, color: 'white', border: 'none', borderRadius: 12, fontWeight: 700 }}>Submit</button>
                </form>
            </div>
        )}

        {/* LOGIN */}
        {!user && view === 'login' && (
            <div style={{ maxWidth: 400, margin: 'auto', background: 'white', padding: 40, borderRadius: 24 }}>
                <h2>Login</h2>
                <input id="l-name" placeholder="Full Name" style={{ width:'100%', padding: 14, borderRadius: 12, border: '1px solid #ddd', marginBottom: 10 }} />
                <input id="l-pass" type="password" placeholder="Password" style={{ width:'100%', padding: 14, borderRadius: 12, border: '1px solid #ddd', marginBottom: 20 }} />
                <button onClick={handleLogin} style={{ width:'100%', padding: 16, background: theme.primary, color: 'white', border: 'none', borderRadius: 12, fontWeight: 700 }}>Sign In</button>
            </div>
        )}

        {/* ADMIN DASHBOARD */}
        {user?.role === 'admin' && (
            <div style={{ maxWidth: 1100, margin: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h1>Admin Triage</h1>
                    <button onClick={downloadCSV} style={{ background: theme.accent, color: 'white', border: 'none', padding: '10px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Download Activities (CSV)</button>
                </div>
                <div style={{ background: 'white', borderRadius: 24, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr><th style={{ padding: 20, textAlign: 'left' }}>Patient</th><th style={{ padding: 20, textAlign: 'left' }}>Status</th><th style={{ padding: 20, textAlign: 'left' }}>Actions</th></tr>
                        </thead>
                        <tbody>
                            {patients.map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: 20 }}>{p.username}</td>
                                    <td style={{ padding: 20 }}>{p.status}</td>
                                    <td style={{ padding: 20, display: 'flex', gap: 10 }}>
                                        <button onClick={() => resetPassword(p._id)} style={{ color: theme.primary, background: 'none', border: '1px solid blue', padding: '4px 8px', borderRadius: 4, cursor: 'pointer' }}>Reset Pass</button>
                                        <button onClick={() => axios.delete(`${API}/patients/${p._id}`).then(() => loadData(true))} style={{ color: theme.danger, background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* DOCTOR DASHBOARD (With History View) */}
        {user?.role === 'doctor' && (
            <div style={{ maxWidth: 900, margin: 'auto' }}>
                <h1>Doctor's Station</h1>
                
                <h3>Active Consultations</h3>
                {patients.filter(p => p.assignedDoctor === user.name && p.status === 'Assigned').map(p => (
                    <div key={p._id} style={{ background: 'white', padding: 24, borderRadius: 20, marginBottom: 20 }}>
                        <h4>Patient: {p.username}</h4>
                        <p>Symptoms: {p.symptoms}</p>
                        <input id={`diag-${p._id}`} placeholder="Diagnosis" style={{ width: '100%', padding: 12, marginBottom: 10 }} />
                        <textarea id={`pres-${p._id}`} placeholder="Prescription" style={{ width: '100%', padding: 12, marginBottom: 10 }} />
                        <button onClick={async () => {
                            const d = document.getElementById(`diag-${p._id}`).value;
                            const pr = document.getElementById(`pres-${p._id}`).value;
                            await axios.put(`${API}/diagnose`, { patientId: p._id, diagnosis: d, prescription: pr });
                            loadData(true); showToast("Case Completed");
                        }} style={{ background: theme.primary, color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8 }}>Complete</button>
                    </div>
                ))}

                <hr style={{ margin: '40px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                
                <h3>Treated Patients History</h3>
                <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr><th style={{ padding: 15, textAlign: 'left' }}>Patient</th><th style={{ padding: 15, textAlign: 'left' }}>Diagnosis</th><th style={{ padding: 15, textAlign: 'left' }}>Report</th></tr>
                        </thead>
                        <tbody>
                            {patients.filter(p => p.assignedDoctor === user.name && p.status === 'Completed').map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: 15 }}>{p.username}</td>
                                    <td style={{ padding: 15 }}>{p.diagnosis}</td>
                                    <td style={{ padding: 15 }}>
                                        <button onClick={() => exportPatientReceipt(p)} style={{ color: theme.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Download</button>
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
            <div style={{ maxWidth: 800, margin: 'auto' }}>
                <h1>My Records</h1>
                {patients.filter(p => p.username === user.name).map(p => (
                    <div key={p._id} style={{ background: 'white', padding: 24, borderRadius: 20, marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>Status: {p.status}</strong>
                            {p.status === 'Completed' && <button onClick={() => exportPatientReceipt(p)} style={{ background: theme.accent, color: 'white', border: 'none', padding: '8px 16px', borderRadius: 8 }}>Get Report</button>}
                        </div>
                        <p>Symptoms: {p.symptoms}</p>
                    </div>
                ))}
            </div>
        )}

      </main>
      <style>{`.spinner{width:40px;height:40px;border:4px solid #ddd;border-top-color:${theme.primary};border-radius:50%;animation:s 1s linear infinite}@keyframes s{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default App;
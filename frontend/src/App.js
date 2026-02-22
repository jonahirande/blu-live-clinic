import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = "https://backend-url-blu-live-clinic.apps.lab.ocp.bludive/api";

function App() {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [view, setView] = useState('landing'); 
  const [loginErr, setLoginErr] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadData = async () => {
    try {
      const res = await axios.get(`${API}/patients`);
      setPatients(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); 
    return () => clearInterval(interval);
  }, []);

  const theme = {
    primary: '#1e40af',    // Deep Blue
    secondary: '#3b82f6',  // Bright Blue
    accent: '#10b981',     // Medical Green
    bg: '#f8fafc',         // Off-white/Grey
    white: '#ffffff',
    textDark: '#1e293b',
    textLight: '#64748b',
    danger: '#ef4444',
    warning: '#f59e0b'
  };

  // --- HELPER FUNCTIONS ---
  const generateReportText = (p) => {
    return `
    ==========================================
             BLUCLINIC MEDICAL REPORT
    ==========================================
    Date: ${new Date(p.createdAt).toLocaleDateString()}
    Patient Name: ${p.username}
    Age Group: ${p.age}
    Location: ${p.location}
    ------------------------------------------
    Attending Doctor: Dr. ${p.assignedDoctor}
    ------------------------------------------
    SYMPTOMS: ${p.symptoms}
    DIAGNOSIS: ${p.diagnosis}
    PRESCRIPTION: ${p.prescription}
    ==========================================`;
  };

  const exportPatientReceipt = (p) => {
    const file = new Blob([generateReportText(p)], {type: 'text/plain'});
    const element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = `Report_${p.username}.txt`;
    element.click();
  };

  const stats = {
    total: patients.length,
    pending: patients.filter(p => p.status === 'Pending').length,
    completed: patients.filter(p => p.status === 'Completed').length
  };

  const handleLogin = () => {
    const name = document.getElementById('l-name').value;
    const pass = document.getElementById('l-pass').value;
    if (name === 'admin' && pass === 'p@ssw0rd') return setUser({ name: 'admin', role: 'admin' });
    const doctors = ['Jonah Irande', 'Oluwatosin Daniel', 'Faith Bitrus'];
    if (doctors.includes(name) && pass === 'p@ssw0rd') return setUser({ name: name, role: 'doctor' });
    
    const found = patients.find(p => p.username === name && p.password === pass);
    if (found) {
        setUser({ name: found.username, role: 'patient' });
        setLoginErr("");
    } else {
        setLoginErr("Access Denied: Invalid Credentials");
    }
  };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', fontFamily: "'Inter', sans-serif", color: theme.textDark }}>
      
      {/* NAVIGATION BAR */}
      <nav style={{ backgroundColor: theme.white, padding: '1rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: theme.primary, color: 'white', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>B</div>
            <h2 style={{ margin: 0, fontSize: '22px', letterSpacing: '-1px' }}>BLU<span style={{color: theme.secondary}}>CLINIC</span></h2>
        </div>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{user.name} ({user.role})</span>
            <button onClick={() => {setUser(null); setView('landing');}} style={{ background: '#fee2e2', color: theme.danger, border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Logout</button>
          </div>
        )}
      </nav>

      <main style={{ padding: '2rem 5%' }}>
        
        {/* LANDING PAGE */}
        {!user && view === 'landing' && (
          <div style={{ maxWidth: '1200px', margin: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '50px', padding: '60px 0' }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '56px', lineHeight: '1.1', marginBottom: '20px' }}>Healthcare that <span style={{color: theme.secondary}}>comes to you.</span></h1>
                    <p style={{ fontSize: '18px', color: theme.textLight, marginBottom: '30px', lineHeight: '1.6' }}>Skip the waiting room. Connect with certified doctors, manage your prescriptions, and track your health journey in one secure place.</p>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={() => setView('register')} style={{ padding: '16px 32px', background: theme.primary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '16px', transition: '0.3s' }}>Start Consultation</button>
                        <button onClick={() => setView('login')} style={{ padding: '16px 32px', background: 'white', color: theme.primary, border: `2px solid ${theme.primary}`, borderRadius: '12px', fontWeight: '600', cursor: 'pointer', fontSize: '16px' }}>Patient Portal</button>
                    </div>
                </div>
                <div style={{ flex: 1, textAlign: 'right' }}>
                    {/* Placeholder for Hero Image */}
                    <img src="https://img.freepik.com/free-vector/doctors-concept-illustration_114360-1515.jpg" alt="Medical Illustration" style={{ width: '100%', maxWidth: '500px', borderRadius: '30px' }} />
                </div>
            </div>

            {/* STATS SECTION */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginTop: '40px' }}>
                {[
                    { label: "Active Doctors", val: "24/7", icon: "👨‍⚕️" },
                    { label: "Quick Diagnosis", val: "< 2hrs", icon: "⚡" },
                    { label: "Patient Security", val: "Encrypted", icon: "🛡️" }
                ].map((s, i) => (
                    <div key={i} style={{ background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        <div style={{ fontSize: '40px', marginBottom: '10px' }}>{s.icon}</div>
                        <h3 style={{ margin: '5px 0' }}>{s.val}</h3>
                        <p style={{ color: theme.textLight, margin: 0 }}>{s.label}</p>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* LOGIN VIEW */}
        {!user && view === 'login' && (
          <div style={{ maxWidth: '400px', margin: '60px auto', background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Welcome Back</h2>
            <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: '600' }}>Full Name</label>
                <input id="l-name" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid #e2e8f0`, boxSizing: 'border-box' }} placeholder="e.g. Jonah Irande" />
            </div>
            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '5px', fontWeight: '600' }}>Password</label>
                <input id="l-pass" type="password" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid #e2e8f0`, boxSizing: 'border-box' }} placeholder="••••••••" />
            </div>
            {loginErr && <p style={{ color: theme.danger, fontSize: '13px', textAlign: 'center' }}>{loginErr}</p>}
            <button onClick={handleLogin} style={{ width: '100%', padding: '14px', background: theme.primary, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px' }}>Sign In to Dashboard</button>
            <p onClick={() => setView('landing')} style={{ textAlign: 'center', cursor: 'pointer', color: theme.secondary, fontSize: '14px' }}>← Back to Home</p>
          </div>
        )}

        {/* PATIENT DASHBOARD */}
        {user?.role === 'patient' && !user.isNew && (
           <div style={{ maxWidth: '800px', margin: 'auto' }}>
                <div style={{ background: theme.primary, color: 'white', padding: '40px', borderRadius: '24px', marginBottom: '30px', position: 'relative', overflow: 'hidden' }}>
                    <h2 style={{ margin: 0 }}>Hello, {user.name}!</h2>
                    <p style={{ opacity: 0.8 }}>Your health records are up to date.</p>
                    <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '150px', opacity: 0.1 }}>🩺</div>
                </div>

                {patients.filter(p => p.username === user.name).map(p => (
                    <div key={p._id} style={{ background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', border: '1px solid #edf2f7' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div>
                                <span style={{ background: '#e0e7ff', color: theme.primary, padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>{p.status.toUpperCase()}</span>
                                <h4 style={{ margin: '10px 0 0 0' }}>Consultation on {new Date(p.createdAt).toLocaleDateString()}</h4>
                            </div>
                            <button onClick={() => exportPatientReceipt(p)} style={{ height: '40px', padding: '0 20px', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Download Results</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#f8fafc', padding: '20px', borderRadius: '15px' }}>
                            <div>
                                <small style={{ color: theme.textLight }}>Your Symptoms</small>
                                <p style={{ margin: '5px 0' }}>{p.symptoms}</p>
                            </div>
                            <div>
                                <small style={{ color: theme.textLight }}>Assigned Doctor</small>
                                <p style={{ margin: '5px 0' }}>Dr. {p.assignedDoctor || 'Waiting...'}</p>
                            </div>
                        </div>
                        {p.status === 'Completed' && (
                            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                <h4 style={{ color: theme.accent }}>Doctor's Feedback</h4>
                                <p><strong>Diagnosis:</strong> {p.diagnosis}</p>
                                <p><strong>Prescription:</strong> {p.prescription}</p>
                            </div>
                        )}
                    </div>
                ))}
           </div>
        )}

        {/* ADMIN DASHBOARD (Simplified Table) */}
        {user?.role === 'admin' && (
            <div style={{ maxWidth: '1100px', margin: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
                    <div>
                        <h1>Triage Center</h1>
                        <p style={{ color: theme.textLight }}>Assign doctors and manage patient flow</p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '24px', fontWeight: '800' }}>{stats.pending}</span>
                            <p style={{ margin: 0, fontSize: '12px', color: theme.warning, fontWeight: '700' }}>AWAITING CARE</p>
                        </div>
                        <input type="text" placeholder="Search by name..." style={{ padding: '10px 15px', borderRadius: '10px', border: '1px solid #ddd' }} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                </div>

                <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f8fafc', borderBottom: '1px solid #eee' }}>
                            <tr>
                                <th style={{ padding: '20px' }}>Patient</th>
                                <th style={{ padding: '20px' }}>Status</th>
                                <th style={{ padding: '20px' }}>Assignment</th>
                                <th style={{ padding: '20px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {patients.filter(p => p.username.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                                <tr key={p._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '20px' }}>
                                        <div style={{ fontWeight: '600' }}>{p.username}</div>
                                        <div style={{ fontSize: '12px', color: theme.textLight }}>{p.location} • {p.age}</div>
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        <span style={{ 
                                            padding: '4px 10px', 
                                            borderRadius: '6px', 
                                            fontSize: '11px', 
                                            fontWeight: '700', 
                                            background: p.status === 'Pending' ? '#fffbeb' : '#ecfdf5',
                                            color: p.status === 'Pending' ? theme.warning : theme.accent
                                        }}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        {p.status === 'Pending' ? (
                                            <select 
                                                onChange={(e) => axios.put(`${API}/assign`, { patientId: p._id, doctorName: e.target.value }).then(loadData)}
                                                style={{ padding: '5px', borderRadius: '5px' }}
                                            >
                                                <option>Assign Doctor...</option>
                                                <option value="Jonah Irande">Dr. Jonah</option>
                                                <option value="Oluwatosin Daniel">Dr. Daniel</option>
                                                <option value="Faith Bitrus">Dr. Faith</option>
                                            </select>
                                        ) : <strong>Dr. {p.assignedDoctor}</strong>}
                                    </td>
                                    <td style={{ padding: '20px' }}>
                                        <button onClick={() => axios.delete(`${API}/patients/${p._id}`).then(loadData)} style={{ color: theme.danger, border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* DOCTOR VIEW */}
        {user?.role === 'doctor' && (
            <div style={{ maxWidth: '800px', margin: 'auto' }}>
                <div style={{ marginBottom: '30px' }}>
                    <h1>Welcome, Dr. {user.name}</h1>
                    <p style={{ color: theme.textLight }}>You have {patients.filter(p => p.assignedDoctor === user.name && p.status === 'Assigned').length} patients waiting for diagnosis.</p>
                </div>

                {patients.filter(p => p.assignedDoctor === user.name && p.status === 'Assigned').map(p => (
                    <div key={p._id} style={{ background: 'white', padding: '30px', borderRadius: '24px', marginBottom: '20px', border: '1px solid #eee' }}>
                        <h3 style={{ marginTop: 0 }}>Patient: {p.username}</h3>
                        <p style={{ background: '#f1f5f9', padding: '15px', borderRadius: '10px' }}><strong>Symptoms:</strong> {p.symptoms}</p>
                        
                        <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
                            <input id={`diag-${p._id}`} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd' }} placeholder="Enter Diagnosis..." />
                            <textarea id={`pres-${p._id}`} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #ddd', height: '80px' }} placeholder="Enter Prescription..." />
                            <button 
                                onClick={async () => {
                                    const d = document.getElementById(`diag-${p._id}`).value;
                                    const pr = document.getElementById(`pres-${p._id}`).value;
                                    await axios.put(`${API}/diagnose`, { patientId: p._id, diagnosis: d, prescription: pr });
                                    loadData();
                                }}
                                style={{ padding: '15px', background: theme.primary, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                Submit & Finalize Case
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}

      </main>
    </div>
  );
}

export default App;
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

  // Form State for Registration
  const [regData, setRegData] = useState({
    username: '', password: '', age: 'Adult (18-64)', 
    location: '', symptoms: ''
  });

  const theme = {
    primary: '#1e40af', secondary: '#3b82f6', accent: '#10b981', 
    bg: '#f8fafc', white: '#ffffff', textDark: '#1e293b', 
    textLight: '#64748b', danger: '#ef4444', warning: '#f59e0b'
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

  // --- HANDLERS ---
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/register`, regData);
      alert("Registration Successful! Please login.");
      setView('login');
    } catch (err) { alert("Registration failed."); }
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

  const exportPatientReceipt = (p) => {
    const text = `BLUCLINIC REPORT\nPatient: ${p.username}\nDiagnosis: ${p.diagnosis}\nPrescription: ${p.prescription}`;
    const file = new Blob([text], {type: 'text/plain'});
    const element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = `Report_${p.username}.txt`;
    element.click();
  };

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
            </div>
          </div>
        )}

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
            </form>
          </div>
        )}

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
            </div>
          </div>
        )}

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

      </main>
    </div>
  );
}

export default App;
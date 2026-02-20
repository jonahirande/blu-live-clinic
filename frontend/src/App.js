import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = "http://backend-url-blu-live-clinic.apps.lab.ocp.bludive/api";

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
    if (user) {
      loadData();
      const interval = setInterval(loadData, 5000); 
      return () => clearInterval(interval);
    }
  }, [user]);

  // Modern Professional Palette
  const colors = {
    bg: '#f8fafc',
    card: '#ffffff',
    primary: '#1e293b', // Deep Slate
    accent: '#3b82f6',  // Professional Blue
    success: '#10b981',
    textMain: '#0f172a',
    textMuted: '#64748b',
    border: '#e2e8f0'
  };

  const filteredPatients = patients.filter(p => 
    p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone && p.phone.includes(searchTerm))
  );

  const handleLogin = () => {
    const name = document.getElementById('l-name').value;
    const pass = document.getElementById('l-pass').value;
    if (name === 'admin' && pass === 'p@ssw0rd') return setUser({ name: 'admin', role: 'admin' });
    const doctors = ['Jonah Irande', 'Oluwatosin Daniel', 'Faith Bitrus'];
    if (doctors.includes(name) && pass === 'p@ssw0rd') return setUser({ name: name, role: 'doctor' });
    const found = patients.find(p => p.username === name && p.password === pass);
    if (found) setUser({ name: found.username, role: 'patient' });
    else setLoginErr("Invalid Credentials");
  };

  // The Data Extraction Logic
  const exportAuditLog = () => {
    const headers = ["Name", "Phone", "Age", "Location", "Status", "Doctor", "Symptoms", "Diagnosis", "Date"];
    const rows = filteredPatients.map(p => [
      `"${p.username}"`, `"${p.phone || ''}"`, `"${p.age}"`, `"${p.location}"`,
      `"${p.status}"`, `"${p.assignedDoctor || ''}"`, `"${(p.symptoms || '').replace(/"/g, '""')}"`,
      `"${(p.diagnosis || '').replace(/"/g, '""')}"`, `"${new Date(p.createdAt).toLocaleDateString()}"`
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Clinic_Audit_${new Date().getTime()}.csv`;
    link.click();
  };

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh', fontFamily: '"Inter", sans-serif', color: colors.textMain }}>
      {/* Navbar */}
      <nav style={{ backgroundColor: colors.primary, padding: '1rem 2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: 0, letterSpacing: '-0.5px' }}>BLUCLINIC<span style={{color: colors.accent}}>+</span></h2>
        {user && <button onClick={() => {setUser(null); setView('landing');}} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>}
      </nav>

      <main style={{ padding: '2rem' }}>
        
        {/* LANDING VIEW */}
        {!user && view === 'landing' && (
          <div style={{ textAlign: 'center', marginTop: '10vh' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Healthcare management <br/><span style={{color: colors.accent}}>simplified.</span></h1>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
              <button onClick={() => setView('register')} style={{ padding: '12px 24px', background: colors.accent, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>New Patient Registration</button>
              <button onClick={() => setView('login')} style={{ padding: '12px 24px', background: 'white', color: colors.primary, border: `1px solid ${colors.border}`, borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Portal Login</button>
            </div>
          </div>
        )}

        {/* ADMIN VIEW */}
        {user?.role === 'admin' && (
          <div style={{ maxWidth: '1200px', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ margin: 0 }}>Clinical Oversight</h1>
                <p style={{ color: colors.textMuted }}>Manage assignments and extract audit data</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="Filter records..." 
                  style={{ padding: '10px', borderRadius: '8px', border: `1px solid ${colors.border}`, width: '250px' }}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {/* THIS IS THE EXTRACTION BUTTON */}
                <button onClick={exportAuditLog} style={{ background: colors.success, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                   Extract Data (CSV)
                </button>
              </div>
            </div>
            
            <div style={{ background: 'white', borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f1f5f9' }}>
                  <tr>
                    <th style={{padding:'15px', borderBottom: `1px solid ${colors.border}`}}>Patient Detail</th>
                    <th style={{padding:'15px', borderBottom: `1px solid ${colors.border}`}}>Location</th>
                    <th style={{padding:'15px', borderBottom: `1px solid ${colors.border}`}}>Status</th>
                    <th style={{padding:'15px', borderBottom: `1px solid ${colors.border}`}}>Assignment</th>
                    <th style={{padding:'15px', borderBottom: `1px solid ${colors.border}`}}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map(p => (
                    <tr key={p._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td style={{padding:'15px'}}>
                        <div style={{fontWeight:'600'}}>{p.username}</div>
                        <div style={{fontSize:'12px', color: colors.accent}}>{p.phone || 'No Phone'}</div>
                      </td>
                      <td style={{padding:'15px'}}>{p.age} | {p.location}</td>
                      <td style={{padding:'15px'}}>
                        <span style={{ fontSize:'11px', fontWeight:'700', textTransform:'uppercase', color: p.status === 'Pending' ? '#b45309' : '#15803d' }}>
                          ● {p.status}
                        </span>
                      </td>
                      <td style={{padding:'15px'}}>
                        {p.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {['Jonah', 'Oluwatosin', 'Faith'].map(doc => (
                              <button key={doc} onClick={() => axios.put(`${API}/assign`, { patientId: p._id, doctorName: doc === 'Jonah' ? 'Jonah Irande' : doc === 'Oluwatosin' ? 'Oluwatosin Daniel' : 'Faith Bitrus' }).then(loadData)} style={{ fontSize: '10px', padding: '4px 8px', cursor: 'pointer' }}>{doc}</button>
                            ))}
                          </div>
                        ) : <span style={{fontWeight:'600', fontSize:'13px'}}>{p.assignedDoctor}</span>}
                      </td>
                      <td style={{padding:'15px'}}>
                        <button onClick={() => { if(window.confirm('Delete?')) axios.delete(`${API}/patients/${p._id}`).then(loadData); }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
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
            <h1 style={{ marginBottom: '0.5rem' }}>Welcome, Dr. {user.name.split(' ')[0]}</h1>
            <p style={{ color: colors.textMuted, marginBottom: '2rem' }}>Active Consultation Queue</p>
            
            {/* NO MORE PATIENTS LOGIC */}
            {patients.filter(p => p.assignedDoctor === user.name && p.status === 'Assigned').length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '12px', border: `1px solid ${colors.border}` }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☕</div>
                <h3 style={{ margin: 0, color: colors.textMain }}>All caught up!</h3>
                <p style={{ color: colors.textMuted }}>There are no more patients on your queue at the moment.</p>
              </div>
            ) : (
              patients.filter(p => p.assignedDoctor === user.name && p.status === 'Assigned').map(p => (
                <div key={p._id} style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '16px', border: `1px solid ${colors.border}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h3>{p.username} <span style={{fontSize:'14px', color:colors.textMuted, fontWeight:'400'}}>({p.age})</span></h3>
                    <span style={{ color: colors.accent, fontWeight: '600' }}>{p.phone}</span>
                  </div>
                  <p style={{ background: '#f1f5f9', padding: '12px', borderRadius: '8px', fontSize: '14px' }}><strong>Symptoms:</strong> {p.symptoms}</p>
                  <input id={`diag-${p._id}`} style={{ width: '100%', padding: '12px', marginBottom: '8px', borderRadius: '6px', border: `1px solid ${colors.border}`, boxSizing: 'border-box' }} placeholder="Diagnosis" />
                  <input id={`pres-${p._id}`} style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '6px', border: `1px solid ${colors.border}`, boxSizing: 'border-box' }} placeholder="Prescription" />
                  <button onClick={async () => {
                    const d = document.getElementById(`diag-${p._id}`).value;
                    const pr = document.getElementById(`pres-${p._id}`).value;
                    if(!d || !pr) return alert("Please fill both fields");
                    await axios.put(`${API}/diagnose`, { patientId: p._id, diagnosis: d, prescription: pr });
                    loadData();
                  }} style={{ width: '100%', padding: '12px', background: colors.primary, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Complete Consultation</button>
                </div>
              ))
            )}
          </div>
        )}

        {/* ... LOGIN/REGISTER VIEWS (Apply similar styling) ... */}
        {/* Simplified Login/Register styles for brevity in this snippet */}

      </main>
    </div>
  );
}

export default App;
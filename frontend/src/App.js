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

  const colors = {
    bg: '#f1f5f9',
    card: '#ffffff',
    primary: '#312e81',
    accent: '#4f46e5',
    success: '#059669',
    warning: '#d97706',
    textMain: '#1e293b',
    textMuted: '#64748b',
    border: '#e2e8f0'
  };

  // Helper to generate the text content for Export/Print
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
    SYMPTOMS REPORTED:
    ${p.symptoms}

    DIAGNOSIS:
    ${p.diagnosis}

    PRESCRIPTION:
    ${p.prescription}
    ------------------------------------------
    This is a computer-generated medical record.
    ==========================================
    `;
  };

  const exportPatientReceipt = (p) => {
    const reportContent = generateReportText(p);
    const element = document.createElement("a");
    const file = new Blob([reportContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `BluClinic_Report_${p.username}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  const printPatientReceipt = (p) => {
    const reportContent = generateReportText(p);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`<pre style="font-family: monospace; padding: 20px;">${reportContent}</pre>`);
    printWindow.document.close();
    printWindow.print();
  };

  const filteredPatients = patients.filter(p => 
    p.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.phone && p.phone.includes(searchTerm))
  );

  const stats = {
    total: patients.length,
    pending: patients.filter(p => p.status === 'Pending').length,
    assigned: patients.filter(p => p.status === 'Assigned').length,
    completed: patients.filter(p => p.status === 'Completed').length
  };

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
    link.download = `BluClinic_Audit_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div style={{ backgroundColor: colors.bg, minHeight: '100vh', fontFamily: 'sans-serif', color: colors.textMain }}>
      <nav style={{ backgroundColor: colors.primary, padding: '1rem 3rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontWeight: '800' }}>BLUCLINIC<span style={{color: '#93c5fd'}}>+</span></h2>
        {user && <button onClick={() => {setUser(null); setView('landing');}} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer' }}>Sign Out</button>}
      </nav>

      <main style={{ padding: '2.5rem 3rem' }}>
        
        {!user && view === 'landing' && (
          <div style={{ maxWidth: '1000px', margin: 'auto' }}>
            <div style={{ textAlign: 'center', background: 'white', padding: '60px', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginTop: '2vh' }}>
              <h1 style={{ fontSize: '48px', color: colors.primary, marginBottom: '10px' }}>BluClinic</h1>
              <p style={{ fontSize: '20px', color: colors.accent, fontWeight: 'bold', marginBottom: '40px' }}>Quality Healthcare at your fingertips</p>
              <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <button onClick={() => setView('register')} style={{ padding: '18px 40px', background: colors.accent, color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>Register as New Patient</button>
                <button onClick={() => setView('login')} style={{ padding: '18px 40px', background: colors.primary, color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' }}>Portal Login</button>
              </div>
            </div>

            {/* NEW HEALTH TIPS SECTION */}
            <div style={{ marginTop: '50px' }}>
              <h3 style={{ color: colors.primary, borderBottom: `2px solid ${colors.accent}`, display: 'inline-block', paddingBottom: '5px', marginBottom: '25px' }}>Weekly Health Insights</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                {[
                  { title: "Hydration Hacks", text: "Drinking water first thing in the morning boosts metabolism and brain function.", icon: "💧" },
                  { title: "Eye Strain", text: "Follow the 20-20-20 rule: every 20 minutes, look 20 feet away for 20 seconds.", icon: "👁️" },
                  { title: "Better Sleep", text: "Avoid blue light screens at least 1 hour before bedtime for deeper REM sleep.", icon: "🌙" }
                ].map((tip, idx) => (
                  <div key={idx} style={{ background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                    <div style={{ fontSize: '30px', marginBottom: '10px' }}>{tip.icon}</div>
                    <h4 style={{ margin: '0 0 10px 0', color: colors.accent }}>{tip.title}</h4>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5', color: colors.textMuted }}>{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!user && view === 'login' && (
          <div style={{ maxWidth: '400px', margin: 'auto', background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3>Portal Login</h3>
            <input id="l-name" style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: `1px solid ${colors.border}`, boxSizing: 'border-box' }} placeholder="Full Name" />
            <input id="l-pass" type="password" style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: `1px solid ${colors.border}`, boxSizing: 'border-box' }} placeholder="Password" />
            {loginErr && <p style={{ color: 'red', fontSize: '13px' }}>{loginErr}</p>}
            <button onClick={handleLogin} style={{ width: '100%', padding: '15px', background: colors.primary, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Sign In</button>
            <p onClick={() => {setView('landing'); setLoginErr("");}} style={{ textAlign: 'center', cursor: 'pointer', color: colors.accent }}>← Back</p>
          </div>
        )}

        {!user && view === 'register' && (
          <div style={{ maxWidth: '500px', margin: 'auto', background: 'white', padding: '40px', borderRadius: '20px' }}>
            <h3 style={{ color: colors.accent }}>Create Patient Account</h3>
            <input id="r-name" style={{ width: '100%', padding: '12px', marginBottom: '12px', border: `1px solid ${colors.border}` }} placeholder="Full Name" />
            <input id="r-phone" style={{ width: '100%', padding: '12px', marginBottom: '12px', border: `1px solid ${colors.border}` }} placeholder="Phone Number" />
            <select id="r-age" style={{ width: '100%', padding: '12px', marginBottom: '12px' }}>
               <option value="">Select Age Group...</option>
               <option value="Infant (0-2)">Infant (0-2)</option>
               <option value="Child (3-12)">Child (3-12)</option>
               <option value="Teenager (13-19)">Teenager (13-19)</option>
               <option value="Young Adult (20-35)">Young Adult (20-35)</option>
               <option value="Adult (36-55)">Adult (36-55)</option>
               <option value="Senior (56+)">Senior (56+)</option>
            </select>
            <input id="r-pass" type="password" style={{ width: '100%', padding: '12px', marginBottom: '12px', border: `1px solid ${colors.border}` }} placeholder="Choose Password" />
            <input id="r-loc" style={{ width: '100%', padding: '12px', marginBottom: '12px', border: `1px solid ${colors.border}` }} placeholder="Location" />
            <button style={{ width: '100%', padding: '15px', background: colors.accent, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold' }} onClick={() => {
              const n = document.getElementById('r-name').value;
              const ph = document.getElementById('r-phone').value;
              const a = document.getElementById('r-age').value;
              const p = document.getElementById('r-pass').value;
              const l = document.getElementById('r-loc').value;
              if(!n || !p || !ph) return alert("Fill Name, Phone and Password");
              setUser({ name: n, phone: ph, role: 'patient', age: a, location: l, pass: p, isNew: true });
            }}>Next: Describe Symptoms</button>
            <p onClick={() => setView('landing')} style={{ textAlign: 'center', cursor: 'pointer', color: colors.accent, marginTop: '15px' }}>← Back</p>
          </div>
        )}

        {/* PATIENT DASHBOARD */}
        {user?.role === 'patient' && (
          <div style={{ maxWidth: '750px', margin: 'auto' }}>
            {user.isNew ? (
              <div style={{ background: 'white', padding: '40px', borderRadius: '24px' }}>
                <h3>Symptoms for {user.name}</h3>
                <textarea id="p-symp" style={{ width: '100%', height: '150px', padding: '15px', borderRadius: '12px', border: `1px solid ${colors.border}` }} placeholder="Describe how you feel..."></textarea>
                <button style={{ width: '100%', padding: '15px', marginTop: '20px', background: colors.accent, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold' }} onClick={async () => {
                  const s = document.getElementById('p-symp').value;
                  await axios.post(`${API}/register`, { username: user.name, password: user.pass, phone: user.phone, symptoms: s, location: user.location, age: user.age });
                  setUser({...user, isNew: false});
                  loadData();
                }}>Submit Medical Record</button>
              </div>
            ) : (
              <div>
                <h1 style={{ marginBottom: '20px' }}>Patient Dashboard</h1>
                <p style={{ color: colors.textMuted }}>Welcome back, {user.name}. View your consultation status below.</p>
                {patients.filter(p => p.username === user.name).length === 0 ? <p>No records found. If you just registered, wait a few seconds...</p> : 
                  patients.filter(p => p.username === user.name).map(p => (
                    <div key={p._id} style={{ background: 'white', padding: '30px', borderRadius: '24px', borderLeft: `8px solid ${colors.accent}`, marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', color: colors.textMuted }}>Visit Date: {new Date(p.createdAt).toLocaleDateString()}</span>
                        <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', background: p.status === 'Completed' ? '#d1e7dd' : '#fef3c7', color: p.status === 'Completed' ? '#065f46' : '#92400e' }}>{p.status}</span>
                      </div>
                      <div style={{ marginTop: '20px' }}>
                        <p><strong>Your Symptoms:</strong> {p.symptoms}</p>
                        {p.status === 'Assigned' && <p style={{ color: colors.accent }}><strong>Status:</strong> Dr. {p.assignedDoctor} is reviewing your case.</p>}
                        {p.status === 'Completed' && (
                          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', marginTop: '15px' }}>
                            <p><strong>Diagnosis:</strong> {p.diagnosis}</p>
                            <p><strong>Prescription:</strong> {p.prescription}</p>
                            <hr style={{ border: 'none', borderTop: `1px solid ${colors.border}`, margin: '15px 0' }} />
                            <div style={{ display: 'flex', gap: '10px' }}>
                              <button onClick={() => exportPatientReceipt(p)} style={{ background: colors.success, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                📥 Download (.txt)
                              </button>
                              <button onClick={() => printPatientReceipt(p)} style={{ background: colors.primary, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                🖨️ Print Report
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        )}

        {/* ADMIN VIEW */}
        {user?.role === 'admin' && (
          <div style={{ maxWidth: '1200px', margin: 'auto' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Administrative Control</h1>
                <p style={{ color: colors.textMuted }}>Review triage flow and download audit records</p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input type="text" placeholder="Search records..." style={{ padding: '12px', borderRadius: '10px', border: `1px solid ${colors.border}`, width: '300px' }} onChange={(e) => setSearchTerm(e.target.value)} />
                <button onClick={exportAuditLog} style={{ background: colors.accent, color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Extract Details</button>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
              {[
                { label: 'Total Patients', val: stats.total, col: colors.primary },
                { label: 'Awaiting Triage', val: stats.pending, col: colors.warning },
                { label: 'In Consultation', val: stats.assigned, col: colors.accent },
                { label: 'Completed', val: stats.completed, col: colors.success }
              ].map(s => (
                <div key={s.label} style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
                  <div style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '700', textTransform: 'uppercase' }}>{s.label}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: s.col }}>{s.val}</div>
                </div>
              ))}
            </div>
            <div style={{ background: 'white', borderRadius: '16px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{padding:'20px', textAlign:'left'}}>PATIENT</th>
                    <th style={{padding:'20px', textAlign:'left'}}>LOCATION</th>
                    <th style={{padding:'20px', textAlign:'left'}}>STATUS</th>
                    <th style={{padding:'20px', textAlign:'left'}}>ASSIGNMENT</th>
                    <th style={{padding:'20px', textAlign:'right'}}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map(p => (
                    <tr key={p._id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td style={{padding:'20px'}}>
                        <div style={{fontWeight:'700'}}>{p.username}</div>
                        <div style={{fontSize:'13px', color: colors.accent}}>{p.phone || 'N/A'}</div>
                      </td>
                      <td style={{padding:'20px'}}>{p.age} • {p.location}</td>
                      <td style={{padding:'20px'}}>
                        <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', background: p.status === 'Pending' ? '#fef3c7' : p.status === 'Assigned' ? '#e0e7ff' : '#d1e7dd' }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{padding:'20px'}}>
                        {p.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {['Jonah', 'Oluwatosin', 'Faith'].map(doc => (
                              <button key={doc} onClick={() => axios.put(`${API}/assign`, { patientId: p._id, doctorName: doc === 'Jonah' ? 'Jonah Irande' : doc === 'Oluwatosin' ? 'Oluwatosin Daniel' : 'Faith Bitrus' }).then(loadData)} style={{ padding: '4px 8px', cursor: 'pointer' }}>{doc}</button>
                            ))}
                          </div>
                        ) : <strong>{p.assignedDoctor}</strong>}
                      </td>
                      <td style={{padding:'20px', textAlign:'right'}}>
                        <button onClick={async () => {
                          const newPass = prompt(`Enter new password for ${p.username}:`);
                          if(newPass) await axios.put(`${API}/reset-password`, { patientId: p._id, newPassword: newPass }).then(() => alert("Reset done"));
                        }} style={{ color: colors.accent, border: 'none', background: 'none', cursor: 'pointer', marginRight: '10px', fontSize: '12px', fontWeight: 'bold' }}>Reset</button>
                        <button onClick={() => axios.delete(`${API}/patients/${p._id}`).then(loadData)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
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
          <div style={{ maxWidth: '850px', margin: 'auto' }}>
            <h1>Dr. {user.name}</h1>
            {patients.filter(p => p.assignedDoctor === user.name && p.status === 'Assigned').length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem', background: 'white', borderRadius: '24px', border: `2px dashed ${colors.border}` }}>
                <h2>✅ Queue Empty</h2>
                <p>No patients currently waiting.</p>
              </div>
            ) : (
              patients.filter(p => p.assignedDoctor === user.name && p.status === 'Assigned').map(p => (
                <div key={p._id} style={{ background: 'white', padding: '2rem', borderRadius: '20px', marginBottom: '1.5rem', border: `1px solid ${colors.border}` }}>
                  <h3>{p.username} ({p.age})</h3>
                  <input id={`diag-${p._id}`} style={{ width: '100%', padding: '12px', marginBottom: '10px' }} placeholder="Diagnosis" />
                  <input id={`pres-${p._id}`} style={{ width: '100%', padding: '12px', marginBottom: '15px' }} placeholder="Prescription" />
                  <button onClick={async () => {
                    const d = document.getElementById(`diag-${p._id}`).value;
                    const pr = document.getElementById(`pres-${p._id}`).value;
                    await axios.put(`${API}/diagnose`, { patientId: p._id, diagnosis: d, prescription: pr });
                    loadData();
                  }} style={{ width: '100%', padding: '15px', background: colors.primary, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold' }}>Finalize</button>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
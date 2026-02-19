import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = "http://backend-url-blu-live-clinic.apps.lab.ocp.bludive/api";

function App() {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [view, setView] = useState('landing'); 
  const [loginErr, setLoginErr] = useState("");

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
    skyBlue: '#f0f9ff',
    brightBlue: '#0ea5e9',
    darkBlue: '#1e40af',
    deepText: '#1e3a8a',
    success: '#10b981'
  };

  const handleLogin = () => {
    const name = document.getElementById('l-name').value;
    const pass = document.getElementById('l-pass').value;
    
    if (name === 'admin' && pass === 'p@ssw0rd') {
      return setUser({ name: 'admin', role: 'admin' });
    }
    const doctors = ['Jonah Irande', 'Oluwatosin Daniel', 'Faith Bitrus'];
    if (doctors.includes(name) && pass === 'p@ssw0rd') {
      return setUser({ name: name, role: 'doctor' });
    }

    const found = patients.find(p => p.username === name && p.password === pass);
    if (found) {
      setUser({ name: found.username, role: 'patient' });
    } else {
      setLoginErr("Invalid Name or Password");
    }
  };

  return (
    <div style={{ backgroundColor: colors.skyBlue, minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* NAVBAR */}
      <nav style={{ backgroundColor: colors.darkBlue, padding: '15px 30px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontWeight: '900' }}>BLUCLINIC +</h1>
        {user && <button onClick={() => {setUser(null); setView('landing');}} style={{ background: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Logout</button>}
      </nav>

      <main style={{ padding: '40px' }}>
        {/* LANDING */}
        {!user && view === 'landing' && (
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: 'auto', background: 'white', padding: '50px', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '40px', color: colors.darkBlue, marginBottom: '10px' }}>BluClinic</h2>
            <p style={{ fontSize: '18px', color: colors.brightBlue, fontWeight: 'bold', marginBottom: '40px' }}>Quality healthcare at your fingertips</p>
            <div style={{ display: 'grid', gap: '15px' }}>
              <button onClick={() => setView('register')} style={{ padding: '20px', background: colors.brightBlue, color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>Register as New Patient</button>
              <button onClick={() => setView('login')} style={{ padding: '20px', background: colors.darkBlue, color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>Portal Login</button>
            </div>
          </div>
        )}

        {/* LOGIN */}
        {!user && view === 'login' && (
          <div style={{ maxWidth: '400px', margin: 'auto', background: 'white', padding: '30px', borderRadius: '20px' }}>
            <h3>Portal Login</h3>
            <input id="l-name" style={{ width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box' }} placeholder="Full Name" />
            <input id="l-pass" type="password" style={{ width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box' }} placeholder="Password" />
            {loginErr && <p style={{ color: 'red', fontSize: '12px' }}>{loginErr}</p>}
            <button onClick={handleLogin} style={{ width: '100%', padding: '15px', background: colors.darkBlue, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Sign In</button>
            <p onClick={() => {setView('landing'); setLoginErr("");}} style={{ textAlign: 'center', cursor: 'pointer', color: colors.brightBlue }}>← Back</p>
          </div>
        )}

        {/* REGISTER */}
        {!user && view === 'register' && (
          <div style={{ maxWidth: '500px', margin: 'auto', background: 'white', padding: '40px', borderRadius: '20px' }}>
            <h3 style={{ color: colors.brightBlue }}>Create Patient Account</h3>
            <input id="r-name" style={{ width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box' }} placeholder="Full Name" />
            
            {/* RESTORED AGE GROUP DROPDOWN */}
            <select id="r-age" style={{ width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box', borderRadius: '5px' }}>
               <option value="Young Adult">Young Adult</option>
               <option value="Adult">Adult</option>
               <option value="Senior">Senior</option>
            </select>

            <input id="r-pass" type="password" style={{ width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box' }} placeholder="Choose Password" />
            <input id="r-loc" style={{ width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box' }} placeholder="Location" />
            <button style={{ width: '100%', padding: '15px', background: colors.brightBlue, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => {
              const n = document.getElementById('r-name').value;
              const a = document.getElementById('r-age').value;
              const p = document.getElementById('r-pass').value;
              const l = document.getElementById('r-loc').value;
              if(!n || !p) return alert("Fill required fields");
              setUser({ name: n, role: 'patient', age: a, location: l, pass: p, isNew: true });
            }}>Next: Describe Symptoms</button>
            <p onClick={() => setView('landing')} style={{ textAlign: 'center', cursor: 'pointer', color: colors.brightBlue }}>← Back</p>
          </div>
        )}

        {/* PATIENT DASHBOARD */}
        {user?.role === 'patient' && (
          <div style={{ maxWidth: '700px', margin: 'auto' }}>
            {user.isNew ? (
              <div style={{ background: 'white', padding: '30px', borderRadius: '20px' }}>
                <h3>Symptoms for {user.name} ({user.age})</h3>
                <textarea id="p-symp" style={{ width: '100%', height: '100px', padding: '10px', boxSizing: 'border-box' }} placeholder="How are you feeling?"></textarea>
                <button style={{ width: '100%', padding: '15px', marginTop: '10px', background: colors.brightBlue, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }} onClick={async () => {
                  const s = document.getElementById('p-symp').value;
                  await axios.post(`${API}/register`, { 
                    username: user.name, 
                    password: user.pass, 
                    symptoms: s, 
                    location: user.location, 
                    age: user.age 
                  });
                  alert("Registered successfully!");
                  setUser({...user, isNew: false});
                  loadData();
                }}>Submit Record</button>
              </div>
            ) : (
              <div>
                <h2>Welcome, {user.name}</h2>
                {patients.filter(p => p.username === user.name).map(p => (
                  <div key={p._id} style={{ background: 'white', padding: '30px', borderRadius: '20px', borderLeft: `8px solid ${colors.brightBlue}`, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <p style={{ fontSize: '18px' }}>Status: <strong style={{ color: colors.brightBlue }}>{p.status === 'Pending' ? 'Unassigned' : p.status}</strong></p>
                    {p.status === 'Assigned' && <p>You have been assigned to <strong>{p.assignedDoctor}</strong>.</p>}
                    {p.status === 'Completed' && (
                      <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', marginTop: '15px' }}>
                        <p><strong>Diagnosis:</strong> {p.diagnosis}</p>
                        <p><strong>Prescription:</strong> {p.prescription}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADMIN DASHBOARD */}
        {user?.role === 'admin' && (
          <div style={{ maxWidth: '1000px', margin: 'auto' }}>
            <h2>Admin Triage Control</h2>
            <div style={{ background: 'white', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead style={{ background: colors.darkBlue, color: 'white' }}>
                  <tr>
                    <th style={{padding:'15px'}}>Patient</th>
                    <th style={{padding:'15px'}}>Age/Loc</th>
                    <th style={{padding:'15px'}}>Status</th>
                    <th style={{padding:'15px'}}>Assignment</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{padding:'15px'}}><strong>{p.username}</strong></td>
                      <td style={{padding:'15px'}}>{p.age} | {p.location}</td>
                      <td style={{padding:'15px'}}>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', background: p.status === 'Completed' ? '#d1fae5' : '#fef3c7', color: p.status === 'Completed' ? '#065f46' : '#92400e' }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{padding:'15px'}}>
                        {p.status === 'Pending' && (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            {['Jonah Irande', 'Oluwatosin Daniel', 'Faith Bitrus'].map(doc => (
                              <button key={doc} onClick={() => axios.put(`${API}/assign`, { patientId: p._id, doctorName: doc }).then(loadData)} style={{ fontSize: '10px', cursor: 'pointer', padding: '5px' }}>{doc.split(' ')[0]}</button>
                            ))}
                          </div>
                        )}
                        {p.assignedDoctor && <span style={{ fontWeight: 'bold' }}>{p.assignedDoctor}</span>}
                      </td>
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
            <h2>Consultation Room: Dr. {user.name}</h2>
            {patients.filter(p => p.assignedDoctor === user.name && p.status === 'Assigned').map(p => (
              <div key={p._id} style={{ background: 'white', padding: '30px', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                <h3>{p.username} ({p.age})</h3>
                <p style={{ background: colors.skyBlue, padding: '10px', borderRadius: '8px' }}><strong>Symptoms:</strong> {p.symptoms}</p>
                <input id={`diag-${p._id}`} style={{ width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box' }} placeholder="Diagnosis" />
                <input id={`pres-${p._id}`} style={{ width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box' }} placeholder="Prescription" />
                <button style={{ width: '100%', padding: '15px', background: colors.darkBlue, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }} onClick={async () => {
                  const d = document.getElementById(`diag-${p._id}`).value;
                  const pr = document.getElementById(`pres-${p._id}`).value;
                  await axios.put(`${API}/diagnose`, { patientId: p._id, diagnosis: d, prescription: pr });
                  loadData();
                }}>Complete Treatment</button>
              </div>
            ))}
            {patients.filter(p => p.assignedDoctor === user.name && p.status === 'Assigned').length === 0 && <p>No active patients waiting for you.</p>}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
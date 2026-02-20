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
      <nav style={{ backgroundColor: colors.darkBlue, padding: '15px 30px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontWeight: '900' }}>BLUCLINIC +</h1>
        {user && <button onClick={() => {setUser(null); setView('landing');}} style={{ background: 'white', border: 'none', padding: '5px 15px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Logout</button>}
      </nav>

      <main style={{ padding: '40px' }}>
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

        {!user && view === 'register' && (
          <div style={{ maxWidth: '500px', margin: 'auto', background: 'white', padding: '40px', borderRadius: '20px' }}>
            <h3 style={{ color: colors.brightBlue }}>Create Patient Account</h3>
            <input id="r-name" style={{ width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box' }} placeholder="Full Name" />
            <input id="r-phone" style={{ width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box' }} placeholder="Phone Number (Required)" />
            <select id="r-age" style={{ width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box', borderRadius: '5px' }}>
               <option value="">Select Age Group...</option>
               <option value="Infant (0-2)">Infant (0-2)</option>
               <option value="Child (3-12)">Child (3-12)</option>
               <option value="Teenager (13-19)">Teenager (13-19)</option>
               <option value="Young Adult (20-35)">Young Adult (20-35)</option>
               <option value="Adult (36-55)">Adult (36-55)</option>
               <option value="Senior (56+)">Senior (56+)</option>
            </select>
            <input id="r-pass" type="password" style={{ width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box' }} placeholder="Choose Password" />
            <input id="r-loc" style={{ width: '100%', padding: '12px', marginBottom: '10px', boxSizing: 'border-box' }} placeholder="Location" />
            <button style={{ width: '100%', padding: '15px', background: colors.brightBlue, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => {
              const n = document.getElementById('r-name').value;
              const ph = document.getElementById('r-phone').value;
              const a = document.getElementById('r-age').value;
              const p = document.getElementById('r-pass').value;
              const l = document.getElementById('r-loc').value;
              if(!n || !p || !ph) return alert("Please fill Name, Password, and Phone");
              setUser({ name: n, phone: ph, role: 'patient', age: a, location: l, pass: p, isNew: true });
            }}>Next: Describe Symptoms</button>
            <p onClick={() => setView('landing')} style={{ textAlign: 'center', cursor: 'pointer', color: colors.brightBlue }}>← Back</p>
          </div>
        )}

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
                    phone: user.phone, 
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
                  <div key={p._id} style={{ background: 'white', padding: '30px', borderRadius: '20px', borderLeft: `8px solid ${colors.brightBlue}`, marginBottom: '10px' }}>
                    <p>Status: <strong style={{ color: colors.brightBlue }}>{p.status}</strong></p>
                    {p.status === 'Assigned' && <p>Doctor: <strong>{p.assignedDoctor}</strong></p>}
                    {p.status === 'Completed' && <div style={{ background: '#f8fafc', padding: '10px' }}><p><strong>Diagnosis:</strong> {p.diagnosis}</p><p><strong>Prescription:</strong> {p.prescription}</p></div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {user?.role === 'admin' && (
          <div style={{ maxWidth: '1100px', margin: 'auto' }}>
            <h2>Admin Triage Control</h2>
            <div style={{ background: 'white', borderRadius: '15px', overflow: 'hidden' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead style={{ background: colors.darkBlue, color: 'white' }}>
                  <tr>
                    <th style={{padding:'15px'}}>Patient / Phone</th>
                    <th style={{padding:'15px'}}>Age/Loc</th>
                    <th style={{padding:'15px'}}>Status</th>
                    <th style={{padding:'15px'}}>Assignment</th>
                    <th style={{padding:'15px'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{padding:'15px'}}>
                        <strong>{p.username}</strong><br/>
                        <span style={{fontSize: '13px', color: p.phone ? colors.brightBlue : 'red', fontWeight: 'bold'}}>
                          📞 {p.phone || 'No Phone recorded'}
                        </span>
                      </td>
                      <td style={{padding:'15px'}}>{p.age} | {p.location}</td>
                      <td style={{padding:'15px'}}>{p.status}</td>
                      <td style={{padding:'15px'}}>
                        {p.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            {['Jonah Irande', 'Oluwatosin Daniel', 'Faith Bitrus'].map(doc => (
                              <button key={doc} onClick={() => axios.put(`${API}/assign`, { patientId: p._id, doctorName: doc }).then(loadData)} style={{ fontSize: '10px' }}>{doc.split(' ')[0]}</button>
                            ))}
                          </div>
                        ) : <span>{p.assignedDoctor}</span>}
                      </td>
                      <td style={{padding:'15px'}}>
                        <button onClick={() => { if(window.confirm('Delete record?')) axios.delete(`${API}/patients/${p._id}`).then(loadData); }} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '5px', borderRadius: '5px', cursor: 'pointer' }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {user?.role === 'doctor' && (
          <div style={{ maxWidth: '800px', margin: 'auto' }}>
            <h2>Dr. {user.name}'s Room</h2>
            {patients.filter(p => p.assignedDoctor === user.name && p.status === 'Assigned').map(p => (
              <div key={p._id} style={{ background: 'white', padding: '30px', borderRadius: '20px', marginBottom: '20px' }}>
                <h3>{p.username} ({p.age})</h3>
                <p><strong>Phone: {p.phone || 'N/A'}</strong></p>
                <p>Symptoms: {p.symptoms}</p>
                <input id={`diag-${p._id}`} style={{ width: '100%', marginBottom: '10px' }} placeholder="Diagnosis" />
                <input id={`pres-${p._id}`} style={{ width: '100%', marginBottom: '10px' }} placeholder="Prescription" />
                <button onClick={async () => {
                  const d = document.getElementById(`diag-${p._id}`).value;
                  const pr = document.getElementById(`pres-${p._id}`).value;
                  await axios.put(`${API}/diagnose`, { patientId: p._id, diagnosis: d, prescription: pr });
                  loadData();
                }}>Complete</button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
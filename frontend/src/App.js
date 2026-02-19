import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = "http://backend-url-blu-live-clinic.apps.lab.ocp.bludive/api";

function App() {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [view, setView] = useState('landing'); 

  const loadData = async () => {
    try {
      const res = await axios.get(`${API}/patients`);
      setPatients(res.data);
    } catch (err) {
      console.error("Error fetching patients", err);
    }
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
    success: '#10b981',
    warning: '#f59e0b'
  };

  return (
    <div style={{ backgroundColor: colors.skyBlue, minHeight: '100vh', color: colors.deepText, fontFamily: 'sans-serif' }}>
      
      <nav style={{ backgroundColor: colors.darkBlue, padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ backgroundColor: 'white', padding: '5px', borderRadius: '8px', color: colors.darkBlue, fontWeight: 'bold' }}>+</div>
          <h1 style={{ fontSize: '22px', fontWeight: '900' }}>LIVE-CLINIC</h1>
        </div>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span><strong>{user.name}</strong> ({user.role})</span>
            <button onClick={() => { setUser(null); setView('landing'); }} style={{ backgroundColor: 'white', color: colors.darkBlue, padding: '6px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Logout</button>
          </div>
        )}
      </nav>

      <main style={{ padding: '30px' }}>
        
        {/* LANDING */}
        {!user && view === 'landing' && (
          <div style={{ maxWidth: '600px', margin: '60px auto', textAlign: 'center', backgroundColor: 'white', padding: '50px', borderRadius: '30px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '900' }}>Clinic Portal</h2>
            <div style={{ display: 'grid', gap: '20px', marginTop: '30px' }}>
              <button onClick={() => setView('register')} style={{ backgroundColor: colors.brightBlue, color: 'white', padding: '20px', borderRadius: '15px', border: 'none', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}>New Patient Registration</button>
              <button onClick={() => setView('login')} style={{ backgroundColor: colors.darkBlue, color: 'white', padding: '20px', borderRadius: '15px', border: 'none', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }}>Login (Staff & Existing Patients)</button>
            </div>
          </div>
        )}

        {/* LOGIN VIEW (Now handles Patients too) */}
        {!user && view === 'login' && (
          <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: 'white', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
             <h2 style={{ textAlign: 'center' }}>Enter Name to Login</h2>
             <input id="login-name" style={{ width: '100%', padding: '15px', boxSizing: 'border-box', marginBottom: '15px', borderRadius: '10px', border: '1px solid #ddd' }} placeholder="Full Name" />
             <button style={{ width: '100%', padding: '15px', backgroundColor: colors.darkBlue, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold' }} onClick={() => {
               const val = document.getElementById('login-name').value;
               if(!val) return;
               const role = val === 'admin' ? 'admin' : (['Jonah Irande', 'Oluwatosin Daniel', 'Faith Bitrus'].includes(val) ? 'doctor' : 'patient');
               setUser({ name: val, role: role });
             }}>Login</button>
             <p onClick={() => setView('landing')} style={{ textAlign: 'center', cursor: 'pointer', marginTop: '15px', color: colors.brightBlue }}>← Back</p>
          </div>
        )}

        {/* REGISTER VIEW */}
        {!user && view === 'register' && (
          <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '25px' }}>
            <h2 style={{ color: colors.brightBlue }}>Patient Registration</h2>
            <input id="r-name" style={{ width: '100%', padding: '15px', marginBottom: '15px', boxSizing: 'border-box' }} placeholder="Full Name" />
            <select id="r-age" style={{ width: '100%', padding: '15px', marginBottom: '15px' }}>
               <option value="Young Adult">Young Adult</option>
               <option value="Adult">Adult</option>
               <option value="Senior">Senior</option>
            </select>
            <input id="r-loc" style={{ width: '100%', padding: '15px', marginBottom: '15px', boxSizing: 'border-box' }} placeholder="Location (City/State)" />
            <button style={{ width: '100%', padding: '15px', backgroundColor: colors.brightBlue, color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold' }} onClick={() => {
               const n = document.getElementById('r-name').value;
               const a = document.getElementById('r-age').value;
               const l = document.getElementById('r-loc').value;
               setUser({ name: n, role: 'patient', age: a, location: l, isNew: true });
            }}>Next: Symptoms</button>
          </div>
        )}

        {/* PATIENT DASHBOARD (Registration & Status View) */}
        {user?.role === 'patient' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {user.isNew ? (
              <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '25px' }}>
                <h3>Describe Symptoms</h3>
                <textarea id="p-symp" style={{ width: '100%', height: '150px', padding: '15px', boxSizing: 'border-box', marginBottom: '15px' }} placeholder="How do you feel?"></textarea>
                <button style={{ width: '100%', padding: '15px', backgroundColor: colors.brightBlue, color: 'white', border: 'none', borderRadius: '10px' }} onClick={async () => {
                   const s = document.getElementById('p-symp').value;
                   await axios.post(`${API}/register`, { username: user.name, symptoms: s, age: user.age, location: user.location });
                   alert("Registered! You can now track your status.");
                   setUser({ ...user, isNew: false });
                }}>Submit Record</button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                <h2 style={{ fontWeight: '900' }}>Medical Status: {user.name}</h2>
                {patients.filter(p => p.username === user.name).map(p => (
                  <div key={p._id} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '25px', borderLeft: `10px solid ${p.status === 'Completed' ? colors.success : colors.warning}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '20px' }}>Current Status:</span>
                      <span style={{ color: p.status === 'Completed' ? colors.success : colors.warning, fontWeight: '900', textTransform: 'uppercase' }}>
                        {p.status === 'Pending' ? 'Unassigned' : p.status === 'Assigned' ? 'Assigned' : 'Diagnosed'}
                      </span>
                    </div>
                    {p.status === 'Assigned' && <p style={{ marginTop: '10px' }}>You have been assigned to <strong>Dr. {p.assignedDoctor}</strong>. Please wait for the consultation.</p>}
                    
                    {p.status === 'Completed' && (
                      <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #f0f9ff' }}>
                        <div style={{ marginBottom: '15px' }}>
                          <label style={{ fontWeight: 'bold', color: colors.brightBlue }}>DIAGNOSIS:</label>
                          <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '10px', marginTop: '5px' }}>{p.diagnosis}</div>
                        </div>
                        <div>
                          <label style={{ fontWeight: 'bold', color: colors.brightBlue }}>PRESCRIPTION:</label>
                          <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '10px', marginTop: '5px', fontWeight: 'bold' }}>{p.prescription}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ADMIN DASHBOARD (Master View) */}
        {user?.role === 'admin' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontWeight: '900', marginBottom: '20px' }}>Clinic Master Control</h2>
            <div style={{ backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: colors.darkBlue, color: 'white' }}>
                  <tr>
                    <th style={{ padding: '20px' }}>Patient</th>
                    <th style={{ padding: '20px' }}>Status</th>
                    <th style={{ padding: '20px' }}>Doctor</th>
                    <th style={{ padding: '20px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #f0f9ff' }}>
                      <td style={{ padding: '15px' }}>
                        <strong>{p.username}</strong><br/>
                        <small>{p.location} | {p.age}</small>
                      </td>
                      <td style={{ padding: '15px' }}>
                        <span style={{ 
                          padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                          backgroundColor: p.status === 'Completed' ? '#d1fae5' : p.status === 'Assigned' ? '#fef3c7' : '#fee2e2',
                          color: p.status === 'Completed' ? '#065f46' : p.status === 'Assigned' ? '#92400e' : '#991b1b'
                        }}>
                          {p.status === 'Pending' ? 'Pending' : p.status === 'Assigned' ? 'Assigned' : 'Diagnosed'}
                        </span>
                      </td>
                      <td style={{ padding: '15px' }}>{p.assignedDoctor || 'Not Yet Assigned'}</td>
                      <td style={{ padding: '15px' }}>
                        {p.status === 'Pending' && (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={() => axios.put(`${API}/assign`, { patientId: p._id, doctorName: 'Jonah Irande' }).then(loadData)} style={{ fontSize: '10px', padding: '5px' }}>Assign Jonah</button>
                            <button onClick={() => axios.put(`${API}/assign`, { patientId: p._id, doctorName: 'Faith Bitrus' }).then(loadData)} style={{ fontSize: '10px', padding: '5px' }}>Assign Faith</button>
                          </div>
                        )}
                        {p.status === 'Completed' && <span style={{ color: colors.success, fontSize: '12px' }}>Done</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DOCTOR DASHBOARD (Unchanged Logic, Applied New Styles) */}
        {user?.role === 'doctor' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{ fontWeight: '900' }}>Active Consultations: Dr. {user.name}</h2>
            <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
              {patients.filter(p => p.assignedDoctor === user.name && p.status === 'Assigned').map(p => (
                <div key={p._id} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
                  <h3>{p.username}</h3>
                  <p style={{ backgroundColor: colors.skyBlue, padding: '15px', borderRadius: '10px' }}>{p.symptoms}</p>
                  <input id={`d-${p._id}`} style={{ width: '100%', padding: '12px', margin: '10px 0' }} placeholder="Diagnosis" />
                  <input id={`pr-${p._id}`} style={{ width: '100%', padding: '12px', margin: '10px 0' }} placeholder="Prescription" />
                  <button style={{ width: '100%', padding: '15px', backgroundColor: colors.darkBlue, color: 'white', borderRadius: '10px', border: 'none' }} onClick={async () => {
                    const d = document.getElementById(`d-${p._id}`).value;
                    const pr = document.getElementById(`pr-${p._id}`).value;
                    await axios.put(`${API}/diagnose`, { patientId: p._id, diagnosis: d, prescription: pr });
                    loadData();
                  }}>Finalize Treatment</button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
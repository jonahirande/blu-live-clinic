import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Ensure this matches your OpenShift Backend Route
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
    if (user && (user.role === 'admin' || user.role === 'doctor')) {
      loadData();
      const interval = setInterval(loadData, 5000); 
      return () => clearInterval(interval);
    }
  }, [user]);

  // COLOR CONSTANTS FOR GUARANTEED BRANDING
  const colors = {
    skyBlue: '#f0f9ff',
    brightBlue: '#0ea5e9',
    darkBlue: '#1e40af',
    deepText: '#1e3a8a'
  };

  return (
    <div style={{ backgroundColor: colors.skyBlue, minHeight: '100vh', color: colors.deepText, fontFamily: 'sans-serif' }}>
      
      {/* NAVIGATION BAR - FORCED DARK BLUE */}
      <nav style={{ backgroundColor: colors.darkBlue, padding: '20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ backgroundColor: 'white', padding: '5px', borderRadius: '8px', color: colors.darkBlue, fontWeight: 'bold', width: '30px', textAlign: 'center' }}>+</div>
          <h1 style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>LIVE-CLINIC</h1>
        </div>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#bae6fd' }}>Welcome, <strong>{user.name}</strong></span>
            <button 
              onClick={() => { setUser(null); setView('landing'); }} 
              style={{ backgroundColor: 'white', color: colors.darkBlue, padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer shadow-sm' }}
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      <main style={{ padding: '32px' }}>
        
        {/* LANDING VIEW */}
        {!user && view === 'landing' && (
          <div style={{ maxWidth: '600px', margin: '64px auto 0', textAlign: 'center', backgroundColor: 'white', padding: '48px', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', border: '1px solid #e0f2fe' }}>
            <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '16px' }}>Quality Care at Your Fingertips</h2>
            <p style={{ color: '#0284c7', fontSize: '18px', marginBottom: '40px' }}>Please select your portal to continue</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
              <button onClick={() => setView('register')} style={{ backgroundColor: colors.brightBlue, color: 'white', padding: '24px', borderRadius: '16px', border: 'none', fontWeight: '900', fontSize: '20px', cursor: 'pointer', boxShadow: '0 4px 0 #0369a1' }}>Register Patient</button>
              <button onClick={() => setView('login')} style={{ backgroundColor: colors.darkBlue, color: 'white', padding: '24px', borderRadius: '16px', border: 'none', fontWeight: '900', fontSize: '20px', cursor: 'pointer', boxShadow: '0 4px 0 #172554' }}>Staff Login</button>
            </div>
          </div>
        )}

        {/* LOGIN VIEW */}
        {!user && view === 'login' && (
          <div style={{ maxWidth: '400px', margin: '0 auto', backgroundColor: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', position: 'relative' }}>
            <button onClick={() => setView('landing')} style={{ position: 'absolute', top: '16px', right: '24px', border: 'none', background: 'none', color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer' }}>← Back</button>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>Staff Login</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input id="name" style={{ padding: '16px', borderRadius: '12px', border: '2px solid #f0f9ff', backgroundColor: '#f0f9ff' }} placeholder="Username (e.g. Jonah Irande)" />
                <input type="password" style={{ padding: '16px', borderRadius: '12px', border: '2px solid #f0f9ff', backgroundColor: '#f0f9ff' }} placeholder="p@ssw0rd" />
                <button style={{ backgroundColor: colors.darkBlue, color: 'white', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' }} onClick={() => {
                  const val = document.getElementById('name').value;
                  if(!val) return alert("Enter name");
                  const role = val === 'admin' ? 'admin' : (['Jonah Irande', 'Oluwatosin Daniel', 'Faith Bitrus'].includes(val) ? 'doctor' : 'patient');
                  setUser({ name: val, role: role });
                }}>Sign In</button>
            </div>
          </div>
        )}

        {/* REGISTER VIEW */}
        {!user && view === 'register' && (
          <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', position: 'relative' }}>
            <button onClick={() => setView('landing')} style={{ position: 'absolute', top: '16px', right: '24px', border: 'none', background: 'none', color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer' }}>← Back</button>
            <h2 style={{ fontSize: '30px', fontWeight: '900', marginBottom: '32px', color: colors.brightBlue }}>Patient Triage</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <input id="reg-name" style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e0f2fe', backgroundColor: '#f0f9ff' }} placeholder="Full Name" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <select id="reg-age" style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e0f2fe', backgroundColor: '#f0f9ff' }}>
                    <option value="children">Children (0-8)</option>
                    <option value="adult">Adult (25-55)</option>
                    <option value="aged">Aged (56+)</option>
                  </select>
                  <input id="reg-loc" style={{ padding: '16px', borderRadius: '12px', border: '1px solid #e0f2fe', backgroundColor: '#f0f9ff' }} placeholder="Location" />
              </div>
              <button style={{ backgroundColor: colors.brightBlue, color: 'white', padding: '20px', borderRadius: '16px', border: 'none', fontWeight: '900', fontSize: '18px', cursor: 'pointer' }} onClick={() => {
                const n = document.getElementById('reg-name').value;
                const a = document.getElementById('reg-age').value;
                const l = document.getElementById('reg-loc').value;
                if(!n || !l) return alert("Fill all fields");
                setUser({ name: n, role: 'patient', age: a, location: l });
              }}>Continue →</button>
            </div>
          </div>
        )}

        {/* DOCTOR DASHBOARD */}
        {user?.role === 'doctor' && (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '900', borderBottom: `4px solid ${colors.skyBlue}`, paddingBottom: '16px', marginBottom: '32px' }}>Specialist Queue: {user.name}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              {patients.filter(p => p.assignedDoctor === user.name && p.status !== 'Completed').map(p => (
                <div key={p._id} style={{ backgroundColor: 'white', padding: '32px', borderRadius: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', borderTop: `8px solid ${colors.brightBlue}` }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '4px' }}>{p.username}</h3>
                  <p style={{ color: colors.brightBlue, fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase', marginBottom: '16px' }}>{p.age} • {p.location}</p>
                  <div style={{ backgroundColor: colors.skyBlue, padding: '20px', borderRadius: '16px', marginBottom: '24px', fontStyle: 'italic' }}>"{p.symptoms}"</div>
                  <input id={`diag-${p._id}`} style={{ width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #ddd' }} placeholder="Diagnosis" />
                  <textarea id={`pres-${p._id}`} style={{ width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #ddd', height: '80px' }} placeholder="Prescription"></textarea>
                  <button 
                    style={{ backgroundColor: colors.darkBlue, color: 'white', width: '100%', padding: '16px', borderRadius: '16px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                    onClick={async () => {
                      const diagnosis = document.getElementById(`diag-${p._id}`).value;
                      const prescription = document.getElementById(`pres-${p._id}`).value;
                      await axios.put(`${API}/diagnose`, { patientId: p._id, diagnosis, prescription });
                      alert("Treatment Complete");
                      loadData();
                    }}
                  >Submit Consultation</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADMIN DASHBOARD */}
        {user?.role === 'admin' && (
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '32px' }}>Triage Management</h2>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: colors.darkBlue, color: 'white' }}>
                  <tr>
                    <th style={{ padding: '16px' }}>Patient</th>
                    <th style={{ padding: '16px' }}>Location</th>
                    <th style={{ padding: '16px' }}>Symptoms</th>
                    <th style={{ padding: '16px' }}>Assign Doctor</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.filter(p => !p.assignedDoctor).map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid #f0f9ff' }}>
                      <td style={{ padding: '16px' }}><strong>{p.username}</strong><br/><small style={{ color: colors.brightBlue }}>{p.age}</small></td>
                      <td style={{ padding: '16px' }}>{p.location}</td>
                      <td style={{ padding: '16px', fontStyle: 'italic' }}>"{p.symptoms}"</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => axios.put(`${API}/assign`, { patientId: p._id, doctorName: 'Jonah Irande' }).then(loadData)} style={{ background: '#e0f2fe', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Jonah</button>
                          <button onClick={() => axios.put(`${API}/assign`, { patientId: p._id, doctorName: 'Oluwatosin Daniel' }).then(loadData)} style={{ background: '#e0f2fe', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Daniel</button>
                          <button onClick={() => axios.put(`${API}/assign`, { patientId: p._id, doctorName: 'Faith Bitrus' }).then(loadData)} style={{ background: '#e0f2fe', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Faith</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
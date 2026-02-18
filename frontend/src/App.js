import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = "http://localhost:5000/api";

function App() {
  const [view, setView] = useState('landing'); 
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);

  // Fetch data for Admin/Doctor
  const loadData = async () => {
    const res = await axios.get(`${API}/patients`);
    setPatients(res.data);
  };

  return (
    <div className="min-h-screen bg-white text-blue-900 font-sans">
      <nav className="bg-blue-600 p-4 text-white flex justify-between">
        <h1 className="text-2xl font-bold">Live-Clinic</h1>
        {user && <button onClick={() => setUser(null)}>Logout</button>}
      </nav>

      <main className="p-8">
        {/* Simplified Login for Demo */}
        {!user && (
          <div className="max-w-md mx-auto border p-6 rounded shadow">
            <h2 className="text-xl mb-4">Login</h2>
            <input id="name" className="border w-full p-2 mb-2" placeholder="Username" />
            <button className="bg-blue-600 text-white w-full py-2" onClick={() => {
              const val = document.getElementById('name').value;
              setUser({ name: val, role: val === 'admin' ? 'admin' : (['Jonah Irande', 'Oluwatosin Daniel', 'Faith Bitrus'].includes(val) ? 'doctor' : 'patient') });
              loadData();
            }}>Login</button>
            <p className="text-xs mt-2 text-gray-500">Creds: admin, Jonah Irande, or register a patient. Password: p@ssw0rd</p>
          </div>
        )}

        {/* Patient View */}
        {user?.role === 'patient' && (
          <div>
            <h2 className="text-2xl mb-4">Welcome, {user.name}</h2>
            <textarea id="symp" className="border w-full p-2" placeholder="State your symptoms..."></textarea>
            <button className="bg-blue-600 text-white px-4 py-2 mt-2" onClick={async () => {
               await axios.post(`${API}/register`, { username: user.name, symptoms: document.getElementById('symp').value });
               alert("Symptoms sent!");
            }}>Submit Symptoms</button>
          </div>
        )}

        {/* Admin View */}
        {user?.role === 'admin' && (
          <div>
            <h2 className="text-2xl mb-4">Admin Dashboard</h2>
            <table className="w-full text-left border">
              <thead><tr className="bg-blue-50"><th>Patient</th><th>Symptoms</th><th>Action</th></tr></thead>
              <tbody>
                {patients.filter(p => !p.assignedDoctor).map(p => (
                  <tr key={p._id}>
                    <td>{p.username}</td><td>{p.symptoms}</td>
                    <td>
                      <button className="text-blue-600 underline" onClick={() => axios.put(`${API}/assign`, { patientId: p._id, doctorName: 'Jonah Irande' }).then(loadData)}>Assign to Jonah</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
export default App;

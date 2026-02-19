import React, { useState } from 'react';
import axios from 'axios';

const API = "http://backend-url-blu-live-clinic.apps.lab.ocp.bludive/api";

function App() {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [view, setView] = useState('login'); // login or register

  // Fetch data for Admin/Doctor
  const loadData = async () => {
    try {
      const res = await axios.get(`${API}/patients`);
      setPatients(res.data);
    } catch (err) {
      console.error("Error fetching patients", err);
    }
  };

  return (
    <div className="min-h-screen bg-white text-blue-900 font-sans">
      <nav className="bg-blue-600 p-4 text-white flex justify-between shadow-lg">
        <h1 className="text-2xl font-bold">Live-Clinic</h1>
        {user && (
          <div className="flex items-center gap-4">
            <span>{user.name} ({user.role})</span>
            <button onClick={() => { setUser(null); setView('login'); }} className="bg-white text-blue-600 px-3 py-1 rounded font-bold">Logout</button>
          </div>
        )}
      </nav>

      <main className="p-8">
        {/* LANDING / LOGIN / REGISTER SCREEN */}
        {!user && (
          <div className="max-w-md mx-auto border-2 border-blue-100 p-6 rounded-lg shadow-xl bg-white">
            {view === 'login' ? (
              <>
                <h2 className="text-xl font-bold mb-4 text-center">Staff & Patient Login</h2>
                <input id="name" className="border w-full p-2 mb-4 rounded" placeholder="Enter Name (admin or Doctor Name)" />
                <input type="password" title="password" className="border w-full p-2 mb-4 rounded" placeholder="p@ssw0rd" />
                <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded transition font-bold" onClick={() => {
                  const val = document.getElementById('name').value;
                  if(!val) return alert("Enter a name");
                  const role = val === 'admin' ? 'admin' : (['Jonah Irande', 'Oluwatosin Daniel', 'Faith Bitrus'].includes(val) ? 'doctor' : 'patient');
                  setUser({ name: val, role: role });
                  if (role !== 'patient') loadData();
                }}>Login</button>
                <p className="mt-4 text-center text-sm">
                  New Patient? <button onClick={() => setView('register')} className="text-blue-600 underline">Register Here</button>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold mb-4 text-center">Patient Registration</h2>
                <input id="regName" className="border w-full p-2 mb-4 rounded" placeholder="Your Full Name" />
                <button className="bg-green-600 hover:bg-green-700 text-white w-full py-2 rounded transition font-bold" onClick={() => {
                  const val = document.getElementById('regName').value;
                  if(!val) return alert("Enter your name");
                  setUser({ name: val, role: 'patient' });
                }}>Start Registration</button>
                <button onClick={() => setView('login')} className="mt-4 w-full text-sm text-gray-500 underline">Back to Login</button>
              </>
            )}
            <div className="mt-6 text-[10px] text-gray-400 border-t pt-2 uppercase tracking-widest">
              <strong>Authorized Doctors:</strong> Jonah Irande, Oluwatosin Daniel, Faith Bitrus
            </div>
          </div>
        )}

        {/* PATIENT DASHBOARD */}
        {user?.role === 'patient' && (
          <div className="max-w-2xl mx-auto bg-blue-50 p-6 rounded-lg border border-blue-200 shadow-inner">
            <h2 className="text-2xl mb-4 font-semibold text-blue-800">Welcome, {user.name}</h2>
            <div className="bg-white p-4 rounded border mb-4">
               <label className="block mb-2 font-bold text-gray-700">What symptoms are you experiencing?</label>
               <textarea id="symp" className="border w-full p-3 rounded h-32 mb-4 focus:ring-2 focus:ring-blue-400 outline-none" placeholder="Describe how you feel..."></textarea>
               <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-blue-700 transition-all transform hover:scale-105" onClick={async () => {
                  await axios.post(`${API}/register`, { username: user.name, symptoms: document.getElementById('symp').value });
                  alert("Symptoms submitted successfully. Please wait for an administrator to assign a specialist.");
                  document.getElementById('symp').value = "";
               }}>Submit to Triage</button>
            </div>
          </div>
        )}

        {/* ADMIN DASHBOARD */}
        {user?.role === 'admin' && (
          <div className="animate-fadeIn">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-blue-800">Administrator Triage Queue</h2>
                <button onClick={loadData} className="text-sm bg-blue-100 px-3 py-1 rounded">Refresh List</button>
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200 shadow-md">
                <table className="w-full text-left border-collapse bg-white">
                  <thead className="bg-blue-600 text-white">
                    <tr>
                      <th className="p-4">Patient Name</th>
                      <th className="p-4">Reported Symptoms</th>
                      <th className="p-4">Action: Assign Specialist</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.filter(p => !p.assignedDoctor).length === 0 ? (
                        <tr><td colSpan="3" className="p-10 text-center text-gray-400 italic">No pending patients in queue</td></tr>
                    ) : (
                        patients.filter(p => !p.assignedDoctor).map(p => (
                          <tr key={p._id} className="border-b hover:bg-blue-50 transition">
                            <td className="p-4 font-bold">{p.username}</td>
                            <td className="p-4 text-gray-600">{p.symptoms}</td>
                            <td className="p-4 flex gap-2">
                              {['Jonah Irande', 'Oluwatosin Daniel', 'Faith Bitrus'].map(doc => (
                                  <button key={doc} className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-md text-xs font-bold hover:bg-blue-600 hover:text-white transition" 
                                    onClick={() => axios.put(`${API}/assign`, { patientId: p._id, doctorName: doc }).then(loadData)}>
                                    Assign {doc.split(' ')[0]}
                                  </button>
                              ))}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
            </div>
          </div>
        )}

        {/* DOCTOR DASHBOARD */}
        {user?.role === 'doctor' && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl font-bold text-blue-800 mb-6">Doctor's Consultation Room</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {patients.filter(p => p.assignedDoctor === user.name && p.status !== 'Completed').map(p => (
                    <div key={p._id} className="bg-white border-l-4 border-blue-600 p-6 rounded-r-lg shadow-md">
                        <h3 className="text-xl font-bold mb-2">{p.username}</h3>
                        <p className="text-gray-600 mb-4 italic">"{p.symptoms}"</p>
                        <hr className="mb-4" />
                        <label className="block text-sm font-bold mb-1">Diagnosis:</label>
                        <input id={`diag-${p._id}`} className="border w-full p-2 mb-3 rounded" placeholder="Enter diagnosis..." />
                        <label className="block text-sm font-bold mb-1">Prescription:</label>
                        <input id={`pres-${p._id}`} className="border w-full p-2 mb-4 rounded" placeholder="Medication & dosage..." />
                        <button className="bg-green-600 text-white w-full py-2 rounded font-bold hover:bg-green-700" onClick={async () => {
                            const diag = document.getElementById(`diag-${p._id}`).value;
                            const pres = document.getElementById(`pres-${p._id}`).value;
                            await axios.put(`${API}/diagnose`, { patientId: p._id, diagnosis: diag, prescription: pres });
                            alert("Consultation complete.");
                            loadData();
                        }}>Mark as Treated</button>
                    </div>
                ))}
                {patients.filter(p => p.assignedDoctor === user.name && p.status !== 'Completed').length === 0 && (
                    <p className="text-gray-400 italic">No patients currently assigned to you.</p>
                )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
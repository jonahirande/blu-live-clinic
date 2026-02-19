import React, { useState } from 'react';
import axios from 'axios';

const API = "http://backend-url-blu-live-clinic.apps.lab.ocp.bludive/api";

function App() {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);

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
            <button onClick={() => setUser(null)} className="bg-white text-blue-600 px-3 py-1 rounded font-bold">Logout</button>
          </div>
        )}
      </nav>

      <main className="p-8">
        {/* LOGIN SCREEN */}
        {!user && (
          <div className="max-w-md mx-auto border-2 border-blue-100 p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-center">Portal Login</h2>
            <input id="name" className="border w-full p-2 mb-4 rounded" placeholder="Enter Name (admin, Jonah Irande, or Patient Name)" />
            <input type="password" title="password" className="border w-full p-2 mb-4 rounded" placeholder="p@ssw0rd" />
            <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded transition" onClick={() => {
              const val = document.getElementById('name').value;
              if(!val) return alert("Enter a name");
              
              const role = val === 'admin' ? 'admin' : (['Jonah Irande', 'Oluwatosin Daniel', 'Faith Bitrus'].includes(val) ? 'doctor' : 'patient');
              setUser({ name: val, role: role });
              if (role !== 'patient') loadData();
            }}>Login</button>
            <div className="mt-4 text-[10px] text-gray-400 border-t pt-2">
              <strong>Doctors:</strong> Jonah Irande, Oluwatosin Daniel, Faith Bitrus
            </div>
          </div>
        )}

        {/* PATIENT DASHBOARD */}
        {user?.role === 'patient' && (
          <div className="max-w-2xl mx-auto bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-2xl mb-4 font-semibold">Welcome, {user.name}</h2>
            <label className="block mb-2 font-medium">Describe your symptoms:</label>
            <textarea id="symp" className="border w-full p-3 rounded h-32 mb-4" placeholder="Example: I have been having a headache for 2 days..."></textarea>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-md hover:bg-blue-700" onClick={async () => {
               await axios.post(`${API}/register`, { username: user.name, symptoms: document.getElementById('symp').value });
               alert("Symptoms submitted. A doctor will be assigned shortly.");
               document.getElementById('symp').value = "";
            }}>Submit to Clinic</button>
          </div>
        )}

        {/* ADMIN DASHBOARD */}
        {user?.role === 'admin' && (
          <div className="animate-fadeIn">
            <h2 className="text-2xl mb-4 font-bold border-b pb-2">Administrator Triage</h2>
            <table className="w-full text-left border-collapse bg-white shadow-sm">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-3">Patient Name</th>
                  <th className="p-3">Reported Symptoms</th>
                  <th className="p-3">Assign Specialist</th>
                </tr>
              </thead>
              <tbody>
                {patients.filter(p => !p.assignedDoctor).map(p => (
                  <tr key={p._id} className="border-b hover:bg-blue-50">
                    <td className="p-3 font-bold">{p.username}</td>
                    <td className="p-3 text-gray-600">{p.symptoms}</td>
                    <td className="p-3 flex gap-2">
                      <button className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm hover:bg-blue-200" onClick={() => axios.put(`${API}/assign`, { patientId: p._id, doctorName: 'Jonah Irande' }).then(loadData)}>Assign Jonah</button>
                      <button className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm hover:bg-blue-200" onClick={() => axios.put(`${API}/assign`, { patientId: p._id, doctorName: 'Oluwatosin Daniel' }).then(loadData)}>Assign Daniel</button>
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
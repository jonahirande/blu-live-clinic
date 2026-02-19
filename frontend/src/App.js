import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Ensure this matches your OpenShift Backend Route
const API = "http://backend-url-blu-live-clinic.apps.lab.ocp.bludive/api";

function App() {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState([]);
  const [view, setView] = useState('landing'); 

  // Fetch data for Admin/Doctor
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
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-[#f0f9ff] text-[#1e3a8a] font-sans">
      {/* NAVIGATION BAR - DARK BLUE */}
      <nav className="bg-[#1e40af] p-5 text-white flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-2">
          <div className="bg-white p-1 rounded-lg">
            <div className="w-6 h-6 bg-[#1e40af] rounded-sm flex items-center justify-center font-bold">+</div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tighter">LIVE-CLINIC</h1>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sky-100 font-medium">Welcome, {user.name}</span>
            <button 
              onClick={() => { setUser(null); setView('landing'); }} 
              className="bg-white text-[#1e40af] px-4 py-2 rounded-lg font-bold hover:bg-sky-50 transition shadow-md"
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      <main className="p-8">
        
        {/* LANDING VIEW - SKY BLUE THEME */}
        {!user && view === 'landing' && (
          <div className="max-w-2xl mx-auto mt-16 text-center bg-white border border-sky-100 p-12 rounded-3xl shadow-2xl">
            <h2 className="text-4xl font-black text-[#1e3a8a] mb-4">Quality Care at Your Fingertips</h2>
            <p className="text-sky-600 text-lg mb-10 font-medium">Please select your portal to continue</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button 
                onClick={() => setView('register')} 
                className="bg-[#0ea5e9] text-white py-6 rounded-2xl font-black text-xl hover:bg-[#0284c7] transition transform hover:scale-105 shadow-lg border-b-4 border-[#0369a1]"
              >
                Register as Patient
              </button>
              <button 
                onClick={() => setView('login')} 
                className="bg-[#1e40af] text-white py-6 rounded-2xl font-black text-xl hover:bg-[#1e3a8a] transition transform hover:scale-105 shadow-lg border-b-4 border-[#172554]"
              >
                Staff Login
              </button>
            </div>
          </div>
        )}

        {/* LOGIN VIEW */}
        {!user && view === 'login' && (
          <div className="max-w-md mx-auto bg-white border border-sky-100 p-8 rounded-3xl shadow-2xl relative">
            <button onClick={() => setView('landing')} className="absolute top-4 right-6 text-sky-400 font-bold hover:text-sky-600">← Back</button>
            <h2 className="text-2xl font-bold mb-6 text-[#1e40af] text-center">Portal Login</h2>
            <div className="space-y-4">
                <input id="name" className="w-full p-4 rounded-xl bg-sky-50 border-2 border-transparent focus:border-sky-400 outline-none" placeholder="Username (admin / Doctor Name)" />
                <input type="password" title="password" className="w-full p-4 rounded-xl bg-sky-50 border-2 border-transparent focus:border-sky-400 outline-none" placeholder="p@ssw0rd" />
                <button className="bg-[#1e40af] text-white w-full py-4 rounded-xl font-bold text-lg hover:bg-blue-800 transition" onClick={() => {
                  const val = document.getElementById('name').value;
                  if(!val) return alert("Enter name");
                  const role = val === 'admin' ? 'admin' : (['Jonah Irande', 'Oluwatosin Daniel', 'Faith Bitrus'].includes(val) ? 'doctor' : 'patient');
                  setUser({ name: val, role: role });
                  if (role !== 'patient') loadData();
                }}>Sign In</button>
            </div>
          </div>
        )}

        {/* REGISTER VIEW - WITH AGE GROUP & LOCATION */}
        {!user && view === 'register' && (
          <div className="max-w-xl mx-auto bg-white border border-sky-100 p-10 rounded-3xl shadow-2xl relative">
            <button onClick={() => setView('landing')} className="absolute top-4 right-6 text-sky-400 font-bold hover:text-sky-600">← Back</button>
            <h2 className="text-3xl font-black mb-8 text-[#0ea5e9]">Patient Triage</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-sky-900 mb-2">Full Name</label>
                <input id="reg-name" className="w-full p-4 rounded-xl bg-sky-50 border-2 border-transparent focus:border-sky-400 outline-none" placeholder="First & Last Name" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-sky-900 mb-2">Age Group</label>
                  <select id="reg-age" className="w-full p-4 rounded-xl bg-sky-50 border-2 border-transparent focus:border-sky-400 outline-none">
                    <option value="children">Children (0-8)</option>
                    <option value="preteen">Preteen (9-12)</option>
                    <option value="teen">Teen (13-17)</option>
                    <option value="young adult">Young Adult (18-24)</option>
                    <option value="adult">Adult (25-55)</option>
                    <option value="aged">Aged (56+)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-sky-900 mb-2">Current Location</label>
                  <input id="reg-loc" className="w-full p-4 rounded-xl bg-sky-50 border-2 border-transparent focus:border-sky-400 outline-none" placeholder="City or State" />
                </div>
              </div>

              <button className="bg-[#0ea5e9] text-white w-full py-5 rounded-2xl font-black text-xl hover:bg-[#0284c7] transition shadow-lg mt-4" onClick={() => {
                const n = document.getElementById('reg-name').value;
                const a = document.getElementById('reg-age').value;
                const l = document.getElementById('reg-loc').value;
                if(!n || !l) return alert("Please fill all fields");
                setUser({ name: n, role: 'patient', age: a, location: l });
              }}>Continue to Symptoms →</button>
            </div>
          </div>
        )}

        {/* PATIENT DASHBOARD */}
        {user?.role === 'patient' && (
          <div className="max-w-3xl mx-auto bg-white p-10 rounded-3xl shadow-2xl border-t-8 border-[#0ea5e9]">
            <h2 className="text-3xl font-black text-[#1e3a8a] mb-2 text-center">Describe Your Symptoms</h2>
            <p className="text-center text-sky-500 mb-8">Providing accurate details helps us assign the right specialist.</p>
            
            <textarea id="symp" className="w-full p-6 rounded-2xl bg-sky-50 border-2 border-transparent focus:border-sky-400 outline-none h-48 mb-6 shadow-inner text-lg" placeholder="I have been experiencing..."></textarea>
            
            <button className="bg-[#0ea5e9] text-white px-10 py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-[#0284c7] transition w-full" onClick={async () => {
               const symptoms = document.getElementById('symp').value;
               if(!symptoms) return alert("Please enter symptoms");
               await axios.post(`${API}/register`, { 
                  username: user.name, 
                  symptoms: symptoms,
                  age: user.age,
                  location: user.location
               });
               alert("Data submitted successfully!");
               document.getElementById('symp').value = "";
               setUser(null); setView('landing');
            }}>Submit Record to Clinic</button>
          </div>
        )}

        {/* ADMIN DASHBOARD - MORE COLOR & INFO */}
        {user?.role === 'admin' && (
          <div className="max-w-6xl mx-auto animate-fadeIn">
            <h2 className="text-3xl font-black text-[#1e3a8a] mb-8 border-b-4 border-sky-100 pb-4">Triage Queue</h2>
            <div className="overflow-hidden rounded-2xl shadow-xl border border-sky-100 bg-white">
              <table className="w-full text-left">
                <thead className="bg-[#1e40af] text-white">
                  <tr>
                    <th className="p-5">Patient & Bio</th>
                    <th className="p-5">Location</th>
                    <th className="p-5">Symptoms</th>
                    <th className="p-5">Assignment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sky-50">
                  {patients.filter(p => !p.assignedDoctor).map(p => (
                    <tr key={p._id} className="hover:bg-sky-50/50 transition">
                      <td className="p-5">
                        <div className="font-bold text-[#1e3a8a] text-lg">{p.username}</div>
                        <div className="text-xs uppercase font-black text-sky-500">{p.age || 'Unknown Age'}</div>
                      </td>
                      <td className="p-5 font-medium">{p.location || 'Not Specified'}</td>
                      <td className="p-5 text-gray-600 italic">"{p.symptoms}"</td>
                      <td className="p-5">
                        <div className="flex gap-2">
                           <button className="bg-sky-100 text-[#0ea5e9] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#0ea5e9] hover:text-white transition" onClick={() => axios.put(`${API}/assign`, { patientId: p._id, doctorName: 'Jonah Irande' }).then(loadData)}>Assign Jonah</button>
                           <button className="bg-sky-100 text-[#0ea5e9] px-3 py-1 rounded-lg text-xs font-bold hover:bg-[#0ea5e9] hover:text-white transition" onClick={() => axios.put(`${API}/assign`, { patientId: p._id, doctorName: 'Oluwatosin Daniel' }).then(loadData)}>Assign Daniel</button>
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
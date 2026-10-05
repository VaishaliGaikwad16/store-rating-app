import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import api from "./api";

function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function logout() {
    localStorage.clear();
    navigate("/login");
  }

  return (
    <div>
      <nav className="nav">
        <Link to="/" className="brand">StoreRate</Link>
        <div>
          {user && <span className="nav-user">{user.name} ({user.role})</span>}
          {user && <button className="btn secondary" onClick={() => navigate("/password")}>Password</button>}
          {user && <button className="btn danger" onClick={logout}>Logout</button>}
        </div>
      </nav>
      <main className="container">{children}</main>
    </div>
  );
}

function Protected({ roles, children }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="auth-card">
      <h1>StoreRate</h1>
      <p className="muted">Login to continue</p>
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit}>
        <input placeholder="Email" type="email" value={form.email}
          onChange={e => setForm({...form,email:e.target.value})} required />
        <input placeholder="Password" type="password" value={form.password}
          onChange={e => setForm({...form,password:e.target.value})} required />
        <button className="btn" type="submit">Login</button>
      </form>
      <p>New user? <Link to="/register">Create account</Link></p>
    </div>
  );
}

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"",email:"",password:"",address:"" });
  const [message, setMessage] = useState("");

  async function submit(e) {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/auth/register", form);
      setMessage("Registration successful. You can now login.");
      setTimeout(() => navigate("/login"), 700);
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div className="auth-card wide">
      <h1>Create account</h1>
      <p className="muted">Normal users can register here.</p>
      {message && <div className="info">{message}</div>}
      <form onSubmit={submit}>
        <input placeholder="Full name (20-60 characters)" value={form.name}
          onChange={e=>setForm({...form,name:e.target.value})} required />
        <input placeholder="Email" type="email" value={form.email}
          onChange={e=>setForm({...form,email:e.target.value})} required />
        <input placeholder="Password (8-16, uppercase + special)" type="password" value={form.password}
          onChange={e=>setForm({...form,password:e.target.value})} required />
        <textarea placeholder="Address (max 400 characters)" value={form.address}
          onChange={e=>setForm({...form,address:e.target.value})} />
        <button className="btn">Register</button>
      </form>
      <Link to="/login">Back to login</Link>
    </div>
  );
}

function Password() {
  const [form,setForm]=useState({currentPassword:"",newPassword:""});
  const [message,setMessage]=useState("");
  async function submit(e){
    e.preventDefault();
    try{
      const {data}=await api.put("/auth/password",form);
      setMessage(data.message);
      setForm({currentPassword:"",newPassword:""});
    }catch(err){setMessage(err.response?.data?.message||"Update failed");}
  }
  return <section className="card narrow"><h2>Change Password</h2><form onSubmit={submit}>
    <input type="password" placeholder="Current password" value={form.currentPassword} onChange={e=>setForm({...form,currentPassword:e.target.value})} required/>
    <input type="password" placeholder="New password" value={form.newPassword} onChange={e=>setForm({...form,newPassword:e.target.value})} required/>
    <button className="btn">Update</button>
  </form>{message&&<div className="info">{message}</div>}</section>
}

function UserDashboard() {
  const [stores,setStores]=useState([]);
  const [search,setSearch]=useState("");
  const [message,setMessage]=useState("");

  async function load() {
    try {
      const {data}=await api.get("/stores",{params:{search}});
      setStores(data);
    } catch(err){setMessage(err.response?.data?.message||"Could not load stores");}
  }
  useEffect(()=>{load()},[]);

  async function rate(id) {
    const value=prompt("Enter rating from 1 to 5:");
    if (value===null) return;
    try {
      await api.post(`/stores/${id}/rating`,{rating:Number(value)});
      setMessage("Rating saved.");
      load();
    } catch(err){setMessage(err.response?.data?.message||"Could not save rating");}
  }

  return <section>
    <div className="page-head"><div><h1>Stores</h1><p className="muted">Search stores and submit or update your rating.</p></div>
      <div className="search"><input placeholder="Search name/address" value={search} onChange={e=>setSearch(e.target.value)}/><button className="btn" onClick={load}>Search</button></div>
    </div>
    {message&&<div className="info">{message}</div>}
    <div className="grid">{stores.map(s=><div className="card" key={s.id}>
      <h3>{s.name}</h3><p>{s.address}</p><p>Overall rating: <b>{s.average_rating}</b> / 5</p>
      <p>Your rating: <b>{s.my_rating ?? "Not rated"}</b></p>
      <button className="btn" onClick={()=>rate(s.id)}>{s.my_rating ? "Update Rating" : "Rate Store"}</button>
    </div>)}</div>
  </section>
}

function AdminDashboard() {
  const [stats,setStats]=useState(null), [users,setUsers]=useState([]), [stores,setStores]=useState([]);
  const [userForm,setUserForm]=useState({name:"",email:"",password:"Password@1",address:"",role:"OWNER"});
  const [storeForm,setStoreForm]=useState({name:"",email:"",address:"",ownerId:""});
  const [message,setMessage]=useState("");

  async function load(){
    const [a,b,c]=await Promise.all([api.get("/admin/dashboard"),api.get("/admin/users"),api.get("/admin/stores")]);
    setStats(a.data);setUsers(b.data);setStores(c.data);
  }
  useEffect(()=>{load().catch(()=>setMessage("Could not load admin data"))},[]);

  async function createUser(e){
    e.preventDefault();
    try{await api.post("/admin/users",userForm);setMessage("User created");load();}
    catch(err){setMessage(err.response?.data?.message||"Could not create user");}
  }
  async function createStore(e){
    e.preventDefault();
    try{await api.post("/admin/stores",storeForm);setMessage("Store created");load();}
    catch(err){setMessage(err.response?.data?.message||"Could not create store");}
  }

  return <section>
    <h1>Admin Dashboard</h1>
    {message&&<div className="info">{message}</div>}
    {stats&&<div className="stats"><div><b>{stats.totalUsers}</b><span>Users</span></div><div><b>{stats.totalStores}</b><span>Stores</span></div><div><b>{stats.totalRatings}</b><span>Ratings</span></div></div>}
    <div className="two-col">
      <div className="card"><h2>Create User</h2><form onSubmit={createUser}>
        <input placeholder="Name (20-60)" value={userForm.name} onChange={e=>setUserForm({...userForm,name:e.target.value})} required/>
        <input placeholder="Email" value={userForm.email} onChange={e=>setUserForm({...userForm,email:e.target.value})} required/>
        <input placeholder="Password" value={userForm.password} onChange={e=>setUserForm({...userForm,password:e.target.value})} required/>
        <input placeholder="Address" value={userForm.address} onChange={e=>setUserForm({...userForm,address:e.target.value})}/>
        <select value={userForm.role} onChange={e=>setUserForm({...userForm,role:e.target.value})}><option>OWNER</option><option>USER</option><option>ADMIN</option></select>
        <button className="btn">Create User</button>
      </form></div>
      <div className="card"><h2>Create Store</h2><form onSubmit={createStore}>
        <input placeholder="Store name (20-60)" value={storeForm.name} onChange={e=>setStoreForm({...storeForm,name:e.target.value})} required/>
        <input placeholder="Store email" value={storeForm.email} onChange={e=>setStoreForm({...storeForm,email:e.target.value})} required/>
        <textarea placeholder="Address" value={storeForm.address} onChange={e=>setStoreForm({...storeForm,address:e.target.value})} required/>
        <select value={storeForm.ownerId} onChange={e=>setStoreForm({...storeForm,ownerId:e.target.value})} required>
          <option value="">Select owner</option>{users.filter(u=>u.role==="OWNER").map(u=><option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
        </select>
        <button className="btn">Create Store</button>
      </form></div>
    </div>
    <div className="card"><h2>Users</h2><div className="table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Address</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u.address||"-"}</td></tr>)}</tbody></table></div></div>
    <div className="card"><h2>Stores</h2><div className="table-wrap"><table><thead><tr><th>Store</th><th>Owner</th><th>Average</th><th>Ratings</th></tr></thead><tbody>{stores.map(s=><tr key={s.id}><td>{s.name}</td><td>{s.owner_name}</td><td>{s.average_rating}</td><td>{s.total_ratings}</td></tr>)}</tbody></table></div></div>
  </section>
}

function OwnerDashboard() {
  const [data,setData]=useState([]),[message,setMessage]=useState("");
  useEffect(()=>{api.get("/stores/owner/dashboard").then(r=>setData(r.data)).catch(()=>setMessage("Could not load dashboard"))},[]);
  return <section><h1>Store Owner Dashboard</h1>{message&&<div className="error">{message}</div>}
    {data.map(s=><div className="card" key={s.id}><h2>{s.name}</h2><p>{s.address}</p><div className="stats small"><div><b>{s.summary.average_rating}</b><span>Average rating</span></div><div><b>{s.summary.total_ratings}</b><span>Total ratings</span></div></div>
    <h3>Users who rated</h3><div className="table-wrap"><table><thead><tr><th>User</th><th>Email</th><th>Rating</th><th>Updated</th></tr></thead><tbody>{s.ratings.map((r,i)=><tr key={i}><td>{r.user_name}</td><td>{r.email}</td><td>{r.rating}</td><td>{new Date(r.updated_at).toLocaleString()}</td></tr>)}</tbody></table></div></div>)}
  </section>
}

function Home() {
  const user=JSON.parse(localStorage.getItem("user")||"null");
  if(!user) return <Navigate to="/login" replace/>;
  if(user.role==="ADMIN") return <Navigate to="/admin" replace/>;
  if(user.role==="OWNER") return <Navigate to="/owner" replace/>;
  return <Navigate to="/stores" replace/>;
}

export default function App(){
  return <Layout><Routes>
    <Route path="/login" element={<Login/>}/>
    <Route path="/register" element={<Register/>}/>
    <Route path="/" element={<Home/>}/>
    <Route path="/password" element={<Protected><Password/></Protected>}/>
    <Route path="/stores" element={<Protected roles={["USER"]}><UserDashboard/></Protected>}/>
    <Route path="/owner" element={<Protected roles={["OWNER"]}><OwnerDashboard/></Protected>}/>
    <Route path="/admin" element={<Protected roles={["ADMIN"]}><AdminDashboard/></Protected>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></Layout>
}
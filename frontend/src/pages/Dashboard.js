import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ company: '', role: '', status: 'Applied', notes: '', interviewDate: '' });
  const [editingJob, setEditingJob] = useState(null);
  const [tips, setTips] = useState({});
  const [loadingTips, setLoadingTips] = useState({});
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => { fetchJobs(); }, []);

  const fetchJobs = async () => {
    try {
      const res = await axios.get('https://job-tracker-qtjd.onrender.com/api/jobs', { headers });
      setJobs(res.data);
    } catch (err) { console.log(err); }
  };

  const handleSubmit = async () => {
    try {
      if (editingJob) {
        await axios.put(`https://job-tracker-qtjd.onrender.com/api/jobs/${editingJob._id}`, form, { headers });
      } else {
        await axios.post('https://job-tracker-qtjd.onrender.com/api/jobs', form, { headers });
      }
      setForm({ company: '', role: '', status: 'Applied', notes: '', interviewDate: '' });
      setShowForm(false);
      setEditingJob(null);
      fetchJobs();
    } catch (err) { console.log(err); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this job?')) {
      await axios.delete(`https://job-tracker-qtjd.onrender.com/api/jobs/${id}`, { headers });
      fetchJobs();
    }
  };

  const handleEdit = (job) => {
    setForm({ company: job.company, role: job.role, status: job.status, notes: job.notes || '', interviewDate: job.interviewDate?.slice(0, 10) || '' });
    setEditingJob(job);
    setShowForm(true);
  };

  const getTips = async (job) => {
    setLoadingTips(prev => ({ ...prev, [job._id]: true }));
    try {
      const res = await axios.post('https://job-tracker-qtjd.onrender.com/api/tips',
        { company: job.company, role: job.role },
        { headers }
      );
      setTips(prev => ({ ...prev, [job._id]: res.data.tips }));
    } catch (err) { console.log(err); }
    setLoadingTips(prev => ({ ...prev, [job._id]: false }));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isUpcoming = (dateStr) => {
    if (!dateStr) return false;
    const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 3;
  };

  const filteredJobs = jobs
    .filter(j => filter === 'All' || j.status === filter)
    .filter(j => j.company.toLowerCase().includes(search.toLowerCase()) ||
                 j.role.toLowerCase().includes(search.toLowerCase()));

  const statusColor = {
    'Applied': '#3b82f6',
    'Interview Scheduled': '#f59e0b',
    'Offer Received': '#10b981',
    'Rejected': '#ef4444'
  };

  const counts = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === 'Applied').length,
    interview: jobs.filter(j => j.status === 'Interview Scheduled').length,
    offer: jobs.filter(j => j.status === 'Offer Received').length,
    rejected: jobs.filter(j => j.status === 'Rejected').length,
  };

  const chartData = [
    { name: 'Applied', value: counts.applied },
    { name: 'Interview', value: counts.interview },
    { name: 'Offer', value: counts.offer },
    { name: 'Rejected', value: counts.rejected },
  ].filter(d => d.value > 0);

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <div style={styles.navbar}>
        <h2 style={styles.logo}>Job Tracker</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: 'white', fontSize: '14px' }}>Hi, {user?.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>

        {/* Stats Cards */}
        <div style={styles.statsRow}>
          {[
            { label: 'Total', value: counts.total, color: '#6366f1' },
            { label: 'Applied', value: counts.applied, color: '#3b82f6' },
            { label: 'Interviews', value: counts.interview, color: '#f59e0b' },
            { label: 'Offers', value: counts.offer, color: '#10b981' },
            { label: 'Rejected', value: counts.rejected, color: '#ef4444' },
          ].map(stat => (
            <div key={stat.label} style={{ ...styles.statCard, borderTop: `4px solid ${stat.color}` }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '13px', color: '#666' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Chart + Search row */}
        <div style={styles.chartSearchRow}>

          {/* Pie Chart */}
          {chartData.length > 0 && (
            <div style={styles.chartCard}>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#1a1a2e' }}>Application breakdown</div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Search */}
          <div style={styles.searchCard}>
            <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '12px', color: '#1a1a2e' }}>Search jobs</div>
            <input
              style={styles.searchInput}
              placeholder="Search by company or role..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {jobs.filter(j => isUpcoming(j.interviewDate)).length > 0 && (
              <div style={styles.alertBox}>
                Upcoming interviews in next 3 days:
                {jobs.filter(j => isUpcoming(j.interviewDate)).map(j => (
                  <div key={j._id} style={{ fontWeight: '500', marginTop: '4px' }}>
                    {j.company} — {j.role} on {new Date(j.interviewDate).toLocaleDateString()}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div style={styles.toolbar}>
          <div style={styles.filters}>
            {['All', 'Applied', 'Interview Scheduled', 'Offer Received', 'Rejected'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ ...styles.filterBtn, background: filter === f ? '#4f46e5' : '#e5e7eb', color: filter === f ? 'white' : '#333' }}>
                {f}
              </button>
            ))}
          </div>
          <button style={styles.addBtn} onClick={() => { setShowForm(true); setEditingJob(null); setForm({ company: '', role: '', status: 'Applied', notes: '', interviewDate: '' }); }}>
            + Add Job
          </button>
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div style={styles.formCard}>
            <h3 style={{ marginBottom: '16px' }}>{editingJob ? 'Edit Job' : 'Add New Job'}</h3>
            <div style={styles.formGrid}>
              <input style={styles.input} placeholder="Company" value={form.company}
                onChange={e => setForm({ ...form, company: e.target.value })} />
              <input style={styles.input} placeholder="Role" value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })} />
              <select style={styles.input} value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}>
                <option>Applied</option>
                <option>Interview Scheduled</option>
                <option>Offer Received</option>
                <option>Rejected</option>
              </select>
              <input style={styles.input} type="date" value={form.interviewDate}
                onChange={e => setForm({ ...form, interviewDate: e.target.value })} />
            </div>
            <textarea style={styles.textarea} placeholder="Notes" value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })} />
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button style={styles.addBtn} onClick={handleSubmit}>{editingJob ? 'Update Job' : 'Save Job'}</button>
              <button style={styles.cancelBtn} onClick={() => { setShowForm(false); setEditingJob(null); }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Job Cards */}
        {filteredJobs.length === 0 ? (
          <div style={styles.empty}>No jobs found. Click "+ Add Job" to get started!</div>
        ) : (
          <div style={styles.jobGrid}>
            {filteredJobs.map(job => (
              <div key={job._id} style={{
                ...styles.jobCard,
                borderLeft: `4px solid ${statusColor[job.status]}`,
                ...(isUpcoming(job.interviewDate) ? styles.upcomingCard : {})
              }}>
                {isUpcoming(job.interviewDate) && (
                  <div style={styles.upcomingBadge}>Interview in 3 days!</div>
                )}
                <div style={styles.jobHeader}>
                  <div>
                    <div style={styles.company}>{job.company}</div>
                    <div style={styles.role}>{job.role}</div>
                  </div>
                  <span style={{ ...styles.badge, background: statusColor[job.status] }}>{job.status}</span>
                </div>
                {job.notes && <div style={styles.notes}>{job.notes}</div>}
                {job.interviewDate && (
                  <div style={styles.date}>Interview: {new Date(job.interviewDate).toLocaleDateString()}</div>
                )}
                <div style={styles.jobActions}>
                  <button style={styles.editBtn} onClick={() => handleEdit(job)}>Edit</button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(job._id)}>Delete</button>
                  <button style={styles.tipsBtn} onClick={() => getTips(job)}>
                    {loadingTips[job._id] ? 'Loading...' : 'AI Tips'}
                  </button>
                </div>
                {tips[job._id] && (
                  <div style={styles.tipsBox}>
                    <strong style={{ fontSize: '13px', color: '#4f46e5' }}>Interview Tips:</strong>
                    <p style={{ fontSize: '13px', color: '#444', marginTop: '8px', whiteSpace: 'pre-line' }}>{tips[job._id]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f0f2f5' },
  navbar: { background: '#4f46e5', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { color: 'white', margin: 0 },
  logoutBtn: { padding: '8px 16px', background: 'white', color: '#4f46e5', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  content: { padding: '32px', maxWidth: '1200px', margin: '0 auto' },
  statsRow: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  statCard: { background: 'white', padding: '20px 24px', borderRadius: '12px', flex: '1', minWidth: '100px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  chartSearchRow: { display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  chartCard: { background: 'white', padding: '20px', borderRadius: '12px', flex: '1', minWidth: '280px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  searchCard: { background: 'white', padding: '20px', borderRadius: '12px', flex: '1', minWidth: '280px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  searchInput: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' },
  alertBox: { marginTop: '12px', padding: '12px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '8px', fontSize: '13px', color: '#c2410c' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  filters: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  filterBtn: { padding: '8px 14px', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  addBtn: { padding: '10px 20px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  cancelBtn: { padding: '10px 20px', background: '#e5e7eb', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  formCard: { background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' },
  input: { padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', minHeight: '80px', boxSizing: 'border-box' },
  jobGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' },
  jobCard: { background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' },
  upcomingCard: { background: '#fffbeb', boxShadow: '0 0 0 2px #fbbf24' },
  upcomingBadge: { background: '#fef3c7', color: '#d97706', fontSize: '12px', fontWeight: '600', padding: '4px 10px', borderRadius: '20px', marginBottom: '10px', display: 'inline-block' },
  jobHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  company: { fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' },
  role: { fontSize: '14px', color: '#666', marginTop: '2px' },
  badge: { padding: '4px 10px', borderRadius: '20px', color: 'white', fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap' },
  notes: { fontSize: '13px', color: '#888', marginBottom: '8px' },
  date: { fontSize: '13px', color: '#f59e0b', fontWeight: '500', marginBottom: '8px' },
  jobActions: { display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' },
  editBtn: { padding: '6px 14px', background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' },
  deleteBtn: { padding: '6px 14px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' },
  tipsBtn: { padding: '6px 14px', background: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' },
  tipsBox: { marginTop: '12px', padding: '12px', background: '#f0f4ff', borderRadius: '8px', borderLeft: '3px solid #4f46e5', wordBreak: 'break-word' },
  empty: { textAlign: 'center', padding: '60px', color: '#999', fontSize: '16px' },
};

export default Dashboard;

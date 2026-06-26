'use client';

import { useMemo, useState } from 'react';
import { customers, competitors, journey, products, users } from '../lib/demoData';
import { distanceMeters, mapLink } from '../lib/gps';

const VISIT_RADIUS = 20;

function formatSar(value) {
  return `SAR ${Number(value || 0).toLocaleString()}`;
}

function nowStamp() {
  return new Date().toISOString();
}

function downloadCsv(filename, rows) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => JSON.stringify(row[h] ?? '')).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Page() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(users[0]);
  const [tab, setTab] = useState('home');
  const [visits, setVisits] = useState([]);
  const [actions, setActions] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0].id);
  const [customerGps, setCustomerGps] = useState({});
  const [activeVisit, setActiveVisit] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('GPS not checked');
  const [form, setForm] = useState({
    objective: 'New Product Presentation',
    contactsMet: [],
    discussed: [],
    requested: [],
    rejected: [],
    samples: 'No',
    interest: '3',
    outcome: 'Quotation Requested',
    pipeline: '',
    competitor: 'Americana',
    competitorPrice: '',
    competitorPromotion: '',
    competitorStrengths: '',
    competitorWeaknesses: '',
    nextAction: 'Send quotation',
    nextVisit: '',
    notes: ''
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];
  const todayJourney = journey.map((j) => ({ ...j, customer: customers.find((c) => c.id === j.customerId) }));
  const kpis = useMemo(() => ({
    visitsToday: visits.length,
    followUps: actions.filter((a) => a.status === 'Open').length,
    pipeline: visits.reduce((sum, v) => sum + Number(v.pipeline || 0), 0),
    openActions: actions.filter((a) => a.status === 'Open').length,
    newCustomers: 0
  }), [visits, actions]);

  function updateArray(field, value) {
    setForm((prev) => {
      const exists = prev[field].includes(value);
      return { ...prev, [field]: exists ? prev[field].filter((x) => x !== value) : [...prev[field], value] };
    });
  }

  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject(new Error('GPS not supported'));
      navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
    });
  }

  async function registerCustomerGps() {
    try {
      setGpsStatus('Getting GPS...');
      const pos = await getCurrentPosition();
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      setCustomerGps((prev) => ({ ...prev, [selectedCustomer.id]: { lat, lng } }));
      setGpsStatus(`Account GPS registered: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } catch (e) {
      setGpsStatus(`GPS error: ${e.message}`);
    }
  }

  async function startVisit() {
    try {
      const account = customerGps[selectedCustomer.id];
      if (!account) {
        setGpsStatus('Register account GPS first during pilot testing.');
        return;
      }
      setGpsStatus('Checking location...');
      const pos = await getCurrentPosition();
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const distance = distanceMeters(lat, lng, account.lat, account.lng);
      if (distance > VISIT_RADIUS) {
        setGpsStatus(`Cannot start. You are ${distance}m away. Limit is ${VISIT_RADIUS}m.`);
        return;
      }
      setActiveVisit({ checkInTime: nowStamp(), checkInLat: lat, checkInLng: lng, checkInDistance: distance });
      setGpsStatus(`Check-in verified. Distance ${distance}m. Visit timer started.`);
    } catch (e) {
      setGpsStatus(`GPS error: ${e.message}`);
    }
  }

  async function finishVisit() {
    try {
      if (!activeVisit) {
        setGpsStatus('Start visit first.');
        return;
      }
      const account = customerGps[selectedCustomer.id];
      const pos = await getCurrentPosition();
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const distance = distanceMeters(lat, lng, account.lat, account.lng);
      if (distance > VISIT_RADIUS) {
        setGpsStatus(`Cannot finish. You are ${distance}m away. Limit is ${VISIT_RADIUS}m.`);
        return;
      }
      const checkOutTime = nowStamp();
      const durationSeconds = Math.round((new Date(checkOutTime) - new Date(activeVisit.checkInTime)) / 1000);
      const shortVisitFlag = durationSeconds < 120 ? 'Yes' : 'No';
      const visit = {
        id: `V${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        salesman: user.name,
        role: user.role,
        customerCode: selectedCustomer.id,
        customerName: selectedCustomer.name,
        city: selectedCustomer.city,
        objective: form.objective,
        contactsMet: form.contactsMet.join('; '),
        productsDiscussed: form.discussed.join('; '),
        productsRequested: form.requested.join('; '),
        productsRejected: form.rejected.join('; '),
        samples: form.samples,
        customerInterest: form.interest,
        outcome: form.outcome,
        pipeline: form.pipeline,
        competitor: form.competitor,
        competitorPrice: form.competitorPrice,
        competitorPromotion: form.competitorPromotion,
        competitorStrengths: form.competitorStrengths,
        competitorWeaknesses: form.competitorWeaknesses,
        nextVisit: form.nextVisit,
        notes: form.notes,
        checkInTime: activeVisit.checkInTime,
        checkInGps: `${activeVisit.checkInLat},${activeVisit.checkInLng}`,
        checkInMapLink: mapLink(activeVisit.checkInLat, activeVisit.checkInLng),
        checkInDistance: activeVisit.checkInDistance,
        checkOutTime,
        checkOutGps: `${lat},${lng}`,
        checkOutMapLink: mapLink(lat, lng),
        checkOutDistance: distance,
        durationSeconds,
        shortVisitFlag
      };
      const action = {
        id: `A${Date.now()}`,
        visitId: visit.id,
        customerName: selectedCustomer.name,
        action: form.nextAction,
        owner: user.name,
        dueDate: form.nextVisit,
        status: 'Open'
      };
      setVisits((prev) => [visit, ...prev]);
      setActions((prev) => [action, ...prev]);
      setActiveVisit(null);
      setGpsStatus(`Visit submitted. Duration ${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s.`);
      setTab('home');
    } catch (e) {
      setGpsStatus(`GPS error: ${e.message}`);
    }
  }

  if (!loggedIn) {
    return (
      <main className="app-shell">
        <section className="content">
          <div className="card login-card">
            <img src="/halwani-logo.png" alt="Halwani Bros" className="login-logo" />
            <h1>Food Service CRM</h1>
            <p className="muted">Sales visit tracker with GPS verification.</p>
            <div className="form-grid" style={{ textAlign: 'left' }}>
              <label>Name</label>
              <select value={user.name} onChange={(e) => setUser(users.find((u) => u.name === e.target.value))}>
                {users.map((u) => <option key={u.name}>{u.name}</option>)}
              </select>
              <label>Role</label>
              <input value={user.role} readOnly />
              <label>Branch</label>
              <input value={user.branch} readOnly />
              <button className="primary-action" onClick={() => setLoggedIn(true)}>Login</button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="header">
        <div className="header-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="logo-box"><img src="/halwani-logo.png" alt="Halwani" /></div>
            <div><p>Halwani Food Service</p><h1>Visit Tracker</h1></div>
          </div>
          <button className="export-btn" onClick={() => downloadCsv('halwani_visits.csv', visits)}>Export</button>
        </div>
      </header>

      <section className="content">
        {tab === 'home' && <>
          <div className="card">
            <div className="muted">Good morning</div>
            <div className="name">{user.name}</div>
            <div className="muted"><strong>{user.role}</strong> · {user.branch}</div>
          </div>
          <button className="primary-action" onClick={() => setTab('visit')}>START VISIT</button>
          <div className="kpi-grid">
            <div className="kpi"><strong>{kpis.visitsToday}</strong><span>Visits Today</span></div>
            <div className="kpi"><strong>{kpis.newCustomers}</strong><span>New Customers</span></div>
            <div className="kpi"><strong>{kpis.followUps}</strong><span>Follow Ups</span></div>
            <div className="kpi"><strong>{formatSar(kpis.pipeline)}</strong><span>Pipeline</span></div>
            <div className="kpi"><strong>{kpis.openActions}</strong><span>Open Actions</span></div>
          </div>
          <div className="card">
            <h2>Today's Journey</h2>
            {todayJourney.map((j) => <div className="journey-item" key={j.customerId} onClick={() => { setSelectedCustomerId(j.customerId); setTab('visit'); }}><div><strong>{j.time}</strong><br />{j.customer?.name}<br /><span className="muted small">{j.customer?.city}</span></div><span className="badge">{j.status}</span></div>)}
          </div>
          <div className="card">
            <h2>Latest Visits</h2>
            {visits.length === 0 ? <p className="muted">No visits recorded yet.</p> : visits.slice(0, 3).map((v) => <div className="journey-item" key={v.id}><div><strong>{v.customerName}</strong><br /><span className="muted small">{v.objective} · {v.outcome}</span></div><span className="badge">{formatSar(v.pipeline)}</span></div>)}
          </div>
        </>}

        {tab === 'visit' && <>
          <div className="card">
            <h2>Customer Snapshot</h2>
            <label>Customer</label>
            <select value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)}>
              {customers.map((c) => <option value={c.id} key={c.id}>{c.name}</option>)}
            </select>
            <div className="kpi-grid" style={{ marginTop: 12 }}>
              <div className="kpi"><strong>{formatSar(selectedCustomer.grossYtd)}</strong><span>Gross Sales YTD</span></div>
              <div className="kpi"><strong>{formatSar(selectedCustomer.monthlyAvg)}</strong><span>Monthly Average</span></div>
            </div>
            <p className="muted">Last Visit: {selectedCustomer.lastVisit} · Last Order: {selectedCustomer.lastOrder}</p>
            <p><strong>Current Supplier:</strong> {selectedCustomer.supplier}</p>
            <p><strong>Buying:</strong> {selectedCustomer.products.join(', ')}</p>
            <p><strong>Next Best Product:</strong> <span className="badge">{selectedCustomer.nextBest}</span></p>
          </div>

          <div className="card">
            <h2>GPS Verification</h2>
            <p className={gpsStatus.includes('Cannot') || gpsStatus.includes('error') ? 'status bad' : 'status'}>{gpsStatus}</p>
            <div className="action-grid">
              <button className="secondary-btn" onClick={registerCustomerGps}>Register Account GPS</button>
              <button className="secondary-btn" onClick={startVisit}>Start GPS Check-In</button>
            </div>
            {activeVisit && <p className="status">Visit active since {new Date(activeVisit.checkInTime).toLocaleTimeString()}</p>}
          </div>

          <div className="card form-grid">
            <h2>Record Visit</h2>
            <label>Visit Objective</label><select value={form.objective} onChange={(e) => setForm({ ...form, objective: e.target.value })}><option>New Product Presentation</option><option>Follow Up</option><option>Collection</option><option>Complaint</option><option>Sample Delivery</option><option>Chef Demo</option></select>
            <label>Who did you meet?</label><div className="check-grid">{['Owner','Buyer','Executive Chef','Kitchen Manager','F&B Manager','Purchasing'].map((x) => <label className="check-card" key={x}><input type="checkbox" onChange={() => updateArray('contactsMet', x)} />{x}</label>)}</div>
            <label>Products Discussed</label><div className="check-grid">{products.slice(0, 10).map((x) => <label className="check-card" key={x}><input type="checkbox" onChange={() => updateArray('discussed', x)} />{x}</label>)}</div>
            <label>Products Requested</label><input placeholder="Example: MEZ Fries 6x6" onChange={(e) => setForm({ ...form, requested: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} />
            <label>Products Rejected</label><input placeholder="Example: Mozzarella, price issue" onChange={(e) => setForm({ ...form, rejected: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) })} />
            <label>Samples Given</label><select value={form.samples} onChange={(e) => setForm({ ...form, samples: e.target.value })}><option>No</option><option>Yes</option></select>
            <label>Customer Interest</label><select value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })}><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option></select>
            <label>Commercial Outcome</label><select value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })}><option>Quotation Requested</option><option>Sample Requested</option><option>Trial Requested</option><option>PO Expected</option><option>Closed Won</option><option>Lost</option><option>No Interest</option></select>
            <label>Pipeline Value SAR</label><input type="number" value={form.pipeline} onChange={(e) => setForm({ ...form, pipeline: e.target.value })} />
          </div>

          <div className="card form-grid">
            <h2>Competitor Update</h2>
            <label>Brand</label><select value={form.competitor} onChange={(e) => setForm({ ...form, competitor: e.target.value })}>{competitors.map((x) => <option key={x}>{x}</option>)}</select>
            <label>Price</label><input value={form.competitorPrice} onChange={(e) => setForm({ ...form, competitorPrice: e.target.value })} />
            <label>Promotion</label><input value={form.competitorPromotion} onChange={(e) => setForm({ ...form, competitorPromotion: e.target.value })} />
            <label>Strengths</label><textarea value={form.competitorStrengths} onChange={(e) => setForm({ ...form, competitorStrengths: e.target.value })} />
            <label>Weaknesses</label><textarea value={form.competitorWeaknesses} onChange={(e) => setForm({ ...form, competitorWeaknesses: e.target.value })} />
          </div>

          <div className="card form-grid">
            <h2>Action List</h2>
            <label>Next Action</label><select value={form.nextAction} onChange={(e) => setForm({ ...form, nextAction: e.target.value })}><option>Send quotation</option><option>Arrange chef demo</option><option>Deliver sample</option><option>Price revision</option><option>Follow up call</option><option>Technical visit</option></select>
            <label>Next Visit / Due Date</label><input type="date" value={form.nextVisit} onChange={(e) => setForm({ ...form, nextVisit: e.target.value })} />
            <label>Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button className="primary-action" onClick={finishVisit}>FINISH VISIT</button>
          </div>
        </>}

        {tab === 'customer' && <div className="card"><h2>Customers</h2>{customers.map((c) => <div className="journey-item" key={c.id} onClick={() => { setSelectedCustomerId(c.id); setTab('visit'); }}><div><strong>{c.name}</strong><br /><span className="muted small">{c.city} · {formatSar(c.monthlyAvg)} monthly avg</span></div><span className="badge">{c.nextBest}</span></div>)}</div>}
        {tab === 'lists' && <div className="card"><h2>Products</h2>{products.map((p) => <div className="journey-item" key={p}><strong>{p}</strong><span className="badge">Active</span></div>)}</div>}
        {tab === 'records' && <><div className="card"><h2>Visit Records</h2>{visits.length === 0 ? <p className="muted">No records yet.</p> : visits.map((v) => <div className="journey-item" key={v.id}><div><strong>{v.customerName}</strong><br /><span className="muted small">{v.date} · {v.outcome} · Duration {v.durationSeconds}s</span></div><span className="badge">{v.shortVisitFlag === 'Yes' ? 'Short' : 'OK'}</span></div>)}</div><div className="card"><h2>Open Actions</h2>{actions.length === 0 ? <p className="muted">No actions yet.</p> : actions.map((a) => <div className="journey-item" key={a.id}><div><strong>{a.action}</strong><br /><span className="muted small">{a.customerName} · Due {a.dueDate || 'Not set'}</span></div><span className="badge">{a.status}</span></div>)}</div></>}
      </section>

      <nav className="bottom-nav">
        {['home','visit','customer','lists','records'].map((x) => <button key={x} className={`nav-btn ${tab === x ? 'active' : ''}`} onClick={() => setTab(x)}>{x === 'home' ? 'Home' : x === 'visit' ? 'Visit' : x === 'customer' ? 'Customer' : x === 'lists' ? 'Lists' : 'Records'}</button>)}
      </nav>
    </main>
  );
}

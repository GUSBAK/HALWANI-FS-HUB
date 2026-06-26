export const users = [
  { name: 'Ghassan Baker', role: 'Head of Food Service', branch: 'Jeddah' },
  { name: 'Ahmed Nabil', role: 'Salesman', branch: 'Jeddah' },
  { name: 'Mustafa', role: 'Salesman', branch: 'Riyadh' },
  { name: 'Khalid', role: 'Regional Manager', branch: 'Riyadh' }
];

export const customers = [
  { id: 'C001', name: 'ALBAIK', city: 'Jeddah', lat: null, lng: null, grossYtd: 485000, monthlyAvg: 80833, lastVisit: '2026-06-18', lastOrder: '2026-06-14', supplier: 'Americana', products: ['Tahina', 'Jammy'], nextBest: 'MEZ Fries' },
  { id: 'C002', name: 'Hilton Jeddah', city: 'Jeddah', lat: null, lng: null, grossYtd: 312000, monthlyAvg: 52000, lastVisit: '2026-06-10', lastOrder: '2026-06-06', supplier: 'Farm Frites', products: ['Jammy', 'Mini Glass Jars'], nextBest: 'Mozzarella' },
  { id: 'C003', name: 'Shobak', city: 'Jeddah', lat: null, lng: null, grossYtd: 176000, monthlyAvg: 29333, lastVisit: '2026-06-12', lastOrder: '2026-06-09', supplier: 'Al Jameel', products: ['Tahina'], nextBest: 'Freshy Fries' }
];

export const products = ['MEZ Fries 9x9', 'MEZ Fries 6x6', 'Freshy Fries', 'MEZ Tahina', 'Al Shola Tahina', 'Jammy 25g', 'La Belle Mini Glass Jars', 'Mozzarella 3.3kg', 'Turkey', 'Mortadella', 'MEZ Salt', 'Ketchup', 'Mayonnaise', 'Hot Sauce'];
export const competitors = ['Americana', 'Farm Frites', 'Lamb Weston', 'Al Jameel', 'Sunbulah', 'Almarai', 'Bidfood', 'Other'];
export const journey = [
  { time: '08:30', customerId: 'C001', status: 'Due Now' },
  { time: '10:00', customerId: 'C002', status: 'Planned' },
  { time: '11:30', customerId: 'C003', status: 'Planned' }
];

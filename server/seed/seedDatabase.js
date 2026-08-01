import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Department } from '../models/Department.js';
import { Complaint } from '../models/Complaint.js';
import { IssuePreset } from '../models/IssuePreset.js';
import { AuditLog } from '../models/AuditLog.js';

const DEFAULT_USER_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23475569'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

const INITIAL_USERS = [
  {
    id: 'usr-1',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@user.portal.edu',
    password: 'password123',
    role: 'user',
    departmentId: null,
    departmentName: null,
    phone: '+91 98123 45678',
    avatar: DEFAULT_USER_AVATAR,
  },
  {
    id: 'usr-2',
    name: 'Priya Patel',
    email: 'priya.patel@user.portal.edu',
    password: 'password123',
    role: 'user',
    departmentId: null,
    departmentName: null,
    phone: '+91 98234 56789',
    avatar: DEFAULT_USER_AVATAR,
  },
  {
    id: 'stf-1',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@technician.portal.edu',
    password: 'password123',
    role: 'technician',
    departmentId: 'dept-1',
    departmentName: 'Electrical Engineering',
    department: 'Electrical Engineering',
    phone: '+91 98450 12345',
    avatar: DEFAULT_USER_AVATAR,
    activeTicketsCount: 2,
    rating: 4.9,
  },
  {
    id: 'stf-2',
    name: 'Suresh Verma',
    email: 'suresh.verma@technician.portal.edu',
    password: 'password123',
    role: 'technician',
    departmentId: 'dept-2',
    departmentName: 'Plumbing & Water Services',
    department: 'Plumbing & Water Services',
    phone: '+91 97312 34567',
    avatar: DEFAULT_USER_AVATAR,
    activeTicketsCount: 1,
    rating: 4.6,
  },
  {
    id: 'stf-3',
    name: 'Kavita Sharma',
    email: 'kavita.sharma@technician.portal.edu',
    password: 'password123',
    role: 'technician',
    departmentId: 'dept-3',
    departmentName: 'IT Infrastructure & Networking',
    department: 'IT Infrastructure & Networking',
    phone: '+91 99001 56789',
    avatar: DEFAULT_USER_AVATAR,
    activeTicketsCount: 0,
    rating: 4.9,
  },
  {
    id: 'adm-1',
    name: 'Alok Gupta',
    email: 'alok.gupta@supervisor.portal.edu',
    password: 'password123',
    role: 'supervisor',
    assignedCategory: 'Electrical',
    departmentId: 'dept-1',
    department: 'Electrical Engineering',
    departmentName: 'Electrical Engineering',
    phone: '+91 98200 11223',
    avatar: DEFAULT_USER_AVATAR,
  },
  {
    id: 'adm-2',
    name: 'Sunita Rao',
    email: 'sunita.rao@supervisor.portal.edu',
    password: 'password123',
    role: 'supervisor',
    assignedCategory: 'Plumbing',
    departmentId: 'dept-2',
    department: 'Plumbing & Water Services',
    departmentName: 'Plumbing & Water Services',
    phone: '+91 98333 44556',
    avatar: DEFAULT_USER_AVATAR,
  },
  {
    id: 'sup-1',
    name: 'Dr. Anita Deshmukh',
    email: 'dr.anita@admin.portal.edu',
    password: 'password123',
    role: 'admin',
    department: 'System Administration',
    phone: '+91 99887 76655',
    avatar: DEFAULT_USER_AVATAR,
  },
];

const INITIAL_DEPARTMENTS = [
  { id: 'dept-1', name: 'Electrical Engineering', code: 'ELE' },
  { id: 'dept-2', name: 'Plumbing & Water Services', code: 'PLM' },
  { id: 'dept-3', name: 'IT Infrastructure & Networking', code: 'ITN' },
  { id: 'dept-4', name: 'Civil & Carpentry Maintenance', code: 'CIV' },
  { id: 'dept-5', name: 'Housekeeping & Sanitation', code: 'HSK' },
  { id: 'dept-6', name: 'HVAC & Air Conditioning', code: 'HVC' },
  { id: 'dept-7', name: 'Fire & Emergency Safety', code: 'FRS' },
];

const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Electrical', departmentId: 'dept-1', basePriority: 'medium', icon: 'Zap' },
  { id: 'cat-2', name: 'Plumbing', departmentId: 'dept-2', basePriority: 'medium', icon: 'Droplet' },
  { id: 'cat-3', name: 'IT & Wi-Fi', departmentId: 'dept-3', basePriority: 'low', icon: 'Wifi' },
  { id: 'cat-4', name: 'Civil & Carpentry', departmentId: 'dept-4', basePriority: 'low', icon: 'Hammer' },
  { id: 'cat-5', name: 'Housekeeping', departmentId: 'dept-5', basePriority: 'low', icon: 'Broom' },
  { id: 'cat-6', name: 'HVAC & AC', departmentId: 'dept-6', basePriority: 'medium', icon: 'Wind' },
  { id: 'cat-7', name: 'Fire & Emergency', departmentId: 'dept-7', basePriority: 'high', icon: 'Flame' },
];

const INITIAL_PREDEFINED_ISSUES = {
  'Electrical': [
    'Wiring short circuit / burning smell',
    'Power Outage / Circuit Breaker Trip',
    'Light Switch / Plug Socket Spark',
    'Ceiling Fan Fault / Fan Noise',
  ],
  'Plumbing': [
    'Severe Water Leak / Pipe Burst',
    'Toilet Flush Tank Overflow',
    'Sink Clogging / Drain Blockage',
    'Low Water Pressure / Tap Repair',
  ],
  'IT & Wi-Fi': [
    'No Internet Connection / Wi-Fi Router Down',
    'LAN Cable Port Broken',
    'Projector Display Signal Failure',
  ],
  'Civil & Carpentry': [
    'Door Lock Jammed / Key Stuck',
    'Window Glass Broken',
    'Desk Chair Fixture Loose',
  ],
  'Housekeeping': [
    'Trash Bin Overflowing / Cleanup Required',
    'Floor Cleaning / Spill Hazard',
  ],
  'HVAC & AC': [
    'AC Not Cooling / Water Dripping',
    'AC Air Filter Noise',
  ],
  'Fire & Emergency': [
    'Smoke Alarm Chirping / Fire Hazard',
    'Extinguisher Pressure Low',
  ],
};

const INITIAL_COMPLAINTS = [
  {
    id: 'cmp-105',
    ticketId: 'TICK-20260731-105',
    title: 'Emergency main breaker spark & power cut in Computer Lab 105',
    description: 'Electrical sparks emitted from main circuit breaker box causing sudden power trip in Lab 105. Urgent inspection required.',
    category: 'Electrical',
    departmentId: 'dept-1',
    location: { block: 'Block A - Main Academic', floor: '1st Floor', room: 'Lab 105' },
    priority: 'high',
    priorityReason: 'Critical Category (Electrical) + Keywords ("spark", "power cut") + Urgent flag',
    priorityScore: 85,
    status: 'assigned',
    userUrgency: 'Urgent',
    createdBy: { id: 'usr-1', name: 'Aarav Sharma', email: 'aarav.sharma@user.portal.edu' },
    assignedTo: { id: 'stf-1', name: 'Rajesh Kumar', department: 'Electrical Engineering', email: 'rajesh.kumar@technician.portal.edu', avatar: DEFAULT_USER_AVATAR },
    attachments: ['https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=600&auto=format&fit=crop&q=80'],
    createdAt: new Date('2026-07-31T11:00:00Z'),
    updatedAt: new Date('2026-07-31T11:05:00Z'),
  },
  {
    id: 'cmp-101',
    ticketId: 'TICK-20260728-101',
    title: 'Severe water leak under main lab sink causing flooding',
    description: 'Pipe ruptured under sink #4 in Chemistry Storage. Water accumulating rapidly on floor near electrical socket. Immediate attention required.',
    category: 'Plumbing',
    departmentId: 'dept-2',
    location: { block: 'Block B - Science Wing', floor: '2nd Floor', room: 'Chemistry Storage' },
    priority: 'high',
    priorityReason: 'Keyword match ("water leak", "flooding") + Urgent selection',
    priorityScore: 70,
    status: 'in_progress',
    userUrgency: 'Urgent',
    createdBy: { id: 'usr-1', name: 'Aarav Sharma', email: 'aarav.sharma@user.portal.edu' },
    assignedTo: { id: 'stf-2', name: 'Suresh Verma', department: 'Plumbing & Water Services', email: 'suresh.verma@technician.portal.edu', avatar: DEFAULT_USER_AVATAR },
    attachments: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&auto=format&fit=crop&q=80'],
    createdAt: new Date('2026-07-28T14:20:00Z'),
    updatedAt: new Date('2026-07-29T10:15:00Z'),
  },
];

export async function seedDatabase() {
  const db = await connectDB();
  if (!db) {
    console.log('[Seed] Database connection offline, skipping MongoDB seeding.');
    return;
  }

  try {
    console.log('[Seed] Seeding MongoDB Collections...');

    await User.deleteMany({});
    await User.insertMany(INITIAL_USERS);

    await Department.deleteMany({});
    await Department.insertMany(INITIAL_DEPARTMENTS);

    await Category.deleteMany({});
    await Category.insertMany(INITIAL_CATEGORIES);

    await IssuePreset.deleteMany({});
    for (const [catName, presets] of Object.entries(INITIAL_PREDEFINED_ISSUES)) {
      await IssuePreset.create({ categoryName: catName, presets });
    }

    await Complaint.deleteMany({});
    await Complaint.insertMany(INITIAL_COMPLAINTS);

    console.log('[Seed] MongoDB Seeding completed successfully!');
  } catch (error) {
    console.error('[Seed Error]:', error.message);
  }
}

if (process.argv[1].includes('seedDatabase.js')) {
  seedDatabase().then(() => process.exit(0));
}

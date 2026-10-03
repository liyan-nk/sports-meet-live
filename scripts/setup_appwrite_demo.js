/**
 * SPORTS MEET LIVE 2026 — APPWRITE SETUP & SEED SCRIPT
 * 
 * Usage:
 *   APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1" \
 *   APPWRITE_PROJECT_ID="your-project-id" \
 *   APPWRITE_API_KEY="your-api-key" \
 *   node scripts/setup_appwrite_demo.js
 */

import { Client, Databases, ID, Permission, Role } from 'node-appwrite';

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

if (!projectId || !apiKey) {
  console.error('Error: APPWRITE_PROJECT_ID and APPWRITE_API_KEY environment variables are required.');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'sports_meet_db';

const COLLECTIONS = {
  TEAMS: 'teams',
  EVENTS: 'events',
  SCORING_RULES: 'scoring_rules',
  RESULTS: 'results',
  ADJUSTMENTS: 'standings_adjustments',
  AUTHORIZED_ADMINS: 'authorized_admins',
};

async function runSetup() {
  console.log('🚀 Starting Appwrite Database Setup for Sports Meet Live 2026...');

  // 1. Create Database if not exists
  try {
    await databases.create(DATABASE_ID, 'Sports Meet Live 2026 DB');
    console.log(`✅ Created Database: ${DATABASE_ID}`);
  } catch (err) {
    if (err.code === 409) {
      console.log(`ℹ️ Database '${DATABASE_ID}' already exists.`);
    } else {
      console.error('Database creation error:', err.message);
    }
  }

  // 2. Helper to create collection
  async function ensureCollection(id, name) {
    try {
      await databases.createCollection(
        DATABASE_ID,
        id,
        name,
        [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any()),
        ]
      );
      console.log(`✅ Created collection: ${name} (${id})`);
    } catch (err) {
      if (err.code === 409) {
        console.log(`ℹ️ Collection '${name}' (${id}) already exists.`);
      } else {
        console.error(`Collection ${id} creation error:`, err.message);
      }
    }
  }

  await ensureCollection(COLLECTIONS.TEAMS, 'Teams');
  await ensureCollection(COLLECTIONS.EVENTS, 'Events');
  await ensureCollection(COLLECTIONS.SCORING_RULES, 'Scoring Rules');
  await ensureCollection(COLLECTIONS.RESULTS, 'Results');
  await ensureCollection(COLLECTIONS.ADJUSTMENTS, 'Standings Adjustments');
  await ensureCollection(COLLECTIONS.AUTHORIZED_ADMINS, 'Authorized Admins');

  // 3. Helper to create string attribute
  async function ensureStringAttr(colId, key, size = 255, required = false) {
    try {
      await databases.createStringAttribute(DATABASE_ID, colId, key, size, required);
      console.log(`  + Attribute '${key}' on ${colId}`);
    } catch (err) {
      if (err.code !== 409) console.error(`  - Attribute '${key}' error:`, err.message);
    }
  }

  // 4. Helper to create integer attribute
  async function ensureIntAttr(colId, key, required = false) {
    try {
      await databases.createIntegerAttribute(DATABASE_ID, colId, key, required);
      console.log(`  + Attribute '${key}' (int) on ${colId}`);
    } catch (err) {
      if (err.code !== 409) console.error(`  - Attribute '${key}' error:`, err.message);
    }
  }

  // 5. Helper to create boolean attribute
  async function ensureBoolAttr(colId, key, required = false) {
    try {
      await databases.createBooleanAttribute(DATABASE_ID, colId, key, required);
      console.log(`  + Attribute '${key}' (bool) on ${colId}`);
    } catch (err) {
      if (err.code !== 409) console.error(`  - Attribute '${key}' error:`, err.message);
    }
  }

  console.log('📦 Configuring Attributes...');
  
  // Teams attributes
  await ensureStringAttr(COLLECTIONS.TEAMS, 'name', 255, true);
  await ensureStringAttr(COLLECTIONS.TEAMS, 'code', 50, true);
  await ensureStringAttr(COLLECTIONS.TEAMS, 'color', 50, false);
  await ensureStringAttr(COLLECTIONS.TEAMS, 'secondaryColor', 50, false);
  await ensureStringAttr(COLLECTIONS.TEAMS, 'logoUrl', 1000, false);

  // Events attributes
  await ensureStringAttr(COLLECTIONS.EVENTS, 'name', 255, true);
  await ensureStringAttr(COLLECTIONS.EVENTS, 'category', 100, true);
  await ensureStringAttr(COLLECTIONS.EVENTS, 'status', 50, true);
  await ensureStringAttr(COLLECTIONS.EVENTS, 'scheduledAt', 100, false);
  await ensureStringAttr(COLLECTIONS.EVENTS, 'createdAt', 100, false);

  // Scoring Rules attributes
  await ensureIntAttr(COLLECTIONS.SCORING_RULES, 'position', true);
  await ensureIntAttr(COLLECTIONS.SCORING_RULES, 'points', true);
  await ensureStringAttr(COLLECTIONS.SCORING_RULES, 'label', 100, false);

  // Results attributes
  await ensureStringAttr(COLLECTIONS.RESULTS, 'eventId', 100, true);
  await ensureStringAttr(COLLECTIONS.RESULTS, 'teamId', 100, true);
  await ensureIntAttr(COLLECTIONS.RESULTS, 'position', true);
  await ensureIntAttr(COLLECTIONS.RESULTS, 'points', true);
  await ensureStringAttr(COLLECTIONS.RESULTS, 'participantName', 255, false);
  await ensureStringAttr(COLLECTIONS.RESULTS, 'createdBy', 255, false);
  await ensureStringAttr(COLLECTIONS.RESULTS, 'createdAt', 100, false);

  // Adjustments attributes
  await ensureStringAttr(COLLECTIONS.ADJUSTMENTS, 'teamId', 100, true);
  await ensureIntAttr(COLLECTIONS.ADJUSTMENTS, 'points', true);
  await ensureStringAttr(COLLECTIONS.ADJUSTMENTS, 'reason', 500, true);
  await ensureStringAttr(COLLECTIONS.ADJUSTMENTS, 'createdBy', 255, false);
  await ensureStringAttr(COLLECTIONS.ADJUSTMENTS, 'createdAt', 100, false);

  // Authorized Admins attributes
  await ensureStringAttr(COLLECTIONS.AUTHORIZED_ADMINS, 'email', 255, true);
  await ensureStringAttr(COLLECTIONS.AUTHORIZED_ADMINS, 'name', 255, false);
  await ensureBoolAttr(COLLECTIONS.AUTHORIZED_ADMINS, 'active', true);
  await ensureStringAttr(COLLECTIONS.AUTHORIZED_ADMINS, 'createdAt', 100, false);

  console.log('⏳ Waiting for attributes to index...');
  await new Promise((r) => setTimeout(r, 4000));

  // Seed Data
  console.log('🌱 Seeding Presentation Demo Dataset...');

  // Teams
  const teamsData = [
    { $id: 'team-vertex', name: 'Vertex', code: 'VTX' },
    { $id: 'team-zenith', name: 'Zenith', code: 'ZNT' },
    { $id: 'team-astra',  name: 'Astra',  code: 'AST' },
    { $id: 'team-nova',   name: 'Nova',   code: 'NOV' },
  ];

  for (const team of teamsData) {
    try {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.TEAMS, team.$id, {
        name: team.name,
        code: team.code,
      });
      console.log(`  + Seeded Team: ${team.name}`);
    } catch (err) {
      if (err.code !== 409) console.error(`  - Team ${team.name} seed error:`, err.message);
    }
  }

  // Scoring Rules
  const rulesData = [
    { $id: 'rule-1', position: 1, points: 10, label: '1st Place' },
    { $id: 'rule-2', position: 2, points: 5,  label: '2nd Place' },
    { $id: 'rule-3', position: 3, points: 3,  label: '3rd Place' },
    { $id: 'rule-4', position: 4, points: 0,  label: '4th Place' },
  ];

  for (const rule of rulesData) {
    try {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.SCORING_RULES, rule.$id, {
        position: rule.position,
        points: rule.points,
        label: rule.label,
      });
      console.log(`  + Seeded Rule: ${rule.label}`);
    } catch (err) {
      if (err.code !== 409) console.error(`  - Rule ${rule.label} seed error:`, err.message);
    }
  }

  // Adjustments
  const adjustmentsData = [
    { $id: 'adj-vertex-init', teamId: 'team-vertex', points: 10, reason: 'Initial standings — pre-system results' },
    { $id: 'adj-zenith-init', teamId: 'team-zenith', points: 5,  reason: 'Initial standings — pre-system results' },
    { $id: 'adj-astra-init',  teamId: 'team-astra',  points: 3,  reason: 'Initial standings — pre-system results' },
    { $id: 'adj-nova-init',   teamId: 'team-nova',   points: 0,  reason: 'Initial standings — pre-system results' },
  ];

  for (const adj of adjustmentsData) {
    try {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.ADJUSTMENTS, adj.$id, {
        teamId: adj.teamId,
        points: adj.points,
        reason: adj.reason,
        createdAt: new Date().toISOString(),
      });
      console.log(`  + Seeded Adjustment: ${adj.teamId} (${adj.points} PTS)`);
    } catch (err) {
      if (err.code !== 409) console.error(`  - Adjustment ${adj.$id} error:`, err.message);
    }
  }

  // Events
  const eventsData = [
    { $id: 'ev-100m-men',          name: '100M Men',               category: 'Track',      status: 'completed' },
    { $id: 'ev-long-jump-men',     name: 'Long Jump Men',          category: 'Field',      status: 'completed' },
    { $id: 'ev-200m-women',        name: '200M Women',             category: 'Track',      status: 'completed' },
    { $id: 'ev-badminton-singles', name: 'Badminton Men Singles',  category: 'Indoor',     status: 'completed' },
    { $id: 'ev-football-men',      name: 'Football Men',           category: 'Team Sport', status: 'completed' },
    { $id: 'ev-volleyball-women',   name: 'Volleyball Women',        category: 'Team Sport', status: 'completed' },
    { $id: 'ev-4x100-relay',       name: '4×100 Relay',            category: 'Track',      status: 'completed' },
    { $id: 'ev-shot-put-men',      name: 'Shot Put Men',           category: 'Field',      status: 'completed' },
  ];

  for (const ev of eventsData) {
    try {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.EVENTS, ev.$id, {
        name: ev.name,
        category: ev.category,
        status: ev.status,
        createdAt: new Date().toISOString(),
      });
      console.log(`  + Seeded Event: ${ev.name}`);
    } catch (err) {
      if (err.code !== 409) console.error(`  - Event ${ev.name} error:`, err.message);
    }
  }

  // Results
  const resultsData = [
    // 100M Men
    { eventId: 'ev-100m-men', teamId: 'team-vertex', position: 1, points: 10, participantName: 'Liyan (S3 CSE)' },
    { eventId: 'ev-100m-men', teamId: 'team-zenith', position: 2, points: 5,  participantName: 'Nihal (S1 AD)' },
    { eventId: 'ev-100m-men', teamId: 'team-astra',  position: 3, points: 3,  participantName: 'Shinas (S1 BBA)' },
    // Long Jump Men
    { eventId: 'ev-long-jump-men', teamId: 'team-zenith', position: 1, points: 10, participantName: 'Azal (S1 CSE)' },
    { eventId: 'ev-long-jump-men', teamId: 'team-vertex', position: 2, points: 5,  participantName: 'Rayyan (S2 CSE)' },
    { eventId: 'ev-long-jump-men', teamId: 'team-astra',  position: 3, points: 3,  participantName: 'Nihal (S1 AD)' },
    // 200M Women
    { eventId: 'ev-200m-women', teamId: 'team-astra',  position: 1, points: 10, participantName: 'Alya (S1 BBA)' },
    { eventId: 'ev-200m-women', teamId: 'team-nova',   position: 2, points: 5,  participantName: 'Fathima (S2 CSE)' },
    { eventId: 'ev-200m-women', teamId: 'team-zenith', position: 3, points: 3,  participantName: 'Hiba (S1 AD)' },
    // Badminton Men Singles
    { eventId: 'ev-badminton-singles', teamId: 'team-astra',  position: 1, points: 10, participantName: 'Shinas (S1 BBA)' },
    { eventId: 'ev-badminton-singles', teamId: 'team-nova',   position: 2, points: 5,  participantName: 'Rayyan (S2 CSE)' },
    { eventId: 'ev-badminton-singles', teamId: 'team-vertex', position: 3, points: 3,  participantName: 'Liyan (S3 CSE)' },
    // Football Men (Team event)
    { eventId: 'ev-football-men', teamId: 'team-vertex', position: 1, points: 10 },
    { eventId: 'ev-football-men', teamId: 'team-zenith', position: 2, points: 5 },
    { eventId: 'ev-football-men', teamId: 'team-astra',  position: 3, points: 3 },
    // Volleyball Women (Team event)
    { eventId: 'ev-volleyball-women', teamId: 'team-astra',  position: 1, points: 10 },
    { eventId: 'ev-volleyball-women', teamId: 'team-nova',   position: 2, points: 5 },
    { eventId: 'ev-volleyball-women', teamId: 'team-zenith', position: 3, points: 3 },
    // 4×100 Relay (Team event)
    { eventId: 'ev-4x100-relay', teamId: 'team-nova',   position: 1, points: 10 },
    { eventId: 'ev-4x100-relay', teamId: 'team-vertex', position: 2, points: 5 },
    { eventId: 'ev-4x100-relay', teamId: 'team-zenith', position: 3, points: 3 },
    // Shot Put Men
    { eventId: 'ev-shot-put-men', teamId: 'team-vertex', position: 1, points: 10 },
    { eventId: 'ev-shot-put-men', teamId: 'team-astra',  position: 2, points: 5 },
    { eventId: 'ev-shot-put-men', teamId: 'team-nova',   position: 3, points: 3 },
  ];

  for (const res of resultsData) {
    try {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.RESULTS, ID.unique(), {
        eventId: res.eventId,
        teamId: res.teamId,
        position: res.position,
        points: res.points,
        participantName: res.participantName || null,
        createdAt: new Date().toISOString(),
      });
      console.log(`  + Seeded Result: Event ${res.eventId} - Pos #${res.position}`);
    } catch (err) {
      if (err.code !== 409) console.error(`  - Result seed error:`, err.message);
    }
  }

  // Seed Authorized Admin Whitelist
  const adminsData = [
    { email: 'admin@example.com', name: 'Primary Event Admin', active: true },
    { email: 'sports@example.com', name: 'Sports Committee Admin', active: true },
  ];

  for (const adm of adminsData) {
    try {
      await databases.createDocument(DATABASE_ID, COLLECTIONS.AUTHORIZED_ADMINS, ID.unique(), {
        email: adm.email,
        name: adm.name,
        active: adm.active,
        createdAt: new Date().toISOString(),
      });
      console.log(`  + Seeded Admin: ${adm.email}`);
    } catch (err) {
      if (err.code !== 409) console.error(`  - Admin ${adm.email} seed error:`, err.message);
    }
  }

  console.log('✨ Appwrite Setup & Demo Seeding Completed Successfully!');
}

runSetup().catch((err) => {
  console.error('Fatal Setup Error:', err);
  process.exit(1);
});

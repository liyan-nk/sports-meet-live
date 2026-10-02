-- ==============================================================================
-- MIGRATION 003: DEMO SEED DATASET FOR COLLEGE PRESENTATION
-- Description: Populates demo events and demo results for presentation.
-- NOTE: Demo data can be cleared prior to official Sports Meet operations.
-- ==============================================================================

-- 1. Demo Events
insert into public.events (id, name, category, status) values
  ('11111111-0000-0000-0000-000000000001', '100M Men', 'Track', 'completed'),
  ('11111111-0000-0000-0000-000000000002', 'Long Jump Men', 'Field', 'completed'),
  ('11111111-0000-0000-0000-000000000003', '200M Women', 'Track', 'completed'),
  ('11111111-0000-0000-0000-000000000004', 'Badminton Men Singles', 'Indoor', 'completed'),
  ('11111111-0000-0000-0000-000000000005', 'Football Men', 'Team Sport', 'completed'),
  ('11111111-0000-0000-0000-000000000006', 'Volleyball Women', 'Team Sport', 'completed'),
  ('11111111-0000-0000-0000-000000000007', '4×100 Relay', 'Track', 'completed'),
  ('11111111-0000-0000-0000-000000000008', 'Shot Put Men', 'Field', 'completed')
on conflict (id) do update set name = excluded.name, category = excluded.category, status = excluded.status;

-- 2. Demo Results
insert into public.results (event_id, team_id, position, points, participant_name) values
  -- 100M Men
  ('11111111-0000-0000-0000-000000000001', 'team-vertex', 1, 10, 'Liyan (S3 CSE)'),
  ('11111111-0000-0000-0000-000000000001', 'team-zenith', 2, 5,  'Nihal (S1 AD)'),
  ('11111111-0000-0000-0000-000000000001', 'team-astra',  3, 3,  'Shinas (S1 BBA)'),

  -- Long Jump Men
  ('11111111-0000-0000-0000-000000000002', 'team-zenith', 1, 10, 'Azal (S1 CSE)'),
  ('11111111-0000-0000-0000-000000000002', 'team-vertex', 2, 5,  'Rayyan (S2 CSE)'),
  ('11111111-0000-0000-0000-000000000002', 'team-astra',  3, 3,  'Nihal (S1 AD)'),

  -- 200M Women
  ('11111111-0000-0000-0000-000000000003', 'team-astra',  1, 10, 'Alya (S1 BBA)'),
  ('11111111-0000-0000-0000-000000000003', 'team-nova',   2, 5,  'Fathima (S2 CSE)'),
  ('11111111-0000-0000-0000-000000000003', 'team-zenith', 3, 3,  'Hiba (S1 AD)'),

  -- Badminton Men Singles
  ('11111111-0000-0000-0000-000000000004', 'team-astra',  1, 10, 'Shinas (S1 BBA)'),
  ('11111111-0000-0000-0000-000000000004', 'team-nova',   2, 5,  'Rayyan (S2 CSE)'),
  ('11111111-0000-0000-0000-000000000004', 'team-vertex', 3, 3,  'Liyan (S3 CSE)'),

  -- Football Men (Team event - NULL participant_name)
  ('11111111-0000-0000-0000-000000000005', 'team-vertex', 1, 10, NULL),
  ('11111111-0000-0000-0000-000000000005', 'team-zenith', 2, 5,  NULL),
  ('11111111-0000-0000-0000-000000000005', 'team-astra',  3, 3,  NULL),

  -- Volleyball Women (Team event)
  ('11111111-0000-0000-0000-000000000006', 'team-astra',  1, 10, NULL),
  ('11111111-0000-0000-0000-000000000006', 'team-nova',   2, 5,  NULL),
  ('11111111-0000-0000-0000-000000000006', 'team-zenith', 3, 3,  NULL),

  -- 4×100 Relay (Team event)
  ('11111111-0000-0000-0000-000000000007', 'team-nova',   1, 10, NULL),
  ('11111111-0000-0000-0000-000000000007', 'team-vertex', 2, 5,  NULL),
  ('11111111-0000-0000-0000-000000000007', 'team-zenith', 3, 3,  NULL),

  -- Shot Put Men
  ('11111111-0000-0000-0000-000000000008', 'team-vertex', 1, 10, NULL),
  ('11111111-0000-0000-0000-000000000008', 'team-astra',  2, 5,  NULL),
  ('11111111-0000-0000-0000-000000000008', 'team-nova',   3, 3,  NULL)
on conflict (event_id, team_id) do update set position = excluded.position, points = excluded.points, participant_name = excluded.participant_name;

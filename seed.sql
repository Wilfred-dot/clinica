-- ========== CONSULTAS (corrigido) ==========
INSERT INTO consultas (paciente_id, medico_id, data_hora, status, observacoes)
SELECT p.id, m.id, dados.data_hora::timestamp, dados.status, dados.obs
FROM (VALUES
  ('ana@email.com',    'carlos@clinicammq.com',  '2025-04-28 08:00:00', 'realizada', '{"motivo":"Revisão anual de miopia","acuidade_visual_od":"20/40","acuidade_visual_oe":"20/60","pressao_od":14,"pressao_oe":13,"diagnostico":"Miopia estável","plano_tratamento":"Renovar óculos"}'),
  ('joao@email.com',   'sofia@clinicammq.com',   '2025-04-28 09:00:00', 'realizada', '{"motivo":"Controlo pós-operatório","diagnostico":"Catarata inicial"}'),
  ('maria@email.com',  'carlos@clinicammq.com',  '2025-04-28 10:00:00', 'confirmada',    '{"motivo":"1.ª consulta – dores oculares"}'),
  ('pedro@email.com',  'sofia@clinicammq.com',   '2025-04-28 10:30:00', 'agendada',   NULL),
  ('lucia@email.com',  'antonio@clinicammq.com', '2025-04-28 11:00:00', 'agendada',   NULL),
  ('ana@email.com',    'carlos@clinicammq.com',  '2025-04-29 09:00:00', 'agendada',   NULL),
  ('ana@email.com',    'sofia@clinicammq.com',   '2025-04-30 14:00:00', 'agendada',   NULL)
) AS dados (paciente_email, medico_email, data_hora, status, obs)
JOIN users up ON up.email = dados.paciente_email
JOIN pacientes p ON p.user_id = up.id
JOIN users um ON um.email = dados.medico_email
JOIN medicos m ON m.user_id = um.id
WHERE NOT EXISTS (
  SELECT 1 FROM consultas c
  WHERE c.paciente_id = p.id AND c.medico_id = m.id AND c.data_hora = dados.data_hora::timestamp
);

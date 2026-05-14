import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed da base de dados...');

  // ─── 1. USUÁRIOS ───
  const passwordHash = await bcrypt.hash('senha123', 10);

  const adminUser = await prisma.users.create({
    data: {
      name: 'Administrador Sistema',
      email: 'admin@clinica.com',
      password: passwordHash,
      role: 'admin',
      ativo: true,
    },
  });

  const medicosUsers = await prisma.users.createMany({
    data: [
      { name: 'Dr. Carlos Mendes', email: 'carlos.mendes@clinica.com', password: passwordHash, role: 'medico', ativo: true },
      { name: 'Dra. Ana Paula Ferreira', email: 'ana.ferreira@clinica.com', password: passwordHash, role: 'medico', ativo: true },
      { name: 'Dr. Roberto Silva', email: 'roberto.silva@clinica.com', password: passwordHash, role: 'medico', ativo: true },
      { name: 'Dra. Mariana Costa', email: 'mariana.costa@clinica.com', password: passwordHash, role: 'medico', ativo: true },
    ],
  });

  const pacientesUsers = await prisma.users.createMany({
    data: [
      { name: 'João Pereira', email: 'joao.pereira@email.com', password: passwordHash, role: 'paciente', ativo: true },
      { name: 'Maria Santos', email: 'maria.santos@email.com', password: passwordHash, role: 'paciente', ativo: true },
      { name: 'Pedro Oliveira', email: 'pedro.oliveira@email.com', password: passwordHash, role: 'paciente', ativo: true },
      { name: 'Lucia Almeida', email: 'lucia.almeida@email.com', password: passwordHash, role: 'paciente', ativo: true },
      { name: 'Fernando Lima', email: 'fernando.lima@email.com', password: passwordHash, role: 'paciente', ativo: true },
      { name: 'Carla Souza', email: 'carla.souza@email.com', password: passwordHash, role: 'paciente', ativo: true },
      { name: 'Ricardo Gomes', email: 'ricardo.gomes@email.com', password: passwordHash, role: 'paciente', ativo: true },
      { name: 'Patricia Rocha', email: 'patricia.rocha@email.com', password: passwordHash, role: 'paciente', ativo: true },
    ],
  });

  console.log('✅ Usuários criados');

  // ─── 2. MÉDICOS ───
  const allUsers = await prisma.users.findMany();
  const medicoUsers = allUsers.filter(u => u.role === 'medico');
  const pacienteUsers = allUsers.filter(u => u.role === 'paciente');

  const medico1 = await prisma.medicos.create({
    data: {
      user_id: medicoUsers[0].id,
      especialidade: 'Oftalmologia',
      numero_ordem: 'CRM-SP-12345',
      telefone: '(11) 98765-4321',
      horario_trabalho: '08:00-17:00',
    },
  });

  const medico2 = await prisma.medicos.create({
    data: {
      user_id: medicoUsers[1].id,
      especialidade: 'Oftalmologia Pediátrica',
      numero_ordem: 'CRM-SP-23456',
      telefone: '(11) 98765-4322',
      horario_trabalho: '09:00-18:00',
    },
  });

  const medico3 = await prisma.medicos.create({
    data: {
      user_id: medicoUsers[2].id,
      especialidade: 'Cirurgia Ocular',
      numero_ordem: 'CRM-SP-34567',
      telefone: '(11) 98765-4323',
      horario_trabalho: '08:00-16:00',
    },
  });

  const medico4 = await prisma.medicos.create({
    data: {
      user_id: medicoUsers[3].id,
      especialidade: 'Retina e Vítreo',
      numero_ordem: 'CRM-SP-45678',
      telefone: '(11) 98765-4324',
      horario_trabalho: '10:00-19:00',
    },
  });

  console.log('✅ Médicos criados');

  // ─── 3. PACIENTES ───
  const paciente1 = await prisma.pacientes.create({
    data: {
      user_id: pacienteUsers[0].id,
      data_nascimento: new Date('1985-03-15'),
      sexo: 'M',
      telefone: '(11) 91234-5678',
      endereco: 'Rua das Flores, 123 - São Paulo, SP',
      historico_medico: 'Hipertensão controlada. Cirurgia de apendicite em 2010.',
    },
  });

  const paciente2 = await prisma.pacientes.create({
    data: {
      user_id: pacienteUsers[1].id,
      data_nascimento: new Date('1990-07-22'),
      sexo: 'F',
      telefone: '(11) 92345-6789',
      endereco: 'Av. Paulista, 1000 - São Paulo, SP',
      historico_medico: 'Asma leve. Alergia a penicilina.',
    },
  });

  const paciente3 = await prisma.pacientes.create({
    data: {
      user_id: pacienteUsers[2].id,
      data_nascimento: new Date('1978-11-05'),
      sexo: 'M',
      telefone: '(11) 93456-7890',
      endereco: 'Rua Augusta, 456 - São Paulo, SP',
      historico_medico: 'Diabetes tipo 2. Retinopatia diabética em acompanhamento.',
    },
  });

  const paciente4 = await prisma.pacientes.create({
    data: {
      user_id: pacienteUsers[3].id,
      data_nascimento: new Date('1995-01-30'),
      sexo: 'F',
      telefone: '(11) 94567-8901',
      endereco: 'Rua Oscar Freire, 789 - São Paulo, SP',
      historico_medico: 'Miopia alta desde adolescência. Uso de lentes de contato.',
    },
  });

  const paciente5 = await prisma.pacientes.create({
    data: {
      user_id: pacienteUsers[4].id,
      data_nascimento: new Date('1960-09-12'),
      sexo: 'M',
      telefone: '(11) 95678-9012',
      endereco: 'Av. Brigadeiro Faria Lima, 2000 - São Paulo, SP',
      historico_medico: 'Catarata diagnosticada. Glaucoma em tratamento.',
    },
  });

  const paciente6 = await prisma.pacientes.create({
    data: {
      user_id: pacienteUsers[5].id,
      data_nascimento: new Date('1988-05-18'),
      sexo: 'F',
      telefone: '(11) 96789-0123',
      endereco: 'Rua Haddock Lobo, 321 - São Paulo, SP',
      historico_medico: 'Cirurgia refrativa realizada em 2020. Acompanhamento anual.',
    },
  });

  const paciente7 = await prisma.pacientes.create({
    data: {
      user_id: pacienteUsers[6].id,
      data_nascimento: new Date('1972-12-03'),
      sexo: 'M',
      telefone: '(11) 97890-1234',
      endereco: 'Av. Rebouças, 654 - São Paulo, SP',
      historico_medico: 'Degeneração macular relacionada à idade (DMI).',
    },
  });

  const paciente8 = await prisma.pacientes.create({
    data: {
      user_id: pacienteUsers[7].id,
      data_nascimento: new Date('2000-08-25'),
      sexo: 'F',
      telefone: '(11) 98901-2345',
      endereco: 'Rua da Consolação, 987 - São Paulo, SP',
      historico_medico: 'Estrabismo infantil corrigido. Acompanhamento oftalmológico regular.',
    },
  });

  console.log('✅ Pacientes criados');

  // ─── 4. CONSULTAS ───
  const hoje = new Date();
  const amanha = new Date(hoje); amanha.setDate(amanha.getDate() + 1);
  const ontem = new Date(hoje); ontem.setDate(ontem.getDate() - 1);
  const semanaPassada = new Date(hoje); semanaPassada.setDate(semanaPassada.getDate() - 7);
  const proximaSemana = new Date(hoje); proximaSemana.setDate(proximaSemana.getDate() + 7);

  const consultas = await prisma.consultas.createMany({
    data: [
      // Consultas passadas (concluídas)
      {
        paciente_id: paciente1.id,
        medico_id: medico1.id,
        data_hora: new Date(semanaPassada.setHours(9, 0, 0, 0)),
        status: 'concluida',
        observacoes: 'Paciente relata dores de cabeça frequentes.',
        motivo: 'Exame de rotina e avaliação de dores de cabeça',
        acuidade_visual: '20/20 OD, 20/25 OE',
        pressao_intraocular: '14 mmHg OD, 15 mmHg OE',
        diagnostico: 'Miopia leve. Recomendado uso de óculos para atividades de longa distância.',
        plano_tratamento: 'Prescrição de óculos. Retorno em 6 meses.',
      },
      {
        paciente_id: paciente3.id,
        medico_id: medico4.id,
        data_hora: new Date(semanaPassada.setHours(14, 0, 0, 0)),
        status: 'concluida',
        observacoes: 'Paciente diabético. Acompanhamento de retina.',
        motivo: 'Acompanhamento de retinopatia diabética',
        acuidade_visual: '20/40 OD, 20/30 OE',
        pressao_intraocular: '16 mmHg OD, 16 mmHg OE',
        diagnostico: 'Retinopatia diabética não proliferativa leve.',
        plano_tratamento: 'Controle glicêmico rigoroso. Fotocoagulação laser programada. Retorno em 3 meses.',
      },
      {
        paciente_id: paciente5.id,
        medico_id: medico3.id,
        data_hora: new Date(ontem.setHours(10, 30, 0, 0)),
        status: 'concluida',
        observacoes: 'Paciente idoso. Dificuldade de visão noturna.',
        motivo: 'Avaliação para cirurgia de catarata',
        acuidade_visual: '20/80 OD, 20/60 OE',
        pressao_intraocular: '18 mmHg OD, 17 mmHg OE',
        diagnostico: 'Catarata nuclear grau III bilateral. Glaucoma de ângulo aberto leve.',
        plano_tratamento: 'Cirurgia de facoemulsificação + IOL programada para próximo mês. Continuar colírio de hipotensor.',
      },
      // Consultas de hoje
      {
        paciente_id: paciente2.id,
        medico_id: medico2.id,
        data_hora: new Date(hoje.setHours(9, 0, 0, 0)),
        status: 'agendada',
        observacoes: 'Primeira consulta. Encaminhada pelo pediatra.',
        motivo: 'Avaliação oftalmológica pediátrica de rotina',
      },
      {
        paciente_id: paciente4.id,
        medico_id: medico1.id,
        data_hora: new Date(hoje.setHours(11, 0, 0, 0)),
        status: 'em_andamento',
        observacoes: 'Paciente chegou 15 minutos atrasado.',
        motivo: 'Troca de receituário de lentes de contato',
      },
      {
        paciente_id: paciente7.id,
        medico_id: medico4.id,
        data_hora: new Date(hoje.setHours(15, 0, 0, 0)),
        status: 'agendada',
        motivo: 'Injeção intravítrea de anti-VEGF',
        observacoes: '3ª injeção do protocolo.',
      },
      // Consultas futuras
      {
        paciente_id: paciente6.id,
        medico_id: medico1.id,
        data_hora: new Date(amanha.setHours(10, 0, 0, 0)),
        status: 'agendada',
        motivo: 'Acompanhamento pós-cirurgia refrativa - 1 ano',
      },
      {
        paciente_id: paciente8.id,
        medico_id: medico2.id,
        data_hora: new Date(amanha.setHours(14, 0, 0, 0)),
        status: 'agendada',
        observacoes: 'Acompanhamento de estrabismo corrigido.',
        motivo: 'Avaliação de motricidade ocular',
      },
      {
        paciente_id: paciente1.id,
        medico_id: medico1.id,
        data_hora: new Date(proximaSemana.setHours(9, 0, 0, 0)),
        status: 'agendada',
        motivo: 'Retorno de 6 meses - controle de miopia',
      },
      {
        paciente_id: paciente5.id,
        medico_id: medico3.id,
        data_hora: new Date(proximaSemana.setHours(8, 0, 0, 0)),
        status: 'agendada',
        motivo: 'Cirurgia de catarata - OD',
        observacoes: 'Jejo de 8 horas. Trazer acompanhante.',
      },
    ],
  });

  console.log('✅ Consultas criadas');

  // ─── 5. PRESCRIÇÕES ───
  const allConsultas = await prisma.consultas.findMany();
  const consultaConcluida1 = allConsultas.find(c => c.paciente_id === paciente1.id && c.status === 'concluida');
  const consultaConcluida2 = allConsultas.find(c => c.paciente_id === paciente3.id && c.status === 'concluida');
  const consultaConcluida3 = allConsultas.find(c => c.paciente_id === paciente5.id && c.status === 'concluida');

  await prisma.prescricoes.createMany({
    data: [
      {
        consulta_id: consultaConcluida1!.id,
        medicamento: 'Óculos de grau',
        dosagem: 'Uso contínuo para atividades de longa distância',
        instrucoes: 'Lente esférica -2.00D OD, -1.75D OE. Armação leve.',
        data_prescricao: new Date(semanaPassada),
      },
      {
        consulta_id: consultaConcluida2!.id,
        medicamento: 'Colírio Hipotensor',
        dosagem: '1 gota em cada olho, 2x ao dia',
        instrucoes: 'Aplicar pela manhã e antes de dormir. Não suspender sem orientação médica.',
        data_prescricao: new Date(semanaPassada),
      },
      {
        consulta_id: consultaConcluida3!.id,
        medicamento: 'Colírio anti-inflamatório (Diclofenaco)',
        dosagem: '1 gota em cada olho, 4x ao dia',
        instrucoes: 'Iniciar 2 dias antes da cirurgia. Suspender 1 dia antes do procedimento.',
        data_prescricao: new Date(ontem),
      },
      {
        consulta_id: consultaConcluida3!.id,
        medicamento: 'Colírio antibiótico (Moxifloxacino)',
        dosagem: '1 gota em cada olho, 3x ao dia',
        instrucoes: 'Iniciar 1 dia antes da cirurgia. Continuar por 7 dias após o procedimento.',
        data_prescricao: new Date(ontem),
      },
    ],
  });

  console.log('✅ Prescrições criadas');

  // ─── 6. NOTIFICAÇÕES ───
  await prisma.notificacoes.createMany({
    data: [
      {
        paciente_id: paciente2.id,
        mensagem: 'Sua consulta oftalmológica está agendada para amanhã às 09:00. Não esqueça de trazer seus óculos anteriores.',
        tipo_variavel: 'lembrete_consulta',
        status_envio: 'enviado',
        data_envio: new Date(),
      },
      {
        paciente_id: paciente4.id,
        mensagem: 'Lembrete: Sua consulta é hoje às 11:00. Chegue com 15 minutos de antecedência.',
        tipo_variavel: 'lembrete_consulta',
        status_envio: 'enviado',
        data_envio: new Date(),
      },
      {
        paciente_id: paciente7.id,
        mensagem: 'Sua injeção intravítrea está agendada para hoje às 15:00. Evite atividades físicas intensas após o procedimento.',
        tipo_variavel: 'lembrete_consulta',
        status_envio: 'pendente',
      },
      {
        paciente_id: paciente6.id,
        mensagem: 'Seu acompanhamento pós-cirúrgico está agendado para amanhã às 10:00.',
        tipo_variavel: 'lembrete_consulta',
        status_envio: 'pendente',
      },
      {
        paciente_id: paciente5.id,
        mensagem: 'Sua cirurgia de catarata está agendada para a próxima semana. Lembre-se do jejum de 8 horas.',
        tipo_variavel: 'lembrete_cirurgia',
        status_envio: 'pendente',
      },
      {
        paciente_id: paciente3.id,
        mensagem: 'Não esqueça de manter o controle glicêmico rigoroso antes da sua próxima consulta.',
        tipo_variavel: 'alerta_saude',
        status_envio: 'enviado',
        data_envio: new Date(ontem),
      },
    ],
  });

  console.log('✅ Notificações criadas');

  // ─── 7. PROCESSOS DE INTERNAÇÃO ───
  await prisma.processo_internacao.createMany({
    data: [
      {
        nr_processo: 'INT-2024-001',
        paciente_id: paciente3.id,
        data_entrada: new Date('2024-01-15'),
        data_reintegracao: new Date('2024-01-18'),
        causa: 'Cirurgia de vitrectomia por descolamento de retina. Paciente diabético com retinopatia proliferativa.',
      },
      {
        nr_processo: 'INT-2024-002',
        paciente_id: paciente5.id,
        data_entrada: new Date('2024-03-10'),
        data_reintegracao: new Date('2024-03-12'),
        causa: 'Cirurgia de catarata bilateral em sessão única. Implante de lente intraocular multifocal.',
      },
      {
        nr_processo: 'INT-2024-003',
        paciente_id: paciente7.id,
        data_entrada: new Date('2024-05-20'),
        data_reintegracao: null,
        causa: 'Tratamento de injeção intravítrea em série. Paciente em acompanhamento para DMI neovascular.',
      },
    ],
  });

  console.log('✅ Processos de internação criados');

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('📊 Resumo:');
  console.log(`   • ${1 + 4 + 8} usuários (1 admin, 4 médicos, 8 pacientes)`);
  console.log(`   • 4 médicos`);
  console.log(`   • 8 pacientes`);
  console.log(`   • 10 consultas`);
  console.log(`   • 4 prescrições`);
  console.log(`   • 6 notificações`);
  console.log(`   • 3 processos de internação`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

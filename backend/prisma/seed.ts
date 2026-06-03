import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed da base de dados...');

  const passwordHash = await bcrypt.hash('senha123', 10);

  // ─── 1. USUÁRIOS ───
  console.log('-> Processando Usuários...');
  
  // Admin
  await prisma.users.upsert({
    where: { email: 'admin@clinica.com' },
    update: {},
    create: {
      name: 'Administrador Sistema',
      email: 'admin@clinica.com',
      password: passwordHash,
      role: 'admin',
      ativo: true,
    },
  });

  // Médicos (Contas de Usuário)
  const medicosData = [
    { name: 'Dr. Carlos Mendes', email: 'carlos.mendes@clinica.com', role: 'medico' },
    { name: 'Dra. Ana Paula Ferreira', email: 'ana.ferreira@clinica.com', role: 'medico' },
    { name: 'Dr. Roberto Silva', email: 'roberto.silva@clinica.com', role: 'medico' },
    { name: 'Dra. Mariana Costa', email: 'mariana.costa@clinica.com', role: 'medico' },
  ];

  const dbMedicosUsers = [];
  for (const m of medicosData) {
    const user = await prisma.users.upsert({
      where: { email: m.email },
      update: {},
      create: { ...m, password: passwordHash, ativo: true },
    });
    dbMedicosUsers.push(user);
  }

  // Pacientes (Contas de Usuário)
  const pacientesData = [
    { name: 'João Pereira', email: 'joao.pereira@email.com', role: 'paciente' },
    { name: 'Maria Santos', email: 'maria.santos@email.com', role: 'paciente' },
    { name: 'Pedro Oliveira', email: 'pedro.oliveira@email.com', role: 'paciente' },
    { name: 'Lucia Almeida', email: 'lucia.almeida@email.com', role: 'paciente' },
    { name: 'Fernando Lima', email: 'fernando.lima@email.com', role: 'paciente' },
    { name: 'Carla Souza', email: 'carla.souza@email.com', role: 'paciente' },
    { name: 'Ricardo Gomes', email: 'ricardo.gomes@email.com', role: 'paciente' },
    { name: 'Patricia Rocha', email: 'patricia.rocha@email.com', role: 'paciente' },
  ];

  const dbPacientesUsers = [];
  for (const p of pacientesData) {
    const user = await prisma.users.upsert({
      where: { email: p.email },
      update: {},
      create: { ...p, password: passwordHash, ativo: true },
    });
    dbPacientesUsers.push(user);
  }

  console.log('✅ Usuários processados');

  // ─── 2. PERFIS DOS MÉDICOS ───
  console.log('-> Processando Perfis dos Médicos...');
  const medicosSpecs = [
    { email: 'carlos.mendes@clinica.com', especialidade: 'Oftalmologia', numero_ordem: 'CRM-SP-12345', telefone: '(11) 98765-4321', horario_trabalho: '08:00-17:00' },
    { email: 'ana.ferreira@clinica.com', especialidade: 'Oftalmologia Pediátrica', numero_ordem: 'CRM-SP-23456', telefone: '(11) 98765-4322', horario_trabalho: '09:00-18:00' },
    { email: 'roberto.silva@clinica.com', especialidade: 'Cirurgia Ocular', numero_ordem: 'CRM-SP-34567', telefone: '(11) 98765-4323', horario_trabalho: '08:00-16:00' },
    { email: 'mariana.costa@clinica.com', especialidade: 'Retina e Vítreo', numero_ordem: 'CRM-SP-45678', telefone: '(11) 98765-4324', horario_trabalho: '10:00-19:00' },
  ];

  const dbMedicos = [];
  for (const spec of medicosSpecs) {
    const userAssociated = dbMedicosUsers.find(u => u.email === spec.email);
    if (!userAssociated) continue;

    const med = await prisma.medicos.upsert({
      where: { user_id: userAssociated.id },
      update: {},
      create: {
        user_id: userAssociated.id,
        especialidade: spec.especialidade,
        numero_ordem: spec.numero_ordem,
        telefone: spec.telefone,
        horario_trabalho: spec.horario_trabalho,
      },
    });
    dbMedicos.push({ ...med, email: spec.email });
  }
  console.log('✅ Perfis dos Médicos processados');

  // ─── 3. PERFIS DOS PACIENTES ───
  console.log('-> Processando Perfis dos Pacientes...');
  const pacientesSpecs = [
    { email: 'joao.pereira@email.com', data_nascimento: '1985-03-15', sexo: 'M', telefone: '(11) 91234-5678', endereco: 'Rua das Flores, 123 - São Paulo, SP', historico_medico: 'Hipertensão controlada. Cirurgia de apendicite em 2010.' },
    { email: 'maria.santos@email.com', data_nascimento: '1990-07-22', sexo: 'F', telefone: '(11) 92345-6789', endereco: 'Av. Paulista, 1000 - São Paulo, SP', historico_medico: 'Asma leve. Alergia a penicilina.' },
    { email: 'pedro.oliveira@email.com', data_nascimento: '1978-11-05', sexo: 'M', telefone: '(11) 93456-7890', endereco: 'Rua Augusta, 456 - São Paulo, SP', historico_medico: 'Diabetes tipo 2. Retinopatia diabética em acompanhamento.' },
    { email: 'lucia.almeida@email.com', data_nascimento: '1995-01-30', sexo: 'F', telefone: '(11) 94567-8901', endereco: 'Rua Oscar Freire, 789 - São Paulo, SP', historico_medico: 'Miopia alta desde adolescência. Uso de lentes de contato.' },
    { email: 'fernando.lima@email.com', data_nascimento: '1960-09-12', sexo: 'M', telefone: '(11) 95678-9012', endereco: 'Av. Brigadeiro Faria Lima, 2000 - São Paulo, SP', historico_medico: 'Catarata diagnosticada. Glaucoma em tratamento.' },
    { email: 'carla.souza@email.com', data_nascimento: '1988-05-18', sexo: 'F', telefone: '(11) 96789-0123', endereco: 'Rua Haddock Lobo, 321 - São Paulo, SP', historico_medico: 'Cirurgia refrativa realizada em 2020. Acompanhamento anual.' },
    { email: 'ricardo.gomes@email.com', data_nascimento: '1972-12-03', sexo: 'M', telefone: '(11) 97890-1234', endereco: 'Av. Rebouças, 654 - São Paulo, SP', historico_medico: 'Degeneração macular relacionada à idade (DMI).' },
    { email: 'patricia.rocha@email.com', data_nascimento: '2000-08-25', sexo: 'F', telefone: '(11) 98901-2345', endereco: 'Rua da Consolação, 987 - São Paulo, SP', historico_medico: 'Estrabismo infantil corrigido. Acompanhamento oftalmológico regular.' },
  ];

  const dbPacientes = [];
  for (const spec of pacientesSpecs) {
    const userAssociated = dbPacientesUsers.find(u => u.email === spec.email);
    if (!userAssociated) continue;

    const pac = await prisma.pacientes.upsert({
      where: { user_id: userAssociated.id },
      update: {},
      create: {
        user_id: userAssociated.id,
        data_nascimento: new Date(spec.data_nascimento),
        sexo: spec.sexo,
        telefone: spec.telefone,
        endereco: spec.endereco,
        historico_medico: spec.historico_medico,
      },
    });
    dbPacientes.push({ ...pac, email: spec.email });
  }
  console.log('✅ Perfis dos Pacientes processados');

  // ─── 4. CONSULTAS ───
  console.log('-> Processando Consultas...');
  const hoje = new Date();
  const amanha = new Date(hoje); amanha.setDate(amanha.getDate() + 1);
  const ontem = new Date(hoje); ontem.setDate(ontem.getDate() - 1);
  const semanaPassada = new Date(hoje); semanaPassada.setDate(semanaPassada.getDate() - 7);
  const proximaSemana = new Date(hoje); proximaSemana.setDate(proximaSemana.getDate() + 7);

  // Mapeadores auxiliares nominais seguros para evitar cruzamento de IDs de relação
  const getPacId = (email: string) => {
    const p = dbPacientes.find(pac => pac.email === email);
    if (!p) throw new Error(`Paciente com email ${email} não encontrado no seed.`);
    return p.id;
  };

  const getMedId = (email: string) => {
    const m = dbMedicos.find(med => med.email === email);
    if (!m) throw new Error(`Médico com email ${email} não encontrado no seed.`);
    return m.id;
  };

  const consultasData = [
    { 
      paciente_id: getPacId('joao.pereira@email.com'), 
      medico_id: getMedId('carlos.mendes@clinica.com'), 
      data_hora: new Date(new Date(semanaPassada).setHours(9, 0, 0, 0)), 
      status: 'concluida', 
      observacoes: 'Paciente relata dores de cabeça frequentes.', 
      motivo: 'Exame de rotina e avaliação de dores de cabeça', 
      acuidade_visual: '20/20 OD, 20/25 OE', 
      pressao_intraocular: '14 mmHg OD, 15 mmHg OE', 
      diagnostico: 'Miopia leve. Recomendado uso de óculos para atividades de longa distância.', 
      plano_tratamento: 'Prescrição de óculos. Retorno em 6 meses.' 
    },
    { 
      paciente_id: getPacId('pedro.oliveira@email.com'), 
      medico_id: getMedId('mariana.costa@clinica.com'), 
      data_hora: new Date(new Date(semanaPassada).setHours(14, 0, 0, 0)), 
      status: 'concluida', 
      observacoes: 'Paciente diabético. Acompanhamento de retina.', 
      motivo: 'Acompanhamento de retinopatia diabética', 
      acuidade_visual: '20/40 OD, 20/30 OE', 
      pressao_intraocular: '16 mmHg OD, 16 mmHg OE', 
      diagnostico: 'Retinopatia diabética não proliferativa leve.', 
      plano_tratamento: 'Controle glicêmico rigoroso. Fotocoagulação laser programada. Retorno em 3 meses.' 
    },
    { 
      paciente_id: getPacId('fernando.lima@email.com'), 
      medico_id: getMedId('roberto.silva@clinica.com'), 
      data_hora: new Date(new Date(ontem).setHours(10, 30, 0, 0)), 
      status: 'concluida', 
      observacoes: 'Paciente idoso. Dificuldade de visão noturna.', 
      motivo: 'Avaliação para cirurgia de catarata', 
      acuidade_visual: '20/80 OD, 20/60 OE', 
      pressao_intraocular: '18 mmHg OD, 17 mmHg OE', 
      diagnostico: 'Catarata nuclear grau III bilateral. Glaucoma de ângulo aberto leve.', 
      plano_tratamento: 'Cirurgia de facoemulsificação + IOL programada para próximo mês. Continuar colírio de hipotensor.' 
    },
    { paciente_id: getPacId('maria.santos@email.com'), medico_id: getMedId('ana.ferreira@clinica.com'), data_hora: new Date(new Date(hoje).setHours(9, 0, 0, 0)), status: 'agendada', observacoes: 'Primeira consulta. Encaminhada pelo pediatra.', motivo: 'Avaliação oftalmológica pediátrica de rotina' },
    { paciente_id: getPacId('lucia.almeida@email.com'), medico_id: getMedId('carlos.mendes@clinica.com'), data_hora: new Date(new Date(hoje).setHours(11, 0, 0, 0)), status: 'em_andamento', observacoes: 'Paciente chegou 15 minutos atrasado.', motivo: 'Troca de receituário de lentes de contato' },
    { paciente_id: getPacId('ricardo.gomes@email.com'), medico_id: getMedId('mariana.costa@clinica.com'), data_hora: new Date(new Date(hoje).setHours(15, 0, 0, 0)), status: 'agendada', motivo: 'Injeção intravítrea de anti-VEGF', observacoes: '3ª injeção do protocolo.' },
    { paciente_id: getPacId('carla.souza@email.com'), medico_id: getMedId('carlos.mendes@clinica.com'), data_hora: new Date(new Date(amanha).setHours(10, 0, 0, 0)), status: 'agendada', motivo: 'Acompanhamento pós-cirurgia refrativa - 1 ano' },
    { paciente_id: getPacId('patricia.rocha@email.com'), medico_id: getMedId('ana.ferreira@clinica.com'), data_hora: new Date(new Date(amanha).setHours(14, 0, 0, 0)), status: 'agendada', observacoes: 'Acompanhamento de estrabismo corrigido.', motivo: 'Avaliação de motricidade ocular' },
    { paciente_id: getPacId('joao.pereira@email.com'), medico_id: getMedId('carlos.mendes@clinica.com'), data_hora: new Date(new Date(proximaSemana).setHours(9, 0, 0, 0)), status: 'agendada', motivo: 'Retorno de 6 meses - controle de miopia' },
    { paciente_id: getPacId('fernando.lima@email.com'), medico_id: getMedId('roberto.silva@clinica.com'), data_hora: new Date(new Date(proximaSemana).setHours(8, 0, 0, 0)), status: 'agendada', motivo: 'Cirurgia de catarata - OD', observacoes: 'Jejo de 8 horas. Trazer acompanhante.' },
  ];

  await prisma.consultas.deleteMany({});
  await prisma.consultas.createMany({ data: consultasData });
  console.log('✅ Consultas recriadas com segurança');

  // ─── 5. PRESCRIÇÕES ───
  console.log('-> Processando Prescrições...');
  const allConsultas = await prisma.consultas.findMany();

  const getConsultaId = (pacienteEmail: string) => {
    const targetPacId = getPacId(pacienteEmail);
    const cons = allConsultas.find(c => c.paciente_id === targetPacId && c.status === 'concluida');
    if (!cons) throw new Error(`Consulta concluída não encontrada para o paciente: ${pacienteEmail}`);
    return cons.id;
  };

  await prisma.prescricoes.deleteMany({});
  await prisma.prescricoes.createMany({
    data: [
      { consulta_id: getConsultaId('joao.pereira@email.com'), medicamento: 'Óculos de grau', dosagem: 'Uso contínuo para atividades de longa distância', instrucoes: 'Lente esférica -2.00D OD, -1.75D OE. Armação leve.', data_prescricao: new Date(semanaPassada) },
      { consulta_id: getConsultaId('pedro.oliveira@email.com'), medicamento: 'Colírio Hipotensor', dosagem: '1 gota em cada olho, 2x ao dia', instrucoes: 'Aplicar pela manhã e antes de dormir. Não suspender sem orientação médica.', data_prescricao: new Date(semanaPassada) },
      { consulta_id: getConsultaId('fernando.lima@email.com'), medicamento: 'Colírio anti-inflamatório (Diclofenaco)', dosagem: '1 gota em cada olho, 4x ao dia', instrucoes: 'Iniciar 2 dias antes da cirurgia. Suspender 1 dia antes do procedimento.', data_prescricao: new Date(ontem) },
      { consulta_id: getConsultaId('fernando.lima@email.com'), medicamento: 'Colírio antibiótico (Moxifloxacino)', dosagem: '1 gota em cada olho, 3x ao dia', instrucoes: 'Iniciar 1 dia antes da cirurgia. Continuar por 7 dias após o procedimento.', data_prescricao: new Date(ontem) },
    ],
  });
  console.log('✅ Prescrições recriadas');

  // ─── 6. NOTIFICAÇÕES ───
  console.log('-> Processando Notificações...');
  await prisma.notificacoes.deleteMany({});
  await prisma.notificacoes.createMany({
    data: [
      { paciente_id: getPacId('maria.santos@email.com'), mensagem: 'Sua consulta oftalmológica está agendada para amanhã às 09:00. Não esqueça de trazer seus óculos anteriores.', tipo_variavel: 'lembrete_consulta', status_envio: 'enviado', data_envio: new Date() },
      { paciente_id: getPacId('lucia.almeida@email.com'), mensagem: 'Lembrete: Sua consulta é hoje às 11:00. Chegue com 15 minutos de antecedência.', tipo_variavel: 'lembrete_consulta', status_envio: 'enviado', data_envio: new Date() },
      { paciente_id: getPacId('ricardo.gomes@email.com'), mensagem: 'Sua injeção intravítrea está agendada para hoje às 15:00. Evite atividades físicas intensas após o procedimento.', tipo_variavel: 'lembrete_consulta', status_envio: 'pendente' },
      { paciente_id: getPacId('carla.souza@email.com'), mensagem: 'Seu acompanhamento pós-cirúrgico está agendado para amanhã às 10:00.', tipo_variavel: 'lembrete_consulta', status_envio: 'pendente' },
      { paciente_id: getPacId('fernando.lima@email.com'), mensagem: 'Sua cirurgia de catarata está agendada para a próxima semana. Lembre-se do jejum de 8 horas.', tipo_variavel: 'lembrete_cirurgia', status_envio: 'pendente' },
      { paciente_id: getPacId('pedro.oliveira@email.com'), mensagem: 'Não esqueça de manter o controle glicêmico rigoroso antes da sua próxima consulta.', tipo_variavel: 'alerta_saude', status_envio: 'enviado', data_envio: new Date(ontem) },
    ],
  });
  console.log('✅ Notificações recriadas');

  // ─── 7. PROCESSOS DE INTERNAÇÃO ───
  console.log('-> Processando Internações...');
  const internacoesData = [
    { nr_processo: 'INT-2024-001', paciente_id: getPacId('pedro.oliveira@email.com'), data_entrada: new Date('2024-01-15'), data_reintegracao: new Date('2024-01-18'), causa: 'Cirurgia de vitrectomia por descolamento de retina. Paciente diabético com retinopatia proliferativa.' },
    { nr_processo: 'INT-2024-002', paciente_id: getPacId('fernando.lima@email.com'), data_entrada: new Date('2024-03-10'), data_reintegracao: new Date('2024-03-12'), causa: 'Cirurgia de catarata bilateral em sessão única. Implante de lente intraocular multifocal.' },
    { nr_processo: 'INT-2024-003', paciente_id: getPacId('ricardo.gomes@email.com'), data_entrada: new Date('2024-05-20'), data_reintegracao: null, causa: 'Tratamento de injeção intravítrea em série. Paciente em acompanhamento para DMI neovascular.' },
  ];

  for (const inter of internacoesData) {
    await prisma.processo_internacao.upsert({
      where: { nr_processo: inter.nr_processo },
      update: {},
      create: inter,
    });
  }
  console.log('✅ Processos de internação processados');

  console.log('\n🎉 Seed executado e concluído com sucesso total!');
}

main()
  .catch((e) => {
    console.error('❌ Erro crítico no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
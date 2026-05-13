-- CreateTable
CREATE TABLE "consultas" (
    "id" SERIAL NOT NULL,
    "paciente_id" INTEGER NOT NULL,
    "medico_id" INTEGER NOT NULL,
    "data_hora" TIMESTAMP(6) NOT NULL,
    "status" VARCHAR(20) DEFAULT 'agendada',
    "observacoes" TEXT,
    "motivo" TEXT,
    "acuidade_visual" VARCHAR(50),
    "pressao_intraocular" VARCHAR(50),
    "diagnostico" TEXT,
    "plano_tratamento" TEXT,

    CONSTRAINT "consultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medicos" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "especialidade" VARCHAR(100) NOT NULL,
    "numero_ordem" VARCHAR(50) NOT NULL,
    "telefone" VARCHAR(20),
    "horario_trabalho" VARCHAR(20),

    CONSTRAINT "medicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificacoes" (
    "id" SERIAL NOT NULL,
    "paciente_id" INTEGER NOT NULL,
    "mensagem" TEXT NOT NULL,
    "tipo_variavel" VARCHAR(50) DEFAULT 'lembrete_consulta',
    "data_envio" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "status_envio" VARCHAR(20) DEFAULT 'pendente',

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "data_nascimento" DATE NOT NULL,
    "sexo" CHAR(1),
    "telefone" VARCHAR(20),
    "endereco" TEXT NOT NULL,
    "historico_medico" TEXT,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prescricoes" (
    "id" SERIAL NOT NULL,
    "consulta_id" INTEGER NOT NULL,
    "medicamento" VARCHAR(100) NOT NULL,
    "dosagem" VARCHAR(100) NOT NULL,
    "instrucoes" TEXT,
    "data_prescricao" DATE DEFAULT CURRENT_DATE,

    CONSTRAINT "prescricoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processo_internacao" (
    "nr_processo" VARCHAR(20) NOT NULL,
    "paciente_id" INTEGER NOT NULL,
    "data_entrada" DATE NOT NULL,
    "data_reintegracao" DATE,
    "causa" TEXT NOT NULL,

    CONSTRAINT "processo_internacao_pkey" PRIMARY KEY ("nr_processo")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "ativo" BOOLEAN DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_consultas_medico_data" ON "consultas"("medico_id", "data_hora");

-- CreateIndex
CREATE INDEX "idx_consultas_paciente" ON "consultas"("paciente_id");

-- CreateIndex
CREATE INDEX "idx_consultas_status" ON "consultas"("status");

-- CreateIndex
CREATE UNIQUE INDEX "consultas_medico_id_data_hora_key" ON "consultas"("medico_id", "data_hora");

-- CreateIndex
CREATE UNIQUE INDEX "medicos_user_id_key" ON "medicos"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "medicos_numero_ordem_key" ON "medicos"("numero_ordem");

-- CreateIndex
CREATE INDEX "idx_notificacoes_paciente" ON "notificacoes"("paciente_id");

-- CreateIndex
CREATE UNIQUE INDEX "pacientes_user_id_key" ON "pacientes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_medico_id_fkey" FOREIGN KEY ("medico_id") REFERENCES "medicos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "consultas" ADD CONSTRAINT "consultas_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "medicos" ADD CONSTRAINT "medicos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pacientes" ADD CONSTRAINT "pacientes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "prescricoes" ADD CONSTRAINT "prescricoes_consulta_id_fkey" FOREIGN KEY ("consulta_id") REFERENCES "consultas"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "processo_internacao" ADD CONSTRAINT "processo_internacao_paciente_id_fkey" FOREIGN KEY ("paciente_id") REFERENCES "pacientes"("id") ON DELETE CASCADE ON UPDATE NO ACTION;


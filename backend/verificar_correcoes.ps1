#!/usr/bin/env pwsh
# ============================================
# SCRIPT DE VERIFICAÇÃO — 23 CORREÇÕES
# ============================================
# Execute na pasta backend: pwsh verificar_correcoes.ps1

param(
    [string]$Path = "."
)

$ErrorActionPreference = "SilentlyContinue"
$global:Pass = 0
$global:Fail = 0
$global:Warn = 0

function Write-Result($Num, $Desc, $Status, $Detail = "") {
    $icon = switch ($Status) {
        "PASS" { "✅"; $global:Pass++ }
        "FAIL" { "❌"; $global:Fail++ }
        "WARN" { "⚠️"; $global:Warn++ }
        default { "❓" }
    }
    Write-Host "$icon #$Num — $Desc" -NoNewline
    if ($Detail) { Write-Host " ($Detail)" -ForegroundColor Gray }
    else { Write-Host "" }
}

function Test-FileContains($File, $Pattern) {
    if (-not (Test-Path $File)) { return $false }
    return (Get-Content $File -Raw) -match $Pattern
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🔍 VERIFICAÇÃO DAS 23 CORREÇÕES" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# ──────────────────────────────────────────
# 🗑️ CÓDIGO MORTO
# ──────────────────────────────────────────
Write-Host "🗑️ CÓDIGO MORTO" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────"

# 1. AppService apagado
if (Test-Path "$Path/src/app.service.ts") {
    Write-Result 1 "AppService removido" "FAIL" "app.service.ts ainda existe"
} else {
    Write-Result 1 "AppService removido" "PASS"
}

# 2. app.controller.spec.ts atualizado
$spec = "$Path/src/app.controller.spec.ts"
if (Test-Path $spec) {
    $content = Get-Content $spec -Raw
    if ($content -match "PrismaService" -and $content -match "\`\$queryRaw") {
        Write-Result 2 "app.controller.spec.ts atualizado" "PASS"
    } else {
        Write-Result 2 "app.controller.spec.ts atualizado" "FAIL" "Não contém mock do PrismaService"
    }
} else {
    Write-Result 2 "app.controller.spec.ts atualizado" "FAIL" "Ficheiro não encontrado"
}

# 3. Dependências removidas
$pkg = "$Path/package.json"
if (Test-Path $pkg) {
    $pkgContent = Get-Content $pkg -Raw
    $hasJsonwebtoken = $pkgContent -match '"jsonwebtoken"'
    $hasSwaggerUi = $pkgContent -match '"swagger-ui-express"'
    if (-not $hasJsonwebtoken -and -not $hasSwaggerUi) {
        Write-Result 3 "Dependências removidas (jsonwebtoken, swagger-ui-express)" "PASS"
    } else {
        $rem = @()
        if ($hasJsonwebtoken) { $rem += "jsonwebtoken" }
        if ($hasSwaggerUi) { $rem += "swagger-ui-express" }
        Write-Result 3 "Dependências removidas" "FAIL" "Ainda presentes: $($rem -join ', ')"
    }
} else {
    Write-Result 3 "Dependências removidas" "WARN" "package.json não encontrado"
}

# 4. dotenv removido do main.ts
$main = "$Path/src/main.ts"
if (Test-Path $main) {
    $mainContent = Get-Content $main -Raw
    if ($mainContent -match "dotenv" -or $mainContent -match "dotenv\.config") {
        Write-Result 4 "dotenv removido do main.ts" "FAIL" "Ainda referencia dotenv"
    } else {
        Write-Result 4 "dotenv removido do main.ts" "PASS"
    }
} else {
    Write-Result 4 "dotenv removido do main.ts" "FAIL" "main.ts não encontrado"
}

Write-Host ""

# ──────────────────────────────────────────
# 🔤 STRINGS & CONSTANTES
# ──────────────────────────────────────────
Write-Host "🔤 STRINGS & CONSTANTES" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────"

# 5. Enum UserRole
$enums = "$Path/src/common/enums.ts"
if (Test-Path $enums) {
    $enumContent = Get-Content $enums -Raw
    $hasEnum = $enumContent -match "export enum UserRole"
    $hasAdmin = $enumContent -match "ADMIN\s*=\s*'admin'"
    $hasMedico = $enumContent -match "MEDICO\s*=\s*'medico'"
    $hasRecep = $enumContent -match "RECEPCIONISTA\s*=\s*'recepcionista'"
    $hasPac = $enumContent -match "PACIENTE\s*=\s*'paciente'"

    if ($hasEnum -and $hasAdmin -and $hasMedico -and $hasRecep -and $hasPac) {
        $controllers = Get-ChildItem "$Path/src" -Filter "*.controller.ts" -Recurse
        $usingEnum = 0
        foreach ($ctrl in $controllers) {
            $c = Get-Content $ctrl.FullName -Raw
            if ($c -match "UserRole\.") { $usingEnum++ }
        }
        if ($usingEnum -ge 5) {
            Write-Result 5 "Enum UserRole criado e usado" "PASS" "$usingEnum controllers usando"
        } else {
            Write-Result 5 "Enum UserRole criado e usado" "WARN" "Só $usingEnum controllers usam o enum (esperado 5+)"
        }
    } else {
        Write-Result 5 "Enum UserRole criado e usado" "FAIL" "Enum incompleto"
    }
} else {
    Write-Result 5 "Enum UserRole criado e usado" "FAIL" "enums.ts não encontrado"
}

Write-Host ""

# ──────────────────────────────────────────
# 🔒 SEGURANÇA SIMPLES
# ──────────────────────────────────────────
Write-Host "🔒 SEGURANÇA SIMPLES" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────"

# 6. ValidationPipe global
if (Test-Path $main) {
    $mainContent = Get-Content $main -Raw
    if ($mainContent -match "useGlobalPipes" -and 
        $mainContent -match "ValidationPipe" -and
        $mainContent -match "whitelist:\s*true" -and
        $mainContent -match "forbidNonWhitelisted:\s*true" -and
        $mainContent -match "transform:\s*true") {
        Write-Result 6 "ValidationPipe global" "PASS"
    } else {
        Write-Result 6 "ValidationPipe global" "FAIL" "Falta alguma opção (whitelist/forbidNonWhitelisted/transform)"
    }
} else {
    Write-Result 6 "ValidationPipe global" "FAIL" "main.ts não encontrado"
}

# 7. Comentário rate limit
$appModule = "$Path/src/app.module.ts"
if (Test-Path $appModule) {
    $appContent = Get-Content $appModule -Raw
    if ($appContent -match "100 pedidos") {
        Write-Result 7 "Comentário rate limit (100)" "PASS"
    } elseif ($appContent -match "10 pedidos") {
        Write-Result 7 "Comentário rate limit (100)" "FAIL" "Ainda diz '10 pedidos'"
    } else {
        Write-Result 7 "Comentário rate limit (100)" "WARN" "Comentário não encontrado"
    }
} else {
    Write-Result 7 "Comentário rate limit (100)" "FAIL" "app.module.ts não encontrado"
}

# 8. @MinLength(6) no CreatePacienteDto
$pacDto = "$Path/src/pacientes/dto/create-paciente.dto.ts"
if (Test-Path $pacDto) {
    $dtoContent = Get-Content $pacDto -Raw
    if ($dtoContent -match "@MinLength\(6\)" -and $dtoContent -match "password") {
        Write-Result 8 "@MinLength(6) no CreatePacienteDto" "PASS"
    } else {
        Write-Result 8 "@MinLength(6) no CreatePacienteDto" "FAIL" "Não encontrado"
    }
} else {
    Write-Result 8 "@MinLength(6) no CreatePacienteDto" "FAIL" "Ficheiro não encontrado"
}

# 9. Proteger rota /ping
$appCtrl = "$Path/src/app.controller.ts"
if (Test-Path $appCtrl) {
    $ctrlContent = Get-Content $appCtrl -Raw
    if ($ctrlContent -match "@Get\('ping'\)" -and 
        $ctrlContent -match "@UseGuards" -and
        $ctrlContent -match "@Roles") {
        Write-Result 9 "Rota /ping protegida" "PASS"
    } else {
        Write-Result 9 "Rota /ping protegida" "FAIL" "Falta @UseGuards ou @Roles"
    }
} else {
    Write-Result 9 "Rota /ping protegida" "FAIL" "app.controller.ts não encontrado"
}

# 10. CORS corrigido
if (Test-Path $main) {
    $mainContent = Get-Content $main -Raw
    if ($mainContent -match "enableCors\(" -and 
        $mainContent -match "origin:" -and
        $mainContent -match "FRONTEND_URL") {
        Write-Result 10 "CORS corrigido com FRONTEND_URL" "PASS"
    } else {
        Write-Result 10 "CORS corrigido com FRONTEND_URL" "FAIL" "enableCors() sem origin configurado"
    }
} else {
    Write-Result 10 "CORS corrigido com FRONTEND_URL" "FAIL"
}

# 11. FRONTEND_URL no .env
$envFile = "$Path/.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "FRONTEND_URL") {
        Write-Result 11 "FRONTEND_URL no .env" "PASS"
    } else {
        Write-Result 11 "FRONTEND_URL no .env" "FAIL" "Variável não encontrada"
    }
} else {
    Write-Result 11 "FRONTEND_URL no .env" "FAIL" ".env não encontrado"
}

Write-Host ""

# ──────────────────────────────────────────
# 🧱 ENCAPSULAMENTO & CLEAN CODE
# ──────────────────────────────────────────
Write-Host "🧱 ENCAPSULAMENTO & CLEAN CODE" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────"

# 12. Prisma privado no NotificacoesService + findByUserId
$notifSvc = "$Path/src/notificacoes/notificacoes.service.ts"
if (Test-Path $notifSvc) {
    $svcContent = Get-Content $notifSvc -Raw
    $isPrivate = $svcContent -match "constructor\(private prisma: PrismaService\)"
    $hasFindByUserId = $svcContent -match "async findByUserId"
    if ($isPrivate -and $hasFindByUserId) {
        Write-Result 12 "Prisma privado + findByUserId no NotificacoesService" "PASS"
    } elseif (-not $isPrivate) {
        Write-Result 12 "Prisma privado + findByUserId" "FAIL" "prisma ainda é public"
    } else {
        Write-Result 12 "Prisma privado + findByUserId" "FAIL" "findByUserId não encontrado"
    }
} else {
    Write-Result 12 "Prisma privado + findByUserId" "FAIL" "Ficheiro não encontrado"
}

# 13. UpdateUserDto com PartialType
$updateUser = "$Path/src/users/dto/update-user.dto.ts"
$updatePac = "$Path/src/pacientes/dto/update-paciente.dto.ts"
$updateMed = "$Path/src/medicos/dto/update-medico.dto.ts"
$partialCount = 0
foreach ($f in @($updateUser, $updatePac, $updateMed)) {
    if (Test-Path $f) {
        $c = Get-Content $f -Raw
        if ($c -match "PartialType" -and $c -match "OmitType") { $partialCount++ }
    }
}
if ($partialCount -eq 3) {
    Write-Result 13 "Update DTOs com PartialType" "PASS" "3/3 DTOs"
} else {
    Write-Result 13 "Update DTOs com PartialType" "FAIL" "$partialCount/3 DTOs"
}

# 14. RolesGuard verifica user
$rolesGuard = "$Path/src/auth/roles.guard.ts"
if (Test-Path $rolesGuard) {
    $guardContent = Get-Content $rolesGuard -Raw
    if ($guardContent -match "if \(!user\) return false") {
        Write-Result 14 "RolesGuard verifica se user existe" "PASS"
    } else {
        Write-Result 14 "RolesGuard verifica se user existe" "FAIL" "Falta 'if (!user) return false'"
    }
} else {
    Write-Result 14 "RolesGuard verifica se user existe" "FAIL" "Ficheiro não encontrado"
}

Write-Host ""

# ──────────────────────────────────────────
# ⚙️ LÓGICA & CONSISTÊNCIA
# ──────────────────────────────────────────
Write-Host "⚙️ LÓGICA & CONSISTÊNCIA" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────"

# 15. TasksService usa NotificacoesService
$tasksSvc = "$Path/src/tasks/tasks.service.ts"
$tasksMod = "$Path/src/tasks/tasks.module.ts"
if (Test-Path $tasksSvc -and Test-Path $tasksMod) {
    $tSvc = Get-Content $tasksSvc -Raw
    $tMod = Get-Content $tasksMod -Raw
    $usesNotif = $tSvc -match "notificacoesService"
    $importsNotif = $tMod -match "NotificacoesModule"
    if ($usesNotif -and $importsNotif) {
        Write-Result 15 "TasksService usa NotificacoesService" "PASS"
    } else {
        Write-Result 15 "TasksService usa NotificacoesService" "FAIL" "Falta import ou uso do serviço"
    }
} else {
    Write-Result 15 "TasksService usa NotificacoesService" "FAIL" "Ficheiros não encontrados"
}

# 16. PacientesService.remove() apaga user
$pacSvc = "$Path/src/pacientes/pacientes.service.ts"
if (Test-Path $pacSvc) {
    $pContent = Get-Content $pacSvc -Raw
    if ($pContent -match "users\.delete" -and $pContent -match "paciente\.user_id") {
        Write-Result 16 "PacientesService.remove() apaga user" "PASS"
    } else {
        Write-Result 16 "PacientesService.remove() apaga user" "FAIL" "Não apaga user associado"
    }
} else {
    Write-Result 16 "PacientesService.remove() apaga user" "FAIL"
}

# 17. Forgot-password não vaza email
$authSvc = "$Path/src/auth/auth.service.ts"
if (Test-Path $authSvc) {
    $aContent = Get-Content $authSvc -Raw
    $hasGeneric = $aContent -match "Se o email existir"
    $hasNotFound = $aContent -match "NotFoundException.*email" -or $aContent -match "NotFoundException.*utilizador"
    if ($hasGeneric -and -not $hasNotFound) {
        Write-Result 17 "Forgot-password não vaza existência" "PASS"
    } elseif ($hasNotFound) {
        Write-Result 17 "Forgot-password não vaza existência" "FAIL" "Ainda lança NotFoundException"
    } else {
        Write-Result 17 "Forgot-password não vaza existência" "WARN" "Mensagem genérica não encontrada"
    }
} else {
    Write-Result 17 "Forgot-password não vaza existência" "FAIL"
}

# 18. Internacoes.update() sem findOne duplo
$intSvc = "$Path/src/internacoes/internacoes.service.ts"
if (Test-Path $intSvc) {
    $iContent = Get-Content $intSvc -Raw
    $updateMatch = [regex]::Matches($iContent, "async update\(.*?\n\}").Value
    if ($updateMatch) {
        $findOneCount = ([regex]::Matches($updateMatch, "findOne")).Count
        if ($findOneCount -le 1) {
            Write-Result 18 "Internacoes.update() sem findOne duplo" "PASS" "$findOneCount chamada(s)"
        } else {
            Write-Result 18 "Internacoes.update() sem findOne duplo" "FAIL" "$findOneCount chamadas"
        }
    } else {
        Write-Result 18 "Internacoes.update() sem findOne duplo" "WARN" "Método update não encontrado"
    }
} else {
    Write-Result 18 "Internacoes.update() sem findOne duplo" "FAIL"
}

# 19. Paginação em internações
if (Test-Path $intSvc) {
    $iContent = Get-Content $intSvc -Raw
    $hasPagination = $iContent -match "skip:" -and $iContent -match "take:" -and $iContent -match "totalPages"
    if ($hasPagination) {
        Write-Result 19 "Paginação no findAll de internações" "PASS"
    } else {
        Write-Result 19 "Paginação no findAll de internações" "FAIL" "Falta skip/take/totalPages"
    }
} else {
    Write-Result 19 "Paginação no findAll de internações" "FAIL"
}

Write-Host ""

# ──────────────────────────────────────────
# 🔐 SEGURANÇA COMPLEXA
# ──────────────────────────────────────────
Write-Host "🔐 SEGURANÇA COMPLEXA" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────"

# 20. JWT_RESET_SECRET separado
$hasResetSecret = $false
$usesResetSecret = $false
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    $hasResetSecret = $envContent -match "JWT_RESET_SECRET"
}
if (Test-Path $authSvc) {
    $aContent = Get-Content $authSvc -Raw
    $usesResetSecret = $aContent -match "JWT_RESET_SECRET" -or $aContent -match "configService\.get.*reset"
}
if ($hasResetSecret -and $usesResetSecret) {
    Write-Result 20 "JWT_RESET_SECRET separado" "PASS"
} elseif (-not $hasResetSecret) {
    Write-Result 20 "JWT_RESET_SECRET separado" "FAIL" "Falta no .env"
} else {
    Write-Result 20 "JWT_RESET_SECRET separado" "FAIL" "Não usado no auth.service.ts"
}

Write-Host ""

# ──────────────────────────────────────────
# 🏗️ ARQUITECTURA
# ──────────────────────────────────────────
Write-Host "🏗️ ARQUITECTURA" -ForegroundColor Yellow
Write-Host "──────────────────────────────────────────"

# 21. Transações em médico/paciente
$medSvc = "$Path/src/medicos/medicos.service.ts"
$pacSvc2 = "$Path/src/pacientes/pacientes.service.ts"
$txCount = 0
foreach ($f in @($medSvc, $pacSvc2)) {
    if (Test-Path $f) {
        $c = Get-Content $f -Raw
        if ($c -match "\`\$transaction") { $txCount++ }
    }
}
if ($txCount -eq 2) {
    Write-Result 21 "Transações em médico/paciente" "PASS" "2/2 services"
} else {
    Write-Result 21 "Transações em médico/paciente" "FAIL" "$txCount/2 services"
}

# 22. Race condition nr_processo
if (Test-Path $intSvc) {
    $iContent = Get-Content $intSvc -Raw
    $createTx = $iContent -match "async create" -and $iContent -match "\`\$transaction" -and $iContent -match "nrProcesso"
    if ($createTx) {
        Write-Result 22 "Race condition nr_processo (transação)" "PASS"
    } else {
        Write-Result 22 "Race condition nr_processo (transação)" "FAIL" "create() não usa `$transaction"
    }
} else {
    Write-Result 22 "Race condition nr_processo (transação)" "FAIL"
}

# 23. Dados clínicos em colunas próprias
$schema = "$Path/prisma/schema.prisma"
$consultasSvc = "$Path/src/consultas/consultas.service.ts"
$relSvc = "$Path/src/relatorios/relatorios.service.ts"
$updateDto = "$Path/src/consultas/dto/update-consulta.dto.ts"

$schemaOk = $false
$codeOk = $false

if (Test-Path $schema) {
    $sContent = Get-Content $schema -Raw
    $hasMotivo = $sContent -match "motivo\s+String\?"
    $hasAcuidade = $sContent -match "acuidade_visual\s+String\?"
    $hasPressao = $sContent -match "pressao_intraocular\s+String\?"
    $hasDiagnostico = $sContent -match "diagnostico\s+String\?"
    $hasPlano = $sContent -match "plano_tratamento\s+String\?"
    if ($hasMotivo -and $hasAcuidade -and $hasPressao -and $hasDiagnostico -and $hasPlano) {
        $schemaOk = $true
    }
}

if (Test-Path $consultasSvc -and Test-Path $relSvc -and Test-Path $updateDto) {
    $cContent = Get-Content $consultasSvc -Raw
    $rContent = Get-Content $relSvc -Raw
    $dContent = Get-Content $updateDto -Raw

    $noJsonStringify = -not ($cContent -match "JSON\.stringify")
    $hasGroupBy = $rContent -match "groupBy.*diagnostico"
    $hasDtoFields = $dContent -match "motivo\?" -and $dContent -match "diagnostico\?"

    if ($noJsonStringify -and $hasGroupBy -and $hasDtoFields) {
        $codeOk = $true
    }
}

if ($schemaOk -and $codeOk) {
    Write-Result 23 "Dados clínicos em colunas próprias" "PASS"
} elseif (-not $schemaOk) {
    Write-Result 23 "Dados clínicos em colunas próprias" "FAIL" "Schema Prisma incompleto"
} else {
    Write-Result 23 "Dados clínicos em colunas próprias" "FAIL" "Código não atualizado"
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📊 RESUMO FINAL" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Passaram:  $global:Pass" -ForegroundColor Green
Write-Host "❌ Falharam:  $global:Fail" -ForegroundColor Red
Write-Host "⚠️  Avisos:    $global:Warn" -ForegroundColor Yellow
Write-Host ""

$total = $global:Pass + $global:Fail
if ($total -gt 0) {
    $pct = [math]::Round(($global:Pass / 23) * 100, 1)
    Write-Host "Progresso: $pct% ($global:Pass/23)" -ForegroundColor Cyan
}

if ($global:Fail -eq 0) {
    Write-Host "🎉 TODAS AS 23 CORREÇÕES VERIFICADAS COM SUCESSO!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Ainda há $($global:Fail) correção(ões) por fazer." -ForegroundColor Yellow
}
Write-Host "==========================================" -ForegroundColor Cyan

# Script de verificação simplificado
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🔍 VERIFICAÇÃO DAS 23 CORREÇÕES" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

$Pass = 0; $Fail = 0

function Check($Num, $Desc, $Condition) {
    if ($Condition) {
        Write-Host "✅ #$Num — $Desc" -ForegroundColor Green
        $script:Pass++
    } else {
        Write-Host "❌ #$Num — $Desc" -ForegroundColor Red
        $script:Fail++
    }
}

# 1. AppService removido
Check 1 "AppService removido" (-not (Test-Path "src/app.service.ts"))

# 2. app.controller.spec.ts
Check 2 "app.controller.spec.ts atualizado" ((Get-Content "src/app.controller.spec.ts" -Raw) -match "PrismaService")

# 3. Dependências removidas
$pkg = Get-Content "package.json" -Raw
Check 3 "Dependências removidas" (-not ($pkg -match '"jsonwebtoken"' -or $pkg -match '"swagger-ui-express"'))

# 4. dotenv removido
Check 4 "dotenv removido do main.ts" (-not ((Get-Content "src/main.ts" -Raw) -match "dotenv"))

# 5. Enum UserRole
Check 5 "Enum UserRole criado" (Test-Path "src/common/enums.ts")

# 6. ValidationPipe global
$main = Get-Content "src/main.ts" -Raw
Check 6 "ValidationPipe global" ($main -match "whitelist" -and $main -match "forbidNonWhitelisted" -and $main -match "transform")

# 7. Comentário rate limit
Check 7 "Comentário rate limit (100)" ((Get-Content "src/app.module.ts" -Raw) -match "100 pedidos")

# 8. @MinLength(6)
Check 8 "@MinLength(6) no CreatePacienteDto" ((Get-Content "src/pacientes/dto/create-paciente.dto.ts" -Raw) -match "@MinLength\(6\)")

# 9. Rota /ping protegida
Check 9 "Rota /ping protegida" ((Get-Content "src/app.controller.ts" -Raw) -match "@UseGuards" -and (Get-Content "src/app.controller.ts" -Raw) -match "@Roles")

# 10. CORS corrigido
Check 10 "CORS corrigido" ($main -match "FRONTEND_URL")

# 11. FRONTEND_URL no .env
Check 11 "FRONTEND_URL no .env" ((Get-Content ".env" -Raw) -match "FRONTEND_URL")

# 12. Prisma privado + findByUserId
Check 12 "Prisma privado + findByUserId" ((Get-Content "src/notificacoes/notificacoes.service.ts" -Raw) -match "private prisma" -and (Get-Content "src/notificacoes/notificacoes.service.ts" -Raw) -match "findByUserId")

# 13. PartialType nos DTOs
Check 13 "Update DTOs com PartialType" ((Get-Content "src/users/dto/update-user.dto.ts" -Raw) -match "PartialType")

# 14. RolesGuard verifica user
Check 14 "RolesGuard verifica user" ((Get-Content "src/auth/roles.guard.ts" -Raw) -match "if \(!user\) return false")

# 15. TasksService usa NotificacoesService
Check 15 "TasksService usa NotificacoesService" ((Get-Content "src/tasks/tasks.service.ts" -Raw) -match "notificacoesService")

# 16. PacientesService.remove() apaga user
Check 16 "PacientesService.remove() apaga user" ((Get-Content "src/pacientes/pacientes.service.ts" -Raw) -match "users.delete")

# 17. Forgot-password não vaza
Check 17 "Forgot-password não vaza email" ((Get-Content "src/auth/auth.service.ts" -Raw) -match "Se o email existir")

# 18. Internacoes.update() sem duplo findOne
Check 18 "Internacoes.update() sem duplo findOne" (-not ((Get-Content "src/internacoes/internacoes.service.ts" -Raw) -match "findOne.*findOne"))

# 19. Paginação internações
Check 19 "Paginação internações" ((Get-Content "src/internacoes/internacoes.service.ts" -Raw) -match "skip:")

# 20. JWT_RESET_SECRET
Check 20 "JWT_RESET_SECRET separado" ((Get-Content ".env" -Raw) -match "JWT_RESET_SECRET")

# 21. Transações médico/paciente
Check 21 "Transações médico/paciente" ((Get-Content "src/medicos/medicos.service.ts" -Raw) -match "\`$transaction" -and (Get-Content "src/pacientes/pacientes.service.ts" -Raw) -match "\`$transaction")

# 22. Race condition nr_processo
Check 22 "Race condition nr_processo" ((Get-Content "src/internacoes/internacoes.service.ts" -Raw) -match "\`$transaction" -and (Get-Content "src/internacoes/internacoes.service.ts" -Raw) -match "nrProcesso")

# 23. Dados clínicos em colunas
Check 23 "Dados clínicos em colunas" ((Get-Content "prisma/schema.prisma" -Raw) -match "motivo" -and (Get-Content "prisma/schema.prisma" -Raw) -match "diagnostico")

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📊 RESUMO: ✅ $Pass | ❌ $Fail" -ForegroundColor Cyan
$pct = [math]::Round(($Pass / 23) * 100, 1)
Write-Host "Progresso: $pct%" -ForegroundColor Cyan
if ($Fail -eq 0) { Write-Host "🎉 TODAS AS 23 CORREÇÕES OK!" -ForegroundColor Green }
Write-Host "==========================================" -ForegroundColor Cyan

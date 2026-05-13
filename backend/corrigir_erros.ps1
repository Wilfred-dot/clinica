#!/usr/bin/env pwsh
# ============================================
# SCRIPT DE CORREÇÃO — ERROS DE BUILD + FALHAS
# ============================================
# Execute na pasta backend: pwsh corrigir_erros.ps1

param(
    [string]$Path = "."
)

$ErrorActionPreference = "Continue"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🔧 CORREÇÃO DE ERROS DE BUILD + FALHAS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# ──────────────────────────────────────────
# 1. CORRIGIR IMPORTS DUPLICADOS E PATHS ERRADOS
# ──────────────────────────────────────────
Write-Host "📁 Corrigindo imports duplicados e paths..." -ForegroundColor Yellow

function Fix-Imports($FilePath, $WrongPath, $CorrectPath) {
    if (Test-Path $FilePath) {
        $lines = Get-Content $FilePath
        $newLines = @()
        $seen = @{}
        $changed = $false

        foreach ($line in $lines) {
            # Remove imports duplicados do UserRole
            if ($line -match "import \{ UserRole \} from '.*/common/enums';") {
                $key = "UserRole-" + ($line -replace ".*from '(.+)'.*", '$1')
                if ($seen.ContainsKey($key)) {
                    $changed = $true
                    continue
                }
                $seen[$key] = $true
            }
            # Remove imports duplicados do IsIn
            if ($line -match "import \{ IsIn \} from 'class-validator';") {
                $key = "IsIn-class-validator"
                if ($seen.ContainsKey($key)) {
                    $changed = $true
                    continue
                }
                $seen[$key] = $true
            }
            # Corrige path errado
            if ($WrongPath -and $line -match [regex]::Escape($WrongPath)) {
                $line = $line -replace [regex]::Escape($WrongPath), $CorrectPath
                $changed = $true
            }
            $newLines += $line
        }

        if ($changed) {
            Set-Content -Path $FilePath -Value ($newLines -join "`n") -Encoding UTF8
            Write-Host "  ✅ Corrigido: $FilePath" -ForegroundColor Green
        } else {
            Write-Host "  ⏭️  Sem alterações: $FilePath" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ⚠️  Não encontrado: $FilePath" -ForegroundColor Yellow
    }
}

Fix-Imports "$Path/src/consultas/consultas.service.ts" "from './common/enums'" "from '../common/enums'"
Fix-Imports "$Path/src/dashboard/dashboard.controller.ts" "from './common/enums'" "from '../common/enums'"
Fix-Imports "$Path/src/dashboard/dashboard.service.ts" "from './common/enums'" "from '../common/enums'"
Fix-Imports "$Path/src/internacoes/internacoes.service.ts" "from './common/enums'" "from '../common/enums'"
Fix-Imports "$Path/src/notificacoes/notificacoes.service.ts" "from './common/enums'" "from '../common/enums'"
Fix-Imports "$Path/src/prescricoes/prescricoes.service.ts" "from './common/enums'" "from '../common/enums'"
Fix-Imports "$Path/src/notificacoes/dto/create-notificacao.dto.ts" $null $null
Fix-Imports "$Path/src/notificacoes/dto/update-notificacao.dto.ts" $null $null
Fix-Imports "$Path/src/pacientes/dto/create-paciente.dto.ts" $null $null
Fix-Imports "$Path/src/users/dto/create-user.dto.ts" $null $null

Write-Host ""

# ──────────────────────────────────────────
# 2. CORRIGIR UpdatePacienteDto (email omitido)
# ──────────────────────────────────────────
Write-Host "📁 Corrigindo pacientes.service.ts (email omitido no DTO)..." -ForegroundColor Yellow

$pacSvc = "$Path/src/pacientes/pacientes.service.ts"
if (Test-Path $pacSvc) {
    $content = Get-Content $pacSvc -Raw
    $newContent = $content -replace "(?s)if \(dto\.email && paciente\.users\) \{\s*await this\.prisma\.users\.update\(\{ where: \{ id: paciente\.user_id \}, data: \{ email: dto\.email \} \}\);\s*\}\s*", ""
    if ($newContent -ne $content) {
        Set-Content -Path $pacSvc -Value $newContent -Encoding UTF8
        Write-Host "  ✅ Removido dto.email do update" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️  Nenhuma alteração necessária" -ForegroundColor Gray
    }
} else {
    Write-Host "  ⚠️  Não encontrado: $pacSvc" -ForegroundColor Yellow
}

Write-Host ""

# ──────────────────────────────────────────
# 3. CORRIGIR app.controller.spec.ts
# ──────────────────────────────────────────
Write-Host "📁 Criando app.controller.spec.ts..." -ForegroundColor Yellow

$specContent = @"
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { PrismaService } from './prisma/prisma.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: PrismaService, useValue: { `$queryRaw: jest.fn().mockResolvedValue([]) } }],
    }).compile();
    appController = app.get<AppController>(AppController);
  });

  it('ping returns ok', async () => {
    const result = await appController.ping();
    expect(result.status).toBe('ok');
  });
});
"@

Set-Content -Path "$Path/src/app.controller.spec.ts" -Value $specContent -Encoding UTF8
Write-Host "  ✅ app.controller.spec.ts criado" -ForegroundColor Green

Write-Host ""

# ──────────────────────────────────────────
# 4. CORRIGIR auth.service.ts (forgotPassword)
# ──────────────────────────────────────────
Write-Host "📁 Corrigindo auth.service.ts (forgotPassword)..." -ForegroundColor Yellow

$authSvc = "$Path/src/auth/auth.service.ts"
if (Test-Path $authSvc) {
    $content = Get-Content $authSvc -Raw
    if ($content -match "NotFoundException" -and $content -match "forgotPassword") {
        $oldMethod = [regex]::Match($content, "async forgotPassword\(email: string\).*?return \{ message:.*?\};\s*\}").Value
        if ($oldMethod) {
            $newMethod = @"
  async forgotPassword(email: string) {
    const user = await this.prisma.users.findUnique({ where: { email } });
    if (user) {
      const token = this.jwtService.sign(
        { sub: user.id, purpose: 'reset' },
        {
          secret: this.configService.get('JWT_RESET_SECRET'),
          expiresIn: '15m',
        }
      );
      const resetLink = `\`\${process.env.FRONTEND_URL}/reset-password?token=\`\${token}`;
      console.log(`Link de reset para \`\${email}: \`\${resetLink}`);
    }
    return { message: 'Se o email existir, receberá um link de recuperação.' };
  }
"@
            $newContent = $content -replace [regex]::Escape($oldMethod), $newMethod
            Set-Content -Path $authSvc -Value $newContent -Encoding UTF8
            Write-Host "  ✅ forgotPassword corrigido" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Método não encontrado" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⏭️  Nenhuma alteração necessária" -ForegroundColor Gray
    }
} else {
    Write-Host "  ⚠️  Não encontrado: $authSvc" -ForegroundColor Yellow
}

Write-Host ""

# ──────────────────────────────────────────
# 5. VERIFICAR TRANSAÇÕES
# ──────────────────────────────────────────
Write-Host "📁 Verificando transações..." -ForegroundColor Yellow

$files = @(
    @("$Path/src/medicos/medicos.service.ts", "MedicosService"),
    @("$Path/src/pacientes/pacientes.service.ts", "PacientesService"),
    @("$Path/src/internacoes/internacoes.service.ts", "InternacoesService")
)

foreach ($pair in $files) {
    $file = $pair[0]
    $name = $pair[1]
    if (Test-Path $file) {
        $c = Get-Content $file -Raw
        if ($c -match "\`\$transaction") {
            Write-Host "  ✅ $name já tem transação" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $name NÃO tem transação" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠️  Não encontrado: $file" -ForegroundColor Yellow
    }
}

Write-Host ""

# ──────────────────────────────────────────
# 6. VERIFICAR DADOS CLÍNICOS
# ──────────────────────────────────────────
Write-Host "📁 Verificando dados clínicos..." -ForegroundColor Yellow

$consSvc = "$Path/src/consultas/consultas.service.ts"
if (Test-Path $consSvc) {
    $c = Get-Content $consSvc -Raw
    if ($c -match "JSON\.stringify") {
        Write-Host "  ❌ consultas.service.ts ainda usa JSON.stringify" -ForegroundColor Red
    } else {
        Write-Host "  ✅ consultas.service.ts sem JSON.stringify" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  Não encontrado: $consSvc" -ForegroundColor Yellow
}

$relSvc = "$Path/src/relatorios/relatorios.service.ts"
if (Test-Path $relSvc) {
    $c = Get-Content $relSvc -Raw
    if ($c -match "groupBy.*diagnostico") {
        Write-Host "  ✅ relatorios.service.ts usa groupBy" -ForegroundColor Green
    } else {
        Write-Host "  ❌ relatorios.service.ts NÃO usa groupBy" -ForegroundColor Red
    }
} else {
    Write-Host "  ⚠️  Não encontrado: $relSvc" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ CORREÇÕES APLICADAS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Agora corre o build:" -ForegroundColor Yellow
Write-Host "  docker-compose exec app npm run build" -ForegroundColor White
Write-Host ""
Write-Host "E depois o script de verificação:" -ForegroundColor Yellow
Write-Host "  pwsh verificar_correcoes.ps1" -ForegroundColor White

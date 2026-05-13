#!/bin/bash
# ============================================
# SCRIPT DE VERIFICAÇÃO - UserRole Enum
# ============================================

cd ~/Desktop/Clinica/backend 2>/dev/null || cd backend 2>/dev/null || { echo "❌ Pasta backend não encontrada"; exit 1; }

echo "=========================================="
echo "🔍 VERIFICAÇÃO COMPLETA DO ENUM UserRole"
echo "=========================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# ============================================
# 1. VERIFICAR SE O ENUM EXISTE
# ============================================
echo "📋 1. Ficheiro src/common/enums.ts"
if [ -f "src/common/enums.ts" ]; then
    if grep -q "export enum UserRole" src/common/enums.ts; then
        echo -e "${GREEN}   ✅ Enum UserRole encontrado${NC}"
        grep -A 5 "export enum UserRole" src/common/enums.ts | sed 's/^/      /'
    else
        echo -e "${RED}   ❌ Enum UserRole NÃO encontrado no ficheiro${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}   ❌ Ficheiro src/common/enums.ts NÃO EXISTE${NC}"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# ============================================
# 2. VERIFICAR CONTROLLERS - @Roles()
# ============================================
echo "📋 2. Controllers - @Roles() decorator"

CONTROLLERS=$(find src -name "*.controller.ts" -not -path "*/node_modules/*")
for file in $CONTROLLERS; do
    # Procura @Roles com strings literais (excluindo UserRole.)
    STRINGS=$(grep -n "@Roles(" "$file" 2>/dev/null | grep -v "UserRole\." | grep -E "('admin'|'medico'|'recepcionista'|'paciente')" || true)

    if [ -n "$STRINGS" ]; then
        echo -e "${RED}   ❌ $file${NC}"
        echo "$STRINGS" | sed 's/^/      /'
        ERRORS=$((ERRORS + 1))
    else
        # Verifica se tem @Roles com UserRole (bom sinal)
        if grep -q "@Roles(UserRole\." "$file" 2>/dev/null; then
            echo -e "${GREEN}   ✅ $file${NC}"
        fi
    fi
done
echo ""

# ============================================
# 3. VERIFICAR SERVICES - comparações e arrays
# ============================================
echo "📋 3. Services - comparações de role"

SERVICES=$(find src -name "*.service.ts" -not -path "*/node_modules/*")
for file in $SERVICES; do
    # Procura strings literais em comparações ===, !==, .includes(), arrays
    STRINGS=$(grep -nE "(===|!==|\.includes\() *['\"](admin|medico|recepcionista|paciente)['\"]|(\[['\"](admin|medico|recepcionista|paciente)['\"])" "$file" 2>/dev/null || true)

    if [ -n "$STRINGS" ]; then
        echo -e "${RED}   ❌ $file${NC}"
        echo "$STRINGS" | sed 's/^/      /'
        ERRORS=$((ERRORS + 1))
    else
        # Verifica se usa UserRole (opcional, pode não ter roles)
        if grep -q "UserRole" "$file" 2>/dev/null; then
            echo -e "${GREEN}   ✅ $file (usa UserRole)${NC}"
        fi
    fi
done
echo ""

# ============================================
# 4. VERIFICAR DTOs - @IsIn e tipos
# ============================================
echo "📋 4. DTOs - @IsIn e tipos de role"

DTOS=$(find src -name "*.dto.ts" -not -path "*/node_modules/*")
for file in $DTOS; do
    HAS_ISSUE=0

    # Verifica @IsIn com array de strings literais
    if grep -q "@IsIn(\['admin'" "$file" 2>/dev/null || \
       grep -q "@IsIn(\['medico'" "$file" 2>/dev/null || \
       grep -q "@IsIn(\['recepcionista'" "$file" 2>/dev/null || \
       grep -q "@IsIn(\['paciente'" "$file" 2>/dev/null; then
        echo -e "${RED}   ❌ $file - @IsIn com strings literais${NC}"
        grep -n "@IsIn" "$file" | sed 's/^/      /'
        HAS_ISSUE=1
        ERRORS=$((ERRORS + 1))
    fi

    # Verifica se role: string ainda existe (deveria ser role: UserRole)
    if grep -q "role: string" "$file" 2>/dev/null; then
        echo -e "${YELLOW}   ⚠️  $file - 'role: string' encontrado (deveria ser 'role: UserRole')${NC}"
        grep -n "role: string" "$file" | sed 's/^/      /'
        WARNINGS=$((WARNINGS + 1))
    fi

    # Verifica se tem @IsIn(Object.values(UserRole)) (padrão correto)
    if [ $HAS_ISSUE -eq 0 ] && grep -q "Object.values(UserRole)" "$file" 2>/dev/null; then
        echo -e "${GREEN}   ✅ $file${NC}"
    fi
done
echo ""

# ============================================
# 5. VERIFICAR DECORATORS/GUARDS
# ============================================
echo "📋 5. Decorators e Guards"

# Roles decorator
if [ -f "src/auth/roles.decorator.ts" ]; then
    if grep -q "roles: UserRole\[\]" src/auth/roles.decorator.ts 2>/dev/null; then
        echo -e "${GREEN}   ✅ roles.decorator.ts (UserRole[])${NC}"
    elif grep -q "roles: string\[\]" src/auth/roles.decorator.ts 2>/dev/null; then
        echo -e "${RED}   ❌ roles.decorator.ts - ainda usa string[]${NC}"
        ERRORS=$((ERRORS + 1))
    fi
fi

# Roles guard
if [ -f "src/auth/roles.guard.ts" ]; then
    if grep -q "UserRole\[\]" src/auth/roles.guard.ts 2>/dev/null; then
        echo -e "${GREEN}   ✅ roles.guard.ts (UserRole[])${NC}"
    elif grep -q "string\[\]" src/auth/roles.guard.ts 2>/dev/null; then
        echo -e "${RED}   ❌ roles.guard.ts - ainda usa string[]${NC}"
        ERRORS=$((ERRORS + 1))
    fi
fi
echo ""

# ============================================
# 6. VERIFICAÇÃO GERAL - grep final
# ============================================
echo "📋 6. Verificação geral (grep por strings literais)"

# Ignora: enums.ts, comentários, @Get/@Post/@Put/@Delete/@Patch (nomes de rotas)
REMAINING=$(grep -rn "'admin'\|'medico'\|'recepcionista'\|'paciente'" src/ --include='*.ts' 2>/dev/null | \
    grep -v "common/enums.ts" | \
    grep -v "^\s*//" | \
    grep -v "/\*" | \
    grep -v "@Get(" | \
    grep -v "@Post(" | \
    grep -v "@Put(" | \
    grep -v "@Delete(" | \
    grep -v "@Patch(" | \
    grep -v "ForbiddenException(" || true)

if [ -n "$REMAINING" ]; then
    echo -e "${RED}   ❌ Strings literais encontradas:${NC}"
    echo "$REMAINING" | sed 's/^/      /'
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}   ✅ Nenhuma string literal de role restante${NC}"
fi
echo ""

# ============================================
# RESUMO FINAL
# ============================================
echo "=========================================="
echo "📊 RESUMO"
echo "=========================================="
echo -e "   Erros (a corrigir): ${RED}$ERRORS${NC}"
echo -e "   Avisos (verificar): ${YELLOW}$WARNINGS${NC}"

if [ $ERRORS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 TUDO OK! O enum UserRole está corretamente aplicado em todo o projeto.${NC}"
    echo ""

    # CORREÇÃO: Usar grep -rl em vez de find -exec (compatível com Git Bash/MINGW)
    CTRL_COUNT=$(grep -rl "UserRole" src/auth/*.controller.ts src/users/*.controller.ts src/medicos/*.controller.ts src/pacientes/*.controller.ts src/consultas/*.controller.ts src/prescricoes/*.controller.ts src/notificacoes/*.controller.ts src/relatorios/*.controller.ts src/internacoes/*.controller.ts src/dashboard/*.controller.ts src/app.controller.ts 2>/dev/null | wc -l)
    SVC_COUNT=$(grep -rl "UserRole" src/auth/*.service.ts src/users/*.service.ts src/medicos/*.service.ts src/pacientes/*.service.ts src/consultas/*.service.ts src/prescricoes/*.service.ts src/notificacoes/*.service.ts src/relatorios/*.service.ts src/internacoes/*.service.ts src/dashboard/*.service.ts 2>/dev/null | wc -l)
    DTO_COUNT=$(grep -rl "UserRole" src/auth/dto/*.dto.ts src/users/dto/*.dto.ts src/medicos/dto/*.dto.ts src/pacientes/dto/*.dto.ts src/consultas/dto/*.dto.ts src/prescricoes/dto/*.dto.ts src/notificacoes/dto/*.dto.ts src/internacoes/dto/*.dto.ts 2>/dev/null | wc -l)

    echo "   Estatísticas:"
    echo "   • Controllers com UserRole: $CTRL_COUNT"
    echo "   • Services com UserRole: $SVC_COUNT"
    echo "   • DTOs com UserRole: $DTO_COUNT"
else
    echo ""
    echo -e "${RED}⚠️  FALTAM $ERRORS CORREÇÕES${NC}"
    echo "   Corre os erros acima e volta a correr este script."
fi
echo "=========================================="

#!/bin/bash
# ============================================
# SCRIPT CORRIGIDO - MIGRAÇÃO UserRole ENUM
# ============================================

cd backend 2>/dev/null || true

# 1. CRIAR ENUM CENTRALIZADO
mkdir -p src/common

cat > src/common/enums.ts << 'EOF'
export enum UserRole {
  ADMIN = 'admin',
  MEDICO = 'medico',
  RECEPCIONISTA = 'recepcionista',
  PACIENTE = 'paciente',
}
EOF

# 2. FUNÇÃO AUXILIAR: Adicionar import do UserRole
add_import() {
    local file="$1"
    if [ ! -f "$file" ]; then return; fi
    if grep -q "import { UserRole } from" "$file"; then return; fi

    # Detecta profundidade para path correto
    local depth=$(echo "$file" | tr '/' '\n' | grep -c "src")
    local path=""

    case "$depth" in
        3) path="../../common/enums" ;;
        2) path="../common/enums" ;;
        *) path="./common/enums" ;;
    esac

    sed -i "1i import { UserRole } from '${path}';" "$file"
}

# 3. FUNÇÃO AUXILIAR: Substituir strings de role por enum
replace_roles() {
    local file="$1"
    if [ ! -f "$file" ]; then return; fi

    # Adiciona import primeiro
    add_import "$file"

    # === CONTROLLERS: @Roles() ===
    # Múltiplos roles em uma linha
    sed -i "s/@Roles('admin', 'medico')/@Roles(UserRole.ADMIN, UserRole.MEDICO)/g" "$file"
    sed -i "s/@Roles('admin', 'recepcionista')/@Roles(UserRole.ADMIN, UserRole.RECEPCIONISTA)/g" "$file"
    sed -i "s/@Roles('admin', 'paciente')/@Roles(UserRole.ADMIN, UserRole.PACIENTE)/g" "$file"
    sed -i "s/@Roles('medico', 'recepcionista')/@Roles(UserRole.MEDICO, UserRole.RECEPCIONISTA)/g" "$file"
    sed -i "s/@Roles('medico', 'paciente')/@Roles(UserRole.MEDICO, UserRole.PACIENTE)/g" "$file"
    sed -i "s/@Roles('recepcionista', 'paciente')/@Roles(UserRole.RECEPCIONISTA, UserRole.PACIENTE)/g" "$file"
    sed -i "s/@Roles('admin', 'medico', 'recepcionista')/@Roles(UserRole.ADMIN, UserRole.MEDICO, UserRole.RECEPCIONISTA)/g" "$file"
    sed -i "s/@Roles('admin', 'medico', 'paciente')/@Roles(UserRole.ADMIN, UserRole.MEDICO, UserRole.PACIENTE)/g" "$file"
    sed -i "s/@Roles('admin', 'recepcionista', 'paciente')/@Roles(UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.PACIENTE)/g" "$file"
    sed -i "s/@Roles('medico', 'recepcionista', 'paciente')/@Roles(UserRole.MEDICO, UserRole.RECEPCIONISTA, UserRole.PACIENTE)/g" "$file"
    sed -i "s/@Roles('admin', 'medico', 'recepcionista', 'paciente')/@Roles(UserRole.ADMIN, UserRole.MEDICO, UserRole.RECEPCIONISTA, UserRole.PACIENTE)/g" "$file"

    # Roles individuais
    sed -i "s/@Roles('admin')/@Roles(UserRole.ADMIN)/g" "$file"
    sed -i "s/@Roles('medico')/@Roles(UserRole.MEDICO)/g" "$file"
    sed -i "s/@Roles('recepcionista')/@Roles(UserRole.RECEPCIONISTA)/g" "$file"
    sed -i "s/@Roles('paciente')/@Roles(UserRole.PACIENTE)/g" "$file"

    # === SERVICES: comparações e arrays ===
    # Comparações === 'role'
    sed -i "s/=== 'admin'/=== UserRole.ADMIN/g" "$file"
    sed -i "s/=== 'medico'/=== UserRole.MEDICO/g" "$file"
    sed -i "s/=== 'recepcionista'/=== UserRole.RECEPCIONISTA/g" "$file"
    sed -i "s/=== 'paciente'/=== UserRole.PACIENTE/g" "$file"

    # Comparações !== 'role'
    sed -i "s/!== 'admin'/!== UserRole.ADMIN/g" "$file"
    sed -i "s/!== 'medico'/!== UserRole.MEDICO/g" "$file"
    sed -i "s/!== 'recepcionista'/!== UserRole.RECEPCIONISTA/g" "$file"
    sed -i "s/!== 'paciente'/!== UserRole.PACIENTE/g" "$file"

    # Arrays de roles
    sed -i "s/\['admin'\]/[UserRole.ADMIN]/g" "$file"
    sed -i "s/\['medico'\]/[UserRole.MEDICO]/g" "$file"
    sed -i "s/\['recepcionista'\]/[UserRole.RECEPCIONISTA]/g" "$file"
    sed -i "s/\['paciente'\]/[UserRole.PACIENTE]/g" "$file"

    # Arrays com múltiplos roles
    sed -i "s/\['admin', 'medico'\]/[UserRole.ADMIN, UserRole.MEDICO]/g" "$file"
    sed -i "s/\['admin', 'recepcionista'\]/[UserRole.ADMIN, UserRole.RECEPCIONISTA]/g" "$file"
    sed -i "s/\['admin', 'paciente'\]/[UserRole.ADMIN, UserRole.PACIENTE]/g" "$file"
    sed -i "s/\['medico', 'recepcionista'\]/[UserRole.MEDICO, UserRole.RECEPCIONISTA]/g" "$file"
    sed -i "s/\['medico', 'paciente'\]/[UserRole.MEDICO, UserRole.PACIENTE]/g" "$file"
    sed -i "s/\['recepcionista', 'paciente'\]/[UserRole.RECEPCIONISTA, UserRole.PACIENTE]/g" "$file"
    sed -i "s/\['admin', 'medico', 'recepcionista'\]/[UserRole.ADMIN, UserRole.MEDICO, UserRole.RECEPCIONISTA]/g" "$file"
    sed -i "s/\['admin', 'medico', 'paciente'\]/[UserRole.ADMIN, UserRole.MEDICO, UserRole.PACIENTE]/g" "$file"
    sed -i "s/\['admin', 'recepcionista', 'paciente'\]/[UserRole.ADMIN, UserRole.RECEPCIONISTA, UserRole.PACIENTE]/g" "$file"
    sed -i "s/\['medico', 'recepcionista', 'paciente'\]/[UserRole.MEDICO, UserRole.RECEPCIONISTA, UserRole.PACIENTE]/g" "$file"
    sed -i "s/\['admin', 'medico', 'recepcionista', 'paciente'\]/[UserRole.ADMIN, UserRole.MEDICO, UserRole.RECEPCIONISTA, UserRole.PACIENTE]/g" "$file"

    # Atribuições role: 'string'
    sed -i "s/role: 'admin'/role: UserRole.ADMIN/g" "$file"
    sed -i "s/role: 'medico'/role: UserRole.MEDICO/g" "$file"
    sed -i "s/role: 'recepcionista'/role: UserRole.RECEPCIONISTA/g" "$file"
    sed -i "s/role: 'paciente'/role: UserRole.PACIENTE/g" "$file"

    # .includes('role')
    sed -i "s/\.includes('admin')/.includes(UserRole.ADMIN)/g" "$file"
    sed -i "s/\.includes('medico')/.includes(UserRole.MEDICO)/g" "$file"
    sed -i "s/\.includes('recepcionista')/.includes(UserRole.RECEPCIONISTA)/g" "$file"
    sed -i "s/\.includes('paciente')/.includes(UserRole.PACIENTE)/g" "$file"
}

# 4. PROCESSAR TODOS OS CONTROLLERS
CONTROLLERS=(
  src/auth/auth.controller.ts
  src/users/users.controller.ts
  src/medicos/medicos.controller.ts
  src/pacientes/pacientes.controller.ts
  src/consultas/consultas.controller.ts
  src/prescricoes/prescricoes.controller.ts
  src/notificacoes/notificacoes.controller.ts
  src/relatorios/relatorios.controller.ts
  src/internacoes/internacoes.controller.ts
  src/dashboard/dashboard.controller.ts
  src/app.controller.ts
)

echo "=== Processando Controllers ==="
for ctrl in "${CONTROLLERS[@]}"; do
    if [ -f "$ctrl" ]; then
        echo "  → $ctrl"
        replace_roles "$ctrl"
    else
        echo "  ⚠ Não encontrado: $ctrl"
    fi
done

# 5. PROCESSAR TODOS OS SERVICES
SERVICES=(
  src/auth/auth.service.ts
  src/users/users.service.ts
  src/medicos/medicos.service.ts
  src/pacientes/pacientes.service.ts
  src/consultas/consultas.service.ts
  src/prescricoes/prescricoes.service.ts
  src/notificacoes/notificacoes.service.ts
  src/relatorios/relatorios.service.ts
  src/internacoes/internacoes.service.ts
  src/dashboard/dashboard.service.ts
)

echo ""
echo "=== Processando Services ==="
for svc in "${SERVICES[@]}"; do
    if [ -f "$svc" ]; then
        echo "  → $svc"
        replace_roles "$svc"
    else
        echo "  ⚠ Não encontrado: $svc"
    fi
done

# 6. PROCESSAR DECORATORS E GUARDS
echo ""
echo "=== Processando Decorators/Guards ==="
GUARDS=(
  src/auth/roles.decorator.ts
  src/auth/roles.guard.ts
  src/auth/jwt.strategy.ts
)

for g in "${GUARDS[@]}"; do
    if [ -f "$g" ]; then
        echo "  → $g"
        add_import "$g"
        sed -i 's/roles: string\[\]/roles: UserRole[]/g' "$g"
        sed -i 's/string\[\]/UserRole[]/g' "$g"
    fi
done

# 7. PROCESSAR TODOS OS DTOs
echo ""
echo "=== Processando DTOs ==="
find src -name "*.dto.ts" | while read -r dto; do
    echo "  → $dto"

    # Adiciona imports necessários
    if ! grep -q "import { UserRole } from" "$dto"; then
        depth=$(echo "$dto" | tr '/' '\n' | grep -c "src")
        path=""
        case "$depth" in
            3) path="../../common/enums" ;;
            2) path="../common/enums" ;;
            *) path="./common/enums" ;;
        esac
        sed -i "1i import { UserRole } from '${path}';" "$dto"
    fi

    if ! grep -q "import { IsIn } from 'class-validator'" "$dto"; then
        sed -i "1i import { IsIn } from 'class-validator';" "$dto"
    fi

    # Substitui @IsIn com array de strings por Object.values(UserRole)
    sed -i "s/@IsIn(\['admin', 'medico', 'recepcionista', 'paciente'\])/@IsIn(Object.values(UserRole))/g" "$dto"
    sed -i "s/@IsIn(\['admin', 'medico', 'recepcionista'\])/@IsIn(Object.values(UserRole))/g" "$dto"
    sed -i "s/@IsIn(\['admin', 'medico'\])/@IsIn(Object.values(UserRole))/g" "$dto"
    sed -i "s/@IsIn(\['admin'\])/@IsIn(Object.values(UserRole))/g" "$dto"

    # Substitui tipos
    sed -i 's/role: string;/@IsIn(Object.values(UserRole))\n  role: UserRole;/g' "$dto"
    sed -i 's/roles: string\[\];/roles: UserRole[];/g' "$dto"
    sed -i 's/role: string\[\];/role: UserRole[];/g' "$dto"
done

# 8. LIMPEZA: Remover imports duplicados
echo ""
echo "=== Limpando imports duplicados ==="
find src -name "*.ts" | while read -r file; do
    if grep -q "UserRole" "$file"; then
        # Remove linhas duplicadas consecutivas de import do UserRole
        awk '!seen[$0]++ || $0 !~ /import.*UserRole/' "$file" > "$file.tmp" 2>/dev/null && mv "$file.tmp" "$file"
    fi
done

# 9. VERIFICAÇÃO FINAL
echo ""
echo "=========================================="
echo "=== VERIFICAÇÃO FINAL ==="
echo "=========================================="

REMAINING=$(grep -rn "'admin'\|'medico'\|'recepcionista'\|'paciente'" src/ --include='*.ts' 2>/dev/null | grep -v "common/enums.ts" | grep -v "^\s*//" | grep -v "/\*" | grep -v "\*/" || true)

if [ -z "$REMAINING" ]; then
    echo "✅ SUCESSO: Nenhuma string literal de role encontrada fora do enum!"
else
    echo "⚠️  ATENÇÃO: Strings literais restantes:"
    echo "$REMAINING"
    echo ""
    echo "Execute manualmente ou ajuste o script."
fi

echo ""
echo "=== Resumo ==="
echo "Controllers: $(find src -name '*.controller.ts' -exec grep -l 'UserRole' {} \; | wc -l)"
echo "Services: $(find src -name '*.service.ts' -exec grep -l 'UserRole' {} \; | wc -l)"
echo "DTOs: $(find src -name '*.dto.ts' -exec grep -l 'UserRole' {} \; | wc -l)"

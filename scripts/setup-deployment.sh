#!/bin/bash

# Script para configurar GitHub Pages + GitHub Actions automáticamente

echo "🚀 Loop Maestro - Deployment Setup Script"
echo "=========================================="
echo ""

# Verificar si Git está instalado
if ! command -v git &> /dev/null; then
    echo "❌ Git no está instalado"
    exit 1
fi

echo "✅ Git está instalado"
echo ""

# Pedir información al usuario
echo "📋 CONFIGURACIÓN REQUERIDA"
echo ""

read -p "Ingresa tu usuario de GitHub: " GITHUB_USER
read -p "Ingresa el nombre del repositorio (ej: loop-maestro-mvp): " REPO_NAME
read -p "Ingresa tu VITE_SUPABASE_URL: " SUPABASE_URL
read -p "Ingresa tu VITE_SUPABASE_ANON_KEY: " SUPABASE_KEY

# Crear .env local
echo ""
echo "📝 Creando archivo .env..."
cat > .env << EOF
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY
VITE_API_BASE_URL=http://localhost:3000
EOF

echo "✅ .env creado"
echo ""

# Inicializar Git si no existe
if [ ! -d ".git" ]; then
    echo "🔧 Inicializando Git..."
    git init
    git config user.email "development@loop-maestro.local"
    git config user.name "Loop Maestro Dev"
    echo "✅ Git inicializado"
else
    echo "✅ Git ya inicializado"
fi

echo ""

# Agregar remoto
echo "🔗 Configurando remoto de GitHub..."
if git remote | grep -q "origin"; then
    echo "⚠️  Remote 'origin' ya existe"
    read -p "¿Deseas actualizarlo? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        git remote remove origin
        git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git
        echo "✅ Remote actualizado"
    fi
else
    git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git
    echo "✅ Remote agregado"
fi

echo ""

# Agregar archivos
echo "📦 Agregando archivos..."
git add .
git status

echo ""

read -p "¿Continuar con el commit? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "❌ Operación cancelada"
    exit 1
fi

echo "📝 Realizando commit..."
git commit -m "Initial commit: Loop Maestro MVP with GitHub Pages deployment"

echo ""
echo "🚀 Subiendo a GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ ¡Listo para desplegar!"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo ""
echo "1. Ir a: https://github.com/$GITHUB_USER/$REPO_NAME/settings/secrets/actions"
echo "2. Crear 2 secretos:"
echo "   - VITE_SUPABASE_URL: $SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY: [tu-anon-key]"
echo ""
echo "3. Ir a: https://github.com/$GITHUB_USER/$REPO_NAME/settings/pages"
echo "4. Seleccionar:"
echo "   - Source: Deploy from a branch"
echo "   - Branch: main"
echo "   - Folder: / (root)"
echo ""
echo "5. ¡Tu app estará disponible en:"
echo "   https://$GITHUB_USER.github.io/$REPO_NAME"
echo ""
echo "=========================================="

# Script para configurar GitHub Pages + GitHub Actions en Windows

Write-Host "🚀 Loop Maestro - Deployment Setup Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Git está instalado
try {
    git --version > $null
    Write-Host "✅ Git está instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ Git no está instalado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 CONFIGURACIÓN REQUERIDA" -ForegroundColor Yellow
Write-Host ""

$GITHUB_USER = Read-Host "Ingresa tu usuario de GitHub"
$REPO_NAME = Read-Host "Ingresa el nombre del repositorio (ej: loop-maestro-mvp)"
$SUPABASE_URL = Read-Host "Ingresa tu VITE_SUPABASE_URL"
$SUPABASE_KEY = Read-Host "Ingresa tu VITE_SUPABASE_ANON_KEY"

# Crear .env local
Write-Host ""
Write-Host "📝 Creando archivo .env..." -ForegroundColor Yellow

$envContent = @"
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_KEY
VITE_API_BASE_URL=http://localhost:3000
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "✅ .env creado" -ForegroundColor Green
Write-Host ""

# Inicializar Git si no existe
if (-not (Test-Path ".git")) {
    Write-Host "🔧 Inicializando Git..." -ForegroundColor Yellow
    git init
    git config user.email "development@loop-maestro.local"
    git config user.name "Loop Maestro Dev"
    Write-Host "✅ Git inicializado" -ForegroundColor Green
} else {
    Write-Host "✅ Git ya inicializado" -ForegroundColor Green
}

Write-Host ""

# Agregar remoto
Write-Host "🔗 Configurando remoto de GitHub..." -ForegroundColor Yellow

$remoteExists = git remote | Select-String -Pattern "origin"

if ($remoteExists) {
    Write-Host "⚠️  Remote 'origin' ya existe" -ForegroundColor Yellow
    $response = Read-Host "¿Deseas actualizarlo? (s/n)"
    if ($response -eq "s") {
        git remote remove origin
        git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
        Write-Host "✅ Remote actualizado" -ForegroundColor Green
    }
} else {
    git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
    Write-Host "✅ Remote agregado" -ForegroundColor Green
}

Write-Host ""

# Agregar archivos
Write-Host "📦 Agregando archivos..." -ForegroundColor Yellow
git add .
git status

Write-Host ""

$response = Read-Host "¿Continuar con el commit? (s/n)"
if ($response -ne "s") {
    Write-Host "❌ Operación cancelada" -ForegroundColor Red
    exit 1
}

Write-Host "📝 Realizando commit..." -ForegroundColor Yellow
git commit -m "Initial commit: Loop Maestro MVP with GitHub Pages deployment"

Write-Host ""
Write-Host "🚀 Subiendo a GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main

Write-Host ""
Write-Host "✅ ¡Listo para desplegar!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 PRÓXIMOS PASOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Ir a: https://github.com/$GITHUB_USER/$REPO_NAME/settings/secrets/actions"
Write-Host "2. Crear 2 secretos:"
Write-Host "   - VITE_SUPABASE_URL: $SUPABASE_URL"
Write-Host "   - VITE_SUPABASE_ANON_KEY: [tu-anon-key]"
Write-Host ""
Write-Host "3. Ir a: https://github.com/$GITHUB_USER/$REPO_NAME/settings/pages"
Write-Host "4. Seleccionar:"
Write-Host "   - Source: Deploy from a branch"
Write-Host "   - Branch: main"
Write-Host "   - Folder: / (root)"
Write-Host ""
Write-Host "5. ¡Tu app estará disponible en:" -ForegroundColor Green
Write-Host "   https://$GITHUB_USER.github.io/$REPO_NAME"
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan

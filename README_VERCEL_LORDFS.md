# 🚀 VERCEL DEPLOYMENT - lordFullstack/domicilios

Configuración específica para tu proyecto de delivery.

---

## 📌 INFORMACIÓN DEL PROYECTO

```
Repository: lordFullstack/domicilios
Framework: Vite + React 19
Deployment: Vercel
CI/CD: GitHub Actions
```

---

## 🎯 PLAN DE ACCIÓN

### Fase 1: Configuración Vercel (5 min)
- Conectar GitHub
- Configurar variables de entorno
- Obtener tokens

### Fase 2: Configuración GitHub (3 min)
- Agregar secretos
- Verificar workflow

### Fase 3: Primera Ejecución (2-3 min)
- Push a main
- Esperar deploy
- Verificar URL

---

## ⚡ QUICK SETUP (RECOMENDADO)

Si tienes prisa, sigue: **QUICK_START_VERCEL.md** (5 pasos, 5 min)

Si quieres detalles: **VERCEL_SETUP.md** (guía completa)

---

## 🔗 URLS IMPORTANTES

```
GitHub Repo:
https://github.com/lordFullstack/domicilios

Vercel Dashboard:
https://vercel.com/dashboard

GitHub Actions:
https://github.com/lordFullstack/domicilios/actions

GitHub Secrets:
https://github.com/lordFullstack/domicilios/settings/secrets/actions

Vercel Project:
https://vercel.com/projects/domicilios
```

---

## 🛠️ ARCHIVOS MODIFICADOS

```
vercel.json                          ← Config Vercel (actualizado)
.github/workflows/vercel-deploy.yml  ← Nuevo workflow
.github/workflows/deploy.yml         ← Deploy a GitHub Pages (existe)
.github/workflows/pr-checks.yml      ← PR checks (existe)
VERCEL_SETUP.md                      ← Guía completa (nuevo)
QUICK_START_VERCEL.md                ← Quick start (nuevo)
```

---

## 🚀 INFRAESTRUCTURA

```
┌─────────────────┐
│  GitHub Repo    │
│ lordFullstack/  │
│  domicilios     │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
    GitHub Actions      Vercel
    (CI/CD Pipeline)    (Hosting)
         │                  │
         └──────────────────┘
                  │
                  ▼
         Production/Preview
         domicilios.vercel.app
```

---

## 📊 DEPLOYMENTS

### Production (main branch)
```
Rama: main
URL: https://domicilios.vercel.app
Deploy: Automático en cada push
Entorno: Producción
```

### Preview (otros branches)
```
Rama: develop, feature/*, etc
URL: https://domicilios-[rama].vercel.app
Deploy: Automático en cada push
Entorno: Preview
```

### Development (local)
```
Comando: npm run dev
URL: http://localhost:3000
Entorno: Desarrollo
```

---

## 🔄 WORKFLOW AUTOMÁTICO

Cada vez que hagas push a `main`:

```
1. git push origin main
   ↓
2. GitHub Actions detecta cambios
   ↓
3. Ejecuta:
   - npm install
   - npm run type-check
   - npm run build
   ↓
4. Vercel CLI deploya
   ↓
5. App actualizada en:
   https://domicilios.vercel.app (1-2 min)
```

---

## 🎓 PRÓXIMOS PASOS

### Paso 1: Copiar archivos de configuración
```bash
# Descargar el ZIP actualizado
# Extraer archivos de configuración

# Archivos clave:
# - .github/workflows/vercel-deploy.yml
# - vercel.json
# - VERCEL_SETUP.md
# - QUICK_START_VERCEL.md
```

### Paso 2: Seguir QUICK_START_VERCEL.md
5 pasos, 5 minutos, ¡online!

### Paso 3: Hacer cambios y pushear
Automáticamente deploya

### Paso 4: Monitorear
- GitHub Actions: https://github.com/lordFullstack/domicilios/actions
- Vercel Dashboard: https://vercel.com/dashboard

---

## 🔐 VARIABLES DE ENTORNO

### En Vercel (Project Settings)
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_BASE_URL (opcional)
```

Aplicadas a: Production, Preview, Development

### En GitHub (Secrets)
```
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

---

## 🆘 SOPORTE

### Documentación
- **QUICK_START_VERCEL.md** - Inicio rápido (recomendado)
- **VERCEL_SETUP.md** - Guía completa
- **DEPLOYMENT_OPTIONS.md** - Comparativa de opciones
- **README.md** - Documentación general

### Enlaces Útiles
- Vercel Docs: https://vercel.com/docs
- GitHub Actions: https://github.com/features/actions
- Vite Docs: https://vitejs.dev

---

## ✅ CHECKLIST FINAL

- ✅ Archivos de configuración descargados
- ✅ QUICK_START_VERCEL.md leído
- ✅ Pasos 1-4 completados (5 min)
- ✅ Primer push ejecutado
- ✅ GitHub Actions corriendo (✅ verde)
- ✅ Vercel deployment completado
- ✅ App accesible en domicilios.vercel.app
- ✅ Preview deployments funcionando

---

## 🎉 ¡LISTO PARA PRODUCCIÓN!

Tu Loop Maestro está online con:

✅ Deploy automático en cada push
✅ CI/CD pipeline funcional
✅ Preview deployments para PRs
✅ Variables de entorno seguras
✅ Monitoreo incluido
✅ Escalabilidad global

**Próximo paso:** Seguir desarrollando features.

¡Adelante! 🚀

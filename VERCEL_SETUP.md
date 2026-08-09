# 🚀 VERCEL DEPLOYMENT - GUÍA COMPLETA

Configuración paso a paso para desplegar Loop Maestro en Vercel con CI/CD automático.

---

## 📋 REQUISITOS

- Cuenta de GitHub (repo creado)
- Cuenta de Vercel (gratuita o paga)
- Credenciales de Supabase

---

## 🔧 PASO 1: CONECTAR GITHUB CON VERCEL

### 1.1 Ir a Vercel Dashboard

```
https://vercel.com/dashboard
```

### 1.2 Crear Nuevo Proyecto

1. Clic en "Add New..." → "Project"
2. "Import Git Repository"
3. Conectar GitHub si no lo está
4. Seleccionar repositorio `domicilios`
5. Clic en "Import"

### 1.3 Verificar Configuración

Vercel automáticamente detectará:
```
✅ Framework: Vite
✅ Build Command: npm run build
✅ Output Directory: dist
```

---

## 🔐 PASO 2: CONFIGURAR SECRETOS EN VERCEL

### 2.1 Ir a Project Settings

```
https://vercel.com/projects/[tu-proyecto]/settings/environment-variables
```

### 2.2 Agregar Variables de Entorno

**Variable 1: VITE_SUPABASE_URL**
- **Name:** `VITE_SUPABASE_URL`
- **Value:** Tu URL de Supabase (https://xxxxx.supabase.co)
- **Environments:** Production, Preview, Development
- Clic en "Save"

**Variable 2: VITE_SUPABASE_ANON_KEY**
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** Tu Anon Key de Supabase
- **Environments:** Production, Preview, Development
- Clic en "Save"

**Variable 3: VITE_API_BASE_URL** (Opcional)
- **Name:** `VITE_API_BASE_URL`
- **Value:** Tu URL de API
- **Environments:** Production, Preview, Development
- Clic en "Save"

### Verificación

Deberías ver 3 variables listadas sin mostrar valores:
```
✅ VITE_SUPABASE_URL
✅ VITE_SUPABASE_ANON_KEY
✅ VITE_API_BASE_URL
```

---

## 🔑 PASO 3: OBTENER SECRETOS PARA GITHUB ACTIONS

### 3.1 Obtener VERCEL_TOKEN

1. Ve a https://vercel.com/account/tokens
2. Clic en "Create Token"
3. **Name:** `github-actions`
4. **Expiration:** 90 days (o custom)
5. Copia el token
6. Guarda en lugar seguro

### 3.2 Obtener VERCEL_ORG_ID

1. Ve a https://vercel.com/account
2. Bajo "General" → "ID"
3. Copia el ID de la organización (o usuario)

### 3.3 Obtener VERCEL_PROJECT_ID

```bash
# En tu directorio del proyecto
vercel --version  # Para verificar que está instalado

# Ejecutar
vercel project info

# Verás:
# Project ID: xxxxxxxxxxxxxxxxxxxxxxxx
```

O desde el dashboard:
1. Ir a proyecto en Vercel
2. Settings → General
3. Project ID está listado

---

## 🔐 PASO 4: CONFIGURAR SECRETOS EN GITHUB

### 4.1 Ir a Secrets

```
https://github.com/lordFullstack/domicilios/settings/secrets/actions
```

### 4.2 Crear Secreto 1: VERCEL_TOKEN

1. Clic en "New repository secret"
2. **Name:** `VERCEL_TOKEN`
3. **Value:** [Tu token de Vercel]
4. Clic en "Add secret"

### 4.3 Crear Secreto 2: VERCEL_ORG_ID

1. Clic en "New repository secret"
2. **Name:** `VERCEL_ORG_ID`
3. **Value:** [Tu org ID de Vercel]
4. Clic en "Add secret"

### 4.4 Crear Secreto 3: VERCEL_PROJECT_ID

1. Clic en "New repository secret"
2. **Name:** `VERCEL_PROJECT_ID`
3. **Value:** [Tu project ID de Vercel]
4. Clic en "Add secret"

### 4.5 Crear Secreto 4: VITE_SUPABASE_URL

1. Clic en "New repository secret"
2. **Name:** `VITE_SUPABASE_URL`
3. **Value:** [Tu URL de Supabase]
4. Clic en "Add secret"

### 4.6 Crear Secreto 5: VITE_SUPABASE_ANON_KEY

1. Clic en "New repository secret"
2. **Name:** `VITE_SUPABASE_ANON_KEY`
3. **Value:** [Tu Anon Key de Supabase]
4. Clic en "Add secret"

### 4.7 Crear Secreto 6: VITE_API_BASE_URL (Opcional)

1. Clic en "New repository secret"
2. **Name:** `VITE_API_BASE_URL`
3. **Value:** [Tu API URL]
4. Clic en "Add secret"

### Verificación

Deberías ver 5-6 secretos listados:
```
✅ VERCEL_TOKEN
✅ VERCEL_ORG_ID
✅ VERCEL_PROJECT_ID
✅ VITE_SUPABASE_URL
✅ VITE_SUPABASE_ANON_KEY
✅ VITE_API_BASE_URL (opcional)
```

---

## 🚀 PASO 5: HACER PUSH PARA PROBAR

```bash
# Asegurate que estés en la rama main
git checkout main

# Agregar archivos actualizados
git add .

# Commit
git commit -m "Add Vercel deployment configuration"

# Push
git push origin main
```

---

## ✅ VERIFICAR DEPLOYMENT

### 5.1 Ver Workflow en GitHub

```
https://github.com/lordFullstack/domicilios/actions
```

Deberías ver:
- ✅ "Deploy to Vercel" corriendo o completado
- El job debe terminar en VERDE ✅

### 5.2 Ver Deployment en Vercel

```
https://vercel.com/dashboard/projects
```

Deberías ver:
- ✅ Nuevo deployment en progreso
- URLs de preview y production

### 5.3 Acceder a tu App

Una vez completado (1-2 minutos):

**Production (main branch):**
```
https://tu-proyecto.vercel.app
```

**Preview (otros branches/PRs):**
```
https://tu-proyecto-[branch].vercel.app
```

---

## 📊 WORKFLOW AUTOMÁTICO

Cada vez que hagas push:

```
git push a main
    ↓
GitHub Actions detecta cambios
    ↓
npm install
npm run type-check
npm run build
    ↓
Vercel CLI deploya a producción
    ↓
App actualizada en 1-2 minutos
URL: https://tu-proyecto.vercel.app
```

Para otros branches (develop, feature/*, etc):

```
git push a rama
    ↓
GitHub Actions detecta cambios
    ↓
Vercel CLI deploya preview
    ↓
Preview URL disponible
URL: https://tu-proyecto-[rama].vercel.app
```

---

## 🎯 DEPLOYMENTS

### Production
- **Rama:** main
- **URL:** https://tu-proyecto.vercel.app
- **Cuando:** Cada push a main
- **Duración:** 1-2 minutos

### Preview
- **Rama:** develop, feature/*, etc
- **URL:** https://tu-proyecto-[rama].vercel.app
- **Cuando:** Cada push a rama, cada PR
- **Duración:** 1-2 minutos

### Environments en Vercel
```
Producción    → main
Preview       → Otros branches y PRs
Development   → Local (npm run dev)
```

---

## 🔄 CAMBIAR CONFIGURACIÓN

### Cambiar dominio personalizado

1. Ve a https://vercel.com/projects/[proyecto]/settings/domains
2. Clic en "Add"
3. Ingresa tu dominio
4. Sigue instrucciones DNS

### Deshabilitar automático para una rama

1. Ve a https://vercel.com/projects/[proyecto]/settings/git
2. "Ignored Build Step"
3. Ingresa comando para skipear build

### Cambiar variables de entorno

1. Ve a https://vercel.com/projects/[proyecto]/settings/environment-variables
2. Edita o elimina variables
3. Los cambios aplican al próximo deploy

---

## 🆘 TROUBLESHOOTING

### Error: "Build failed"

**Revisar logs:**
1. Ve a https://vercel.com/projects/[proyecto]/deployments
2. Haz clic en el deployment fallido
3. Expande "Build Output"
4. Lee el error específico

**Causas comunes:**
- Secretos de GitHub/Vercel no configurados
- Sintaxis TypeScript error
- Dependencias faltantes

### Error: "Environment variables not found"

**Solución:**
1. Verifica en Vercel: Settings → Environment Variables
2. Verifica en GitHub: Settings → Secrets
3. Asegúrate que los nombres sean exactos (case-sensitive)
4. Redeploy después de agregar secretos

### Error: "Can't find module '@supabase/supabase-js'"

**Solución:**
```bash
# Local
npm install

# Vercel automáticamente detectará package-lock.json
# Asegúrate de commitear package-lock.json

git add package-lock.json
git commit -m "Update dependencies"
git push origin main
```

### Deployment tarda mucho

**Normal:**
- Primer deploy: 3-5 minutos
- Deploys subsecuentes: 1-2 minutos

**Optimizar:**
- Vercel cachea dependencies
- Asegúrate que vite.config.ts esté optimizado

### App se muestra pero rutas no funcionan

**No es problema:**
- Vercel automáticamente redirige a index.html
- React Router maneja las rutas en el navegador
- Normalmente funciona sin configuración adicional

---

## 📊 ANALYTICS Y MONITORING

### Ver Performance

1. Ve a https://vercel.com/projects/[proyecto]/analytics
2. Metrics:
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Cumulative Layout Shift (CLS)

### Ver Logs

1. Ve a https://vercel.com/projects/[proyecto]/logs
2. Filtrar por deployment
3. Ver errores en tiempo real

### Alertas

1. Ve a https://vercel.com/projects/[proyecto]/settings/alerts
2. Configurar notificaciones:
   - Build failed
   - Deployment completed
   - Custom domain issues

---

## 🔒 SEGURIDAD

### Variables de Entorno

✅ **DO:**
- Almacenar en Vercel Environment Variables
- Almacenar en GitHub Secrets
- Usar variables diferentes por environment
- Rotar tokens regularmente

❌ **DON'T:**
- Commitear .env con valores reales
- Mostrar secretos en logs
- Compartir tokens con otros

### CORS y Security Headers

Ya configurado en `vercel.json`:
```json
{
  "headers": [
    {
      "key": "X-Content-Type-Options",
      "value": "nosniff"
    },
    {
      "key": "X-Frame-Options",
      "value": "SAMEORIGIN"
    },
    {
      "key": "X-XSS-Protection",
      "value": "1; mode=block"
    }
  ]
}
```

---

## 💰 COSTOS

### Plan Gratuito (Recomendado para MVP)
- ✅ Deployments ilimitados
- ✅ Sitios públicos
- ✅ Edge Network global
- ✅ Domains personalizados
- ✅ Analytics integrado
- **Costo:** $0

### Plan Pro ($20/mes)
- ✅ Analytics avanzado
- ✅ Edge Middleware
- ✅ Serverless Functions (ilimitadas)
- ✅ Soporte prioritario
- **Costo:** $20/mes

### Plan Enterprise
- ✅ Soporte dedicado
- ✅ SSO/SAML
- ✅ Custom SLA
- **Costo:** Contactar a Vercel

**Recomendación:** Plan Gratuito es suficiente para MVP.

---

## ✅ CHECKLIST FINAL

- ✅ Repositorio conectado a Vercel
- ✅ Variables de entorno en Vercel
- ✅ Secretos en GitHub
- ✅ Workflow vercel-deploy.yml creado
- ✅ vercel.json configurado
- ✅ Primer push completado
- ✅ Workflow ejecutado (✅ verde)
- ✅ App accesible en https://tu-proyecto.vercel.app
- ✅ Preview deployments funcionando
- ✅ Monitoreo configurado

---

## 🚀 PRÓXIMOS PASOS

1. **Hacer cambios al código**
2. **Push a main o rama**
3. **GitHub Actions automáticamente:**
   - Compila el código
   - Ejecuta tests
   - Deploya a Vercel
4. **App actualizada en 1-2 minutos**

---

## 📞 REFERENCIAS

- **Vercel Dashboard:** https://vercel.com/dashboard
- **GitHub Actions:** https://github.com/lordFullstack/domicilios/actions
- **Vercel Docs:** https://vercel.com/docs
- **Vite Docs:** https://vitejs.dev

---

## 🎉 ¡LISTO!

Tu Loop Maestro MVP está desplegado en Vercel con CI/CD automático.

**Cada push a main = App actualizada en 1-2 minutos** ⚡

¡Adelante! 🚀

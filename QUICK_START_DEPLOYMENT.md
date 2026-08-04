# ⚡ QUICK START - DEPLOYMENT EN GITHUB PAGES

**5 pasos. 10 minutos. ¡Tu app en producción!**

---

## 🎯 OBJETIVO

Desplegar Loop Maestro MVP en GitHub Pages con CI/CD automático.

---

## ⏱️ PASO 1: CREAR REPOSITORIO (2 MIN)

```bash
# En la carpeta del proyecto
git init

# Configurar usuario local
git config user.email "tu@email.com"
git config user.name "Tu Nombre"

# Agregar todos los archivos
git add .

# Primer commit
git commit -m "Initial commit: Loop Maestro MVP"

# Crear rama main
git branch -M main
```

---

## 🔗 PASO 2: CONECTAR CON GITHUB (2 MIN)

### 2a. Crear repositorio en GitHub

1. Ve a https://github.com/new
2. **Repository name:** `loop-maestro-mvp`
3. **Description:** (opcional) Plataforma de delivery tipo Uber Eats
4. **Public** (recomendado para GitHub Pages)
5. Clic en "Create repository"

### 2b. Conectar tu repositorio local

Copia el comando que GitHub muestra (similar a):

```bash
git remote add origin https://github.com/tu-usuario/loop-maestro-mvp.git
git push -u origin main
```

---

## 🔐 PASO 3: CONFIGURAR SECRETOS (3 MIN)

Los secretos son credenciales que no se ven públicamente.

### 3a. Ir a Secretos

```
https://github.com/tu-usuario/loop-maestro-mvp/settings/secrets/actions
```

### 3b. Crear secreto 1: VITE_SUPABASE_URL

1. Clic en "New repository secret"
2. **Name:** `VITE_SUPABASE_URL`
3. **Value:** Tu URL de Supabase
   - Obtener de: https://app.supabase.com → Project → Settings → API → URL
   - Ejemplo: `https://xxxxx.supabase.co`
4. Clic en "Add secret"

### 3c. Crear secreto 2: VITE_SUPABASE_ANON_KEY

1. Clic en "New repository secret"
2. **Name:** `VITE_SUPABASE_ANON_KEY`
3. **Value:** Tu Anon Key
   - Obtener de: https://app.supabase.com → Project → Settings → API → anon public key
4. Clic en "Add secret"

**Verificación:**
- Deberías ver 2 secretos listados (sin mostrar valores)

---

## 🌐 PASO 4: HABILITAR GITHUB PAGES (2 MIN)

### 4a. Ir a Configuración de Pages

```
https://github.com/tu-usuario/loop-maestro-mvp/settings/pages
```

### 4b. Configurar Deployment

1. **Source:** Selecciona "Deploy from a branch"
2. **Branch:** Selecciona `main`
3. **Folder:** Selecciona `/ (root)`
4. Clic en "Save"

**Nota:** GitHub automáticamente buscará la rama `main`.

---

## 🚀 PASO 5: VERIFICAR DEPLOYMENT (1 MIN)

### 5a. Ver Workflow en Acción

Ve a:
```
https://github.com/tu-usuario/loop-maestro-mvp/actions
```

Deberías ver:
- ✅ "Deploy to GitHub Pages" corriendo o completado
- El estado debe estar en VERDE (✅)

### 5b. Esperar 2-3 Minutos

El workflow ejecuta:
1. Instala dependencias
2. Compila el código
3. Sube a GitHub Pages
4. ¡Listo!

### 5c. Ver tu App

Una vez que veas ✅ verde en Actions:

```
https://tu-usuario.github.io/loop-maestro-mvp
```

---

## ✅ ¡LISTO!

Tu app está desplegada y se actualiza automáticamente cada vez que hagas push a `main`.

---

## 📝 CAMBIOS FUTUROS

Cada vez que hagas cambios:

```bash
# 1. Hacer cambios al código
# 2. Agregar archivos
git add .

# 3. Commit
git commit -m "Descripción del cambio"

# 4. Push
git push origin main

# 5. GitHub Actions automáticamente:
#    - Ejecuta tests
#    - Compila el código
#    - Deploya la app
#    - ¡Listo en 2-3 minutos!
```

---

## 🆘 TROUBLESHOOTING

### ❌ "Build failed"

**Revisar logs:**
1. Ve a Actions
2. Haz clic en el workflow fallido
3. Expande "Build application"
4. Lee el error

**Causas comunes:**
- Secretos no configurados → ve a PASO 3
- Sintaxis TypeScript error → revisa `npm run type-check` localmente
- Dependencias faltantes → ejecuta `npm install`

### ❌ "Workflow no aparece"

**Solución:**
1. Verifica que `.github/workflows/deploy.yml` existe
2. El archivo debe estar en GitHub (haz `git push`)
3. Espera 1 minuto y recarga la página

### ❌ "App se ve, pero rutas no funcionan"

**No es problema, es normal:**
- GitHub Pages redirige todas las rutas a `/index.html`
- React Router maneja el routing en el navegador
- Verificar que estés usando rutas relativas

### ❌ "No puedo ver los secretos"

**Verificar:**
- Estés en la rama `main`
- Estés en Settings → Secrets → Actions
- El repositorio sea tuyo (admin permisos)

---

## 🎓 ENTENDER EL WORKFLOW

El archivo `.github/workflows/deploy.yml` hace esto automáticamente:

```
git push a main
    ↓
GitHub Actions detecta cambios
    ↓
Ejecuta: npm install
    ↓
Ejecuta: npm run build
    ↓
Toma la carpeta dist/
    ↓
La sube a GitHub Pages
    ↓
Tu app está actualizada en 2-3 min
```

**Sin hacer nada más.** 🪄

---

## 🎯 PRÓXIMOS PASOS

1. **Fase 3:** Conectar Supabase real y hacer funcionar login
2. **Fase 4:** Crear dashboards completos
3. **Fase 5+:** Agregar features según roadmap

---

## 🎉 ¡FELICITACIONES!

Tu Loop Maestro MVP está online.

**URL:** `https://tu-usuario.github.io/loop-maestro-mvp`

Ahora puedes:
- ✅ Compartir el link con usuarios
- ✅ Seguir desarrollando features
- ✅ Hacer cambios y ver actualizaciones en 2-3 min
- ✅ Escalar cuando sea necesario

**¡Adelante!** 🚀

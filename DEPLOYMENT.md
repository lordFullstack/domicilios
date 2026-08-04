# 🚀 DEPLOYMENT - LOOP MAESTRO MVP

Guía completa para desplegar en GitHub Pages con GitHub Actions.

---

## 📋 REQUISITOS

- Cuenta de GitHub
- Repositorio público o privado con GitHub Pages habilitado
- Credenciales de Supabase

---

## 🔧 PASO 1: CONFIGURAR SECRETOS EN GITHUB

Los secretos se usan en el workflow sin exponerlos públicamente.

### 1.1 Ir a Configuración del Repositorio

```
https://github.com/tu-usuario/loop-maestro-mvp/settings/secrets/actions
```

### 1.2 Agregar Secretos

Haz clic en "New repository secret" y agrega estos secretos:

#### Secret 1: VITE_SUPABASE_URL
- **Name:** `VITE_SUPABASE_URL`
- **Value:** Tu URL de Supabase
  - Ejemplo: `https://xxxxx.supabase.co`
  - Obtener de: Supabase Dashboard → Settings → API → URL

#### Secret 2: VITE_SUPABASE_ANON_KEY
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** Tu Anon Key de Supabase
  - Obtener de: Supabase Dashboard → Settings → API → anon public key

---

## 🌐 PASO 2: HABILITAR GITHUB PAGES

### 2.1 Ir a Settings

```
https://github.com/tu-usuario/loop-maestro-mvp/settings/pages
```

### 2.2 Configurar Deployment

1. **Source:** Selecciona "Deploy from a branch"
2. **Branch:** Selecciona `main`
3. **Folder:** Selecciona `/ (root)`
4. Haz clic en "Save"

### 2.3 Esperar Despliegue

GitHub automáticamente ejecutará el workflow y desplegará la app en:

```
https://tu-usuario.github.io/loop-maestro-mvp
```

---

## 📤 PASO 3: HACER PUSH AL REPOSITORIO

```bash
# Desde el directorio del proyecto
git add .
git commit -m "Initial commit: Loop Maestro MVP with GitHub Pages"
git push origin main
```

---

## ✅ PASO 4: VERIFICAR DESPLIEGUE

### 4.1 Ver el Workflow en Acción

```
https://github.com/tu-usuario/loop-maestro-mvp/actions
```

Deberías ver:
- ✅ "Deploy to GitHub Pages" corriendo
- ✅ Verde = Exitoso
- ❌ Rojo = Error (revisar logs)

### 4.2 Ver la Aplicación Desplegada

Una vez que el workflow termine (✅ verde):

```
https://tu-usuario.github.io/loop-maestro-mvp
```

---

## 🔄 WORKFLOW AUTOMÁTICO

Cada vez que hagas push a `main`:

```
Push a GitHub
    ↓
Ejecuta workflow (deploy.yml)
    ↓
Instala dependencias (npm ci)
    ↓
Type check (TypeScript)
    ↓
Build (npm run build)
    ↓
Sube artifact a GitHub Pages
    ↓
Deploy automático
    ↓
App disponible en tu dominio
```

---

## 🧪 PULL REQUESTS

Cuando abras un PR:

```
PR abierto a main
    ↓
Ejecuta workflow (pr-checks.yml)
    ↓
Type check
    ↓
Build test
    ↓
Comenta resultado en el PR
    ↓
Decide si mergear o no
```

---

## 🆘 SOLUCIONAR PROBLEMAS

### Error: "ENOENT: no such file or directory"

**Causa:** Archivo .nojekyll faltante

**Solución:**
```bash
touch public/.nojekyll
git add public/.nojekyll
git commit -m "Add .nojekyll"
git push origin main
```

### Error: "Environment variables not defined"

**Causa:** Secretos de GitHub no configurados

**Solución:**
1. Ir a Settings → Secrets → Actions
2. Verificar que existan VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
3. Hacer push nuevamente

### Error: "Cannot find module"

**Causa:** Dependencias no instaladas correctamente

**Solución:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### La app se muestra pero rutas no funcionan

**Causa:** GitHub Pages redirige a index.html

**Solución:** El proyecto ya está configurado para esto (Vite handle routing).

---

## 📊 MONITOREAR DEPLOYMENTS

### Ver Histórico

```
https://github.com/tu-usuario/loop-maestro-mvp/deployments
```

### Ver Logs del Workflow

1. Ir a **Actions**
2. Seleccionar el workflow más reciente
3. Expandir "Deploy to GitHub Pages"
4. Ver logs en tiempo real

---

## 🔒 SEGURIDAD

### Buenas Prácticas

✅ **DO:**
- Almacenar credenciales en Secrets
- No commitear archivos .env
- Usar variables de entorno en workflows
- Revisar logs para errors

❌ **DON'T:**
- Commitear .env con credenciales reales
- Publicar secretos en código
- Usar tokens hardcodeados
- Compartir URLs de Supabase

---

## 📱 ACCEDER A LA APP

### Dominio por defecto

```
https://tu-usuario.github.io/loop-maestro-mvp
```

### Con dominio personalizado (Opcional)

Si quieres usar tu propio dominio:

1. Ir a Settings → Pages
2. En "Custom domain" ingresa tu dominio
3. Configura DNS records en tu proveedor
4. Verifica el dominio

Ejemplo:
```
https://tudominio.com
```

---

## 🚀 PRÓXIMOS PASOS

Una vez desplegado:

1. **Probar la app** en `https://tu-usuario.github.io/loop-maestro-mvp`
2. **Configurar Supabase** para producción si es necesario
3. **Agregar más features** según roadmap
4. **Monitorear performance** con Lighthouse

---

## 📞 REFERENCIA RÁPIDA

```bash
# Ver estado del workflow
git log --oneline

# Ver si hay errores
gh run list --workflow=deploy.yml

# Retrigger workflow
gh run rerun [run-id]

# Ver secretos (no muestra valores)
gh secret list
```

---

## ✅ CHECKLIST DEPLOYMENT

- ✅ Repositorio en GitHub
- ✅ Secretos configurados (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- ✅ GitHub Pages habilitado
- ✅ Workflow en `.github/workflows/deploy.yml`
- ✅ `.nojekyll` en `public/`
- ✅ Push a `main`
- ✅ Workflow completado (✅ verde)
- ✅ App accesible en `https://tu-usuario.github.io/loop-maestro-mvp`

---

## 📊 ESTADÍSTICAS POST-DEPLOY

Monitorear:
- Time to First Byte (TTFB)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

```bash
# Usar Lighthouse
npx lighthouse https://tu-usuario.github.io/loop-maestro-mvp --view
```

---

## 🎯 CONCLUSIÓN

¡Tu app ahora se deploya automáticamente cada vez que haces push a main! 🎉

Cualquier cambio:
```bash
git add .
git commit -m "Tu mensaje"
git push origin main

# El workflow se ejecuta automáticamente
# En 2-3 minutos tu app está actualizada
```

**¡Felicitaciones! Tu Loop Maestro MVP está en producción.** 🚀

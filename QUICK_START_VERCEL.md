# ⚡ VERCEL QUICK START - 5 PASOS EN 5 MINUTOS

Desplega tu app en Vercel sin complicaciones.

---

## 🎯 OBJETIVO

Conectar repo GitHub con Vercel y tener deploy automático.

---

## ⏱️ PASO 1: CONECTAR GITHUB (1 MIN)

```
https://vercel.com/import

1. Clic en "Import Git Repository"
2. Conectar GitHub
3. Seleccionar lordFullstack/domicilios
4. Clic en "Import"
```

---

## 🔐 PASO 2: CONFIGURAR VARIABLES (2 MIN)

En Vercel → Project Settings → Environment Variables

Agregar 3 variables:

```
1. VITE_SUPABASE_URL = https://xxxxx.supabase.co
2. VITE_SUPABASE_ANON_KEY = tu-anon-key
3. VITE_API_BASE_URL = tu-api-url (opcional)
```

Seleccionar Environments: **Production, Preview, Development**

---

## 🔑 PASO 3: OBTENER TOKENS (1 MIN)

### 3a. VERCEL_TOKEN

```
https://vercel.com/account/tokens

1. Create Token
2. Name: github-actions
3. Copy token
```

### 3b. VERCEL_ORG_ID

```
https://vercel.com/account

General → ID (copia el ID)
```

### 3c. VERCEL_PROJECT_ID

```
https://vercel.com/projects/[tu-proyecto]

Settings → General → Project ID (copia el ID)

O en terminal:
vercel project info
```

---

## 🔐 PASO 4: AGREGAR SECRETOS A GITHUB (1 MIN)

```
https://github.com/lordFullstack/domicilios/settings/secrets/actions

New repository secret → Agregar:

1. VERCEL_TOKEN = [tu-token]
2. VERCEL_ORG_ID = [tu-org-id]
3. VERCEL_PROJECT_ID = [tu-project-id]
4. VITE_SUPABASE_URL = [tu-url]
5. VITE_SUPABASE_ANON_KEY = [tu-key]
```

---

## 🚀 PASO 5: HACER PUSH (DONE!)

```bash
git add .
git commit -m "Add Vercel deployment"
git push origin main
```

Luego:
1. Ve a GitHub Actions
2. Espera que termine el workflow (✅ verde)
3. Tu app estará en: https://tu-proyecto.vercel.app

---

## ✅ ¡LISTO!

Cada push a `main` = Deploy automático en 1-2 minutos ⚡

---

## 📊 RESULTADO

| Rama | URL | Tipo |
|------|-----|------|
| main | https://domicilios.vercel.app | Producción |
| develop | https://domicilios-develop.vercel.app | Preview |
| feature/* | https://domicilios-feature-name.vercel.app | Preview |

---

## 🆘 SI ALGO FALLA

**1. Revisar GitHub Actions**
```
https://github.com/lordFullstack/domicilios/actions
```

**2. Revisar Vercel Deployments**
```
https://vercel.com/projects/domicilios/deployments
```

**3. Revisar logs del error**

Más detalles en: **VERCEL_SETUP.md**

---

## 🎉 ¡YA ESTÁ!

Tu app está en: **https://domicilios.vercel.app** 🚀

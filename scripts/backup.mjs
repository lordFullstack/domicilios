#!/usr/bin/env node
// Respaldo de la base de datos de Domicilios Riohacha (plan gratuito de Supabase: sin respaldos automáticos).
//
// Uso:   npm run backup            (o:  node scripts/backup.mjs [--keep 30] [--out backups])
// Antes: definir la clave SECRETA (service_role) en TU equipo, nunca en el repositorio ni en el chat:
//   PowerShell:  $env:SUPABASE_SERVICE_ROLE_KEY = "<pegar aquí>"      (vale solo para esa ventana)
//   La encuentras en Supabase → Project Settings → API → service_role. Trátala como una contraseña.
//
// Qué hace: descarga TODAS las tablas de `public` (con paginación) y la lista de usuarios de Auth,
// las guarda en backups/AAAA-MM-DD_HHMMSS/ como JSON, verifica que el número de filas descargado sea
// igual al que informa la base y escribe manifest.json con sumas de control (SHA-256).
// Sale con código 1 si algo no cuadra. Solo LEE la base: no modifica nada en Supabase.
//
// Límites (ver docs/RESPALDOS.md): no incluye las contraseñas de los usuarios (Supabase no las expone),
// ni los archivos de Storage (fotos). Los respaldos contienen datos personales: NO subir a git.

import { createHash } from 'node:crypto'
import { mkdir, writeFile, readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://eisgjtabunwnnsfyrwcx.supabase.co').replace(/\/$/, '')
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PAGE = 1000

const TABLES = [
  'profiles',
  'restaurants',
  'products',
  'promotions',
  'orders',
  'order_items',
  'order_assignment_attempts',
  'order_ratings',
  'notifications',
  'favorites',
  'push_subscriptions',
  'app_settings',
]

const args = process.argv.slice(2)
const arg = (name, fallback) => {
  const i = args.indexOf(name)
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback
}
const OUT_ROOT = arg('--out', 'backups')
const KEEP = Number(arg('--keep', '30'))

const fail = (msg) => {
  console.error(`\n✖ ${msg}`)
  process.exit(1)
}

if (!KEY) {
  fail(
    'Falta SUPABASE_SERVICE_ROLE_KEY.\n' +
      '  PowerShell:  $env:SUPABASE_SERVICE_ROLE_KEY = "<clave service_role>"\n' +
      '  (Supabase → Project Settings → API → service_role. No la pegues en el chat ni en archivos del repo.)'
  )
}

const headers = { apikey: KEY, Authorization: `Bearer ${KEY}` }

/** Descarga una tabla completa; devuelve { rows, total } donde total lo informa la base (count exacto). */
const fetchTable = async (table) => {
  const rows = []
  let total = null
  for (let from = 0; ; from += PAGE) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
      headers: { ...headers, Prefer: 'count=exact', Range: `${from}-${from + PAGE - 1}`, 'Range-Unit': 'items' },
    })
    if (!res.ok && res.status !== 206) {
      throw new Error(`${table}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`)
    }
    const range = res.headers.get('content-range') // "0-999/2345"  o  "*/0"
    if (range) total = Number(range.split('/')[1])
    const page = await res.json()
    rows.push(...page)
    if (page.length < PAGE) break
  }
  return { rows, total: total ?? rows.length }
}

/** Usuarios de Auth (correo, fechas, metadatos). Sin contraseñas: Supabase no las expone. */
const fetchAuthUsers = async () => {
  const users = []
  for (let page = 1; ; page++) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=${PAGE}`, { headers })
    if (!res.ok) throw new Error(`auth users: HTTP ${res.status}`)
    const body = await res.json()
    const batch = body.users ?? []
    users.push(...batch)
    if (batch.length < PAGE) break
  }
  return users
}

const sha256 = (text) => createHash('sha256').update(text).digest('hex')

const stamp = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
}

const main = async () => {
  const dir = join(OUT_ROOT, stamp())
  await mkdir(dir, { recursive: true })
  console.log(`Respaldo → ${dir}\n`)

  const manifest = { created_at: new Date().toISOString(), supabase_url: SUPABASE_URL, tables: {} }
  const problems = []

  for (const table of TABLES) {
    try {
      const { rows, total } = await fetchTable(table)
      const json = JSON.stringify(rows, null, 2)
      await writeFile(join(dir, `${table}.json`), json)
      const ok = rows.length === total
      manifest.tables[table] = { rows: rows.length, expected: total, sha256: sha256(json), ok }
      console.log(`${ok ? '✔' : '✖'} ${table.padEnd(28)} ${String(rows.length).padStart(6)} filas${ok ? '' : `  (la base informa ${total})`}`)
      if (!ok) problems.push(`${table}: descargadas ${rows.length}, esperadas ${total}`)
    } catch (err) {
      manifest.tables[table] = { ok: false, error: String(err.message || err) }
      console.log(`✖ ${table.padEnd(28)} ERROR`)
      problems.push(String(err.message || err))
    }
  }

  try {
    const users = await fetchAuthUsers()
    const json = JSON.stringify(users, null, 2)
    await writeFile(join(dir, 'auth_users.json'), json)
    manifest.tables.auth_users = { rows: users.length, expected: users.length, sha256: sha256(json), ok: true }
    console.log(`✔ ${'auth_users'.padEnd(28)} ${String(users.length).padStart(6)} filas`)
  } catch (err) {
    manifest.tables.auth_users = { ok: false, error: String(err.message || err) }
    console.log(`✖ ${'auth_users'.padEnd(28)} ERROR`)
    problems.push(String(err.message || err))
  }

  manifest.ok = problems.length === 0
  await writeFile(join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2))

  // Rotación: conserva solo los últimos KEEP respaldos (solo carpetas con nombre de fecha dentro de OUT_ROOT).
  if (Number.isFinite(KEEP) && KEEP > 0) {
    const all = (await readdir(OUT_ROOT)).filter((n) => /^\d{4}-\d{2}-\d{2}_\d{6}$/.test(n)).sort()
    for (const old of all.slice(0, Math.max(0, all.length - KEEP))) {
      await rm(join(OUT_ROOT, old), { recursive: true, force: true })
      console.log(`(rotación) borrado respaldo antiguo ${old}`)
    }
  }

  if (problems.length) {
    console.error(`\n✖ El respaldo tiene ${problems.length} problema(s):\n  - ${problems.join('\n  - ')}`)
    process.exit(1)
  }
  console.log(`\n✔ Respaldo completo y verificado en ${dir}`)
  console.log('  Copia esa carpeta a un segundo lugar (disco externo o nube PRIVADA). Contiene datos personales.')
}

main().catch((err) => fail(err.message || String(err)))

/**
 * Formateo de nombres de personas para MOSTRAR en pantalla.
 *
 * El nombre se guarda en `profiles.name` tal como el usuario lo escribió
 * ("jose luis", "JOSE LUIS"...). Estas funciones solo corrigen el render:
 * nunca se usan para reescribir el valor en backend.
 *
 * Reglas:
 * - Colapsa espacios repetidos y recorta extremos.
 * - Capitaliza cada palabra (y cada parte de nombres con guion: "Ana-María").
 * - Pone tilde solo a nombres/apellidos comunes del diccionario; si la
 *   palabra no está, capitaliza sin inventar tildes.
 * - Si la palabra ya trae tilde, se respeta ("MARÍA" → "María").
 * - Seguro con emojis, números y símbolos (trabaja por code points).
 */

// Diccionario mínimo, ampliable. Llave en minúscula y SIN tilde.
const NOMBRE_TILDES: Record<string, string> = {
  // Nombres
  jose: 'José', maria: 'María', lucia: 'Lucía', sofia: 'Sofía',
  andres: 'Andrés', ramon: 'Ramón', martin: 'Martín', angel: 'Ángel',
  angela: 'Ángela', jesus: 'Jesús', ines: 'Inés', raul: 'Raúl',
  ruben: 'Rubén', oscar: 'Óscar', hector: 'Héctor', victor: 'Víctor',
  adrian: 'Adrián', simon: 'Simón', julian: 'Julián', sebastian: 'Sebastián',
  tomas: 'Tomás', nicolas: 'Nicolás', matias: 'Matías', joaquin: 'Joaquín',
  german: 'Germán', hernan: 'Hernán', fabian: 'Fabián', dario: 'Darío',
  ivan: 'Iván', cesar: 'César', monica: 'Mónica', veronica: 'Verónica',
  angelica: 'Angélica', rocio: 'Rocío', belen: 'Belén', efrain: 'Efraín',
  // Apellidos frecuentes en Colombia
  garcia: 'García', rodriguez: 'Rodríguez', gomez: 'Gómez', lopez: 'López',
  martinez: 'Martínez', gonzalez: 'González', hernandez: 'Hernández',
  perez: 'Pérez', sanchez: 'Sánchez', ramirez: 'Ramírez', diaz: 'Díaz',
  gutierrez: 'Gutiérrez', jimenez: 'Jiménez', alvarez: 'Álvarez',
  fernandez: 'Fernández', suarez: 'Suárez', vasquez: 'Vásquez',
  benitez: 'Benítez', dominguez: 'Domínguez', mendez: 'Méndez',
  nuñez: 'Núñez', nunez: 'Núñez', gonzales: 'Gonzáles',
}

const capitalize = (word: string): string => {
  const chars = Array.from(word)
  if (chars.length === 0) return ''
  return chars[0].toLocaleUpperCase('es-CO') + chars.slice(1).join('')
}

const formatWord = (word: string): string => {
  const lower = word.toLocaleLowerCase('es-CO')
  return lower
    .split('-')
    .map((part) => NOMBRE_TILDES[part] ?? capitalize(part))
    .join('-')
}

/** Nombre completo para mostrar: "jose luis perez" → "José Luis Pérez". */
export function formatFullName(raw: string | null | undefined): string {
  if (!raw) return ''
  return raw.trim().split(/\s+/).filter(Boolean).map(formatWord).join(' ')
}

/**
 * Nombre de pila para mostrar. Acepta nombres compuestos
 * ("jose luis" → "José Luis"); quien llama decide cuántas palabras pasar
 * (el saludo del Home pasa solo la primera palabra de `profiles.name`).
 */
export function formatFirstName(raw: string | null | undefined): string {
  return formatFullName(raw)
}

/**
 * Normaliza texto para BÚSQUEDA (nunca para mostrar): sin tildes, sin
 * diéresis, sin mayúsculas y con espacios colapsados.
 * "Pizzá" → "pizza", "  PA  COMER " → "pa comer", "Ñame" → "name".
 */
export function normalizeText(raw: string | null | undefined): string {
  if (!raw) return ''
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-CO')
    .trim()
    .replace(/\s+/g, ' ')
}

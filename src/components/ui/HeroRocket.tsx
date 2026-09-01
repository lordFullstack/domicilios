import { motion } from "motion/react"
import { RocketIcon } from "../icons/RocketIcon"

/**
 * Animación de cohete "llegando" para la página principal (Hero).
 * Úsalo dentro de tu sección hero actual, por ejemplo:
 *
 *   <section className="relative h-64 overflow-hidden">
 *     <HeroRocket />
 *   </section>
 */
export function HeroRocket() {
  return (
    <div className="relative h-64 overflow-hidden flex items-center justify-center">
      <motion.div
        initial={{ x: "120%", y: "-40%", rotate: 45, opacity: 0 }}
        animate={{ x: "0%", y: "0%", rotate: 0, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <RocketIcon variant="premium" className="w-16 h-16 text-[#2F5EFF]" animate />
      </motion.div>

      {/* Estela sutil */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: [0, 0.5, 0], scaleX: 1 }}
        transition={{ duration: 1.4, delay: 0.2 }}
        className="absolute right-1/3 top-1/3 w-24 h-2 bg-[#2F5EFF]/30 rounded-full origin-right"
      />
    </div>
  )
}

export default HeroRocket

import { motion } from "motion/react"
import { RocketIcon, type RocketSize } from "./RocketIcon"

interface RocketSpinnerProps {
  size?: RocketSize // "xs" | "sm" | "md" | "lg" | "xl"
}

export function RocketSpinner({ size = "md" }: RocketSpinnerProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      style={{ display: "inline-flex" }}
    >
      <RocketIcon variant="tech" size={size} alt="Cargando" />
    </motion.div>
  )
}

export default RocketSpinner

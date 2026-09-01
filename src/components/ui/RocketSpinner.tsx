import { motion } from "motion/react"
import { RocketIcon } from "../icons/RocketIcon"

interface RocketSpinnerProps {
  size?: string // clases de tamaño Tailwind, ej: "w-8 h-8"
}

export function RocketSpinner({ size = "w-8 h-8" }: RocketSpinnerProps) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className={size}
    >
      <RocketIcon variant="tech" className="w-full h-full text-[#2F5EFF]" />
    </motion.div>
  )
}

export default RocketSpinner

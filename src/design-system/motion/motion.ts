export const motion = {
  duration: {
    instant: 0.1,
    fast:    0.2,
    base:    0.3,
    slow:    0.5,
    slower:  0.8,
  },
  ease: {
    out:    [0.16, 1, 0.3, 1] as const,
    in:     [0.7, 0, 0.84, 0] as const,
    inOut:  [0.65, 0, 0.35, 1] as const,
    bounce: [0.34, 1.56, 0.64, 1] as const,
  },
  spring: {
    soft:   { type: 'spring', stiffness: 200, damping: 25 } as const,
    snappy: { type: 'spring', stiffness: 400, damping: 30 } as const,
    bouncy: { type: 'spring', stiffness: 500, damping: 15 } as const,
  },
  transition: {
    press: { scale: 0.97, transition: { duration: 0.1 } },
    pageEnter: {
      initial: { opacity: 0, y: 8 },
      animate: { opacity: 1, y: 0 },
      exit:    { opacity: 0, y: -8 },
      transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
    },
    sheetUp: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit:    { y: '100%' },
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
  },
} as const
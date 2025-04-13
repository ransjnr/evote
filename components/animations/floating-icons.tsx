"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface FloatingIconProps {
  icon: ReactNode;
  x?: number;
  y?: number;
  delay?: number;
  size?: number;
  color?: string;
  opacity?: number;
}

export function FloatingIcon({
  icon,
  x = 0,
  y = 0,
  delay = 0,
  size = 24,
  color = "currentColor",
  opacity = 0.6,
}: FloatingIconProps) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        color,
        fontSize: size,
        opacity,
      }}
      initial={{ x, y, opacity: 0 }}
      animate={{
        x: [x, x + 10, x - 10, x],
        y: [y, y - 15, y - 30],
        opacity: [0, opacity, 0],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      }}
    >
      {icon}
    </motion.div>
  );
}

interface FloatingIconGroupProps {
  icons: ReactNode[];
  count?: number;
  widthRange?: [number, number];
  heightRange?: [number, number];
}

export function FloatingIconGroup({
  icons = [],
  count = 10,
  widthRange = [-300, 300],
  heightRange = [-100, 200],
}: FloatingIconGroupProps) {
  // Generate random icons with random positions
  const randomIcons = Array.from({ length: count }).map((_, i) => {
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    const randomX =
      Math.random() * (widthRange[1] - widthRange[0]) + widthRange[0];
    const randomY =
      Math.random() * (heightRange[1] - heightRange[0]) + heightRange[0];
    const randomDelay = Math.random() * 5;
    const randomSize = Math.floor(Math.random() * 16) + 16; // 16-32px
    const randomOpacity = Math.random() * 0.3 + 0.1; // 0.1-0.4

    return (
      <FloatingIcon
        key={i}
        icon={randomIcon}
        x={randomX}
        y={randomY}
        delay={randomDelay}
        size={randomSize}
        opacity={randomOpacity}
      />
    );
  });

  return <div className="absolute inset-0 overflow-hidden">{randomIcons}</div>;
}

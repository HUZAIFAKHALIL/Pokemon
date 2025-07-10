"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large"
  className?: string
  showGif?: boolean
}

export default function LoadingSpinner({ size = "medium", className = "", showGif = true }: LoadingSpinnerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-10 w-10",
    large: "h-16 w-16",
  }

  if (!mounted) {
    return (
      <div
        className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 ${sizeClasses[size]} ${className}`}
      />
    )
  }

  if (showGif) {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <Image
          src="/pokeball-loading.gif"
          alt="Loading..."
          width={size === "small" ? 24 : size === "medium" ? 40 : 64}
          height={size === "small" ? 24 : size === "medium" ? 40 : 64}
          className="w-full h-full object-contain"
          unoptimized={true}
        />
      </div>
    )
  }

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-500 ${sizeClasses[size]} ${className}`}
    />
  )
}

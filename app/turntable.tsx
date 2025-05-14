"use client"

import { useEffect, useRef } from "react"

export default function Turntable() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw turntable
    const drawTurntable = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw turntable base
      ctx.fillStyle = "#e0e0e0"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw record
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 3, 0, Math.PI * 2)
      ctx.fillStyle = "#000"
      ctx.fill()

      // Draw record center
      ctx.beginPath()
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 15, 0, Math.PI * 2)
      ctx.fillStyle = "#fff"
      ctx.fill()
    }

    drawTurntable()
  }, [])

  return (
    <div className="relative w-full aspect-square bg-gray-200 rounded-lg shadow-md">
      <canvas ref={canvasRef} width={400} height={400} className="w-full h-full" />
    </div>
  )
}

'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useDrop } from 'react-dnd'
import { DraggableItem } from './DraggableItem';
import { useElements } from '../context/ElementsContext';

interface Item {
  id: string
  type: string
  left: number
  top: number
  zIndex: number
}

interface DragItem extends Item {
  initialOffsetX: number
  initialOffsetY: number
}

const mergeElements = async (type1: string, type2: string) => {
  try {
    const response = await fetch(
      `https://corsproxy.io/?https://infiniteback.org/pair?first=${type1}&second=${type2}`
    )
    const data = await response.json()
    return {
      type: data.result.toLowerCase(),
      emoji: data.emoji
    }
  } catch (error) {
    console.error('Error merging elements:', error)
    return null
  }
}

const DropArea = () => {
  const [items, setItems] = useState<Item[]>([])
  const [maxZIndex, setMaxZIndex] = useState(0)
  const dropAreaRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Canvas animation logic
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width: number
    let height: number

    const dots: any[] = []
    const numDots = 150
    const dotSizeRange = { min: 1, max: 3 }
    const moveSpeed = 0.15

    class Dot {
      x: number
      y: number
      size: number
      vx: number
      vy: number
      opacity: number

      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.size = Math.random() * (dotSizeRange.max - dotSizeRange.min) + dotSizeRange.min
        this.vx = (Math.random() - 0.5) * moveSpeed
        this.vy = (Math.random() - 0.5) * moveSpeed
        this.opacity = Math.random() * 0.5 + 0.1
      }

      update() {
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > width) this.vx *= -1
        if (this.y < 0 || this.y > height) this.vy *= -1
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(200, 200, 200, ${this.opacity})`
        ctx.fill()
      }
    }

    function initDots() {
      const gridSize = Math.sqrt(numDots)
      const cellWidth = width / gridSize
      const cellHeight = height / gridSize

      for (let i = 0; i < numDots; i++) {
        const dot = new Dot()
        const gridX = i % gridSize
        const gridY = Math.floor(i / gridSize)
        
        dot.x = (gridX + Math.random()) * cellWidth
        dot.y = (gridY + Math.random()) * cellHeight
        
        dots.push(dot)
      }
    }

    function resizeCanvas() {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      dots.length = 0
      initDots()
    }

    function animate() {
      ctx.clearRect(0, 0, width, height)

      dots.forEach(dot => {
        dot.update()
        dot.draw()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    resizeCanvas()
    animate()

    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  const moveItem = useCallback((id: string, left: number, top: number) => {
    setItems((prevItems) => {
      const newZIndex = maxZIndex + 1
      setMaxZIndex(newZIndex)
      return prevItems.map((item) => 
        item.id === id ? { ...item, left, top, zIndex: newZIndex } : item
      )
    })
  }, [maxZIndex])

  const mergeItems = useCallback(async (item1: Item, item2: Item) => {
    const result = await mergeElements(item1.type, item2.type)
    if (result) {
      return {
        ...item1,
        type: result.type
      }
    }
    return item1
  }, [])

  const [, drop] = useDrop(() => ({
    accept: ['item', 'new-item'],
    drop: async (item: DragItem | { type: string; initialOffsetX: number; initialOffsetY: number }, monitor) => {
      const dropAreaRect = dropAreaRef.current?.getBoundingClientRect()
      if (!dropAreaRect) return

      const clientOffset = monitor.getClientOffset()
      if (!clientOffset) return

      const left = clientOffset.x - dropAreaRect.left - item.initialOffsetX
      const top = clientOffset.y - dropAreaRect.top - item.initialOffsetY

      if ('id' in item) {
        const targetItem = items.find(i => 
          i.id !== item.id &&
          Math.abs(i.left - left) < 50 && 
          Math.abs(i.top - top) < 50
        )

        if (targetItem) {
          const mergedItem = await mergeItems(item, targetItem)
          setItems(prevItems => {
            const filteredItems = prevItems.filter(i => i.id !== item.id && i.id !== targetItem.id)
            return [...filteredItems, {
              ...mergedItem,
              id: Date.now().toString(),
              left,
              top,
              zIndex: maxZIndex + 1
            }]
          })
          setMaxZIndex(prev => prev + 1)
        } else {
          moveItem(item.id, left, top)
        }
      } else {
        const newZIndex = maxZIndex + 1
        setMaxZIndex(newZIndex)
        const newItem: Item = {
          id: Date.now().toString(),
          type: item.type,
          left,
          top,
          zIndex: newZIndex,
        }

        const targetItem = items.find(i => 
          Math.abs(i.left - left) < 50 && 
          Math.abs(i.top - top) < 50
        )

        if (targetItem) {
          const mergedItem = await mergeItems(newItem, targetItem)
          setItems(prevItems => {
            const filteredItems = prevItems.filter(i => i.id !== targetItem.id)
            return [...filteredItems, {
              ...mergedItem,
              id: Date.now().toString(),
              left,
              top,
              zIndex: maxZIndex + 1
            }]
          })
          setMaxZIndex(prev => prev + 1)
        } else {
          setItems((prevItems) => [...prevItems, newItem])
        }
      }
    },
  }), [moveItem, maxZIndex, items, mergeItems])

  return (
    <div className="relative w-full h-full">
      <time dateTime="2016-10-25" suppressHydrationWarning />
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full bg-white"
        style={{ zIndex: -1 }}
      />
      <div 
        ref={(node) => {
          drop(node)
          dropAreaRef.current = node
        }} 
        className="w-full h-full relative bg-transparent"
      >
        {items.map((item) => (
          <DraggableItem 
            key={item.id} 
            id={item.id} 
            type={item.type}
            left={item.left} 
            top={item.top} 
            zIndex={item.zIndex}
            moveItem={moveItem} 
          />
        ))}
      </div>
    </div>
  )
}

export default DropArea
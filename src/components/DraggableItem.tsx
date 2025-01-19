'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { Button } from "@/components/ui/button"
import { roboto } from '../app/fonts'
import { useElements } from '../context/ElementsContext'

interface DraggableItemProps {
  id: string
  type: string
  left: number
  top: number
  zIndex: number
  moveItem: (id: string, left: number, top: number) => void
}

export const DraggableItem: React.FC<DraggableItemProps> = ({ id, type, left, top, zIndex, moveItem }) => {
  const ref = useRef<HTMLDivElement>(null)
  const { getElementContent } = useElements()
  const [shouldHide, setShouldHide] = useState(false)

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'item',
    item: (monitor) => {
      const initialOffset = monitor.getInitialClientOffset()
      const initialSourceClientOffset = monitor.getInitialSourceClientOffset()
      return { 
        id, 
        left, 
        top, 
        initialOffsetX: initialOffset ? initialOffset.x - initialSourceClientOffset!.x : 0,
        initialOffsetY: initialOffset ? initialOffset.y - initialSourceClientOffset!.y : 0
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [id, left, top])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isDragging) {
      timer = setTimeout(() => setShouldHide(true), 80) // 100ms delay
    } else {
      setShouldHide(false)
    }
    return () => clearTimeout(timer)
  }, [isDragging])

  drag(ref)

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        left,
        top,
        zIndex,
        cursor: 'move',
        opacity: shouldHide ? 0 : 1,
        touchAction: 'none',
      }}
    >
      <Button variant="outline" className={`px-3 ${roboto.className} transition-none`}>
        <span dangerouslySetInnerHTML={{ __html: getElementContent(type) }} />
      </Button>
    </div>
  )
}


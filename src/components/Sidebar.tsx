'use client'

import React, { useRef } from 'react'
import { useDrag } from 'react-dnd'
import { Button } from "@/components/ui/button"
import { roboto } from '../app/fonts'
import { useElements } from '../context/ElementsContext'

interface DraggableElementProps {
  type: string
  content: string
}

const DraggableElement: React.FC<DraggableElementProps> = ({ type, content }) => {
  const ref = useRef<HTMLDivElement>(null)

  const [, drag] = useDrag(() => ({
    type: 'new-item',
    item: (monitor) => {
      const initialOffset = monitor.getInitialClientOffset()
      const initialSourceClientOffset = monitor.getInitialSourceClientOffset()
      return { 
        type,
        initialOffsetX: initialOffset ? initialOffset.x - initialSourceClientOffset!.x : 0,
        initialOffsetY: initialOffset ? initialOffset.y - initialSourceClientOffset!.y : 0
      }
    }
  }))

  drag(ref)

  return (
    <div ref={ref}>
      <Button variant="outline" className={`px-3 ${roboto.className} transition-none`}>
        <span dangerouslySetInnerHTML={{ __html: content }} />
      </Button>
    </div>
  )
}

export const Sidebar: React.FC = () => {
  const { elements, getElementContent } = useElements()

  return (
    <div className="w-64 h-full bg-gray-100 p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Elements</h2>
      <div className="flex flex-wrap gap-2">
        {Array.from(elements.values()).map((element) => (
          <DraggableElement 
            key={element.type} 
            type={element.type} 
            content={getElementContent(element.type)} 
          />
        ))}
      </div>
    </div>
  )
}


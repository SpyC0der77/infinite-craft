'use client'

import React, { useRef, useState } from 'react'
import { useDrag } from 'react-dnd'
import { Button } from "@/components/ui/button"
import { roboto } from '../app/fonts'
import { useElements } from '../context/ElementsContext'
import { Input } from "@/components/ui/input"

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
  const [searchQuery, setSearchQuery] = useState('')

  const filteredElements = Array.from(elements.values()).filter(element => 
    getElementContent(element.type).toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-[350px] h-full flex flex-col fixed top-0 right-0 border-l-2 border-l-rgb(200,200,200)">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-wrap gap-2">
          {filteredElements.map((element) => (
            <DraggableElement 
              key={element.type} 
              type={element.type} 
              content={getElementContent(element.type)} 
            />
          ))}
        </div>
      </div>
      <div className="border-t">
        {/* <div className="flex w-full">
          <Button variant="ghost" className="w-1/2 rounded-none border-r">
            Discoveries
          </Button>
          <Button variant="ghost" className="w-1/2 rounded-none">
            Sort by Time
          </Button>
        </div> */}
        <Input 
          className="w-full px-4 py-3 rounded-none" 
          placeholder="Search..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  )
}
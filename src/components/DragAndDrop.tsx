'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { roboto } from '../app/fonts'
import { Sidebar } from './Sidebar'
import { ElementsProvider } from '../context/ElementsContext'

const DynamicDropArea = dynamic(() => import('./DropArea'), { ssr: false })

export const DragAndDrop: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ElementsProvider>
        <div className={`w-full h-screen flex ${roboto.className}`}>
          <div className="flex-1">
            <DynamicDropArea />
          </div>
          <Sidebar />
        </div>
      </ElementsProvider>
    </DndProvider>
  )
}


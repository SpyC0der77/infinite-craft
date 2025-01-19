'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface Element {
  type: string
  emoji: string
  text: string
}

interface ElementsContextType {
  elements: Map<string, Element>
  addElement: (type: string, emoji: string) => void
  getElementContent: (type: string) => string
}

const ElementsContext = createContext<ElementsContextType | undefined>(undefined)

export function ElementsProvider({ children }: { children: React.ReactNode }) {
  const [elements, setElements] = useState<Map<string, Element>>(new Map([
    ['water', { type: 'water', emoji: '💧', text: 'Water' }],
    ['fire', { type: 'fire', emoji: '🔥', text: 'Fire' }],
    ['earth', { type: 'earth', emoji: '🌿', text: 'Earth' }],
    ['air', { type: 'air', emoji: '💨', text: 'Air' }],
  ]))

  const addElement = useCallback((type: string, emoji: string) => {
    setElements(prev => {
      const newElements = new Map(prev)
      if (!newElements.has(type)) {
        newElements.set(type, { 
          type, 
          emoji, 
          text: type.charAt(0).toUpperCase() + type.slice(1) 
        })
      }
      return newElements
    })
  }, [])

  const getElementContent = useCallback((type: string) => {
    const element = Array.from(elements.values()).find(el => el.type === type)
    return element ? `${element.emoji} ${element.text}` : type
  }, [elements])

  return (
    <ElementsContext.Provider value={{ elements, addElement, getElementContent }}>
      {children}
    </ElementsContext.Provider>
  )
}

export function useElements() {
  const context = useContext(ElementsContext)
  if (context === undefined) {
    throw new Error('useElements must be used within a ElementsProvider')
  }
  return context
}


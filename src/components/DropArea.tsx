'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useDrop } from 'react-dnd'
import { DraggableItem } from './DraggableItem'
import { useElements } from '../context/ElementsContext'

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

const DropArea: React.FC = () => {
  const [items, setItems] = useState<Item[]>([])
  const [maxZIndex, setMaxZIndex] = useState(0)
  const dropAreaRef = useRef<HTMLDivElement>(null)
  const { addElement } = useElements()

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
      // Add the new element type to the sidebar
      addElement(result.type, result.emoji)
      return {
        ...item1,
        type: result.type
      }
    }
    return item1
  }, [addElement])

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
            // Remove both original items and add the merged item
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
            // Remove the original item and add the merged item
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
    <div 
      ref={(node) => {
        drop(node)
        dropAreaRef.current = node
      }} 
      className="w-full h-full relative bg-white"
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
  )
}

export default DropArea


'use client'

import { useEffect, useRef } from 'react'
import BookingItem from './booking-item'

interface BookingsListProps {
  confirmedBookings: any[]
}

const BookingList = ({ confirmedBookings }: BookingsListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    let isDown = false
    let startX: number
    let scrollLeft: number

    const handleMouseDown = (e: MouseEvent) => {
      isDown = true
      el.classList.add('cursor-grabbing')
      startX = e.pageX - el.offsetLeft
      scrollLeft = el.scrollLeft
    }

    const handleMouseLeave = () => {
      isDown = false
      el.classList.remove('cursor-grabbing')
    }

    const handleMouseUp = () => {
      isDown = false
      el.classList.remove('cursor-grabbing')
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDown) return
      e.preventDefault()
      const x = e.pageX - el.offsetLeft
      const walk = (x - startX) * 1.2 // velocidade de arraste
      el.scrollLeft = scrollLeft - walk
    }

    el.addEventListener('mousedown', handleMouseDown)
    el.addEventListener('mouseleave', handleMouseLeave)
    el.addEventListener('mouseup', handleMouseUp)
    el.addEventListener('mousemove', handleMouseMove)

    return () => {
      el.removeEventListener('mousedown', handleMouseDown)
      el.removeEventListener('mouseleave', handleMouseLeave)
      el.removeEventListener('mouseup', handleMouseUp)
      el.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  if (!confirmedBookings?.length) return null

  return (
    <>
      <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
        Agendamentos
      </h2>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto gap-3 cursor-grab select-none [&::-webkit-scrollbar]:hidden"
      >
        {confirmedBookings.map((booking) => (
          <BookingItem
            key={booking.id}
            booking={JSON.parse(JSON.stringify(booking))}
          />
        ))}
      </div>
    </>
  )
}

export default BookingList

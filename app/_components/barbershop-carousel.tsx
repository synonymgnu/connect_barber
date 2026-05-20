'use client'

import { useRef, useState, useEffect } from 'react'
import { Barbershop } from '../generated/prisma'
import BarbershopItem from './barbershop-item'
import ButtonIcon from './button-icon'

interface Props {
  title: string
  barbershops: Barbershop[]
}

export default function BarbershopCarousel({ title, barbershops }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)

  const isDown = useRef(false)
  const startX = useRef(0)
  const startScrollLeft = useRef(0)
  const moved = useRef(false)
  const velX = useRef(0)
  const lastX = useRef(0)
  const rafId = useRef<number>(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    function handleScroll() {
      const c = containerRef.current
      if (!c) return
      const { scrollLeft, scrollWidth, clientWidth } = c
      setShowLeft(scrollLeft > 0)
      setShowRight(scrollLeft + clientWidth < scrollWidth - 10)
    }

    function onMouseDown(e: MouseEvent) {
      if (e.button !== 0) return
      const c = containerRef.current!
      isDown.current = true
      moved.current = false
      velX.current = 0
      startX.current = e.pageX
      startScrollLeft.current = c.scrollLeft
      lastX.current = e.pageX
      c.style.cursor = 'grabbing'
      c.style.scrollBehavior = 'auto'
      cancelAnimationFrame(rafId.current)
      e.preventDefault()
    }

    function onMouseMove(e: MouseEvent) {
      if (!isDown.current) return
      const c = containerRef.current
      if (!c) return
      const dx = e.pageX - startX.current
      if (Math.abs(dx) > 4) moved.current = true
      velX.current = lastX.current - e.pageX
      lastX.current = e.pageX
      c.scrollLeft = startScrollLeft.current + (startX.current - e.pageX)
    }

    function onMouseUp() {
      if (!isDown.current) return
      const c = containerRef.current
      if (!c) return
      isDown.current = false
      c.style.cursor = 'grab'

      function momentum() {
        const el = containerRef.current
        if (!el) return
        if (Math.abs(velX.current) < 0.5) {
          el.style.scrollBehavior = 'smooth'
          return
        }
        el.scrollLeft += velX.current
        velX.current *= 0.92
        rafId.current = requestAnimationFrame(momentum)
      }
      momentum()
    }

    function onClick(e: MouseEvent) {
      if (moved.current) {
        e.preventDefault()
        e.stopPropagation()
        moved.current = false
      }
    }

    container.style.cursor = 'grab'
    container.addEventListener('scroll', handleScroll)
    container.addEventListener('mousedown', onMouseDown)
    container.addEventListener('click', onClick, true)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    handleScroll()

    return () => {
      container.removeEventListener('scroll', handleScroll)
      container.removeEventListener('mousedown', onMouseDown)
      container.removeEventListener('click', onClick, true)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      cancelAnimationFrame(rafId.current)
    }
  }, [])

  const scrollLeftFn = () => {
    const c = containerRef.current
    if (c) c.scrollBy({ left: -300, behavior: 'smooth' })
  }

  const scrollRightFn = () => {
    const c = containerRef.current
    if (c) c.scrollBy({ left: 300, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <h2 className="mb-3 text-xs font-bold uppercase text-gray-400">
        {title}
      </h2>

      <div className="relative">
        {showLeft && (
          <ButtonIcon
            direction="left"
            onClick={scrollLeftFn}
            className="left-0"
          />
        )}

        <div
          ref={containerRef}
          className="flex flex-nowrap gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden select-none"
        >
          {barbershops.map((barbershop: any) => (
            <div key={barbershop.id} className="flex-shrink-0">
              <BarbershopItem barbershop={barbershop} />
            </div>
          ))}
        </div>

        {showRight && (
          <ButtonIcon
            direction="right"
            onClick={scrollRightFn}
            className="right-0"
          />
        )}
      </div>
    </div>
  )
}

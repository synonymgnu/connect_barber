'use client'

import { useState, useMemo, useEffect } from 'react'
import BookingItem from './booking-item'
import BookingInfo from './booking-info'
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from './ui/drawer'
import { DateTimePicker } from './datetime-picker'

interface BookingsClientProps {
  confirmedBookings: any[]
  concludedBookings: any[]
}

type StatusFilter = 'CONFIRMED' | 'CONCLUDED' | 'ALL'

const PAGE_SIZE = 10
const LG_BREAKPOINT = 1024

export default function BookingsClient({
  confirmedBookings,
  concludedBookings,
}: BookingsClientProps) {
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined)
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined)
  const [currentPage, setCurrentPage] = useState(1)
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= LG_BREAKPOINT)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleBookingCanceled = () => setSelectedBooking(null)

  const allBookings = useMemo(() => {
    const confirmed = confirmedBookings.map((b) => ({
      ...b,
      _status: 'CONFIRMED',
    }))
    const concluded = concludedBookings.map((b) => ({
      ...b,
      _status: 'CONCLUDED',
    }))
    return [...confirmed, ...concluded].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [confirmedBookings, concludedBookings])

  const filtered = useMemo(() => {
    return allBookings.filter((booking) => {
      if (statusFilter !== 'ALL' && booking._status !== statusFilter)
        return false
      const bookingDate = new Date(
        booking.date instanceof Date ? booking.date : booking.date
      )
      if (dateFrom && bookingDate.getTime() < dateFrom.getTime()) return false
      if (dateTo && bookingDate.getTime() > dateTo.getTime()) return false
      return true
    })
  }, [allBookings, statusFilter, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  )

  const confirmedOnPage = paginated.filter((b) => b._status === 'CONFIRMED')
  const concludedOnPage = paginated.filter((b) => b._status === 'CONCLUDED')

  const hasActiveFilters = statusFilter !== 'ALL' || !!dateFrom || !!dateTo

  const clearFilters = () => {
    setStatusFilter('ALL')
    setDateFrom(undefined)
    setDateTo(undefined)
    setCurrentPage(1)
  }

  const applyAndClose = () => {
    setCurrentPage(1)
    setShowFilters(false)
  }

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'ALL', label: 'Todos' },
    { value: 'CONFIRMED', label: 'Confirmado' },
    { value: 'CONCLUDED', label: 'Finalizado' },
  ]

  // useInlinePicker=true no desktop: calendário expande inline (sem Popover),
  // permitindo scroll normal no Dialog sem conflito de overflow.
  // useInlinePicker=false no mobile: Popover normal dentro do Drawer.
  const FilterContent = ({
    useInlinePicker = false,
  }: {
    useInlinePicker?: boolean
  }) => (
    <div className="space-y-6 px-1">
      {/* Status */}
      <div>
        <p className="text-xs font-bold uppercase text-gray-400 mb-3">Status</p>
        <div className="grid grid-cols-3 gap-2">
          {statusOptions.map((opt) => (
            <Button
              key={opt.value}
              variant="outline"
              onClick={() => setStatusFilter(opt.value)}
              className={`text-sm font-medium transition-colors ${
                statusFilter === opt.value
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-primary'
                  : ''
              }`}
            >
              {opt.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Período com DateTimePicker */}
      <div>
        <p className="text-xs font-bold uppercase text-gray-400 mb-3">
          Período
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">De</label>
            <DateTimePicker
              value={dateFrom}
              onChange={setDateFrom}
              placeholder="Data e hora inicial"
              granularity="minute"
              inline={useInlinePicker}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Até</label>
            <DateTimePicker
              value={dateTo}
              onChange={setDateTo}
              placeholder="Data e hora final"
              granularity="minute"
              inline={useInlinePicker}
            />
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={clearFilters} className="flex-1">
          Limpar filtros
        </Button>
        <Button onClick={applyAndClose} className="flex-1">
          Aplicar filtros
        </Button>
      </div>
    </div>
  )

  return (
    <div className="md:flex md:gap-10">
      {/* Left column */}
      <div className="flex-1 space-y-3">
        {/* Filter bar */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-gray-400">
            Mostrando{' '}
            <span className="text-white font-medium">
              {filtered.length === 0
                ? '0'
                : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)}`}
            </span>{' '}
            de <span className="text-white font-medium">{filtered.length}</span>{' '}
            agendamentos
          </p>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(true)}
            className={`flex items-center gap-2 text-xs ${
              hasActiveFilters
                ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-primary'
                : ''
            }`}
          >
            <SlidersHorizontal size={13} />
            Filtros
            {hasActiveFilters && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px]">
                !
              </span>
            )}
          </Button>
        </div>

        {/* Bookings list */}
        {paginated.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">
            Nenhum agendamento encontrado.
          </p>
        ) : (
          <>
            {confirmedOnPage.length > 0 && (
              <>
                <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
                  Confirmados
                </h2>
                {confirmedOnPage.map((booking) => (
                  <div
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className="cursor-pointer"
                  >
                    <BookingItem booking={booking} />
                  </div>
                ))}
              </>
            )}
            {concludedOnPage.length > 0 && (
              <>
                <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
                  Finalizados
                </h2>
                {concludedOnPage.map((booking) => (
                  <div
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    className="cursor-pointer"
                  >
                    <BookingItem booking={booking} />
                  </div>
                ))}
              </>
            )}
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 pb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="flex items-center gap-1 text-xs"
            >
              <ChevronLeft size={13} />
              Anterior
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    variant={page === safePage ? 'default' : 'outline'}
                    className="h-7 w-7 p-0 text-xs"
                  >
                    {page}
                  </Button>
                )
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="flex items-center gap-1 text-xs"
            >
              Próximo
              <ChevronRight size={13} />
            </Button>
          </div>
        )}
      </div>

      {/* Desktop detail panel */}
      <div className="hidden md:block md:w-[400px]">
        {selectedBooking ? (
          <BookingInfo
            booking={selectedBooking}
            onBookingCanceled={handleBookingCanceled}
          />
        ) : (
          <p className="text-gray-400 mt-10">
            Selecione um agendamento para ver os detalhes.
          </p>
        )}
      </div>

      {/* Dialog (desktop) / Drawer (mobile) */}
      {isDesktop ? (
        <Dialog open={showFilters} onOpenChange={setShowFilters}>
          {/* inline=true: calendário expande dentro do Dialog → scroll funciona normalmente */}
          <DialogContent className="sm:max-w-md flex flex-col max-h-[90vh] overflow-y-auto">
            <DialogHeader className="shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-primary" />
                Filtros
              </DialogTitle>
            </DialogHeader>
            <FilterContent useInlinePicker={true} />
          </DialogContent>
        </Dialog>
      ) : (
        /* Drawer (mobile) — Popover normal, sem scroll */
        <Drawer open={showFilters} onOpenChange={setShowFilters}>
          <DrawerContent>
            <DrawerHeader className="flex items-center justify-between">
              <DrawerTitle className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-primary" />
                Filtros
              </DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X size={16} />
                </Button>
              </DrawerClose>
            </DrawerHeader>
            <div className="px-4 pb-8">
              <FilterContent useInlinePicker={false} />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  )
}

'use client'

import { Button, buttonVariants } from './ui/button'
import { Input } from './ui/input'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { cn } from '@/app/_lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { type Locale } from 'date-fns/locale'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { Clock } from 'lucide-react'
import * as React from 'react'
import { useImperativeHandle, useRef } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { DayPicker, DayPickerProps } from 'react-day-picker'

// ---------- utils ----------

function isValidHour(value: string) {
  return /^(0[0-9]|1[0-9]|2[0-3])$/.test(value)
}
function isValid12Hour(value: string) {
  return /^(0[1-9]|1[0-2])$/.test(value)
}
function isValidMinuteOrSecond(value: string) {
  return /^[0-5][0-9]$/.test(value)
}

type GetValidNumberConfig = { max: number; min?: number; loop?: boolean }
function getValidNumber(
  value: string,
  { max, min = 0, loop = false }: GetValidNumberConfig
) {
  let n = parseInt(value, 10)
  if (!Number.isNaN(n)) {
    if (!loop) {
      if (n > max) n = max
      if (n < min) n = min
    } else {
      if (n > max) n = min
      if (n < min) n = max
    }
    return n.toString().padStart(2, '0')
  }
  return '00'
}

function getValidHour(v: string) {
  return isValidHour(v) ? v : getValidNumber(v, { max: 23 })
}
function getValid12Hour(v: string) {
  return isValid12Hour(v) ? v : getValidNumber(v, { min: 1, max: 12 })
}
function getValidMinuteOrSecond(v: string) {
  return isValidMinuteOrSecond(v) ? v : getValidNumber(v, { max: 59 })
}

function getValidArrowNumber(
  v: string,
  { min, max, step }: { min: number; max: number; step: number }
) {
  const n = parseInt(v, 10)
  return Number.isNaN(n)
    ? '00'
    : getValidNumber(String(n + step), { min, max, loop: true })
}
function getValidArrowHour(v: string, step: number) {
  return getValidArrowNumber(v, { min: 0, max: 23, step })
}
function getValidArrow12Hour(v: string, step: number) {
  return getValidArrowNumber(v, { min: 1, max: 12, step })
}
function getValidArrowMinuteOrSecond(v: string, step: number) {
  return getValidArrowNumber(v, { min: 0, max: 59, step })
}

function setMinutes(date: Date, value: string) {
  date.setMinutes(parseInt(getValidMinuteOrSecond(value), 10))
  return date
}
function setSeconds(date: Date, value: string) {
  date.setSeconds(parseInt(getValidMinuteOrSecond(value), 10))
  return date
}
function setHours(date: Date, value: string) {
  date.setHours(parseInt(getValidHour(value), 10))
  return date
}
function set12Hours(date: Date, value: string, period: Period) {
  date.setHours(
    convert12HourTo24Hour(parseInt(getValid12Hour(value), 10), period)
  )
  return date
}

type TimePickerType = 'minutes' | 'seconds' | 'hours' | '12hours'
type Period = 'AM' | 'PM'

function setDateByType(
  date: Date,
  value: string,
  type: TimePickerType,
  period?: Period
) {
  switch (type) {
    case 'minutes':
      return setMinutes(date, value)
    case 'seconds':
      return setSeconds(date, value)
    case 'hours':
      return setHours(date, value)
    case '12hours':
      return period ? set12Hours(date, value, period) : date
    default:
      return date
  }
}

function getDateByType(date: Date | null, type: TimePickerType) {
  if (!date) return '00'
  switch (type) {
    case 'minutes':
      return getValidMinuteOrSecond(String(date.getMinutes()))
    case 'seconds':
      return getValidMinuteOrSecond(String(date.getSeconds()))
    case 'hours':
      return getValidHour(String(date.getHours()))
    case '12hours':
      return getValid12Hour(String(display12HourValue(date.getHours())))
    default:
      return '00'
  }
}

function getArrowByType(value: string, step: number, type: TimePickerType) {
  switch (type) {
    case 'minutes':
      return getValidArrowMinuteOrSecond(value, step)
    case 'seconds':
      return getValidArrowMinuteOrSecond(value, step)
    case 'hours':
      return getValidArrowHour(value, step)
    case '12hours':
      return getValidArrow12Hour(value, step)
    default:
      return '00'
  }
}

function convert12HourTo24Hour(hour: number, period: Period) {
  if (period === 'PM') return hour <= 11 ? hour + 12 : hour
  if (period === 'AM') return hour === 12 ? 0 : hour
  return hour
}

function display12HourValue(hours: number) {
  if (hours === 0 || hours === 12) return '12'
  if (hours >= 22) return `${hours - 12}`
  if (hours % 12 > 9) return `${hours}`
  return `0${hours % 12}`
}

function genMonths(
  locale: Pick<Locale, 'options' | 'localize' | 'formatLong'>
) {
  return Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: format(new Date(2021, i), 'MMMM', { locale }),
  }))
}

function genYears(yearRange = 50) {
  const today = new Date()
  return Array.from({ length: yearRange * 2 + 1 }, (_, i) => ({
    value: today.getFullYear() - yearRange + i,
    label: (today.getFullYear() - yearRange + i).toString(),
  }))
}

// ---------- Calendar ----------

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  yearRange = 50,
  ...props
}: DayPickerProps & { yearRange?: number }) {
  const MONTHS = React.useMemo(() => {
    let locale: Pick<Locale, 'options' | 'localize' | 'formatLong'> = ptBR
    const { options, localize, formatLong } = props.locale || {}
    if (options && localize && formatLong)
      locale = { options, localize, formatLong }
    return genMonths(locale)
  }, [])
  const YEARS = React.useMemo(() => genYears(yearRange), [])

  const disableLeft = () => {
    const start = new Date(new Date().getFullYear() - yearRange, 0, 1)
    return props.month
      ? props.month.getMonth() === start.getMonth() &&
          props.month.getFullYear() === start.getFullYear()
      : false
  }
  const disableRight = () => {
    const end = new Date(new Date().getFullYear() + yearRange, 11, 31)
    return props.month
      ? props.month.getMonth() === end.getMonth() &&
          props.month.getFullYear() === end.getFullYear()
      : false
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months:
          'flex flex-col sm:flex-row space-y-4 sm:space-y-0 justify-center',
        month: 'flex flex-col items-center space-y-4',
        month_caption: 'flex justify-center pt-1 relative items-center w-full',
        caption_label: 'text-sm font-medium',
        nav: 'hidden',
        button_previous: 'hidden',
        button_next: 'hidden',
        month_grid: 'w-full border-collapse space-y-1',
        weekdays: cn('flex', props.showWeekNumber && 'justify-end'),
        weekday:
          'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        week: 'flex w-full mt-2',
        day: 'h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-l-md rounded-r-md'
        ),
        selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-l-md rounded-r-md',
        today: 'bg-accent text-accent-foreground',
        outside: 'day-outside text-muted-foreground opacity-50',
        disabled: 'text-muted-foreground opacity-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ ...p }) =>
          p.orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
        MonthCaption: ({ calendarMonth }) => {
          const prevMonth = () => {
            const d = new Date(calendarMonth.date)
            d.setMonth(d.getMonth() - 1)
            props.onMonthChange?.(d)
          }
          const nextMonth = () => {
            const d = new Date(calendarMonth.date)
            d.setMonth(d.getMonth() + 1)
            props.onMonthChange?.(d)
          }
          return (
            <div className="inline-flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                disabled={disableLeft()}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                  disableLeft() && 'pointer-events-none opacity-20'
                )}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <Select
                defaultValue={calendarMonth.date.getMonth().toString()}
                onValueChange={(v) => {
                  const d = new Date(calendarMonth.date)
                  d.setMonth(parseInt(v, 10))
                  props.onMonthChange?.(d)
                }}
              >
                <SelectTrigger className="focus:bg-accent focus:text-accent-foreground w-fit gap-1 border-none p-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value.toString()}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                defaultValue={calendarMonth.date.getFullYear().toString()}
                onValueChange={(v) => {
                  const d = new Date(calendarMonth.date)
                  d.setFullYear(parseInt(v, 10))
                  props.onMonthChange?.(d)
                }}
              >
                <SelectTrigger className="focus:bg-accent focus:text-accent-foreground w-fit gap-1 border-none p-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y.value} value={y.value.toString()}>
                      {y.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <button
                type="button"
                onClick={nextMonth}
                disabled={disableRight()}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
                  disableRight() && 'pointer-events-none opacity-20'
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = 'Calendar'

// ---------- TimePeriodSelect ----------

interface PeriodSelectorProps {
  period: Period
  setPeriod?: (m: Period) => void
  date?: Date | null
  onDateChange?: (date: Date | undefined) => void
  onRightFocus?: () => void
  onLeftFocus?: () => void
}

const TimePeriodSelect = React.forwardRef<
  HTMLButtonElement,
  PeriodSelectorProps
>(
  (
    { period, setPeriod, date, onDateChange, onLeftFocus, onRightFocus },
    ref
  ) => (
    <div className="flex h-10 items-center">
      <Select
        defaultValue={period}
        onValueChange={(value: Period) => {
          setPeriod?.(value)
          if (date) {
            const tempDate = new Date(date)
            onDateChange?.(
              setDateByType(
                tempDate,
                display12HourValue(date.getHours()).toString(),
                '12hours',
                period === 'AM' ? 'PM' : 'AM'
              )
            )
          }
        }}
      >
        <SelectTrigger
          ref={ref}
          className="focus:bg-accent focus:text-accent-foreground w-[65px]"
          onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => {
            if (e.key === 'ArrowRight') onRightFocus?.()
            if (e.key === 'ArrowLeft') onLeftFocus?.()
          }}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
)
TimePeriodSelect.displayName = 'TimePeriodSelect'

// ---------- TimePickerInput ----------

interface TimePickerInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  picker: TimePickerType
  date?: Date | null
  onDateChange?: (date: Date | undefined) => void
  period?: Period
  onRightFocus?: () => void
  onLeftFocus?: () => void
}

const TimePickerInput = React.forwardRef<
  HTMLInputElement,
  TimePickerInputProps
>(
  (
    {
      className,
      type = 'tel',
      value,
      id,
      name,
      date = new Date(new Date().setHours(0, 0, 0, 0)),
      onDateChange,
      onChange,
      onKeyDown,
      picker,
      period,
      onLeftFocus,
      onRightFocus,
      ...props
    },
    ref
  ) => {
    const [flag, setFlag] = React.useState(false)
    const [prevIntKey, setPrevIntKey] = React.useState('0')
    React.useEffect(() => {
      if (flag) {
        const t = setTimeout(() => setFlag(false), 2000)
        return () => clearTimeout(t)
      }
    }, [flag])
    const calculatedValue = React.useMemo(
      () => getDateByType(date, picker),
      [date, picker]
    )
    const calculateNewValue = (key: string) => {
      if (
        picker === '12hours' &&
        flag &&
        calculatedValue.slice(1, 2) === '1' &&
        prevIntKey === '0'
      )
        return `0${key}`
      return !flag ? `0${key}` : calculatedValue.slice(1, 2) + key
    }
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Tab') return
      e.preventDefault()
      if (e.key === 'ArrowRight') onRightFocus?.()
      if (e.key === 'ArrowLeft') onLeftFocus?.()
      if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
        const newValue = getArrowByType(
          calculatedValue,
          e.key === 'ArrowUp' ? 1 : -1,
          picker
        )
        if (flag) setFlag(false)
        onDateChange?.(
          setDateByType(
            date ? new Date(date) : new Date(),
            newValue,
            picker,
            period
          )
        )
      }
      if (e.key >= '0' && e.key <= '9') {
        if (picker === '12hours') setPrevIntKey(e.key)
        const newValue = calculateNewValue(e.key)
        if (flag) onRightFocus?.()
        setFlag((prev) => !prev)
        onDateChange?.(
          setDateByType(
            date ? new Date(date) : new Date(),
            newValue,
            picker,
            period
          )
        )
      }
    }
    return (
      <Input
        ref={ref}
        id={id || picker}
        name={name || picker}
        type={type}
        inputMode="decimal"
        className={cn(
          'focus:bg-accent focus:text-accent-foreground w-[48px] text-center font-mono text-base tabular-nums caret-transparent [&::-webkit-inner-spin-button]:appearance-none',
          className
        )}
        value={value || calculatedValue}
        onChange={(e) => {
          e.preventDefault()
          onChange?.(e)
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          handleKeyDown(e)
        }}
        {...props}
      />
    )
  }
)
TimePickerInput.displayName = 'TimePickerInput'

// ---------- TimePicker ----------

interface TimePickerProps {
  date?: Date | null
  onChange?: (date: Date | undefined) => void
  hourCycle?: 12 | 24
  granularity?: Granularity
}
interface TimePickerRef {
  minuteRef: HTMLInputElement | null
  hourRef: HTMLInputElement | null
  secondRef: HTMLInputElement | null
}

const TimePicker = React.forwardRef<TimePickerRef, TimePickerProps>(
  ({ date, onChange, hourCycle = 24, granularity = 'second' }, ref) => {
    const minuteRef = React.useRef<HTMLInputElement>(null)
    const hourRef = React.useRef<HTMLInputElement>(null)
    const secondRef = React.useRef<HTMLInputElement>(null)
    const periodRef = React.useRef<HTMLButtonElement>(null)
    const [period, setPeriod] = React.useState<Period>(
      date && date.getHours() >= 12 ? 'PM' : 'AM'
    )
    useImperativeHandle(
      ref,
      () => ({
        minuteRef: minuteRef.current,
        hourRef: hourRef.current,
        secondRef: secondRef.current,
      }),
      [minuteRef, hourRef, secondRef]
    )
    return (
      <div className="flex items-center justify-center gap-2">
        <label htmlFor="datetime-picker-hour-input" className="cursor-pointer">
          <Clock className="mr-2 h-4 w-4" />
        </label>
        <TimePickerInput
          picker={hourCycle === 24 ? 'hours' : '12hours'}
          date={date}
          id="datetime-picker-hour-input"
          onDateChange={onChange}
          ref={hourRef}
          period={period}
          onRightFocus={() => minuteRef?.current?.focus()}
        />
        {(granularity === 'minute' || granularity === 'second') && (
          <>
            :
            <TimePickerInput
              picker="minutes"
              date={date}
              onDateChange={onChange}
              ref={minuteRef}
              onLeftFocus={() => hourRef?.current?.focus()}
              onRightFocus={() => secondRef?.current?.focus()}
            />
          </>
        )}
        {granularity === 'second' && (
          <>
            :
            <TimePickerInput
              picker="seconds"
              date={date}
              onDateChange={onChange}
              ref={secondRef}
              onLeftFocus={() => minuteRef?.current?.focus()}
              onRightFocus={() => periodRef?.current?.focus()}
            />
          </>
        )}
        {hourCycle === 12 && (
          <TimePeriodSelect
            period={period}
            setPeriod={setPeriod}
            date={date}
            onDateChange={(d) => {
              onChange?.(d)
              if (d) setPeriod(d.getHours() >= 12 ? 'PM' : 'AM')
            }}
            ref={periodRef}
            onLeftFocus={() => secondRef?.current?.focus()}
          />
        )}
      </div>
    )
  }
)
TimePicker.displayName = 'TimePicker'

// ---------- DateTimePicker ----------

type Granularity = 'day' | 'hour' | 'minute' | 'second'

type DateTimePickerProps = {
  value?: Date
  onChange?: (date: Date | undefined) => void
  disabled?: boolean
  hourCycle?: 12 | 24
  placeholder?: string
  yearRange?: number
  displayFormat?: { hour24?: string; hour12?: string }
  granularity?: Granularity
  className?: string
  defaultPopupValue?: Date
  /**
   * Quando true, o calendário expande inline abaixo do botão (sem Popover).
   * Use dentro de Dialog no desktop para evitar conflito com overflow/scroll.
   */
  inline?: boolean
} & Pick<
  DayPickerProps,
  'locale' | 'weekStartsOn' | 'showWeekNumber' | 'showOutsideDays'
>

type DateTimePickerRef = { value?: Date } & Omit<HTMLButtonElement, 'value'>

const DateTimePicker = React.forwardRef<
  Partial<DateTimePickerRef>,
  DateTimePickerProps
>(
  (
    {
      locale = ptBR,
      defaultPopupValue = new Date(new Date().setHours(0, 0, 0, 0)),
      value,
      onChange,
      hourCycle = 24,
      yearRange = 50,
      disabled = false,
      displayFormat,
      granularity = 'minute',
      placeholder = 'Selecionar data',
      className,
      inline = false,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    const [internalDate, setInternalDate] = React.useState<Date | undefined>(
      value
    )
    const [month, setMonth] = React.useState<Date>(value ?? defaultPopupValue)
    const buttonRef = useRef<HTMLButtonElement>(null)

    React.useEffect(() => {
      setInternalDate(value)
      if (value) setMonth(value)
    }, [value])

    const handleOpenChange = (next: boolean) => {
      if (!next) {
        setInternalDate(value)
        setMonth(value ?? defaultPopupValue)
      }
      setOpen(next)
    }

    const handleMonthChange = (newMonth: Date) => {
      setMonth(newMonth)
    }

    const handleDaySelect = (newDay: Date | undefined) => {
      if (!newDay) return
      newDay.setHours(
        internalDate?.getHours() ?? 0,
        internalDate?.getMinutes() ?? 0,
        internalDate?.getSeconds() ?? 0
      )
      setInternalDate(new Date(newDay))
      setMonth(new Date(newDay))
    }

    const handleTimeChange = (date: Date | undefined) => {
      setInternalDate(date ? new Date(date) : undefined)
      if (date) setMonth(new Date(date))
    }

    const handleConfirm = () => {
      onChange?.(internalDate)
      setOpen(false)
    }

    const handleClear = () => {
      setInternalDate(undefined)
      setMonth(defaultPopupValue)
      onChange?.(undefined)
      setOpen(false)
    }

    const handleClearButton = (e: React.MouseEvent) => {
      e.stopPropagation()
      onChange?.(undefined)
      setInternalDate(undefined)
      setMonth(defaultPopupValue)
    }

    useImperativeHandle(
      ref,
      () => ({ ...buttonRef.current, value: internalDate }),
      [internalDate]
    )

    const fmt = {
      hour24:
        displayFormat?.hour24 ??
        `dd/MM/yyyy HH:mm${granularity === 'second' ? ':ss' : ''}`,
      hour12:
        displayFormat?.hour12 ??
        `dd/MM/yyyy hh:mm${granularity === 'second' ? ':ss' : ''} b`,
    }

    let loc = ptBR
    const { options, localize, formatLong } = locale
    if (options && localize && formatLong)
      loc = { ...ptBR, options, localize, formatLong }

    // Painel do calendário (compartilhado entre inline e popover)
    const CalendarPanel = (
      <div className="rounded-md border border-border bg-popover text-popover-foreground shadow-md">
        <Calendar
          mode="single"
          selected={internalDate}
          month={month}
          onMonthChange={handleMonthChange}
          onSelect={handleDaySelect}
          yearRange={yearRange}
          locale={locale}
          {...props}
        />
        {granularity !== 'day' && (
          <div className="border-t border-border p-3">
            <TimePicker
              onChange={handleTimeChange}
              date={internalDate ?? month}
              hourCycle={hourCycle}
              granularity={granularity}
            />
          </div>
        )}
        <div className="border-t border-border flex gap-2 p-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleClear}
            type="button"
          >
            Limpar
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={handleConfirm}
            type="button"
          >
            Confirmar
          </Button>
        </div>
      </div>
    )

    // Botão trigger (compartilhado)
    const TriggerButton = (
      <Button
        ref={buttonRef}
        variant="outline"
        disabled={disabled}
        type="button"
        className={cn(
          'w-full justify-start text-left font-normal',
          !value && 'text-muted-foreground',
          className
        )}
        onClick={() => inline && setOpen((prev) => !prev)}
      >
        <CalendarIcon className="mr-2 h-4 w-4" />
        {value ? (
          format(value, hourCycle === 24 ? fmt.hour24 : fmt.hour12, {
            locale: loc,
          })
        ) : (
          <span>{placeholder}</span>
        )}
        {value && (
          <span
            role="button"
            className="ml-auto rounded-sm opacity-50 hover:opacity-100"
            onClick={handleClearButton}
          >
            <X className="h-4 w-4" />
          </span>
        )}
      </Button>
    )

    // ---------- Modo inline: expande abaixo do botão, sem Popover/portal ----------
    if (inline) {
      return (
        <div className="space-y-2">
          {TriggerButton}
          {open && CalendarPanel}
        </div>
      )
    }

    // ---------- Modo Popover (padrão, para uso fora de Dialog) ----------
    return (
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild disabled={disabled}>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground',
              className
            )}
            ref={buttonRef}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? (
              format(value, hourCycle === 24 ? fmt.hour24 : fmt.hour12, {
                locale: loc,
              })
            ) : (
              <span>{placeholder}</span>
            )}
            {value && (
              <span
                role="button"
                className="ml-auto rounded-sm opacity-50 hover:opacity-100"
                onClick={handleClearButton}
              >
                <X className="h-4 w-4" />
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="center"
          side="bottom"
          avoidCollisions
        >
          <Calendar
            mode="single"
            selected={internalDate}
            month={month}
            onMonthChange={handleMonthChange}
            onSelect={handleDaySelect}
            yearRange={yearRange}
            locale={locale}
            {...props}
          />
          {granularity !== 'day' && (
            <div className="border-border border-t p-3">
              <TimePicker
                onChange={handleTimeChange}
                date={internalDate ?? month}
                hourCycle={hourCycle}
                granularity={granularity}
              />
            </div>
          )}
          <div className="border-border border-t flex gap-2 p-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleClear}
            >
              Limpar
            </Button>
            <Button size="sm" className="flex-1" onClick={handleConfirm}>
              Confirmar
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    )
  }
)
DateTimePicker.displayName = 'DateTimePicker'

export { DateTimePicker, TimePickerInput, TimePicker }
export type { TimePickerType, DateTimePickerProps, DateTimePickerRef }

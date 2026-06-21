import { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import Button from "../ui/button";
import {
  buildCalendarMonthDays,
  countOpportunitiesOnDay,
  parseDateKey,
  todayDateKey,
} from "../../utils/dateUtils";
import "./CalendarFilter.css";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export { opportunityMatchesDateRange } from "../../utils/dateUtils";

export default function CalendarFilter({ opportunities, dateFrom, dateTo, onDateChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectingStart, setSelectingStart] = useState(null);
  const [popupStyle, setPopupStyle] = useState({});
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const popupRef = useRef(null);

  const calendarDays = useMemo(() => buildCalendarMonthDays(viewDate), [viewDate]);

  const opportunityCountsByDay = useMemo(() => {
    const counts = {};
    calendarDays.forEach((dayKey) => {
      if (dayKey) {
        counts[dayKey] = countOpportunitiesOnDay(dayKey, opportunities);
      }
    });
    return counts;
  }, [calendarDays, opportunities]);

  const hasActiveFilter = Boolean(dateFrom || dateTo);

  const updatePopupPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popupWidth = 320;
    const left = Math.max(8, Math.min(rect.right - popupWidth, window.innerWidth - popupWidth - 8));
    setPopupStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left,
      width: popupWidth,
      zIndex: 1000,
    });
  };

  const openCalendar = () => {
    setSelectingStart(null);
    setViewDate(new Date());
    setIsOpen(true);
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePopupPosition();
    window.addEventListener("resize", updatePopupPosition);
    window.addEventListener("scroll", updatePopupPosition, true);
    return () => {
      window.removeEventListener("resize", updatePopupPosition);
      window.removeEventListener("scroll", updatePopupPosition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      const clickedTrigger = containerRef.current?.contains(e.target);
      const clickedPopup = popupRef.current?.contains(e.target);
      if (!clickedTrigger && !clickedPopup) {
        setIsOpen(false);
        setSelectingStart(null);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSelectingStart(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const goToPrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDayClick = (dayKey) => {
    if (!selectingStart) {
      setSelectingStart(dayKey);
      return;
    }

    const start = selectingStart <= dayKey ? selectingStart : dayKey;
    const end = selectingStart <= dayKey ? dayKey : selectingStart;
    onDateChange(start, end);
    setSelectingStart(null);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onDateChange("", "");
    setSelectingStart(null);
  };

  const isInRange = (dayKey) => {
    if (!dayKey) return false;
    const start = dateFrom || selectingStart;
    const end = dateTo || (selectingStart && dayKey !== selectingStart ? null : selectingStart);
    if (!start) return false;
    const rangeEnd = end || start;
    return dayKey >= start && dayKey <= rangeEnd;
  };

  const isRangeStart = (dayKey) => {
    const start = selectingStart || dateFrom;
    return dayKey === start;
  };

  const isRangeEnd = (dayKey) => {
    const end = dateTo || (selectingStart && !dateFrom ? selectingStart : null);
    return dayKey === end;
  };

  const formatFilterLabel = () => {
    if (!dateFrom && !dateTo) return null;
    const fmt = (key) =>
      parseDateKey(key).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        timeZone: "UTC",
      });
    if (dateFrom === dateTo || !dateTo) return fmt(dateFrom || dateTo);
    return `${fmt(dateFrom)} – ${fmt(dateTo)}`;
  };

  return (
    <div className="calendar-filter" ref={containerRef}>
      <div ref={triggerRef} className="calendar-filter__actions">
        <Button
          variant={hasActiveFilter || isOpen ? "primary" : "outline"}
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
              setSelectingStart(null);
            } else {
              openCalendar();
            }
          }}
          className="status-button calendar-filter__button"
        >
          <Calendar size={18} />
          {hasActiveFilter && (
            <span className="calendar-filter__label">{formatFilterLabel()}</span>
          )}
        </Button>
        {hasActiveFilter && (
          <button
            type="button"
            className="calendar-filter__clear"
            onClick={handleClear}
            aria-label="Limpar filtro de data"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && createPortal(
        <div ref={popupRef} className="calendar-filter__popup" style={popupStyle} role="dialog" aria-label="Calendário de oportunidades">
          <div className="calendar-filter__header">
            <button type="button" className="calendar-filter__nav" onClick={goToPrevMonth} aria-label="Mês anterior">
              <ChevronLeft size={18} />
            </button>
            <span className="calendar-filter__month">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button type="button" className="calendar-filter__nav" onClick={goToNextMonth} aria-label="Próximo mês">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="calendar-filter__weekdays">
            {WEEKDAYS.map((day) => (
              <span key={day} className="calendar-filter__weekday">{day}</span>
            ))}
          </div>

          <div className="calendar-filter__grid">
            {calendarDays.map((dayKey, index) => {
              if (!dayKey) {
                return <span key={`empty-${index}`} className="calendar-filter__day calendar-filter__day--empty" />;
              }

              const opportunityCount = opportunityCountsByDay[dayKey] || 0;
              const inRange = isInRange(dayKey);
              const isStart = isRangeStart(dayKey);
              const isEnd = isRangeEnd(dayKey);
              const isToday = dayKey === todayDateKey();
              const dayNumber = parseDateKey(dayKey).getUTCDate();

              return (
                <button
                  key={dayKey}
                  type="button"
                  className={[
                    "calendar-filter__day",
                    opportunityCount > 0 && "calendar-filter__day--has-opportunity",
                    inRange && "calendar-filter__day--in-range",
                    isStart && "calendar-filter__day--range-start",
                    isEnd && "calendar-filter__day--range-end",
                    isToday && "calendar-filter__day--today",
                    selectingStart === dayKey && "calendar-filter__day--selecting",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleDayClick(dayKey)}
                >
                  <span className="calendar-filter__day-inner">
                    <span className="calendar-filter__day-number">{dayNumber}</span>
                    {opportunityCount > 0 && (
                      <span className="calendar-filter__count">{opportunityCount}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="calendar-filter__hint">
            {selectingStart
              ? "Selecione a data final do período"
              : "O número abaixo indica quantas oportunidades há no dia"}
          </p>
        </div>,
        document.body
      )}
    </div>
  );
}

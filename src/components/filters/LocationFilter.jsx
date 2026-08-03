import { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { MapPin, ChevronDown, X } from "lucide-react";
import Button from "../ui/button";
import {
  LOCATION_FILTER_ALL,
  collectLocationFilterOptions,
} from "../../utils/locationUtils";
import "./LocationFilter.css";

export default function LocationFilter({
  opportunities,
  selectedLocation,
  onLocationChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [popupStyle, setPopupStyle] = useState({});
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const popupRef = useRef(null);

  const options = useMemo(
    () => collectLocationFilterOptions(opportunities),
    [opportunities]
  );

  const hasActiveFilter = selectedLocation && selectedLocation !== LOCATION_FILTER_ALL;

  const updatePopupPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popupWidth = Math.min(280, window.innerWidth - 16);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - popupWidth - 8));
    setPopupStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left,
      width: popupWidth,
      zIndex: 1000,
    });
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
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (value) => {
    onLocationChange(value);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onLocationChange(LOCATION_FILTER_ALL);
  };

  const triggerLabel = hasActiveFilter ? selectedLocation : "Localização";

  return (
    <div className="location-filter" ref={containerRef}>
      <div ref={triggerRef} className="location-filter__actions">
        <Button
          variant={hasActiveFilter || isOpen ? "primary" : "outline"}
          onClick={() => setIsOpen((prev) => !prev)}
          className="status-button location-filter__button"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <MapPin size={18} />
          <span className="location-filter__label">{triggerLabel}</span>
          <ChevronDown
            size={16}
            className={`location-filter__chevron${isOpen ? " location-filter__chevron--open" : ""}`}
          />
        </Button>
        {hasActiveFilter && (
          <button
            type="button"
            className="location-filter__clear"
            onClick={handleClear}
            aria-label="Limpar filtro de localização"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen &&
        createPortal(
          <div
            ref={popupRef}
            className="location-filter__popup"
            style={popupStyle}
            role="listbox"
            aria-label="Filtrar por localização"
          >
            <ul className="location-filter__list">
              {options.map((option) => {
                const isSelected = option === selectedLocation;
                return (
                  <li key={option}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={[
                        "location-filter__option",
                        isSelected && "location-filter__option--selected",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => handleSelect(option)}
                    >
                      {option}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
}

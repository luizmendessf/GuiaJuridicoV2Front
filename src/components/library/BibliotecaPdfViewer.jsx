import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import "./BibliotecaPdfViewer.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const MAX_PAGE_WIDTH_PX = { compact: 720, expanded: 880 };
const PAGE_GAP_PX = 10;
const SCROLL_PADDING_PX = 12;
const SCROLL_ROOT_MARGIN = "280px 0px";
const SCROLL_VIEWPORT_FALLBACK = { compact: 680, expanded: 840 };
const SCROLL_VIEWPORT_VH = { compact: 0.68, expanded: 0.84 };

const MIN_ZOOM = 0.9;
const MAX_ZOOM = 1.4;
const ZOOM_STEP = 0.08;

export default function BibliotecaPdfViewer({ pdfUrl, title, className = "", variant = "compact" }) {
  const scrollRef = useRef(null);
  const pdfRef = useRef(null);
  const renderGenRef = useRef(0);
  const renderScaleRef = useRef(1);
  const pageBaseSizeRef = useRef({ width: 595, height: 842 });
  const pageSlotsRef = useRef(new Map());
  const renderTasksRef = useRef(new Map());
  const scrollRafRef = useRef(null);
  const statusRef = useRef("loading");

  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [zoom, setZoom] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showControls, setShowControls] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);
  const [renderEpoch, setRenderEpoch] = useState(0);
  const [scrollViewportHeight, setScrollViewportHeight] = useState(null);
  const prevZoomRef = useRef(1);
  const didMeasureScrollRef = useRef(false);

  const updateStatus = useCallback((next) => {
    statusRef.current = next;
    setStatus(next);
  }, []);

  const getMaxPageWidth = useCallback(() => {
    const cap = MAX_PAGE_WIDTH_PX[variant] ?? MAX_PAGE_WIDTH_PX.compact;
    const available = Math.min(cap, window.innerWidth - 40);
    return available - SCROLL_PADDING_PX * 2;
  }, [variant]);

  const getScrollInnerMaxHeight = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      const styles = getComputedStyle(el);
      const pad = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
      const inner = el.clientHeight - pad;
      if (inner > 120) return inner;
    }

    const ratio = SCROLL_VIEWPORT_VH[variant] ?? SCROLL_VIEWPORT_VH.compact;
    const outer = Math.min(
      window.innerHeight * ratio,
      SCROLL_VIEWPORT_FALLBACK[variant] ?? SCROLL_VIEWPORT_FALLBACK.compact
    );
    return outer - SCROLL_PADDING_PX * 2;
  }, [variant]);

  const computeRenderScale = useCallback(
    async (pdf, zoomMultiplier) => {
      const page = await pdf.getPage(1);
      const base = page.getViewport({ scale: 1 });
      pageBaseSizeRef.current = { width: base.width, height: base.height };

      const maxW = getMaxPageWidth();
      const maxH = getScrollInnerMaxHeight();
      const fitScale = Math.min(maxW / base.width, maxH / base.height) * zoomMultiplier;
      return fitScale;
    },
    [getMaxPageWidth, getScrollInnerMaxHeight]
  );

  const getEstimatedPageHeight = useCallback((scale) => {
    const { height } = pageBaseSizeRef.current;
    return Math.floor(height * scale);
  }, []);

  const cancelAllRenderTasks = useCallback(() => {
    renderTasksRef.current.forEach((task) => {
      try {
        task.cancel();
      } catch {
        /* ignore */
      }
    });
    renderTasksRef.current.clear();
  }, []);

  const clearAllSlots = useCallback(() => {
    pageSlotsRef.current.forEach((slot) => {
      slot.replaceChildren();
      delete slot.dataset.renderedGen;
    });
  }, []);

  const reapplyLayout = useCallback(async () => {
    const pdf = pdfRef.current;
    if (!pdf) return;

    const gen = ++renderGenRef.current;
    cancelAllRenderTasks();
    clearAllSlots();

    const scale = await computeRenderScale(pdf, zoom);
    if (gen !== renderGenRef.current) return;

    renderScaleRef.current = scale;
    const height = getEstimatedPageHeight(scale);
    setScrollViewportHeight(height + SCROLL_PADDING_PX * 2);
    pageSlotsRef.current.forEach((slot) => {
      slot.style.minHeight = `${height}px`;
      delete slot.dataset.renderedGen;
    });
    setRenderEpoch((e) => e + 1);
  }, [zoom, computeRenderScale, cancelAllRenderTasks, clearAllSlots, getEstimatedPageHeight]);

  const renderPageInSlot = useCallback(async (pageNum, gen) => {
    const pdf = pdfRef.current;
    const slot = pageSlotsRef.current.get(pageNum);
    const scale = renderScaleRef.current;
    if (!pdf || !slot || gen !== renderGenRef.current) return;
    if (slot.dataset.renderedGen === String(gen)) return;

    const existing = renderTasksRef.current.get(pageNum);
    if (existing) {
      try {
        existing.cancel();
      } catch {
        /* ignore */
      }
      renderTasksRef.current.delete(pageNum);
    }

    try {
      const page = await pdf.getPage(pageNum);
      if (gen !== renderGenRef.current) return;

      const viewport = page.getViewport({ scale });
      const w = Math.floor(viewport.width);
      const h = Math.floor(viewport.height);

      slot.style.minHeight = `${h}px`;

      const canvas = document.createElement("canvas");
      canvas.className = "biblioteca-pdf-page__canvas";
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");

      slot.replaceChildren(canvas);

      const task = page.render({ canvasContext: ctx, viewport });
      renderTasksRef.current.set(pageNum, task);
      await task.promise;

      if (gen !== renderGenRef.current) return;
      slot.dataset.renderedGen = String(gen);
    } catch (err) {
      if (gen !== renderGenRef.current) return;
      if (err?.name === "RenderingCancelledException") return;
      console.error(err);
    } finally {
      renderTasksRef.current.delete(pageNum);
    }
  }, []);

  const registerPageSlot = useCallback((pageNum, el) => {
    if (el) {
      pageSlotsRef.current.set(pageNum, el);
    } else {
      pageSlotsRef.current.delete(pageNum);
    }
  }, []);

  const updateCurrentPageFromScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container || !numPages) return;

    const containerRect = container.getBoundingClientRect();
    const mid = containerRect.top + containerRect.height * 0.35;
    let closest = 1;
    let closestDist = Infinity;

    pageSlotsRef.current.forEach((slot, pageNum) => {
      const rect = slot.getBoundingClientRect();
      const pageMid = rect.top + rect.height / 2;
      const dist = Math.abs(pageMid - mid);
      if (dist < closestDist) {
        closestDist = dist;
        closest = pageNum;
      }
    });

    setCurrentPage(closest);
  }, [numPages]);

  useEffect(() => {
    if (!pdfUrl) return;

    let cancelled = false;
    const gen = ++renderGenRef.current;

    updateStatus("loading");
    setErrorMessage("");
    setZoom(1);
    setCurrentPage(1);
    setNumPages(0);
    setLayoutReady(false);
    setScrollViewportHeight(null);
    didMeasureScrollRef.current = false;
    prevZoomRef.current = 1;
    pdfRef.current = null;
    cancelAllRenderTasks();
    clearAllSlots();

    const load = async () => {
      try {
        const pdf = await pdfjsLib.getDocument({ url: pdfUrl, withCredentials: false }).promise;
        if (cancelled || gen !== renderGenRef.current) return;

        pdfRef.current = pdf;
        const scale = await computeRenderScale(pdf, 1);
        if (cancelled || gen !== renderGenRef.current) return;

        renderScaleRef.current = scale;
        setScrollViewportHeight(getEstimatedPageHeight(scale) + SCROLL_PADDING_PX * 2);
        setNumPages(pdf.numPages);
        setLayoutReady(true);
        updateStatus("ready");
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setErrorMessage("Não foi possível carregar o PDF.");
        updateStatus("error");
      }
    };

    load();
    return () => {
      cancelled = true;
      renderGenRef.current += 1;
      pdfRef.current = null;
      cancelAllRenderTasks();
    };
  }, [pdfUrl, computeRenderScale, updateStatus, cancelAllRenderTasks, clearAllSlots, getEstimatedPageHeight]);

  useEffect(() => {
    if (status !== "ready" || !layoutReady || didMeasureScrollRef.current) return;

    const measure = () => {
      didMeasureScrollRef.current = true;
      reapplyLayout();
    };

    const rafId = requestAnimationFrame(() => requestAnimationFrame(measure));
    return () => cancelAnimationFrame(rafId);
  }, [status, layoutReady, reapplyLayout]);

  useEffect(() => {
    if (statusRef.current !== "ready" || !pdfRef.current) return;
    if (prevZoomRef.current === zoom) return;
    prevZoomRef.current = zoom;
    reapplyLayout();
  }, [zoom, reapplyLayout]);

  useEffect(() => {
    if (status !== "ready" || !layoutReady || numPages === 0) return;

    const root = scrollRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const pageNum = Number(entry.target.getAttribute("data-page"));
          if (pageNum) renderPageInSlot(pageNum, renderGenRef.current);
        });
      },
      { root, rootMargin: SCROLL_ROOT_MARGIN, threshold: 0.01 }
    );

    const observeAll = () => {
      pageSlotsRef.current.forEach((slot) => observer.observe(slot));
      renderPageInSlot(1, renderGenRef.current);
    };

    const rafId = requestAnimationFrame(observeAll);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [status, layoutReady, numPages, renderEpoch, renderPageInSlot]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || status !== "ready") return;

    const onScroll = () => {
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
      scrollRafRef.current = requestAnimationFrame(updateCurrentPageFromScroll);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    updateCurrentPageFromScroll();
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (scrollRafRef.current) cancelAnimationFrame(scrollRafRef.current);
    };
  }, [status, numPages, layoutReady, updateCurrentPageFromScroll]);

  useEffect(() => {
    if (status !== "ready") return;

    let debounceId;
    const onResize = () => {
      clearTimeout(debounceId);
      debounceId = window.setTimeout(reapplyLayout, 200);
    };

    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(debounceId);
      window.removeEventListener("resize", onResize);
    };
  }, [status, reapplyLayout]);

  const scrollToPage = useCallback((pageNum) => {
    const slot = pageSlotsRef.current.get(pageNum);
    const container = scrollRef.current;
    if (!slot || !container) return;

    const top =
      slot.getBoundingClientRect().top - container.getBoundingClientRect().top + container.scrollTop;
    container.scrollTo({ top: Math.max(0, top - 8), behavior: "smooth" });
    setCurrentPage(pageNum);
  }, []);

  const goPrev = useCallback(() => {
    scrollToPage(Math.max(1, currentPage - 1));
  }, [currentPage, scrollToPage]);

  const goNext = useCallback(() => {
    scrollToPage(Math.min(numPages || currentPage, currentPage + 1));
  }, [currentPage, numPages, scrollToPage]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (statusRef.current !== "ready") return;
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goPrev, goNext]);

  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)));
  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)));

  const variantClass = variant === "expanded" ? "biblioteca-pdf-viewer--expanded" : "biblioteca-pdf-viewer--compact";
  const estimatedHeight = layoutReady ? getEstimatedPageHeight(renderScaleRef.current) : 400;
  const pageNumbers = layoutReady ? Array.from({ length: numPages }, (_, i) => i + 1) : [];

  return (
    <div className={`biblioteca-pdf-viewer ${variantClass} ${className}`.trim()} aria-label={title}>
      <div className="biblioteca-pdf-viewer__chrome">
        <div className="biblioteca-pdf-viewer__pager">
          <button
            type="button"
            className="biblioteca-pdf-viewer__pager-btn"
            onClick={goPrev}
            disabled={status !== "ready" || currentPage <= 1}
            aria-label="Página anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="biblioteca-pdf-viewer__pager-label">
            Página {currentPage} de {numPages || "—"}
          </span>
          <button
            type="button"
            className="biblioteca-pdf-viewer__pager-btn"
            onClick={goNext}
            disabled={status !== "ready" || currentPage >= numPages}
            aria-label="Próxima página"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <button
          type="button"
          className="biblioteca-pdf-viewer__toggle-controls"
          onClick={() => setShowControls((v) => !v)}
          aria-expanded={showControls}
        >
          {showControls ? "Ocultar zoom" : "Zoom"}
        </button>
        {showControls && (
          <div className="biblioteca-pdf-viewer__zoom" role="group" aria-label="Zoom do PDF">
            <button type="button" onClick={zoomOut} disabled={status !== "ready"} aria-label="Diminuir zoom">
              <ZoomOut size={16} />
            </button>
            <span className="biblioteca-pdf-viewer__zoom-label">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={zoomIn} disabled={status !== "ready"} aria-label="Aumentar zoom">
              <ZoomIn size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="biblioteca-pdf-viewer__stage">
        {status === "error" && (
          <div className="biblioteca-pdf-viewer__state biblioteca-pdf-viewer__state--error">{errorMessage}</div>
        )}

        {status === "loading" && (
          <div className="biblioteca-pdf-viewer__scroll biblioteca-pdf-viewer__scroll--loading">
            <Loader2 className="biblioteca-pdf-viewer__spinner" size={28} aria-hidden />
            <span>Carregando documento...</span>
          </div>
        )}

        {status === "ready" && layoutReady && (
          <div
            ref={scrollRef}
            className="biblioteca-pdf-viewer__scroll"
            role="region"
            aria-label="Documento PDF com rolagem contínua"
            tabIndex={0}
            style={
              scrollViewportHeight
                ? { "--scroll-viewport-height": `${scrollViewportHeight}px` }
                : undefined
            }
          >
            <div className="biblioteca-pdf-viewer__pages" style={{ gap: `${PAGE_GAP_PX}px` }}>
              {pageNumbers.map((pageNum) => (
                <div
                  key={pageNum}
                  ref={(el) => registerPageSlot(pageNum, el)}
                  className="biblioteca-pdf-page-slot"
                  data-page={pageNum}
                  style={{ minHeight: estimatedHeight }}
                  aria-label={`Página ${pageNum}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

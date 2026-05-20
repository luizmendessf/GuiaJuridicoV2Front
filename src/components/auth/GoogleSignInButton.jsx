import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";
const GOOGLE_BTN_MAX_WIDTH = 400;

export function isGoogleSignInEnabled() {
  return Boolean(GOOGLE_CLIENT_ID);
}

export default function GoogleSignInButton({ onSuccess, onError }) {
  const containerRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(320);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const w = Math.floor(el.getBoundingClientRect().width);
      setButtonWidth(Math.min(GOOGLE_BTN_MAX_WIDTH, Math.max(w, 200)));
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (!isGoogleSignInEnabled()) {
    return null;
  }

  return (
    <div ref={containerRef} className="auth-google">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        text="continue_with"
        locale="pt_BR"
        size="large"
        width={buttonWidth}
        useOneTap={false}
      />
    </div>
  );
}

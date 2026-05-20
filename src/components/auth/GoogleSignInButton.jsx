import { GoogleLogin } from "@react-oauth/google";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";

export function isGoogleSignInEnabled() {
  return Boolean(GOOGLE_CLIENT_ID);
}

export default function GoogleSignInButton({ onSuccess, onError, disabled }) {
  if (!isGoogleSignInEnabled()) {
    return null;
  }

  return (
    <div className="auth-google">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
        text="continue_with"
        locale="pt_BR"
        size="large"
        width="100%"
        useOneTap={false}
      />
    </div>
  );
}

export const MIN_PASSWORD_LENGTH = 6;

export const expiredLinkMessage = "This link is invalid or has expired. Try again.";

export type AuthField = "email" | "password" | "confirmPassword" | "name";

export type MappedAuthError = {
  field?: AuthField;
  message: string;
};

export function formString(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

export function clearFieldError<T extends Record<string, string | undefined>>(
  errors: T,
  name: string,
): T {
  if (!errors[name as keyof T]) {
    return errors;
  }

  return { ...errors, [name]: undefined };
}

export function emailError(email: string) {
  if (!email) {
    return "Enter your email.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "Enter a valid email.";
  }
}

export function nameError(name: string) {
  if (!name) {
    return "Enter your full name.";
  }
}

export function passwordError(password: string) {
  if (!password) {
    return "Enter a password.";
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
}

export function confirmPasswordError(password: string, confirmPassword: string) {
  if (!confirmPassword) {
    return "Confirm your password.";
  }

  if (confirmPassword !== password) {
    return "Passwords do not match.";
  }
}

export function authRedirectTo(next: "/home" | "/reset-password") {
  return `${window.location.origin}/auth/callback?next=${next}`;
}

export function isExistingAccountError(error: { message: string; code?: string }) {
  const message = error.message.toLowerCase();
  const code = error.code?.toLowerCase() ?? "";
  return (
    code === "user_already_exists" ||
    message.includes("already registered") ||
    message.includes("user already exists")
  );
}

export function isRateLimitError(error: { message: string; code?: string }) {
  const message = error.message.toLowerCase();
  const code = error.code?.toLowerCase() ?? "";
  return code.includes("rate_limit") || message.includes("rate limit") || message.includes("over_email_send_rate_limit");
}

export function mapAuthError(error: { message: string; code?: string }): MappedAuthError {
  const message = error.message.toLowerCase();
  const code = error.code?.toLowerCase() ?? "";
  const withPeriod = error.message.endsWith(".") ? error.message : `${error.message}.`;

  if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return { message: "Email or password is incorrect." };
  }

  if (isExistingAccountError(error)) {
    return { field: "email", message: "An account with this email already exists." };
  }

  if (code === "weak_password" || message.includes("weak password") || message.includes("password should be")) {
    return { field: "password", message: withPeriod };
  }

  if (
    code === "otp_expired" ||
    code.includes("expired") ||
    message.includes("expired") ||
    message.includes("invalid or has expired")
  ) {
    return { field: "email", message: expiredLinkMessage };
  }

  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return { field: "email", message: "Confirm your email before signing in." };
  }

  if (isRateLimitError(error)) {
    return { field: "email", message: "Too many attempts. Try again in a few minutes." };
  }

  if (
    code === "provider_disabled" ||
    code.includes("unsupported_provider") ||
    message.includes("provider is not enabled") ||
    message.includes("unsupported provider")
  ) {
    return { message: "Google sign-in is not available. Try email instead." };
  }

  if (message.includes("same password") || message.includes("different from the old password")) {
    return { field: "password", message: "Choose a password you have not used before." };
  }

  if (code.includes("session") || message.includes("session") || message.includes("not authenticated")) {
    return { field: "password", message: expiredLinkMessage };
  }

  if (message.includes("password")) {
    return { field: "password", message: withPeriod };
  }

  return { message: "Something went wrong. Please try again." };
}

export function fieldFromAuthError(
  error: { message: string; code?: string },
  fallback: AuthField,
) {
  const mapped = mapAuthError(error);
  return {
    field: mapped.field ?? fallback,
    message: mapped.message,
  };
}

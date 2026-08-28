"use client";

import { useEffect, useState, type ChangeEvent, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";

import { AuthError } from "@/components/auth/auth-error";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogConfirmActions } from "@/components/ui/dialog";
import { ChevronRightIcon, UserIcon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Text } from "@/components/ui/text";
import {
  fieldFromAuthError,
  formString,
  nameError,
  passwordError,
} from "@/lib/auth/validation";
import { saveFullName } from "@/lib/onboarding/store";
import { createClient } from "@/lib/supabase/client";

const fieldLabelClass = "type-overline text-foreground-muted";

function initialsFromUser(name: string, email: string | null) {
  const words = name.trim().split(/\s+/).filter((part) => part.length > 0);
  if (words.length >= 2 && name !== email) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  const source = words[0] && words[0].toLowerCase() !== "there" ? words[0] : (email ?? "PP");
  return source.slice(0, 2).toUpperCase();
}

export function ProfilePage({
  name,
  email,
  avatarUrl,
  roleLabel,
  memberSince,
}: {
  name: string;
  email: string | null;
  avatarUrl?: string;
  roleLabel?: string;
  memberSince?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [fullName, setFullName] = useState(name);
  const [namePending, setNamePending] = useState(false);
  const [nameHint, setNameHint] = useState<string>();
  const [nameSuccess, setNameSuccess] = useState<string>();
  const [passwordPending, setPasswordPending] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string>();
  const [passwordFormError, setPasswordFormError] = useState<string>();
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
  }>({});
  const initials = initialsFromUser(name, email);

  useEffect(() => {
    setFullName(name);
  }, [name]);

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setFullName(event.currentTarget.value);
    setNameHint(undefined);
    setNameSuccess(undefined);
  }

  function cancelEditing() {
    setFullName(name);
    setNameHint(undefined);
    setEditing(false);
  }

  async function handleNameSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = fullName.trim();
    const nextError = nameError(nextName);
    setNameHint(nextError);
    setNameSuccess(undefined);

    if (nextError) {
      return;
    }

    setNamePending(true);

    try {
      const supabase = createClient();
      await saveFullName(supabase, nextName);

      if (nextName !== name) {
        const { error } = await supabase.auth.updateUser({
          data: { full_name: nextName, name: nextName },
        });

        if (error) {
          setNameHint(fieldFromAuthError(error, "name").message);
          return;
        }
      }

      setEditing(false);
      setNameSuccess("Name updated.");
      router.refresh();
    } catch {
      setNameHint("Something went wrong. Please try again.");
    } finally {
      setNamePending(false);
    }
  }

  function handlePasswordChange(event: ChangeEvent<HTMLFormElement>) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.name) {
      return;
    }

    setPasswordFormError(undefined);
    setPasswordSuccess(undefined);
    setPasswordErrors((current) => ({ ...current, [target.name]: undefined }));
  }

  async function handlePasswordSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const currentPassword = formString(data, "currentPassword");
    const newPassword = formString(data, "newPassword");

    const nextErrors = {
      currentPassword: currentPassword ? undefined : "Enter your current password.",
      newPassword: passwordError(newPassword),
    };

    if (newPassword && currentPassword && newPassword === currentPassword) {
      nextErrors.newPassword = "Choose a password you have not used before.";
    }

    setPasswordErrors(nextErrors);
    setPasswordFormError(undefined);
    setPasswordSuccess(undefined);

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    if (!email) {
      setPasswordFormError("Password can't be changed for this account.");
      return;
    }

    setPasswordPending(true);

    try {
      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (verifyError) {
        setPasswordErrors({ currentPassword: "Current password is incorrect." });
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        const mapped = fieldFromAuthError(error, "password");
        setPasswordErrors({ newPassword: mapped.message });
        return;
      }

      form.reset();
      setPasswordSuccess("Password updated.");
    } catch {
      setPasswordFormError("Something went wrong. Please try again.");
    } finally {
      setPasswordPending(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <Text as="h1" variant="pageTitle">
          Profile
        </Text>
        <Text variant="description" className="mt-2">
          Customize your experience.
        </Text>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(16rem,20rem)_1fr]">
        <Card className="flex h-full flex-col items-center text-center">
          <Avatar
            src={avatarUrl}
            alt=""
            initials={initials}
            size="2xl"
            className="ring-2 ring-primary ring-offset-2 ring-offset-surface"
          />
          <Text as="h2" variant="cardTitle" className="mt-4">
            {name}
          </Text>
          {email ? (
            <Text variant="caption" className="mt-1">
              {email}
            </Text>
          ) : null}
          {roleLabel ? (
            <Badge tone="primary" look="outline" size="md" className="mt-3 bg-background-subtle">
              {roleLabel}
            </Badge>
          ) : null}
          <div className="mt-auto flex w-full flex-col gap-2 pt-8 text-left">
            {memberSince ? (
              <div className="flex items-center gap-2 text-foreground-muted">
                <UserIcon size={16} />
                <Text variant="caption">Member since {memberSince}</Text>
              </div>
            ) : null}
          </div>
        </Card>

        <Card>
          <form className="flex flex-col gap-4" noValidate onSubmit={handleNameSubmit}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <Text as="h2" variant="sectionTitle">
                Account Information
              </Text>
              {editing ? (
                <div className="flex flex-wrap gap-2">
                  <Button look="outline" size="sm" disabled={namePending} onClick={cancelEditing}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" loading={namePending}>
                    Save
                  </Button>
                </div>
              ) : (
                <Button look="outline" size="sm" onClick={() => setEditing(true)}>
                  Edit Details
                </Button>
              )}
            </div>
            <Input
              label="Full name"
              labelClassName={fieldLabelClass}
              name="name"
              autoComplete="name"
              value={fullName}
              disabled={!editing || namePending}
              state={nameHint ? "error" : "default"}
              hint={nameHint}
              onChange={handleNameChange}
            />
            <Input
              label="Email address"
              labelClassName={fieldLabelClass}
              type="email"
              defaultValue={email ?? ""}
              disabled
              autoComplete="email"
            />
            {nameSuccess ? (
              <Text variant="caption" className="text-success-foreground" role="status">
                {nameSuccess}
              </Text>
            ) : null}
          </form>
        </Card>
      </div>

      <Card>
        <Text as="h2" variant="sectionTitle">
          Change Password
        </Text>
        <form
          className="mt-6 flex flex-col gap-4"
          noValidate
          onChange={handlePasswordChange}
          onSubmit={handlePasswordSubmit}
        >
          <PasswordInput
            label="Current password"
            labelClassName={fieldLabelClass}
            name="currentPassword"
            autoComplete="current-password"
            disabled={passwordPending}
            state={passwordErrors.currentPassword ? "error" : "default"}
            hint={passwordErrors.currentPassword}
          />
          <PasswordInput
            label="New password"
            labelClassName={fieldLabelClass}
            name="newPassword"
            autoComplete="new-password"
            disabled={passwordPending}
            state={passwordErrors.newPassword ? "error" : "default"}
            hint={passwordErrors.newPassword}
          />
          <AuthError message={passwordFormError} />
          {passwordSuccess ? (
            <Text variant="caption" className="text-success-foreground" role="status">
              {passwordSuccess}
            </Text>
          ) : null}
          <div>
            <Button type="submit" loading={passwordPending}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <Text as="h2" variant="sectionTitle">
          Data & Privacy
        </Text>
        <button
          type="button"
          className="-mx-2 mt-6 flex w-full items-center justify-between gap-4 rounded-sm p-2 text-left hover:bg-background-subtle"
          onClick={() => setClearOpen(true)}
        >
          <span className="flex min-w-0 flex-col gap-1">
            <Text variant="label" className="text-error">
              Clear data
            </Text>
            <Text variant="caption">
              Permanently delete all logs, streaks, and account configurations. This cannot be undone.
            </Text>
          </span>
          <ChevronRightIcon className="shrink-0 text-foreground-muted" />
        </button>
      </Card>

      <Dialog
        open={clearOpen}
        onOpenChange={setClearOpen}
        title="Clear data?"
        description="Permanently delete all logs, streaks, and account configurations. This cannot be undone."
      >
        <DialogConfirmActions
          danger
          confirmLabel="Clear data"
          onCancel={() => setClearOpen(false)}
          onConfirm={() => setClearOpen(false)}
        />
      </Dialog>
    </div>
  );
}

"use client";

import { useRef, useState, type ChangeEvent, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";

import { AvatarCropDialog } from "@/components/app/avatar-crop-dialog";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogConfirmActions } from "@/components/ui/dialog";
import { CameraIcon, ChevronRightIcon, UserIcon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { ToastRegion, useToasts } from "@/components/ui/toast-region";
import { deleteOwnAccount } from "@/lib/auth/account";
import {
  AVATAR_ACCEPT,
  avatarActionError,
  avatarFileError,
  removeAvatar,
  uploadAvatar,
} from "@/lib/auth/avatar";
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
  roleLabels,
  memberSince,
}: {
  name: string;
  email: string | null;
  avatarUrl?: string;
  roleLabels?: string[];
  memberSince?: string;
}) {
  const router = useRouter();
  const { toasts, showToast } = useToasts();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearPending, setClearPending] = useState(false);
  const [fullName, setFullName] = useState(name);
  const [savedName, setSavedName] = useState(name);
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [cropSource, setCropSource] = useState<{ url: string; revoke: boolean }>();
  const [brokenPhotoUrl, setBrokenPhotoUrl] = useState<string>();
  const [avatarPending, setAvatarPending] = useState(false);
  const [namePending, setNamePending] = useState(false);
  const [nameHint, setNameHint] = useState<string>();
  const [passwordPending, setPasswordPending] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
  }>({});
  if (name !== savedName) {
    setSavedName(name);
    setFullName(name);
  }
  const initials = initialsFromUser(name, email);
  const displayedAvatarUrl = previewUrl !== undefined ? previewUrl : avatarUrl;
  const photoUrl = displayedAvatarUrl?.trim() || undefined;
  const hasPhoto = Boolean(photoUrl) && photoUrl !== brokenPhotoUrl;

  function openAvatarPicker() {
    avatarInputRef.current?.click();
  }

  function closeCrop() {
    if (cropSource?.revoke) {
      URL.revokeObjectURL(cropSource.url);
    }
    setCropSource(undefined);
  }

  function openAvatarEditor() {
    if (!hasPhoto || !photoUrl) {
      openAvatarPicker();
      return;
    }

    setCropSource({ url: photoUrl, revoke: false });
  }

  function handleCropMediaError() {
    closeCrop();
  }

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";

    if (!file) {
      return;
    }

    const nextError = avatarFileError(file);
    if (nextError) {
      showToast(nextError, "error");
      return;
    }

    const url = URL.createObjectURL(file);
    if (cropSource?.revoke) {
      URL.revokeObjectURL(cropSource.url);
    }
    setCropSource({ url, revoke: true });
  }

  async function handleCropSave(blob: Blob) {
    setAvatarPending(true);

    try {
      const supabase = createClient();
      const nextUrl = await uploadAvatar(supabase, blob);
      if (cropSource?.revoke) {
        URL.revokeObjectURL(cropSource.url);
      }
      setCropSource(undefined);
      setPreviewUrl(nextUrl);
      showToast("Photo updated.");
      router.refresh();
    } catch (error) {
      throw new Error(avatarActionError(error, "Couldn't update photo. Please try again."));
    } finally {
      setAvatarPending(false);
    }
  }

  async function handleAvatarRemove() {
    if (!hasPhoto) {
      closeCrop();
      return;
    }

    setAvatarPending(true);

    try {
      const supabase = createClient();
      await removeAvatar(supabase);
      closeCrop();
      setPreviewUrl("");
      showToast("Photo removed.");
      router.refresh();
    } catch (error) {
      showToast(avatarActionError(error, "Couldn't remove photo. Please try again."), "error");
    } finally {
      setAvatarPending(false);
    }
  }

  async function handleClearData() {
    setClearPending(true);

    try {
      const supabase = createClient();
      await deleteOwnAccount(supabase);
      router.replace("/login");
      router.refresh();
    } catch {
      showToast("Couldn't clear data. Please try again.", "error");
    } finally {
      setClearPending(false);
    }
  }

  function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
    setFullName(event.currentTarget.value);
    setNameHint(undefined);
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
      showToast("Name updated.");
      router.refresh();
    } catch {
      showToast("Something went wrong. Please try again.", "error");
    } finally {
      setNamePending(false);
    }
  }

  function handlePasswordChange(event: ChangeEvent<HTMLFormElement>) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement) || !target.name) {
      return;
    }

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

    if (Object.values(nextErrors).some(Boolean)) {
      return;
    }

    if (!email) {
      showToast("Password can't be changed for this account.", "error");
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
      showToast("Password updated.");
    } catch {
      showToast("Something went wrong. Please try again.", "error");
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
          <input
            ref={avatarInputRef}
            type="file"
            accept={AVATAR_ACCEPT}
            tabIndex={-1}
            aria-hidden
            className="sr-only"
            disabled={avatarPending}
            onChange={handleAvatarChange}
          />
          <button
            type="button"
            aria-label={hasPhoto ? "Edit profile photo" : "Upload profile photo"}
            disabled={avatarPending}
            className="relative rounded-full outline-offset-4 disabled:cursor-not-allowed"
            onClick={openAvatarEditor}
          >
            <Avatar
              src={hasPhoto ? photoUrl : undefined}
              alt=""
              initials={initials}
              size="2xl"
              className="ring-2 ring-primary ring-offset-2 ring-offset-surface"
              onImageLoad={() => setBrokenPhotoUrl(undefined)}
              onImageError={() => {
                if (photoUrl) {
                  setBrokenPhotoUrl(photoUrl);
                }
              }}
            />
            <span
              aria-hidden
              className="absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-surface"
            >
              {avatarPending ? <Spinner size={14} label="Updating photo" /> : <CameraIcon size={14} />}
            </span>
          </button>
          <Text as="h2" variant="cardTitle" className="mt-4">
            {name}
          </Text>
          {email ? (
            <Text variant="caption" className="mt-1">
              {email}
            </Text>
          ) : null}
          {roleLabels && roleLabels.length > 0 ? (
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {roleLabels.map((label) => (
                <Badge key={label} tone="primary" look="outline" size="md" className="bg-background-subtle">
                  {label}
                </Badge>
              ))}
            </div>
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
              Permanently delete all triggers, data, and account configurations. This cannot be undone.
            </Text>
          </span>
          <ChevronRightIcon className="shrink-0 text-foreground-muted" />
        </button>
      </Card>

      <Dialog
        open={clearOpen}
        onOpenChange={(open) => {
          if (!clearPending) {
            setClearOpen(open);
          }
        }}
        title="Clear data?"
        description="Permanently delete all triggers, data, and account configurations. This cannot be undone."
      >
        <DialogConfirmActions
          danger
          pending={clearPending}
          confirmLabel="Clear data"
          onCancel={() => setClearOpen(false)}
          onConfirm={handleClearData}
        />
      </Dialog>
      <AvatarCropDialog
        imageSrc={cropSource?.url}
        pending={avatarPending}
        canManagePhoto={hasPhoto}
        onOpenChange={(open) => {
          if (!open) {
            closeCrop();
          }
        }}
        onReplace={openAvatarPicker}
        onMediaError={handleCropMediaError}
        onRemove={handleAvatarRemove}
        onSave={handleCropSave}
      />
      <ToastRegion toasts={toasts} />
    </div>
  );
}

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/lib/supabase/database";

type Client = SupabaseClient<Database>;

export const AVATAR_BUCKET = "avatars";
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024;
export const AVATAR_ACCEPT = "image/jpeg,image/png,image/webp";

const AVATAR_OBJECT = "avatar.jpg";
const ALLOWED_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const OUTPUT_SIZE = 512;
const OUTPUT_TYPE = "image/jpeg";
const OUTPUT_QUALITY = 0.86;

export function avatarObjectPath(userId: string) {
  return `${userId}/${AVATAR_OBJECT}`;
}

export function avatarActionError(error: unknown, fallback: string) {
  const message = errorMessage(error);
  if (
    message === "Use a JPG, PNG, or WebP image." ||
    message === "Image must be 2 MB or smaller."
  ) {
    return message;
  }

  const lower = message.toLowerCase();
  if (
    lower.includes("bucket") ||
    lower.includes("avatar_url") ||
    lower.includes("schema cache")
  ) {
    return "Photo storage isn't ready yet.";
  }

  return fallback;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return "";
}

export function avatarFileError(file: File) {
  const type = file.type.toLowerCase();
  const allowedType = ALLOWED_TYPES.has(type) || /\.(jpe?g|png|webp)$/i.test(file.name);

  if (!allowedType) {
    return "Use a JPG, PNG, or WebP image.";
  }

  if (file.size > AVATAR_MAX_BYTES) {
    return "Image must be 2 MB or smaller.";
  }
}

export async function uploadAvatar(supabase: Client, blob: Blob) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not signed in");
  }

  const path = avatarObjectPath(user.id);
  const { error: uploadError } = await supabase.storage.from(AVATAR_BUCKET).upload(path, blob, {
    upsert: true,
    contentType: blob.type || OUTPUT_TYPE,
    cacheControl: "3600",
  });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const publicUrl = `${data.publicUrl}?v=${Date.now()}`;

  await persistAvatarUrl(supabase, user.id, publicUrl);

  const { error: metaError } = await supabase.auth.updateUser({
    data: { avatar_url: publicUrl },
  });

  if (metaError) {
    throw metaError;
  }

  return publicUrl;
}

export async function removeAvatar(supabase: Client) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not signed in");
  }

  const path = avatarObjectPath(user.id);
  await persistAvatarUrl(supabase, user.id, "");

  const { error: metaError } = await supabase.auth.updateUser({
    data: { avatar_url: "" },
  });

  if (metaError) {
    throw metaError;
  }

  await supabase.storage.from(AVATAR_BUCKET).remove([path]);
}

async function persistAvatarUrl(supabase: Client, userId: string, avatarUrl: string) {
  const { error } = await supabase.from("user_data").upsert({
    user_id: userId,
    avatar_url: avatarUrl,
  });

  if (error) {
    throw error;
  }
}

export type CropArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export async function cropImageToAvatar(imageSrc: string, area: CropArea) {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_SIZE;
  canvas.height = OUTPUT_SIZE;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Couldn't crop this photo.");
  }

  context.drawImage(
    image,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE,
  );

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, OUTPUT_TYPE, OUTPUT_QUALITY);
  });

  if (!blob) {
    throw new Error("Couldn't crop this photo.");
  }

  return blob;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    if (!src.startsWith("blob:")) {
      image.crossOrigin = "anonymous";
    }
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Couldn't load this photo.")));
    image.src = src;
  });
}

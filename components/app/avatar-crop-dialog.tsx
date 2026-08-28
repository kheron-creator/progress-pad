"use client";

import { useRef, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";

import { Button } from "@/components/ui/button";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { cropImageToAvatar } from "@/lib/auth/avatar";

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

type AvatarCropDialogProps = {
  imageSrc?: string;
  pending?: boolean;
  canManagePhoto?: boolean;
  onOpenChange: (open: boolean) => void;
  onReplace: () => void;
  onMediaError?: () => void;
  onRemove: () => void | Promise<void>;
  onSave: (blob: Blob) => Promise<void>;
};

export function AvatarCropDialog({
  imageSrc,
  pending = false,
  canManagePhoto = false,
  onOpenChange,
  onReplace,
  onMediaError,
  onRemove,
  onSave,
}: AvatarCropDialogProps) {
  return (
    <Dialog
      open={Boolean(imageSrc)}
      onOpenChange={(open) => {
        if (!pending) {
          onOpenChange(open);
        }
      }}
      title="Adjust photo"
      description="Drag to reposition, and use the slider to zoom."
      className="overflow-hidden"
    >
      {imageSrc ? (
        <AvatarCropEditor
          key={imageSrc}
          imageSrc={imageSrc}
          pending={pending}
          canManagePhoto={canManagePhoto}
          onRemove={onRemove}
          onReplace={onReplace}
          onMediaError={onMediaError}
          onSave={onSave}
        />
      ) : null}
    </Dialog>
  );
}

function AvatarCropEditor({
  imageSrc,
  pending,
  canManagePhoto,
  onRemove,
  onReplace,
  onMediaError,
  onSave,
}: {
  imageSrc: string;
  pending: boolean;
  canManagePhoto: boolean;
  onRemove: () => void | Promise<void>;
  onReplace: () => void;
  onMediaError?: () => void;
  onSave: (blob: Blob) => Promise<void>;
}) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [hint, setHint] = useState<string>();
  const [imageReady, setImageReady] = useState(false);
  const areaRef = useRef<Area | null>(null);

  async function handleSave() {
    const area = areaRef.current;
    if (!area) {
      setHint("Move or zoom the photo, then save.");
      return;
    }

    setHint(undefined);

    try {
      const blob = await cropImageToAvatar(imageSrc, area);
      await onSave(blob);
    } catch (error) {
      setHint(error instanceof Error ? error.message : "Couldn't crop this photo.");
    }
  }

  return (
    <>
      <div className="relative h-72 w-full overflow-hidden rounded-md bg-background-subtle">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          roundCropAreaPixels
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_area, pixels) => {
            areaRef.current = pixels;
          }}
          onMediaLoaded={() => setImageReady(true)}
          mediaProps={{
            ...(imageSrc.startsWith("blob:") ? {} : { crossOrigin: "anonymous" as const }),
            onError: () => onMediaError?.(),
          }}
        />
        {pending ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-overlay">
            <Spinner size={24} label="Saving photo" />
          </div>
        ) : null}
      </div>
      {imageReady ? (
        <Field className="mt-4">
          <FieldLabel htmlFor="avatar-zoom">Zoom</FieldLabel>
          <input
            id="avatar-zoom"
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.05}
            value={zoom}
            disabled={pending}
            className="w-full accent-primary"
            onChange={(event) => setZoom(Number(event.currentTarget.value))}
          />
        </Field>
      ) : null}
      {hint ? (
        <Text variant="caption" className="mt-2 text-error" role="alert">
          {hint}
        </Text>
      ) : null}
      <DialogActions>
        {canManagePhoto ? (
          <>
            <Button variant="danger" look="outline" disabled={pending} onClick={onRemove}>
              Remove photo
            </Button>
            <Button look="outline" disabled={pending} onClick={onReplace}>
              Replace photo
            </Button>
          </>
        ) : null}
        <Button loading={pending} disabled={!imageReady} onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </>
  );
}

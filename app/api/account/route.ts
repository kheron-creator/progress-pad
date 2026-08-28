import { NextResponse } from "next/server";

import { deleteSignedInAccount } from "@/lib/auth/delete-account";

export async function DELETE() {
  try {
    await deleteSignedInAccount();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === "unauthorized") {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

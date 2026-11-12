import { deleteMicroSprint, listMicroSprints, saveMicroSprint } from "@/lib/micro-sprints/store";
import { errorMessage, routeUser } from "@/lib/micro-sprints/route-user";

export const dynamic = "force-dynamic";

const unauthorized = () => Response.json({ error: "Sign in to see your micro sprints." }, { status: 401 });

export async function GET() {
  const user = await routeUser();
  if (!user) {
    return unauthorized();
  }

  try {
    return Response.json({ docs: await listMicroSprints(user.supabase) });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await routeUser();
  if (!user) {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as { id?: unknown; data?: unknown };
    await saveMicroSprint(user.supabase, user.userId, body.id, body.data);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const user = await routeUser();
  if (!user) {
    return unauthorized();
  }

  try {
    await deleteMicroSprint(user.supabase, new URL(request.url).searchParams.get("id"));
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: errorMessage(error) }, { status: 400 });
  }
}

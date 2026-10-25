import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

import { bearerToken, verifyMcpToken } from "@/lib/mcp/auth";
import { protectedResourceMetadataUrl } from "@/lib/mcp/metadata";
import { createProgressPadServer } from "@/lib/mcp/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function unauthorized(request: Request, error = "invalid_token") {
  return Response.json(
    { error, error_description: "Sign in to Progress Pad to use this connector." },
    {
      status: 401,
      headers: {
        "WWW-Authenticate": `Bearer error="${error}", resource_metadata="${protectedResourceMetadataUrl(request)}"`,
      },
    },
  );
}

async function handle(request: Request) {
  const token = bearerToken(request);
  if (!token) {
    return unauthorized(request, "invalid_request");
  }

  const user = await verifyMcpToken(token);
  if (!user) {
    return unauthorized(request);
  }

  // Stateless: each request gets its own server and transport, which suits serverless.
  const server = createProgressPadServer(user);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  await server.connect(transport);

  try {
    return await transport.handleRequest(request, {
      authInfo: {
        token: user.token,
        clientId: user.clientId,
        scopes: [],
        expiresAt: user.expiresAt,
        extra: { userId: user.userId },
      },
    });
  } finally {
    void server.close();
  }
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;

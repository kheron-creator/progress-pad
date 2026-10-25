import { authorizationServerUrl } from "@/lib/mcp/auth";

export const MCP_PATH = "/mcp";

function origin(request: Request) {
  return new URL(request.url).origin;
}

export function protectedResourceMetadataUrl(request: Request) {
  return `${origin(request)}/.well-known/oauth-protected-resource${MCP_PATH}`;
}

/** RFC 9728 metadata telling MCP clients to sign in through Supabase Auth's OAuth server. */
export function protectedResourceMetadata(request: Request) {
  return {
    resource: `${origin(request)}${MCP_PATH}`,
    authorization_servers: [authorizationServerUrl()],
    bearer_methods_supported: ["header"],
    resource_name: "Progress Pad",
  };
}

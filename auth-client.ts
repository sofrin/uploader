import { createAuthClient } from "better-auth/client";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";
import type { auth } from "./auth.ts";

export const authClient = createAuthClient({
	baseURL: "http://localhost:3000",
	plugins: [inferAdditionalFields<typeof auth>(), adminClient()],
});
export const { signIn, signUp, useSession } = createAuthClient();

import { httpRouter } from "convex/server";

const http = httpRouter();

http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: async (req) => {
    // Handle Clerk webhooks
    return new Response("OK", { status: 200 });
  },
});

export default http;

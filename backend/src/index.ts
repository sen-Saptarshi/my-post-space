import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { userRouter } from "./routes/user";
import { blogRouter } from "./routes/blog";

export const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
  Variables: {
    prisma: PrismaClient & ReturnType<typeof withAccelerate>;
  };
}>();

// server running
app.get("/", (c) => {
  return c.json({ status: "Server is running!!" });
});

// set prisma client as context
app.use("*", async (c, next) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate()) as unknown as PrismaClient &
    ReturnType<typeof withAccelerate>;

  c.set("prisma", prisma);
  await next();
});

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);

export default app;

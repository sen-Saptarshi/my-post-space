///api/v1/user
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign, verify } from "hono/jwt";
import { hashPassword, verifyPassword } from "../utils/hashing";

import { sigininInput, signupInput } from "@saptarshisen/common";

export const userRouter = new Hono<{
  Bindings: {
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
    prisma: PrismaClient & ReturnType<typeof withAccelerate>;
  };
}>();

userRouter.post("/signup", async (c) => {
  const prisma = c.get("prisma");

  const body = await c.req.json();

  const { success } = signupInput.safeParse(body);
  if (!success) {
    c.status(400);
    return c.json({ error: "invalid input" });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (existingUser) {
    c.status(400);
    return c.json({ error: "user already exists" });
  }

  try {
    const hashedPassword = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
      },
    });

    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwt });
  } catch (e) {
    c.status(500);
    console.log(e);
    return c.json({ error: "Internal Server Error" });
  }
});

userRouter.post("/signin", async (c) => {
  const prisma = c.get("prisma");
  const body = await c.req.json();

  const { success } = sigininInput.safeParse(body);
  if (!success) {
    c.status(400);
    return c.json({ error: "invalid input" });
  }

  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  });

  if (!user) {
    c.status(403);
    return c.json({ error: "user not found" });
  }

  const isValidPassword = await verifyPassword(user.password, body.password);

  if (!isValidPassword) {
    c.status(403);
    return c.json({ error: "invalid password" });
  }

  const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);

  return c.json({ jwt });
});

userRouter.use("/users/*", async (c, next) => {
  const jwt = c.req.header("Authorization");
  if (!jwt) {
    c.status(401);
    return c.json({ error: "unauthorized" });
  }
  const token = jwt.split(" ")[1];
  const payload = await verify(token, c.env.JWT_SECRET);

  if (!payload) {
    c.status(401);
    return c.json({ error: "unauthorized" });
  }

  if (typeof payload.id === "string") {
    c.set("userId", payload.id);
  } else {
    c.status(400);
    return c.json({ error: "Invalid token payload" });
  }
  await next();
});

userRouter.get("/users/:id", async (c) => {
  const prisma = c.get("prisma");
  const id = c.req.param("id");

  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      email: true,
      name: true,
    },
  });

  if (!user) {
    c.status(404);
    return c.json({ error: "user not found" });
  }

  return c.json(user);
});

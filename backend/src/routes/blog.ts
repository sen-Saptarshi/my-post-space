import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { createPostInput, updatePostInput } from "@saptarshisen/common";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
    prisma: PrismaClient & ReturnType<typeof withAccelerate>;
  };
}>();

// middleware
blogRouter.use("/*", async (c, next) => {
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

// create post
blogRouter.post("/", async (c) => {
  const userId = c.get("userId");
  const prisma = c.get("prisma");

  const body = await c.req.json();

  const { success } = createPostInput.safeParse(body);
  if (!success) {
    c.status(400);
    c.json({ error: "invalid input" });
  }

  if (!body.title && !body.content) {
    c.status(400);
    return c.json({ error: "Both title and content can't be empty" });
  }

  try {
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        published: body.published ?? false,
        authorId: userId,
      },
    });

    return c.json({
      id: post.id,
    });
  } catch (e) {
    c.status(400);
    return c.json({ error: "Could not create post" });
  }
});

// update post
blogRouter.put("/", async (c) => {
  const userId = c.get("userId");
  const prisma = c.get("prisma");

  const body = await c.req.json();
  const { success } = updatePostInput.safeParse(body);
  if (!success) {
    c.status(400);
    return c.json({ error: "invalid input" });
  }

  try {
    await prisma.post.update({
      where: {
        id: body.id,
        authorId: userId,
      },
      data: {
        title: body.title,
        content: body.content,
        published: body.published,
      },
    });

    return c.text("updated post");
  } catch (e) {
    c.status(400);
    return c.json({ error: "Could not update post" });
  }
});

// get a blog
blogRouter.post("/:id", async (c) => {
  const id = c.req.param("id");
  if (!id) {
    c.status(400);
    return c.json({ error: "invalid id" });
  }

  const prisma = c.get("prisma");
  const userId = c.get("userId");

  const post = await prisma.post.findFirst({
    where: {
      id,
      OR: [
        { authorId: userId },
        { published: true },
      ],
    },
  });

  if (!post) {
    c.status(404);
    return c.json({ error: "post not found" });
  }

  try {
    const postWithAuthor = await prisma.post.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        published: true,
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
    if (!postWithAuthor) {
      c.status(500);
      return c.json({ error: "No posts found" });
    }
    return c.json(postWithAuthor);
  } catch (e) {
    c.status(500);
    return c.json({ error: "Internal server error" });
  }
});

// get all public posts
blogRouter.get("/bulk", async (c) => {
  const prisma = c.get("prisma");
  const userId = c.get("userId");
  const [publicPosts, userPosts] = await Promise.all([
    prisma.post.findMany({
      where: {
        published: true,
      },
      select: {
        id: true,
        title: true,
        published: true,
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.post.findMany({
      where: {
        authorId: userId,
      },
      select: {
        id: true,
        title: true,
        published: true,
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);
  return c.json({ publicPosts, userPosts });
});

// delete post
blogRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const userId = c.get("userId");
  const prisma = c.get("prisma");
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      c.status(404);
      return c.json({ error: "Post not found" });
    }

    if (post.authorId !== userId) {
      c.status(403);
      return c.json({ error: "You are not allowed to delete this post" });
    }

    await prisma.post.delete({
      where: {
        id,
      },
    });
    return c.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    c.status(500);
    return c.json({ error: "Internal server error" });
  }
});

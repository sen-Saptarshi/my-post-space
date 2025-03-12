import z from "zod";

export const signupInput = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(3).optional(),
});

export type SignupType = z.infer<typeof signupInput> 

export const sigininInput = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type SigninType = z.infer<typeof sigininInput>

export const createPostInput = z.object({
  title: z.string(),
  content: z.string().min(3),
  published: z.boolean().optional(),
});

export type CreatePostType = z.infer<typeof createPostInput>

export const updatePostInput = z.object({
    title: z.string().optional(),
    content: z.string().min(3).optional(),
    published: z.boolean().optional(),
})

export type UpdatePostType = z.infer<typeof updatePostInput>

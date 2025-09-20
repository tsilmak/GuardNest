"use client"

import { z } from "zod"
import { authClient } from "@/lib/auth-client"

export type SignUpParams = {
  email: string
  password: string
  name: string
  image?: string
  callbackURL?: string
}

const SignUpParamsSchema = z.object({
  email: z.string().email("Invalid email").max(254, "Email is too long"),
  password: z.string(),
  name: z.string().min(1, "Name is required").max(254, "Name is too long"),
  image: z.string().url().optional(),
  callbackURL: z.string().optional(),
})

export async function signUpWithEmail(params: SignUpParams, callbacks?: Parameters<typeof authClient.signUp.email>[1]) {
  const validated = SignUpParamsSchema.parse(params)
  return authClient.signUp.email(
    {
      email: validated.email,
      password: validated.password,
      name: validated.name,
      image: validated.image,
      callbackURL: validated.callbackURL ?? "/auth/login",
    },
    callbacks
  )
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { registerSchema, loginSchema } from "@/lib/validation";

export type AuthResult = {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function register(formData: FormData): Promise<AuthResult> {
  const rawData = {
    email: formData.get("email") as string,
    username: formData.get("username") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
    acceptTerms: formData.get("acceptTerms") === "on" ? true : false,
    acceptEmail: formData.get("acceptEmail") === "on" ? true : false,
  };

  const parsed = registerSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  // Check if username is already taken
  const { data: existingUser } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", parsed.data.username)
    .single();

  if (existingUser) {
    return {
      success: false,
      fieldErrors: { username: ["This username is already taken"] },
    };
  }

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        username: parsed.data.username,
      },
    },
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      return {
        success: false,
        fieldErrors: { email: ["An account with this email already exists"] },
      };
    }
    return {
      success: false,
      error: authError.message,
    };
  }

  if (!authData.user) {
    return {
      success: false,
      error: "Failed to create account",
    };
  }

  // Create profile
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    username: parsed.data.username,
    display_name: parsed.data.username,
  });

  if (profileError) {
    // Clean up auth user if profile creation fails
    console.error("Profile creation failed:", profileError);
    return {
      success: false,
      error: "Failed to create profile. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/profile");
}

export async function login(formData: FormData): Promise<AuthResult> {
  const rawData = {
    identifier: formData.get("identifier") as string,
    password: formData.get("password") as string,
  };

  const parsed = loginSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();

  // Determine if identifier is email or username
  const isEmail = parsed.data.identifier.includes("@");
  let email = parsed.data.identifier;

  if (!isEmail) {
    // Look up email by username using database function
    const { data: userEmail, error: lookupError } = await supabase
      .rpc("get_email_by_username", { p_username: parsed.data.identifier });

    if (lookupError || !userEmail) {
      return {
        success: false,
        error: "Invalid username or password",
      };
    }
    email = userEmail;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: parsed.data.password,
  });

  if (error) {
    return {
      success: false,
      error: "Invalid username or password",
    };
  }

  revalidatePath("/", "layout");
  redirect("/profile");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

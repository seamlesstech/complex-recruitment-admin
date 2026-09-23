"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { FormField } from "@/components/admin/forms/FormField";
import { TextInput } from "@/components/admin/forms/TextInput";
import { signIn, type SignInState } from "@/lib/auth/actions";

const initialState: SignInState = {};

export function LoginForm({ showInactiveMessage }: { showInactiveMessage: boolean }) {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  const bannerMessage = state?.error
    ? state.error
    : showInactiveMessage
      ? "Your Complex Admin account is not currently active."
      : null;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {bannerMessage ? (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-red-line bg-red-tint px-4 py-3 text-sm font-medium text-complex-red"
        >
          <AlertCircle size={16} className="shrink-0" />
          {bannerMessage}
        </div>
      ) : null}

      <FormField label="Email" htmlFor="login-email">
        <TextInput
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
        />
      </FormField>

      <FormField label="Password" htmlFor="login-password">
        <TextInput
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </FormField>

      <button
        type="submit"
        disabled={pending}
        className="flex h-10 items-center justify-center rounded-md bg-complex-red text-sm font-medium text-white transition-colors duration-150 hover:bg-complex-red/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-complex-red disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

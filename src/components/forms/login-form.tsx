import React, { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function LoginForm({ onClose }: { onClose?: () => void }) {
  const { signIn } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await signIn("password", {
        email,
        password,
        flow: isSignUp ? "signUp" : "signIn",
      });
      onClose?.();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Authentication failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">
          {isSignUp ? "Create an account" : "Login to your account"}
        </h3>
        <p className="text-sm text-text-primary">
          {isSignUp
            ? "Enter your email below to create your account"
            : "Enter your email below to login to your account"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="text-sm text-red-400 bg-red-400/10 p-3 rounded border border-red-400/20">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-semibold text-text-primary mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-10 px-3 text-sm border border-muted rounded bg-background-light text-white placeholder-text-secondary focus:border-accent focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-semibold text-text-primary mb-2"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-10 px-3 text-sm border border-muted rounded bg-background-light text-white placeholder-text-secondary focus:border-accent focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full h-10 px-4 text-sm rounded bg-accent text-muted hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : isSignUp ? "Sign up" : "Login"}
        </button>
      </form>

      <div className="text-center text-sm text-text-primary">
        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-accent hover:text-accent/80 transition-colors underline underline-offset-4"
        >
          {isSignUp ? "Sign in" : "Sign up"}
        </button>
      </div>
    </div>
  );
}

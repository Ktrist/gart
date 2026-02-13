"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        setError("Email ou mot de passe invalide.");
        setLoading(false);
        return;
      }

      // Check producer role in user_profiles (graceful: allow any authenticated user if column/table missing)
      try {
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (!profileError && profile && profile.role && profile.role !== "producer") {
          await supabase.auth.signOut();
          setError("Acces refuse. Ce tableau de bord est reserve aux producteurs.");
          setLoading(false);
          return;
        }
        // If profileError (table/column doesn't exist yet) or no role column, let authenticated user in
      } catch {
        // Gracefully ignore -- table or column may not exist yet
      }

      router.push("/dashboard");
    } catch {
      setError("Une erreur inattendue est survenue. Veuillez reessayer.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7f5]">
      <div className="w-full max-w-md px-4">
        {/* Branding */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#1a3a2a]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 text-white"
            >
              <path d="M7 20h10" />
              <path d="M10 20c5.5-2.5.8-6.4 3-10" />
              <path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z" />
              <path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z" />
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight text-[#1a3a2a]">
              GART Admin
            </h1>
            <p className="mt-1 text-sm text-[#2d5a3c]">
              Tableau de bord producteur
            </p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-[#e2e8e4] shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-lg text-[#1a3a2a]">Connexion</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour acceder au tableau de bord
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-[#1a3a2a]"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="focus-visible:border-[#2d5a3c] focus-visible:ring-[#2d5a3c]/30"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#1a3a2a]"
                >
                  Mot de passe
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="focus-visible:border-[#2d5a3c] focus-visible:ring-[#2d5a3c]/30"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="mt-2 w-full bg-[#1a3a2a] text-white hover:bg-[#2d5a3c]"
              >
                {loading ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-[#2d5a3c]/60">
          GART &mdash; Le Jardin du Bon
        </p>
      </div>
    </div>
  );
}

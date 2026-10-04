"use client";

import { Building2, UserRound } from "lucide-react";
import { useState } from "react";
import { register } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Role = "CANDIDATE" | "EMPLOYER";

const OPTIONS = [
  { value: "CANDIDATE" as Role, title: "I'm returning to work", hint: "Build evidence of my skills", icon: UserRound },
  { value: "EMPLOYER" as Role, title: "I'm hiring", hint: "Post jobs and read shared evidence", icon: Building2 },
];

export function RegisterForm() {
  const [role, setRole] = useState<Role>("CANDIDATE");

  return (
    <form action={register} className="space-y-4">
      <fieldset className="grid grid-cols-2 gap-3">
        <legend className="sr-only">I am</legend>
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer flex-col gap-1 rounded-lg border p-3 text-sm transition-colors focus-within:ring-2 focus-within:ring-ring",
              role === option.value ? "border-primary bg-accent" : "hover:bg-accent/50"
            )}
          >
            <input
              type="radio"
              name="role"
              value={option.value}
              checked={role === option.value}
              onChange={() => setRole(option.value)}
              className="sr-only"
            />
            <option.icon className="size-4" />
            <span className="font-medium">{option.title}</span>
            <span className="text-xs text-muted-foreground">{option.hint}</span>
          </label>
        ))}
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" autoComplete="name" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
      </div>

      {role === "EMPLOYER" && (
        <div className="space-y-2">
          <Label htmlFor="companyName">Company name</Label>
          <Input id="companyName" name="companyName" maxLength={100} required />
        </div>
      )}

      <Button type="submit" className="w-full">
        Create account
      </Button>
    </form>
  );
}
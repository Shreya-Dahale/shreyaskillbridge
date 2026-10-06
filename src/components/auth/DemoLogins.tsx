import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ACCOUNTS = [
  { role: "Candidate", name: "Aditi Sharma", email: "aditi@example.com", note: "Returning Java developer with practice evidence" },
  { role: "Employer", name: "Acme Technologies", email: "hr@acme.example.com", note: "Has a published Java job and candidate search" },
  { role: "Candidate", name: "Meera Iyer", email: "meera@example.com", note: "Discoverable, shares roles and a career timeline" },
];

export function DemoLogins() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Try the demo</CardTitle>
        <CardDescription>
          Password for all accounts: <span className="font-mono text-foreground">password123</span>. Resume upload,
          practice-task grading and AI analysis are off in this hosted demo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {ACCOUNTS.map((a) => (
            <li key={a.email} className="rounded-lg border p-3 text-sm">
              <p className="font-medium">
                {a.role}: {a.name}
              </p>
              <p className="font-mono text-xs">{a.email}</p>
              <p className="text-xs text-muted-foreground">{a.note}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
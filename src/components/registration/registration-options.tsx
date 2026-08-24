import { Link } from "react-router-dom";
import { ArrowRight, Fingerprint, Mail } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function RegistrationOptions() {
  return (
    <div className="space-y-5">
      <div className="grid gap-4" aria-label="Registration methods">
        <Card className="gap-5 bg-card py-5 shadow-lg shadow-background/30 ring-primary/40 transition-colors hover:ring-primary/65">
          <CardHeader className="gap-3 px-5 sm:px-6">
            <div className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <Fingerprint aria-hidden="true" className="size-5" />
            </div>
            <CardTitle className="text-lg font-semibold">
              <h2>Register with Singpass</h2>
            </CardTitle>
            <CardDescription className="max-w-md leading-6">
              The quickest option for Singapore citizens and permanent residents. Your verified
              details are filled in securely.
            </CardDescription>
            <CardAction>
              <Badge className="h-6 px-2.5">Recommended</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="px-5 sm:px-6">
            <Button size="lg" className="h-11 w-full text-sm" type="button">
              Continue with Singpass
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>

        <Card className="gap-5 bg-card py-5 shadow-none transition-colors hover:bg-accent/40">
          <CardHeader className="gap-3 px-5 sm:px-6">
            <div className="grid size-10 place-items-center rounded-lg border border-border bg-background text-foreground">
              <Mail aria-hidden="true" className="size-5" />
            </div>
            <CardTitle className="text-lg font-semibold">
              <h2>Register manually</h2>
            </CardTitle>
            <CardDescription className="max-w-md leading-6">
              Use your email address to register as an athlete, parent, guardian, or coach.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 sm:px-6">
            <Link
              to="/auth/manual-registration"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "h-11 w-full text-sm",
              })}
            >
              Continue with email
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 py-1">
        <Separator className="flex-1" />
        <p className="text-sm text-muted-foreground">
          Already registered?{" "}
          <a
            href="#"
            className="font-medium text-primary-strong underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Sign in
          </a>
        </p>
        <Separator className="flex-1" />
      </div>
    </div>
  );
}

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, ArrowLeft, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <Card className="max-w-md text-center">
        <CardContent className="pt-10 pb-8 px-8">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Sparkles className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          
          <h1 className="mb-2 text-4xl font-bold">404</h1>
          <h2 className="mb-4 text-xl font-semibold text-muted-foreground">
            Page Not Found
          </h2>
          <p className="mb-8 text-muted-foreground">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track to building your career.
          </p>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/">
              <Button className="w-full gap-2 sm:w-auto" data-testid="button-go-home">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </Link>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => window.history.back()}
              data-testid="button-go-back"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

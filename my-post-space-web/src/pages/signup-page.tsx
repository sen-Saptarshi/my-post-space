import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";

export default function SignupPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    toast("Trying Signup", { description: "Please wait..." });

    console.log("Form submitted:", formData);
    // Handle signup logic here

    fetch("/api/api/v1/user/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    }).then((response) => {
      response.json().then((data) => {
        if (response.ok) {
          localStorage.setItem("jwt", data.jwt);
          localStorage.setItem("email", formData.email);
          toast.success("Signup successful");
          navigate("/");
        } else {
          toast.error(`Status: ${response.status}`, {
            description: JSON.stringify(data),
          
          });
        }
      });
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-66px)] flex-col md:flex-row">
      <div className="flex flex-1 items-center justify-center p-6 md:p-10">
        <Card className="w-full max-w-md border-none bg-transparent shadow-none">
          <CardContent className="p-0">
            <div className="space-y-8">
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight">
                  Create an account
                </h1>
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    to="/signin"
                    className="underline underline-offset-4 hover:text-primary"
                  >
                    Signin
                  </Link>
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="abc@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  {error && (
                    <p className="text-red-500 text-sm mt-1">{error}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-foreground text-background hover:bg-foreground/90"
                >
                  Sign Up
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="hidden bg-muted p-10 md:flex md:w-1/2 md:flex-col md:justify-center">
        <div className="mx-auto max-w-md space-y-6">
          <blockquote className="space-y-2">
            <p className="text-2xl font-medium leading-relaxed">
              "The customer service I received was exceptional. The support team
              went above and beyond to address my concerns."
            </p>
            <footer className="text-sm">
              <div className="font-semibold">Jules Winnfield</div>
              <div className="text-muted-foreground">CEO, Acme Inc</div>
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

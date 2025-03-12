"use client";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Edit, User, LogOut, PlusCircle } from "lucide-react";
import { ModeToggle } from "./mode-toggle";

export default function Navbar() {
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setEmail(localStorage.getItem("email"));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("email");
    navigate("/signin");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between lg:px-8">
        <div className="flex ml-2 items-center gap-6">
          <Link to="/" className="text-xl font-bold">
            My Post Space
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/create">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Edit className="h-5 w-5" />
              <span className="sr-only">Write</span>
            </Button>
          </Link>

          <ModeToggle />

          {/* Profile HoverCard */}
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="p-4">
              <div className="text-sm px-4 font-medium text-gray-700 dark:text-gray-200">
                {email ?? "No email found"}
              </div>
              <div className="mt-2 border-t pt-2 ">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                >
                  <PlusCircle className="h-4 w-4" />
                  Create Another Account
                </button>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    </header>
  );
}

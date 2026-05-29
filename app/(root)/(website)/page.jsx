import React from "react";
import Home from "@/components/application/main/home";

export default function Layout({ children }) {
  return (
      <main className="flex-1">
        <Home/>
      </main>
  );
}
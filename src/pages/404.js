import React from "react";
import { useRouter } from "next/router";

export default function Custom404() {
  const router = useRouter();

  // Redirect to /welcome user visits this page
  if (typeof window !== "undefined") {
    router.push("/");
  }
  return <h1 className="pt-12 text-center">404 - Page Not Found</h1>;
}

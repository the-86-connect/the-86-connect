import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { SetPasswordContent } from "./set-password-content";

export const dynamic = "force-dynamic";

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SetPasswordContent />
    </Suspense>
  );
}

"use client";

import { IconLogout } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

interface RepLogoutButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export function RepLogoutButton({ className, children }: RepLogoutButtonProps = {}) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/representative/login";
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        className ||
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-status-error hover:bg-status-error/10 transition-colors"
      }
    >
      {children || (
        <>
          <IconLogout size={20} />
          ውጣ (Logout)
        </>
      )}
    </button>
  );
}

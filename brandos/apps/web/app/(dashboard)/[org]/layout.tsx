import { ReactNode } from "react";
import Link from "next/link";

const navItems = [
  { href: "", label: "Dashboard" },
  { href: "/brand-kit", label: "Brand Kit" },
  { href: "/dam", label: "DAM" },
  { href: "/cms", label: "CMS" },
  { href: "/pages", label: "Pages" },
  { href: "/campaigns", label: "Campaigns" },
  { href: "/commerce", label: "Commerce" },
  { href: "/automations", label: "Automations" },
  { href: "/seo", label: "SEO & Analytics" },
  { href: "/settings", label: "Settings" }
];

export default function OrgLayout({ children, params }: { children: ReactNode; params: { org: string } }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-white/5 bg-neutral/80 p-6">
        <h2 className="text-lg font-semibold">Puriva Studio</h2>
        <nav className="mt-6 space-y-2 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className="block rounded-full px-4 py-2 text-neutral-foreground/70 hover:bg-primary/20 hover:text-neutral-foreground"
              href={`/${params.org}${item.href}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-neutral/95/50">{children}</main>
    </div>
  );
}

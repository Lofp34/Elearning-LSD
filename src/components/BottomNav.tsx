"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./BottomNav.module.css";

const NAV_ITEMS = [
  { href: "/parcours", label: "Parcours", key: "parcours" },
  { href: "/leaderboard", label: "Classement", key: "leaderboard" },
  { href: "/progression", label: "Progression", key: "progression" },
  { href: "/profil", label: "Profil", key: "profil" },
];

function resolveActive(pathname: string) {
  if (pathname.startsWith("/parcours") || pathname.startsWith("/quiz")) {
    return "parcours";
  }
  if (pathname.startsWith("/leaderboard")) {
    return "leaderboard";
  }
  if (pathname.startsWith("/progression")) {
    return "progression";
  }
  if (pathname.startsWith("/profil")) {
    return "profil";
  }
  return "";
}

export default function BottomNav() {
  const pathname = usePathname() ?? "/";
  const active = resolveActive(pathname);

  return (
    <nav className={styles.nav}>
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.key}
          className={`${styles.navItem} ${active === item.key ? styles.active : ""}`}
          href={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

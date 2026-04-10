"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Wallet, LogOut, LogIn, LayoutDashboard, Settings } from "lucide-react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className={styles.navbar}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.brand}>
          <div className={styles.iconWrapper}>
            <Wallet size={24} />
          </div>
          <span className={styles.brandText}>Room<span style={{color: "var(--primary-accent)"}}>Fund</span></span>
        </Link>
        
        <div className={styles.navLinks}>
          {status === "loading" ? (
            <div className={styles.skeleton}></div>
          ) : session ? (
            <>
              <Link href="/dashboard" className={styles.navLink}>
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </Link>
              {session.user?.role === "ADMIN" && (
                <Link href="/admin" className={styles.navLink}>
                  <Settings size={18} />
                  <span>Admin</span>
                </Link>
              )}
              <div className={styles.userMenu}>
                <img 
                  src={"https://ui-avatars.com/api/?name=" + session.user?.name + "&background=6366f1&color=fff"} 
                  alt="Profile" 
                  className={styles.avatar} 
                />
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })} 
                  className={`btn btn-secondary ${styles.authBtn}`}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

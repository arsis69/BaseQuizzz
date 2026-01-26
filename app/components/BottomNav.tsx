'use client';

import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isHome = pathname === '/';
  const isProfile = pathname === '/profile';

  return (
    <nav className={styles.bottomNav}>
      <button
        className={`${styles.navButton} ${isHome ? styles.active : ''}`}
        onClick={() => router.push('/')}
        aria-label="Home"
      >
        <div className={styles.iconWrapper}>
          <Image
            src="/home.png"
            alt="Home"
            width={24}
            height={24}
            className={styles.icon}
          />
        </div>
        <span className={styles.label}>Home</span>
      </button>

      <button
        className={`${styles.navButton} ${isProfile ? styles.active : ''}`}
        onClick={() => router.push('/profile')}
        aria-label="Profile"
      >
        <div className={styles.iconWrapper}>
          <Image
            src="/user.png"
            alt="Profile"
            width={24}
            height={24}
            className={styles.icon}
          />
        </div>
        <span className={styles.label}>Profile</span>
      </button>
    </nav>
  );
}

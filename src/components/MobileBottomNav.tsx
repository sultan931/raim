import { Link, useLocation } from 'wouter';
import { useCurrentProfile } from '../lib/useCurrentProfile';
import './MobileBottomNav.css';

type NavItem = {
  href: string;
  icon: 'home' | 'albums' | 'parent' | 'register';
  label: string;
};

const kidNavItems: NavItem[] = [
  { href: '/', icon: 'home', label: 'Jey' },
  { href: '/albums', icon: 'albums', label: 'Albums' },
  { href: '/register', icon: 'register', label: 'Register' },
];

const parentNavItems: NavItem[] = [
  { href: '/parent', icon: 'parent', label: 'Parent' },
  { href: '/register', icon: 'register', label: 'Register' },
];

export function MobileBottomNav() {
  const [location] = useLocation();
  const { isLoading, profile } = useCurrentProfile();
  const navItems = profile?.role === 'parent' ? parentNavItems : kidNavItems;

  if (isLoading) return null;

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {navItems.map((item) => {
        const isActive = item.href === location;

        return (
          <Link
            key={item.href}
            className={isActive ? 'mobile-bottom-nav__item is-active' : 'mobile-bottom-nav__item'}
            href={item.href}
          >
            <span
              className={`mobile-bottom-nav__icon mobile-bottom-nav__icon--${item.icon}`}
              aria-hidden="true"
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

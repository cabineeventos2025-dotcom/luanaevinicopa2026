import { Trophy, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useChannelConfig } from "@/contexts/ChannelConfigContext";
import { YouTubeButton } from "@/components/common/YouTubeButton";
import { cn } from "@/lib/utils";

export function Header() {
  const { config } = useChannelConfig();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-amber-200/60 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo + Brand */}
          <Link to="/" className="flex items-center gap-3 min-w-0 group" id="header-home-link">
            <div className="relative shrink-0">
              {config.logoUrl ? (
                <img
                  src={config.logoUrl}
                  alt={config.channelName}
                  className="h-10 w-10 rounded-xl object-cover ring-2 ring-amber-400"
                />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-400 to-green-400 flex items-center justify-center shadow-md">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
              )}
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
            </div>
            <div className="min-w-0">
              <div className="font-black text-sm sm:text-base leading-tight truncate text-gray-900 group-hover:text-amber-600 transition-colors">
                {config.channelName}
              </div>
              <div className="text-[10px] text-amber-600 font-semibold truncate hidden sm:block">
                🏆 Desafio da Copa 2026
              </div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Links de página">
            <NavLink to="/ranking" label="🥇 Ranking" id="header-ranking-link" />
            <NavLink to="/regulamento" label="📜 Regulamento" id="header-regulamento-link" />
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <YouTubeButton variant="compact" label="YouTube" className="hidden sm:flex text-xs px-3 py-1.5" />
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-amber-50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
              id="header-mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-amber-100 py-3 flex flex-col gap-2">
            <MobileNavLink to="/ranking" label="🥇 Ranking da Família" onClick={() => setMobileMenuOpen(false)} />
            <MobileNavLink to="/regulamento" label="📜 Regulamento" onClick={() => setMobileMenuOpen(false)} />
            <div className="pt-2">
              <YouTubeButton variant="compact" className="w-full justify-center" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({ to, label, id }: { to: string; label: string; id: string }) {
  return (
    <Link
      to={to}
      id={id}
      className={cn(
        "px-3 py-1.5 rounded-lg text-sm font-bold transition-colors text-gray-600 hover:text-amber-700 hover:bg-amber-50",
      )}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({
  to,
  label,
  onClick,
}: {
  to: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-gray-700 hover:bg-amber-50 transition-colors"
    >
      {label}
    </Link>
  );
}

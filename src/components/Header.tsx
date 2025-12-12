import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, Menu, X, Zap, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onOpenFavorites: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  favoritesCount?: number;
}

export function Header({ onOpenFavorites, searchQuery, onSearchChange, favoritesCount = 0 }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 glow-orange">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-wider hidden sm:block">
            <span className="text-foreground">PECHIN</span>
            <span className="text-primary">TECH</span>
          </span>
        </Link>

        {/* Search Bar - Desktop */}
        <div className="flex-1 max-w-xl hidden md:flex">
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Buscar promoções de tech..."
              className="pl-10 bg-secondary border-border/50 focus:border-primary/50 focus:ring-primary/20 h-10"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Admin Link */}
          {isAdmin && (
            <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
              <Link to="/admin">
                <Shield className="h-4 w-4 mr-2" />
                Admin
              </Link>
            </Button>
          )}

          {/* Favorites Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenFavorites}
            className="relative hover:text-primary"
          >
            <Heart className="h-5 w-5" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {favoritesCount}
              </span>
            )}
          </Button>

          {/* User Menu - Desktop */}
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate('/auth')}>
                  Entrar
                </Button>
                <Button size="sm" onClick={() => navigate('/auth')}>
                  Cadastrar
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Search & Menu */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300',
          isMobileMenuOpen ? 'max-h-64 border-t border-border/50' : 'max-h-0'
        )}
      >
        <div className="container py-4 space-y-4">
          {/* Mobile Search */}
          <div className="relative w-full group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar promoções..."
              className="pl-10 bg-secondary border-border/50"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          {/* Admin Link Mobile */}
          {isAdmin && (
            <Button variant="outline" className="w-full" asChild>
              <Link to="/admin">
                <Shield className="h-4 w-4 mr-2" />
                Painel Admin
              </Link>
            </Button>
          )}

          {/* Mobile Auth Buttons */}
          <div className="flex gap-2 sm:hidden">
            {user ? (
              <Button variant="outline" className="flex-1" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            ) : (
              <>
                <Button variant="outline" className="flex-1" onClick={() => navigate('/auth')}>
                  Entrar
                </Button>
                <Button className="flex-1" onClick={() => navigate('/auth')}>
                  Cadastrar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

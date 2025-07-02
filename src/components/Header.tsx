import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold text-primary">BookMyShow</h1>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Movies
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Events
            </a>
            <a href="#" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
              Sports
            </a>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <input
              type="search"
              placeholder="Search for movies, events..."
              className="w-64 px-3 py-2 text-sm rounded-md bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <Button variant="cinema" size="sm">
            Sign In
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
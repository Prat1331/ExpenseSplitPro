import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, Users, Clock, User } from "lucide-react";

export default function Navigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/friends", icon: Users, label: "Friends" },
    { path: "/history", icon: Clock, label: "History" },
    { path: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 px-6 py-3">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Button
              key={item.path}
              onClick={() => setLocation(item.path)}
              variant="ghost"
              className={`flex flex-col items-center space-y-1 p-2 h-auto ${
                isActive ? "nav-item-active" : "nav-item-inactive"
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}

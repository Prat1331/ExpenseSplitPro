import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Settings, CreditCard, HelpCircle, LogOut, Bell, Shield } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [user, authLoading, toast]);

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const menuItems = [
    {
      icon: Settings,
      label: "Account Settings",
      action: () => toast({ title: "Coming Soon", description: "Account settings will be available soon!" }),
    },
    {
      icon: CreditCard,
      label: "Payment Methods",
      action: () => toast({ title: "Coming Soon", description: "Payment methods management will be available soon!" }),
    },
    {
      icon: Bell,
      label: "Notifications",
      action: () => toast({ title: "Coming Soon", description: "Notification settings will be available soon!" }),
    },
    {
      icon: Shield,
      label: "Privacy & Security",
      action: () => toast({ title: "Coming Soon", description: "Privacy settings will be available soon!" }),
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      action: () => toast({ title: "Coming Soon", description: "Help center will be available soon!" }),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <User className="text-primary" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
        </div>
      </div>

      <div className="p-6">
        {/* User Info Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <img
                src={user.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user.email?.split("@")[0] || "User"
                  }
                </h3>
                <p className="text-gray-600">{user.email}</p>
                {user.phoneNumber && (
                  <p className="text-gray-500 text-sm">{user.phoneNumber}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Version */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">App Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Version</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Updated</span>
                <span className="font-medium">Dec 2024</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card className="mb-6">
          <CardContent className="p-0">
            {menuItems.map((item, index) => (
              <div key={index}>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-auto p-4 rounded-none"
                  onClick={item.action}
                >
                  <item.icon className="mr-3 text-gray-500" size={20} />
                  <span className="text-gray-900">{item.label}</span>
                </Button>
                {index < menuItems.length - 1 && <Separator />}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 py-3 h-auto"
        >
          <LogOut className="mr-2" size={20} />
          Sign Out
        </Button>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>SplitEase v1.0.0</p>
          <p className="mt-2">
            Made with ❤️ for seamless expense splitting
          </p>
        </div>
      </div>

      <Navigation />
    </div>
  );
}

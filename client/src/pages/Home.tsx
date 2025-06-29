import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Camera, QrCode, ArrowDown, ArrowUp, Users, RefreshCw, Wallet } from "lucide-react";
import BillScanner from "@/components/BillScanner";
import Navigation from "@/components/Navigation";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showScanner, setShowScanner] = useState(false);

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

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ["/api/users/balance"],
    retry: false,
  });

  const { data: walletBalance, isLoading: walletLoading, refetch: refetchWallet } = useQuery({
    queryKey: ["/api/wallet/balance"],
    retry: false,
  });

  const { data: bills, isLoading: billsLoading } = useQuery({
    queryKey: ["/api/bills"],
    retry: false,
  });

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning!";
    if (hour < 18) return "Good afternoon!";
    return "Good evening!";
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(Number(amount));
  };

  const handleScanBill = () => {
    setShowScanner(true);
  };

  const handleScanQR = () => {
    toast({
      title: "QR Scanner",
      description: "QR code scanning feature coming soon!",
    });
  };

  const handleRefreshWallet = () => {
    refetchWallet();
    toast({
      title: "Refreshing",
      description: "Updating your wallet balance...",
    });
  };

  if (showScanner) {
    return <BillScanner onClose={() => setShowScanner(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={user.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {user.firstName || user.email?.split("@")[0] || "User"}
            </h1>
            <p className="text-sm text-gray-500">{getGreeting()}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <Bell className="text-gray-400" size={20} />
        </Button>
      </header>

      <div className="p-6">
        {/* Paytm Wallet Balance */}
        <Card className="balance-gradient text-white mb-4">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Wallet size={20} />
                <h2 className="text-lg font-medium">Paytm Wallet</h2>
              </div>
              <Button
                onClick={handleRefreshWallet}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white hover:bg-opacity-20 p-2"
                disabled={walletLoading}
              >
                <RefreshCw size={16} className={walletLoading ? "animate-spin" : ""} />
              </Button>
            </div>
            <div className="flex items-baseline space-x-2 mb-2">
              <span className="text-3xl font-bold">
                {walletLoading ? "..." : formatCurrency(walletBalance?.balance || 0)}
              </span>
              <span className="text-sm opacity-80">available</span>
            </div>
            <p className="text-xs opacity-75">
              Last updated: {walletBalance?.lastUpdated 
                ? new Date(walletBalance.lastUpdated).toLocaleTimeString('en-IN', { 
                    hour: 'numeric', 
                    minute: '2-digit', 
                    hour12: true 
                  })
                : "Just now"
              }
            </p>
          </CardContent>
        </Card>

        {/* Split Balance Overview */}
        <Card className="bg-white border border-gray-200 mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Split Balance</h2>
            <div className="flex space-x-6 text-sm">
              <div>
                <span className="text-gray-600">You owe: </span>
                <span className="font-semibold text-red-600">
                  {balanceLoading ? "..." : formatCurrency(balance?.owes || 0)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Owed to you: </span>
                <span className="font-semibold text-green-600">
                  {balanceLoading ? "..." : formatCurrency(balance?.owed || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button
            onClick={handleScanBill}
            className="bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white p-6 rounded-2xl flex flex-col items-center space-y-2 shadow-sm h-auto"
            variant="outline"
          >
            <Camera size={24} />
            <span className="font-semibold">Scan Bill</span>
          </Button>
          <Button
            onClick={handleScanQR}
            className="btn-secondary p-6 rounded-2xl flex flex-col items-center space-y-2 shadow-sm h-auto"
            variant="outline"
          >
            <QrCode size={24} />
            <span className="font-semibold">Scan QR</span>
          </Button>
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <Button variant="ghost" className="text-primary text-sm font-medium p-0">
              View All
            </Button>
          </div>

          {billsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bill-item-card animate-pulse">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </Card>
              ))}
            </div>
          ) : bills && bills.length > 0 ? (
            <div className="space-y-3">
              {bills.slice(0, 3).map((bill: any) => (
                <Card key={bill.id} className="bill-item-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center">
                        <Users size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{bill.merchantName}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(bill.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-600 font-semibold">
                      {formatCurrency(bill.totalAmount)}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bill-item-card">
              <div className="text-center py-8">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="text-gray-400" size={24} />
                </div>
                <h4 className="font-medium text-gray-900 mb-2">No bills yet</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Start by scanning your first bill or adding an expense
                </p>
                <Button onClick={handleScanBill} className="btn-primary">
                  Scan Your First Bill
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Navigation />
    </div>
  );
}

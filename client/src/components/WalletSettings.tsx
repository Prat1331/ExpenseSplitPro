import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Wallet, Phone, CheckCircle, RefreshCw, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface WalletSettingsProps {
  onClose: () => void;
}

export default function WalletSettings({ onClose }: WalletSettingsProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: walletBalance, isLoading: balanceLoading, refetch: refetchBalance } = useQuery({
    queryKey: ["/api/wallet/balance"],
    retry: false,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/wallet/transactions"],
    retry: false,
  });

  const connectWalletMutation = useMutation({
    mutationFn: async (phone: string) => {
      // This would typically involve API calls to link the Paytm account
      // For demo, we'll simulate the connection
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, message: "Wallet connected successfully" };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/balance"] });
      toast({
        title: "Success",
        description: "Paytm wallet connected successfully!",
      });
      setPhoneNumber("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Error",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleConnectWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter your Paytm registered phone number.",
        variant: "destructive",
      });
      return;
    }
    connectWalletMutation.mutate(phoneNumber);
  };

  const handleRefreshBalance = () => {
    refetchBalance();
    toast({
      title: "Refreshing",
      description: "Updating your wallet balance...",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-center">
      <Card className="w-full max-w-md mx-4 mb-4 rounded-t-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Wallet size={24} className="text-blue-600" />
              <span>Wallet Settings</span>
            </CardTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-gray-400"
            >
              <X size={20} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Current Balance */}
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Paytm Wallet Balance</h3>
                <Button
                  onClick={handleRefreshBalance}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white hover:bg-opacity-20 p-1"
                  disabled={balanceLoading}
                >
                  <RefreshCw size={16} className={balanceLoading ? "animate-spin" : ""} />
                </Button>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold">
                  {balanceLoading ? "..." : formatCurrency(walletBalance?.balance || 0)}
                </span>
                <Badge className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
                  Connected
                </Badge>
              </div>
              <p className="text-xs opacity-75 mt-1">
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

          {/* Connect New Account */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-4">Add Another Paytm Account</h4>
            <form onSubmit={handleConnectWallet} className="space-y-4">
              <div>
                <Label htmlFor="paytm-phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Paytm Registered Phone Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    id="paytm-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={connectWalletMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold h-auto"
              >
                {connectWalletMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="loading-spinner h-4 w-4"></div>
                    <span>Connecting...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle className="mr-2" size={20} />
                    Connect Wallet
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Recent Transactions */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-4">Recent Transactions</h4>
            
            {transactionsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {transactions.slice(0, 5).map((transaction: any) => (
                  <Card key={transaction.id} className="border border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "CREDIT" 
                              ? "bg-green-100 text-green-600" 
                              : "bg-red-100 text-red-600"
                          }`}>
                            {transaction.type === "CREDIT" ? (
                              <ArrowDownLeft size={20} />
                            ) : (
                              <ArrowUpRight size={20} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {transaction.description}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatDate(transaction.date)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === "CREDIT" 
                              ? "text-green-600" 
                              : "text-red-600"
                          }`}>
                            {transaction.type === "CREDIT" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <Badge 
                            variant={transaction.status === "SUCCESS" ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border border-gray-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Wallet className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-sm text-gray-500">No transactions yet</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="p-4 h-auto flex flex-col items-center space-y-2"
              onClick={() => toast({ title: "Coming Soon", description: "Add money feature will be available soon!" })}
            >
              <ArrowDownLeft className="text-green-600" size={20} />
              <span className="text-sm font-medium">Add Money</span>
            </Button>
            <Button
              variant="outline"
              className="p-4 h-auto flex flex-col items-center space-y-2"
              onClick={() => toast({ title: "Coming Soon", description: "Send money feature will be available soon!" })}
            >
              <ArrowUpRight className="text-blue-600" size={20} />
              <span className="text-sm font-medium">Send Money</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
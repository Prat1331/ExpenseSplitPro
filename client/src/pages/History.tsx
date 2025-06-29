import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Receipt, Users, DollarSign } from "lucide-react";
import Navigation from "@/components/Navigation";

export default function History() {
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

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(Number(amount));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-yellow-100 text-yellow-800";
      case "settled":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <Clock className="text-primary" size={24} />
          <h2 className="text-2xl font-bold text-gray-900">History</h2>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <Receipt className="text-white" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {bills?.length || 0}
              </p>
              <p className="text-sm text-gray-500">Total Bills</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="bg-green-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <DollarSign className="text-white" size={20} />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(
                  bills?.reduce((sum: number, bill: any) => sum + Number(bill.totalAmount), 0) || 0
                )}
              </p>
              <p className="text-sm text-gray-500">Total Spent</p>
            </CardContent>
          </Card>
        </div>

        {/* Bills History */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All Bills</h3>
          
          {billsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : bills && bills.length > 0 ? (
            <div className="space-y-4">
              {bills.map((bill: any) => (
                <Card key={bill.id} className="bill-item-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="bg-primary rounded-lg w-12 h-12 flex items-center justify-center">
                          <Receipt className="text-white" size={20} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{bill.merchantName}</h4>
                          <p className="text-sm text-gray-500">{formatDate(bill.createdAt)}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(bill.status)}>
                              {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(bill.totalAmount)}
                        </p>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users size={14} className="mr-1" />
                          <span>Split</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Details */}
                    <div className="border-t border-gray-100 pt-3 mt-3">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Subtotal</p>
                          <p className="font-medium">
                            {formatCurrency(Number(bill.totalAmount) - Number(bill.taxAmount || 0) - Number(bill.tipAmount || 0))}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tax</p>
                          <p className="font-medium">{formatCurrency(bill.taxAmount || 0)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tip</p>
                          <p className="font-medium">{formatCurrency(bill.tipAmount || 0)}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bill-item-card">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="text-gray-400" size={24} />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">No bills yet</h4>
                  <p className="text-sm text-gray-500">
                    Your bill history will appear here once you start splitting expenses
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Navigation />
    </div>
  );
}

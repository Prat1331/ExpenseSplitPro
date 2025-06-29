import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Utensils, Edit, Send } from "lucide-react";

interface ExtractedBillData {
  merchantName: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}

interface SplitBillProps {
  billData: ExtractedBillData;
  onClose: () => void;
  onBack: () => void;
}

export default function SplitBill({ billData, onClose, onBack }: SplitBillProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const { data: friends } = useQuery({
    queryKey: ["/api/friends"],
    retry: false,
  });

  const createBillMutation = useMutation({
    mutationFn: async (billDataToSave: any) => {
      const response = await apiRequest("POST", "/api/bills", billDataToSave);
      return response.json();
    },
    onSuccess: (newBill) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      toast({
        title: "Success",
        description: "Bill created successfully! Payment requests will be sent.",
      });
      onClose();
    },
    onError: (error) => {
      setIsCreating(false);
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
        description: "Failed to create bill. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const handleSaveBill = () => {
    setIsCreating(true);
    
    const billToSave = {
      merchantName: billData.merchantName,
      totalAmount: billData.total.toString(),
      taxAmount: billData.tax.toString(),
      tipAmount: billData.tip.toString(),
      ocrData: billData,
      status: "active",
    };

    createBillMutation.mutate(billToSave);
  };

  const handleSendRequests = () => {
    // For now, just save the bill. In a real implementation,
    // this would also trigger payment requests via Razorpay
    handleSaveBill();
  };

  // Calculate individual shares (for demo, split equally)
  const numberOfPeople = 2; // User + 1 friend for demo
  const individualShare = billData.total / numberOfPeople;

  return (
    <div className="fixed inset-0 bg-white z-40">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="text-gray-400"
          >
            <ArrowLeft size={20} />
          </Button>
          <h2 className="text-lg font-semibold text-gray-900">Split Bill</h2>
          <Button
            onClick={handleSaveBill}
            variant="ghost"
            className="text-primary font-semibold"
            disabled={isCreating}
          >
            {isCreating ? "Saving..." : "Save"}
          </Button>
        </div>
        
        {/* Bill Details */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-primary rounded-lg w-12 h-12 flex items-center justify-center">
              <Utensils className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{billData.merchantName}</h3>
              <p className="text-sm text-gray-500">Today, {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</p>
            </div>
          </div>
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Amount</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(billData.total)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Bill Items */}
        <div className="flex-1 overflow-y-auto p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Items</h4>
          
          <div className="space-y-3">
            {billData.items.map((item, index) => (
              <Card key={index} className="bill-item-card">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h5 className="font-medium text-gray-900">{item.name}</h5>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary text-sm font-medium">
                      <Edit size={14} className="mr-1" />
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Split between:</span>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center border-2 border-white">
                        Y
                      </div>
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center border-2 border-white">
                        F
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatCurrency(item.price / numberOfPeople)} each
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Split Summary */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-4">Split Summary</h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Subtotal</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(billData.subtotal)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Tax</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(billData.tax)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Tip</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(billData.tip)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Your share</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(individualShare)}
              </span>
            </div>
            {friends && friends.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Friend's share</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(individualShare)}
                </span>
              </div>
            )}
          </div>
          
          <Button
            onClick={handleSendRequests}
            disabled={isCreating}
            className="w-full btn-primary py-4 rounded-2xl font-semibold mt-6 h-auto"
          >
            {isCreating ? (
              <div className="flex items-center space-x-2">
                <div className="loading-spinner h-4 w-4"></div>
                <span>Creating Bill...</span>
              </div>
            ) : (
              <>
                <Send className="mr-2" size={20} />
                Send Payment Requests
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

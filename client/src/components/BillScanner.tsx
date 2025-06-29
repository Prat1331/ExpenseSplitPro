import { useState, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Camera, Image, QrCode, FlashlightIcon as Flash } from "lucide-react";
import SplitBill from "./SplitBill";

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

interface BillScannerProps {
  onClose: () => void;
}

export default function BillScanner({ onClose }: BillScannerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedBillData | null>(null);
  const [showSplitBill, setShowSplitBill] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const extractBillMutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      const response = await apiRequest("POST", "/api/bills/extract", {
        imageBase64,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setExtractedData(data);
      setIsProcessing(false);
      setShowSplitBill(true);
    },
    onError: (error) => {
      setIsProcessing(false);
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
        description: "Failed to extract bill data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setIsProcessing(true);
      extractBillMutation.mutate(result);
    };
    reader.readAsDataURL(file);
  }, [extractBillMutation, toast]);

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = "image/*";
      fileInputRef.current.capture = "environment";
      fileInputRef.current.click();
    }
  };

  const handleGallerySelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = "image/*";
      fileInputRef.current.removeAttribute("capture");
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleQRSwitch = () => {
    toast({
      title: "QR Scanner",
      description: "QR code scanning feature coming soon!",
    });
  };

  if (showSplitBill && extractedData) {
    return (
      <SplitBill
        billData={extractedData}
        onClose={() => {
          setShowSplitBill(false);
          setExtractedData(null);
          onClose();
        }}
        onBack={() => {
          setShowSplitBill(false);
          setExtractedData(null);
        }}
      />
    );
  }

  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
        <Card className="mx-6 w-full max-w-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="bg-primary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Camera className="text-white text-2xl" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Processing Bill</h3>
              <p className="text-gray-600 mb-6">Extracting items and calculating totals...</p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="loading-spinner h-5 w-5"></div>
                  <span className="text-sm text-gray-700">Reading text from image</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="loading-spinner h-5 w-5"></div>
                  <span className="text-sm text-gray-700">Identifying items and prices</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="loading-spinner h-5 w-5"></div>
                  <span className="text-sm text-gray-700">Calculating splits</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50">
      <div className="relative h-full">
        {/* Mock camera feed */}
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center text-white">
              <Camera size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Camera View</p>
              <p className="text-sm opacity-75">Position bill within frame and capture</p>
            </div>
          </div>
        </div>
        
        {/* Overlay UI */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top Controls */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center pointer-events-auto">
            <Button
              onClick={onClose}
              className="camera-control w-12 h-12"
              size="icon"
              variant="ghost"
            >
              <X size={20} />
            </Button>
            <Button
              className="camera-control w-12 h-12"
              size="icon"
              variant="ghost"
              onClick={() => toast({ title: "Flash", description: "Flash toggle coming soon!" })}
            >
              <Flash size={20} />
            </Button>
          </div>
          
          {/* Scan Frame */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-60 border-2 border-white rounded-2xl relative">
              <div className="scan-corner scan-corner-tl"></div>
              <div className="scan-corner scan-corner-tr"></div>
              <div className="scan-corner scan-corner-bl"></div>
              <div className="scan-corner scan-corner-br"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <p className="text-lg font-medium">Position bill within frame</p>
                  <p className="text-sm opacity-75 mt-1">Tap capture button below</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-6 pointer-events-auto">
            <div className="flex justify-center items-center space-x-12 mb-4">
              <Button
                onClick={handleGallerySelect}
                className="camera-control w-12 h-12"
                size="icon"
                variant="ghost"
              >
                <Image size={20} />
              </Button>
              <Button
                onClick={handleCameraCapture}
                className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90"
              >
                <div className="w-16 h-16 bg-white rounded-full"></div>
              </Button>
              <Button
                onClick={handleQRSwitch}
                className="camera-control w-12 h-12"
                size="icon"
                variant="ghost"
              >
                <QrCode size={20} />
              </Button>
            </div>
            <p className="text-white text-center text-sm font-medium">Scan Bill</p>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

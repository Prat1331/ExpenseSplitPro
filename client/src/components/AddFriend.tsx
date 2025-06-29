import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, UserPlus, Search, Plus } from "lucide-react";

interface AddFriendProps {
  onClose: () => void;
}

export default function AddFriend({ onClose }: AddFriendProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const searchUserMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await apiRequest("GET", `/api/users/search/${encodeURIComponent(phone)}`);
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResult(data);
      setIsSearching(false);
    },
    onError: (error) => {
      setIsSearching(false);
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
      
      if (error.message.includes("404")) {
        toast({
          title: "User Not Found",
          description: "No user found with this phone number.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to search for user. Please try again.",
          variant: "destructive",
        });
      }
      setSearchResult(null);
    },
  });

  const addFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const response = await apiRequest("POST", "/api/friends", {
        friendId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      toast({
        title: "Success",
        description: "Friend request sent!",
      });
      onClose();
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
        description: "Failed to send friend request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a phone number.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSearching(true);
    setSearchResult(null);
    searchUserMutation.mutate(phoneNumber.trim());
  };

  const handleAddFriend = () => {
    if (searchResult) {
      addFriendMutation.mutate(searchResult.id);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Simple phone number formatting (you might want to use a proper library)
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-center">
      <Card className="w-full max-w-md mx-4 mb-4 rounded-t-3xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold text-gray-900">Add Friend</CardTitle>
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
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <Button
              type="submit"
              disabled={isSearching}
              className="w-full btn-primary py-3 rounded-xl font-semibold h-auto"
            >
              {isSearching ? (
                <div className="flex items-center space-x-2">
                  <div className="loading-spinner h-4 w-4"></div>
                  <span>Searching...</span>
                </div>
              ) : (
                <>
                  <Search className="mr-2" size={20} />
                  Search User
                </>
              )}
            </Button>
          </form>

          {/* Search Result */}
          {searchResult && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={searchResult.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${searchResult.id}`}
                      alt="User"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {searchResult.firstName} {searchResult.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{phoneNumber}</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleAddFriend}
                    disabled={addFriendMutation.isPending}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {addFriendMutation.isPending ? (
                      <div className="loading-spinner h-4 w-4"></div>
                    ) : (
                      <>
                        <Plus size={16} className="mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Recent Contacts Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-4">Recent Contacts</h4>
            <Card className="bg-gray-50">
              <CardContent className="p-4">
                <div className="text-center py-4">
                  <UserPlus className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-500">
                    Contact integration coming soon!
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    For now, search by phone number to add friends
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

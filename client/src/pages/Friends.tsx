import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, UserPlus, Check, X } from "lucide-react";
import AddFriend from "@/components/AddFriend";
import Navigation from "@/components/Navigation";

export default function Friends() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

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

  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ["/api/friends"],
    retry: false,
  });

  const { data: friendRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["/api/friends/requests"],
    retry: false,
  });

  const acceptRequestMutation = useMutation({
    mutationFn: async (friendId: string) => {
      await apiRequest("POST", `/api/friends/${friendId}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/friends/requests"] });
      toast({
        title: "Success",
        description: "Friend request accepted!",
      });
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
        description: "Failed to accept friend request",
        variant: "destructive",
      });
    },
  });

  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner h-8 w-8"></div>
      </div>
    );
  }

  const filteredFriends = friends?.filter((friend: any) =>
    friend.friend.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.friend.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.friend.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(Number(amount));
  };

  if (showAddFriend) {
    return <AddFriend onClose={() => setShowAddFriend(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Friends</h2>
        <Button
          onClick={() => setShowAddFriend(true)}
          className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center p-0"
        >
          <Plus size={20} />
        </Button>
      </div>

      {/* Search */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div className="p-6">
        {/* Friend Requests */}
        {friendRequests && friendRequests.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Friend Requests</h3>
            <div className="space-y-3">
              {friendRequests.map((request: any) => (
                <Card key={request.id} className="friend-item">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={request.user.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.user.id}`}
                          alt="Friend"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {request.user.firstName} {request.user.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{request.user.email}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => acceptRequestMutation.mutate(request.user.id)}
                          disabled={acceptRequestMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white p-2"
                        >
                          <Check size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50 p-2"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Friends List */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Friends</h3>
          
          {friendsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="friend-item animate-pulse">
                  <CardContent className="p-4">
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredFriends.length > 0 ? (
            <div className="space-y-4">
              {filteredFriends.map((friend: any) => (
                <Card key={friend.id} className="friend-item">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={friend.friend.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.friend.id}`}
                          alt="Friend"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {friend.friend.firstName} {friend.friend.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">{friend.friend.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 font-medium">Settled up</p>
                        <p className="text-lg font-bold text-gray-500">{formatCurrency(0)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="friend-item">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="text-gray-400" size={24} />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">No friends yet</h4>
                  <p className="text-sm text-gray-500 mb-4">
                    Add friends to start splitting bills together
                  </p>
                  <Button
                    onClick={() => setShowAddFriend(true)}
                    className="btn-primary"
                  >
                    Add Your First Friend
                  </Button>
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

import { Button } from "@/components/ui/button";
import { Receipt } from "lucide-react";

export default function Landing() {
  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="text-center mb-12">
        <div className="bg-primary rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Receipt className="text-white text-2xl" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SplitEase</h1>
        <p className="text-gray-600 px-8">Split bills effortlessly with friends</p>
      </div>

      <div className="w-full max-w-sm space-y-4 mb-8">
        <Button 
          onClick={handleSignIn}
          className="w-full bg-gray-900 hover:bg-gray-800 text-white py-4 rounded-2xl font-semibold text-lg h-auto"
        >
          Sign In
        </Button>
        <Button 
          onClick={handleSignIn}
          className="w-full btn-primary py-4 rounded-2xl font-semibold text-lg h-auto"
        >
          Sign Up
        </Button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500 px-4">
          By continuing, you agree to our{" "}
          <a href="#" className="text-primary underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}

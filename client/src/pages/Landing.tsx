import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt, Camera, Users, Smartphone, CreditCard, CheckCircle } from "lucide-react";

export default function Landing() {
  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6 max-w-6xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="bg-primary rounded-xl w-10 h-10 flex items-center justify-center">
            <Receipt className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-900">SplitEase</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleSignIn}
            variant="ghost"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Sign In
          </Button>
          <Button 
            onClick={handleSignIn}
            className="btn-primary px-6 py-2 rounded-xl font-semibold"
          >
            Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="bg-primary rounded-3xl w-24 h-24 flex items-center justify-center mx-auto mb-8 shadow-xl">
            <Receipt className="text-white text-3xl" size={40} />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Split Bills<br />
            <span className="text-primary">Effortlessly</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Scan receipts with AI, split expenses with friends, and settle payments instantly through your Paytm wallet or UPI.
          </p>
          
          <Button 
            onClick={handleGetStarted}
            className="btn-primary px-12 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Get Started
          </Button>
          
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • Free to start
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="bg-blue-100 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Camera className="text-blue-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Bill Scanning</h3>
              <p className="text-gray-600">
                Just snap a photo of your receipt and our AI will automatically extract items and amounts
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="bg-green-100 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Users className="text-green-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Splitting</h3>
              <p className="text-gray-600">
                Add friends by phone number and split bills fairly with customizable shares
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="bg-orange-100 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <CreditCard className="text-orange-600" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Payments</h3>
              <p className="text-gray-600">
                Pay directly from your Paytm wallet or use UPI, cards for quick settlements
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Scan Receipt</h4>
              <p className="text-sm text-gray-600">Take a photo of your bill</p>
            </div>
            <div className="text-center">
              <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Add Friends</h4>
              <p className="text-sm text-gray-600">Select who to split with</p>
            </div>
            <div className="text-center">
              <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Split Items</h4>
              <p className="text-sm text-gray-600">Choose how to divide costs</p>
            </div>
            <div className="text-center">
              <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Get Paid</h4>
              <p className="text-sm text-gray-600">Receive money instantly</p>
            </div>
          </div>
        </div>

        {/* Benefits */}
        <Card className="bg-gradient-to-r from-primary to-orange-400 text-white p-8 mb-16">
          <CardContent className="p-0">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Why Choose SplitEase?</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle size={20} />
                    <span>No more awkward money conversations</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle size={20} />
                    <span>Automatic bill scanning saves time</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle size={20} />
                    <span>Secure payments through trusted platforms</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle size={20} />
                    <span>Keep track of all your expenses</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Smartphone size={120} className="mx-auto opacity-20" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <div className="text-center bg-gray-900 rounded-3xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Split Smarter?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of users who have simplified their bill splitting
          </p>
          <Button 
            onClick={handleGetStarted}
            className="bg-primary hover:bg-primary/90 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Get Started Now
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-500 max-w-6xl mx-auto px-6">
        <p className="text-sm">
          By continuing, you agree to our{" "}
          <a href="#" className="text-primary underline hover:text-primary/80">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-primary underline hover:text-primary/80">
            Privacy Policy
          </a>
        </p>
        <p className="text-xs mt-4">
          © 2024 SplitEase. Made with ❤️ for seamless expense splitting.
        </p>
      </footer>
    </div>
  );
}

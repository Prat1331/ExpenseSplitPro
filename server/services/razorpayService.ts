import Razorpay from "razorpay";
import crypto from "crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID || "rzp_test_XC9RNjvRZTDo61";
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "Z0I81kQ0BjmTA45lW6sFpL";

if (!KEY_ID || !KEY_SECRET) {
  throw new Error("Razorpay credentials are required");
}

const razorpay = new Razorpay({
  key_id: KEY_ID,
  key_secret: KEY_SECRET,
});

export interface CreateOrderRequest {
  amount: number; // in paise (smallest currency unit)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export class RazorpayService {
  async createOrder(orderData: CreateOrderRequest) {
    try {
      const order = await razorpay.orders.create(orderData);
      return order;
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      throw new Error("Failed to create payment order");
    }
  }

  async verifyPayment(verification: PaymentVerification): Promise<boolean> {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = verification;
      
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", KEY_SECRET)
        .update(body.toString())
        .digest("hex");

      return expectedSignature === razorpay_signature;
    } catch (error) {
      console.error("Error verifying payment:", error);
      return false;
    }
  }

  async getPaymentDetails(paymentId: string) {
    try {
      const payment = await razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error("Error fetching payment details:", error);
      throw new Error("Failed to fetch payment details");
    }
  }

  async refundPayment(paymentId: string, amount?: number) {
    try {
      const refundData: any = { payment_id: paymentId };
      if (amount) {
        refundData.amount = amount;
      }
      
      const refund = await razorpay.payments.refund(paymentId, refundData);
      return refund;
    } catch (error) {
      console.error("Error processing refund:", error);
      throw new Error("Failed to process refund");
    }
  }
}

export const razorpayService = new RazorpayService();

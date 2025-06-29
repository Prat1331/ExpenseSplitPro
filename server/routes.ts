import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

import { geminiService } from "./services/geminiService";
import { razorpayService } from "./services/razorpayService";
import { paytmService } from "./services/paytmService";
import { insertBillSchema, insertBillItemSchema, insertFriendSchema, insertPaymentSchema } from "@shared/schema";
import { z } from "zod";

// ✅ Add this
import { isAuthenticated } from "./googleAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
 

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.get("/api/users/balance", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const balance = await storage.getUserBalance(userId);
      res.json(balance);
    } catch (error) {
      console.error("Error fetching user balance:", error);
      res.status(500).json({ message: "Failed to fetch balance" });
    }
  });

  // Paytm Wallet Integration
  app.get("/api/wallet/balance", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const paytmBalance = await paytmService.getWalletBalance(userId);
      res.json(paytmBalance);
    } catch (error) {
      console.error("Error fetching Paytm balance:", error);
      res.status(500).json({ message: "Failed to fetch wallet balance" });
    }
  });

  app.get("/api/wallet/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const transactions = await paytmService.getTransactionHistory(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching wallet transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/wallet/transfer", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { recipientPhone, amount, purpose } = req.body;
      
      const transferRequest = {
        recipientPhone,
        amount: parseFloat(amount),
        purpose: purpose || "Bill settlement",
        orderId: `SPLIT_${Date.now()}`,
      };

      const result = await paytmService.transferMoney(transferRequest, userId);
      res.json(result);
    } catch (error) {
      console.error("Error transferring money:", error);
      res.status(500).json({ message: "Failed to transfer money" });
    }
  });

  app.get("/api/users/search/:phoneNumber", isAuthenticated, async (req, res) => {
    try {
      const { phoneNumber } = req.params;
      const user = await storage.getUserByPhoneNumber(phoneNumber);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't return sensitive information
      const { id, firstName, lastName, profileImageUrl } = user;
      res.json({ id, firstName, lastName, profileImageUrl });
    } catch (error) {
      console.error("Error searching user:", error);
      res.status(500).json({ message: "Failed to search user" });
    }
  });

  // Friend routes
  app.get("/api/friends", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const friends = await storage.getFriends(userId);
      res.json(friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  app.get("/api/friends/requests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getFriendRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching friend requests:", error);
      res.status(500).json({ message: "Failed to fetch friend requests" });
    }
  });

  app.post("/api/friends", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertFriendSchema.parse({
        ...req.body,
        userId,
      });

      const friend = await storage.addFriend(validatedData.userId, validatedData.friendId);
      res.json(friend);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error adding friend:", error);
      res.status(500).json({ message: "Failed to add friend" });
    }
  });

  app.post("/api/friends/:friendId/accept", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { friendId } = req.params;
      
      await storage.acceptFriendRequest(userId, friendId);
      res.json({ message: "Friend request accepted" });
    } catch (error) {
      console.error("Error accepting friend request:", error);
      res.status(500).json({ message: "Failed to accept friend request" });
    }
  });

  // Bill routes
  app.get("/api/bills", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bills = await storage.getUserBills(userId);
      res.json(bills);
    } catch (error) {
      console.error("Error fetching bills:", error);
      res.status(500).json({ message: "Failed to fetch bills" });
    }
  });

  app.get("/api/bills/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const bill = await storage.getBillWithDetails(parseInt(id));
      
      if (!bill) {
        return res.status(404).json({ message: "Bill not found" });
      }

      res.json(bill);
    } catch (error) {
      console.error("Error fetching bill:", error);
      res.status(500).json({ message: "Failed to fetch bill" });
    }
  });

  app.post("/api/bills", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertBillSchema.parse({
        ...req.body,
        createdById: userId,
      });

      const bill = await storage.createBill(validatedData);
      res.json(bill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating bill:", error);
      res.status(500).json({ message: "Failed to create bill" });
    }
  });

  app.post("/api/bills/:id/items", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertBillItemSchema.parse({
        ...req.body,
        billId: parseInt(id),
      });

      const item = await storage.addBillItem(validatedData);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error adding bill item:", error);
      res.status(500).json({ message: "Failed to add bill item" });
    }
  });

  app.post("/api/bills/:id/participants", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, shareAmount } = req.body;

      const participant = await storage.addBillParticipant(parseInt(id), userId, shareAmount);
      res.json(participant);
    } catch (error) {
      console.error("Error adding bill participant:", error);
      res.status(500).json({ message: "Failed to add bill participant" });
    }
  });

  // OCR route for bill scanning
  app.post("/api/bills/extract", isAuthenticated, async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ message: "Image data is required" });
      }

      const extractedData = await geminiService.extractBillData(imageBase64);
      res.json(extractedData);
    } catch (error) {
      console.error("Error extracting bill data:", error);
      res.status(500).json({ message: "Failed to extract bill data" });
    }
  });

  // Payment routes
  app.post("/api/payments/create-order", isAuthenticated, async (req: any, res) => {
    try {
      const { amount, billId } = req.body;
      
      const order = await razorpayService.createOrder({
        amount: Math.round(amount * 100), // Convert to paise
        currency: "INR",
        receipt: `bill_${billId}_${Date.now()}`,
        notes: {
          billId: billId.toString(),
          userId: req.user.claims.sub,
        },
      });

      res.json(order);
    } catch (error) {
      console.error("Error creating payment order:", error);
      res.status(500).json({ message: "Failed to create payment order" });
    }
  });

  app.post("/api/payments/verify", isAuthenticated, async (req: any, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, billId, payeeId, amount } = req.body;
      
      const isValid = await razorpayService.verifyPayment({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

      if (!isValid) {
        return res.status(400).json({ message: "Invalid payment signature" });
      }

      // Create payment record
      const payment = await storage.createPayment({
        billId: parseInt(billId),
        payerId: req.user.claims.sub,
        payeeId,
        amount,
        razorpayPaymentId: razorpay_payment_id,
        status: "completed",
      });

      res.json({ message: "Payment verified successfully", payment });
    } catch (error) {
      console.error("Error verifying payment:", error);
      res.status(500).json({ message: "Failed to verify payment" });
    }
  });

  app.get("/api/payments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // This would need additional storage methods to get user payments
      res.json([]);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

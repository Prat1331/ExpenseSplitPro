import crypto from "crypto";

// Paytm Wallet API configuration
const PAYTM_MERCHANT_ID = process.env.PAYTM_MERCHANT_ID || "your_merchant_id";
const PAYTM_MERCHANT_KEY = process.env.PAYTM_MERCHANT_KEY || "your_merchant_key";
const PAYTM_WEBSITE = process.env.PAYTM_WEBSITE || "WEBSTAGING";
const PAYTM_INDUSTRY_TYPE = process.env.PAYTM_INDUSTRY_TYPE || "Retail";
const PAYTM_CHANNEL_ID = process.env.PAYTM_CHANNEL_ID || "WEB";

export interface PaytmBalanceResponse {
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface PaytmTransferRequest {
  recipientPhone: string;
  amount: number;
  purpose: string;
  orderId: string;
}

export class PaytmService {
  private generateChecksum(params: Record<string, string>, key: string): string {
    // Generate checksum for Paytm API requests
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result: Record<string, string>, key: string) => {
        result[key] = params[key];
        return result;
      }, {});

    const paramString = Object.values(sortedParams).join('|');
    return crypto
      .createHash('sha256')
      .update(paramString + key)
      .digest('hex');
  }

  async getWalletBalance(customerId: string): Promise<PaytmBalanceResponse> {
    try {
      // In a real implementation, this would call Paytm's Balance Inquiry API
      // For demo purposes, we'll simulate the response
      const params = {
        MID: PAYTM_MERCHANT_ID,
        CUST_ID: customerId,
        INDUSTRY_TYPE_ID: PAYTM_INDUSTRY_TYPE,
        CHANNEL_ID: PAYTM_CHANNEL_ID,
        WEBSITE: PAYTM_WEBSITE,
        REQUEST_TYPE: "BALANCE_INQUIRY",
        ORDER_ID: `BAL_${Date.now()}`,
      };

      const checksum = this.generateChecksum(params, PAYTM_MERCHANT_KEY);

      // This would be the actual API call to Paytm
      // const response = await fetch('https://securegw-stage.paytm.in/wallet-web/balanceInquiry', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     ...params,
      //     CHECKSUMHASH: checksum,
      //   }),
      // });

      // For demo, return simulated balance data
      // In production, parse the actual Paytm API response
      return {
        balance: Math.random() * 5000 + 1000, // Random balance between ₹1000-₹6000
        currency: "INR",
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching Paytm balance:", error);
      throw new Error("Failed to fetch wallet balance");
    }
  }

  async transferMoney(transferRequest: PaytmTransferRequest, senderId: string): Promise<any> {
    try {
      const params = {
        MID: PAYTM_MERCHANT_ID,
        ORDER_ID: transferRequest.orderId,
        CUST_ID: senderId,
        INDUSTRY_TYPE_ID: PAYTM_INDUSTRY_TYPE,
        CHANNEL_ID: PAYTM_CHANNEL_ID,
        WEBSITE: PAYTM_WEBSITE,
        TXN_AMOUNT: transferRequest.amount.toString(),
        BENEFICIARY_PHONE_NO: transferRequest.recipientPhone,
        PURPOSE: transferRequest.purpose,
        REQUEST_TYPE: "TRANSFER",
      };

      const checksum = this.generateChecksum(params, PAYTM_MERCHANT_KEY);

      // This would be the actual API call to Paytm Wallet Transfer API
      // const response = await fetch('https://securegw-stage.paytm.in/wallet-web/transfer', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     ...params,
      //     CHECKSUMHASH: checksum,
      //   }),
      // });

      // For demo, return simulated success response
      return {
        status: "SUCCESS",
        transactionId: `TXN_${Date.now()}`,
        amount: transferRequest.amount,
        message: "Money transferred successfully",
      };
    } catch (error) {
      console.error("Error transferring money:", error);
      throw new Error("Failed to transfer money");
    }
  }

  async getTransactionHistory(customerId: string, limit: number = 10): Promise<any[]> {
    try {
      // In production, this would fetch actual transaction history from Paytm
      // For demo, return simulated transactions
      const transactions = [];
      for (let i = 0; i < limit; i++) {
        transactions.push({
          id: `TXN_${Date.now()}_${i}`,
          amount: Math.random() * 1000,
          type: Math.random() > 0.5 ? "CREDIT" : "DEBIT",
          description: `Transaction ${i + 1}`,
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          status: "SUCCESS",
        });
      }
      return transactions;
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      throw new Error("Failed to fetch transaction history");
    }
  }
}

export const paytmService = new PaytmService();
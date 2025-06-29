import {
  users,
  bills,
  billItems,
  billParticipants,
  expenseSplits,
  friends,
  payments,
  type User,
  type UpsertUser,
  type Bill,
  type InsertBill,
  type BillItem,
  type InsertBillItem,
  type Friend,
  type InsertFriend,
  type Payment,
  type InsertPayment,
  type BillParticipant,
  type ExpenseSplit,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
  
  // Friend operations
  addFriend(userId: string, friendId: string): Promise<Friend>;
  getFriends(userId: string): Promise<(Friend & { friend: User })[]>;
  getFriendRequests(userId: string): Promise<(Friend & { user: User })[]>;
  acceptFriendRequest(userId: string, friendId: string): Promise<void>;
  
  // Bill operations
  createBill(bill: InsertBill): Promise<Bill>;
  getBill(id: number): Promise<Bill | undefined>;
  getBillWithDetails(id: number): Promise<any>;
  getUserBills(userId: string): Promise<Bill[]>;
  addBillItem(item: InsertBillItem): Promise<BillItem>;
  addBillParticipant(billId: number, userId: string, shareAmount: string): Promise<BillParticipant>;
  addExpenseSplit(billItemId: number, userId: string, shareAmount: string): Promise<ExpenseSplit>;
  
  // Payment operations
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string, razorpayPaymentId?: string): Promise<void>;
  getUserBalance(userId: string): Promise<{ owes: string; owed: string }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber));
    return user;
  }

  // Friend operations
  async addFriend(userId: string, friendId: string): Promise<Friend> {
    const [friend] = await db
      .insert(friends)
      .values({
        userId,
        friendId,
        status: "pending",
      })
      .returning();
    return friend;
  }

  async getFriends(userId: string): Promise<(Friend & { friend: User })[]> {
    return await db
      .select({
        id: friends.id,
        userId: friends.userId,
        friendId: friends.friendId,
        status: friends.status,
        createdAt: friends.createdAt,
        friend: users,
      })
      .from(friends)
      .innerJoin(users, eq(friends.friendId, users.id))
      .where(and(eq(friends.userId, userId), eq(friends.status, "accepted")));
  }

  async getFriendRequests(userId: string): Promise<(Friend & { user: User })[]> {
    return await db
      .select({
        id: friends.id,
        userId: friends.userId,
        friendId: friends.friendId,
        status: friends.status,
        createdAt: friends.createdAt,
        user: users,
      })
      .from(friends)
      .innerJoin(users, eq(friends.userId, users.id))
      .where(and(eq(friends.friendId, userId), eq(friends.status, "pending")));
  }

  async acceptFriendRequest(userId: string, friendId: string): Promise<void> {
    await db
      .update(friends)
      .set({ status: "accepted" })
      .where(and(eq(friends.userId, friendId), eq(friends.friendId, userId)));

    // Create reciprocal friendship
    await db
      .insert(friends)
      .values({
        userId,
        friendId,
        status: "accepted",
      })
      .onConflictDoNothing();
  }

  // Bill operations
  async createBill(bill: InsertBill): Promise<Bill> {
    const [newBill] = await db.insert(bills).values(bill).returning();
    return newBill;
  }

  async getBill(id: number): Promise<Bill | undefined> {
    const [bill] = await db.select().from(bills).where(eq(bills.id, id));
    return bill;
  }

  async getBillWithDetails(id: number): Promise<any> {
    const billData = await db
      .select({
        bill: bills,
        createdBy: users,
      })
      .from(bills)
      .innerJoin(users, eq(bills.createdById, users.id))
      .where(eq(bills.id, id));

    if (billData.length === 0) return null;

    const items = await db
      .select()
      .from(billItems)
      .where(eq(billItems.billId, id));

    const participants = await db
      .select({
        participant: billParticipants,
        user: users,
      })
      .from(billParticipants)
      .innerJoin(users, eq(billParticipants.userId, users.id))
      .where(eq(billParticipants.billId, id));

    return {
      ...billData[0].bill,
      createdBy: billData[0].createdBy,
      items,
      participants,
    };
  }

  async getUserBills(userId: string): Promise<Bill[]> {
    return await db
      .select()
      .from(bills)
      .where(
        or(
          eq(bills.createdById, userId),
          sql`${bills.id} IN (SELECT bill_id FROM bill_participants WHERE user_id = ${userId})`
        )
      )
      .orderBy(desc(bills.createdAt));
  }

  async addBillItem(item: InsertBillItem): Promise<BillItem> {
    const [newItem] = await db.insert(billItems).values(item).returning();
    return newItem;
  }

  async addBillParticipant(billId: number, userId: string, shareAmount: string): Promise<BillParticipant> {
    const [participant] = await db
      .insert(billParticipants)
      .values({
        billId,
        userId,
        shareAmount,
      })
      .returning();
    return participant;
  }

  async addExpenseSplit(billItemId: number, userId: string, shareAmount: string): Promise<ExpenseSplit> {
    const [split] = await db
      .insert(expenseSplits)
      .values({
        billItemId,
        userId,
        shareAmount,
      })
      .returning();
    return split;
  }

  // Payment operations
  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }

  async updatePaymentStatus(id: number, status: string, razorpayPaymentId?: string): Promise<void> {
    const updateData: any = { status };
    if (razorpayPaymentId) {
      updateData.razorpayPaymentId = razorpayPaymentId;
    }
    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    await db
      .update(payments)
      .set(updateData)
      .where(eq(payments.id, id));
  }

  async getUserBalance(userId: string): Promise<{ owes: string; owed: string }> {
    const owesResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
      })
      .from(payments)
      .where(and(eq(payments.payerId, userId), eq(payments.status, "pending")));

    const owedResult = await db
      .select({
        total: sql<string>`COALESCE(SUM(${payments.amount}), 0)`,
      })
      .from(payments)
      .where(and(eq(payments.payeeId, userId), eq(payments.status, "pending")));

    return {
      owes: owesResult[0]?.total || "0",
      owed: owedResult[0]?.total || "0",
    };
  }
}

export const storage = new DatabaseStorage();

import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  decimal,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - mandatory for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - mandatory for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phoneNumber: varchar("phone_number").unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Friends relationship table
export const friends = pgTable("friends", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  friendId: varchar("friend_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("pending"), // pending, accepted, blocked
  createdAt: timestamp("created_at").defaultNow(),
});

// Bills table
export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  createdById: varchar("created_by_id").notNull().references(() => users.id),
  merchantName: varchar("merchant_name").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  tipAmount: decimal("tip_amount", { precision: 10, scale: 2 }).default("0"),
  imageUrl: varchar("image_url"),
  ocrData: jsonb("ocr_data"),
  status: varchar("status").notNull().default("active"), // active, settled, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

// Bill items table
export const billItems = pgTable("bill_items", {
  id: serial("id").primaryKey(),
  billId: integer("bill_id").notNull().references(() => bills.id),
  name: varchar("name").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
});

// Bill participants table
export const billParticipants = pgTable("bill_participants", {
  id: serial("id").primaryKey(),
  billId: integer("bill_id").notNull().references(() => bills.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  shareAmount: decimal("share_amount", { precision: 10, scale: 2 }).notNull(),
  isPaid: boolean("is_paid").notNull().default(false),
  paidAt: timestamp("paid_at"),
});

// Expense splits for individual items
export const expenseSplits = pgTable("expense_splits", {
  id: serial("id").primaryKey(),
  billItemId: integer("bill_item_id").notNull().references(() => billItems.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  shareAmount: decimal("share_amount", { precision: 10, scale: 2 }).notNull(),
});

// Payment transactions
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  billId: integer("bill_id").notNull().references(() => bills.id),
  payerId: varchar("payer_id").notNull().references(() => users.id),
  payeeId: varchar("payee_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  razorpayPaymentId: varchar("razorpay_payment_id"),
  status: varchar("status").notNull().default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdBills: many(bills),
  billParticipants: many(billParticipants),
  expenseSplits: many(expenseSplits),
  sentPayments: many(payments, { relationName: "payer" }),
  receivedPayments: many(payments, { relationName: "payee" }),
  friends: many(friends, { relationName: "user" }),
  friendOf: many(friends, { relationName: "friend" }),
}));

export const billsRelations = relations(bills, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [bills.createdById],
    references: [users.id],
  }),
  items: many(billItems),
  participants: many(billParticipants),
  payments: many(payments),
}));

export const billItemsRelations = relations(billItems, ({ one, many }) => ({
  bill: one(bills, {
    fields: [billItems.billId],
    references: [bills.id],
  }),
  splits: many(expenseSplits),
}));

export const billParticipantsRelations = relations(billParticipants, ({ one }) => ({
  bill: one(bills, {
    fields: [billParticipants.billId],
    references: [bills.id],
  }),
  user: one(users, {
    fields: [billParticipants.userId],
    references: [users.id],
  }),
}));

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  billItem: one(billItems, {
    fields: [expenseSplits.billItemId],
    references: [billItems.id],
  }),
  user: one(users, {
    fields: [expenseSplits.userId],
    references: [users.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  bill: one(bills, {
    fields: [payments.billId],
    references: [bills.id],
  }),
  payer: one(users, {
    fields: [payments.payerId],
    references: [users.id],
    relationName: "payer",
  }),
  payee: one(users, {
    fields: [payments.payeeId],
    references: [users.id],
    relationName: "payee",
  }),
}));

export const friendsRelations = relations(friends, ({ one }) => ({
  user: one(users, {
    fields: [friends.userId],
    references: [users.id],
    relationName: "user",
  }),
  friend: one(users, {
    fields: [friends.friendId],
    references: [users.id],
    relationName: "friend",
  }),
}));

// Zod schemas
export const upsertUserSchema = createInsertSchema(users);
export const insertBillSchema = createInsertSchema(bills).omit({
  id: true,
  createdAt: true,
});
export const insertBillItemSchema = createInsertSchema(billItems).omit({
  id: true,
});
export const insertFriendSchema = createInsertSchema(friends).omit({
  id: true,
  createdAt: true,
});
export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type Bill = typeof bills.$inferSelect;
export type InsertBillItem = z.infer<typeof insertBillItemSchema>;
export type BillItem = typeof billItems.$inferSelect;
export type InsertFriend = z.infer<typeof insertFriendSchema>;
export type Friend = typeof friends.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;
export type BillParticipant = typeof billParticipants.$inferSelect;
export type ExpenseSplit = typeof expenseSplits.$inferSelect;

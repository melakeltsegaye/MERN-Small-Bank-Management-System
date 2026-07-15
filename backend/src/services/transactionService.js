import mongoose from "mongoose";
import { Account } from "../models/Account.js";
import { Transaction } from "../models/Transaction.js";

export const performDeposit = async ({ accountId, amount, performedBy, channel, description }) => {
  if (amount <= 0) throw new Error("Deposit amount must be positive");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await Account.findById(accountId).session(session);
    if (!account) throw new Error("Account not found");
    if (account.status !== "active") throw new Error("Account is not active");

    const updated = await Account.findOneAndUpdate(
      { _id: accountId, version: account.version },
      { $inc: { balance: amount, version: 1 } },
      { new: true, session }
    );
    if (!updated) throw new Error("Concurrent update conflict, please retry");

    const [txn] = await Transaction.create(
      [{
        referenceId: Transaction.generateReferenceId(),
        account: accountId,
        type: "deposit",
        amount,
        balanceAfter: parseFloat(updated.balance.toString()),
        performedBy,
        channel: channel || "online",
        description,
        status: "completed",
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return { account: updated, transaction: txn };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

export const performWithdrawal = async ({ accountId, amount, performedBy, channel, description }) => {
  if (amount <= 0) throw new Error("Withdrawal amount must be positive");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const account = await Account.findById(accountId).session(session);
    if (!account) throw new Error("Account not found");
    if (!account.canWithdraw(amount)) throw new Error("Insufficient funds or account not eligible for withdrawal");

    const updated = await Account.findOneAndUpdate(
      { _id: accountId, version: account.version },
      { $inc: { balance: -amount, version: 1 } },
      { new: true, session }
    );
    if (!updated) throw new Error("Concurrent update conflict, please retry");

    const [txn] = await Transaction.create(
      [{
        referenceId: Transaction.generateReferenceId(),
        account: accountId,
        type: "withdrawal",
        amount,
        balanceAfter: parseFloat(updated.balance.toString()),
        performedBy,
        channel: channel || "online",
        description,
        status: "completed",
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return { account: updated, transaction: txn };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

export const performTransfer = async ({ fromAccountId, toAccountId, amount, performedBy, description }) => {
  if (amount <= 0) throw new Error("Transfer amount must be positive");
  if (fromAccountId === toAccountId) throw new Error("Cannot transfer to the same account");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const fromAccount = await Account.findById(fromAccountId).session(session);
    const toAccount = await Account.findById(toAccountId).session(session);
    if (!fromAccount || !toAccount) throw new Error("One or both accounts not found");
    if (!fromAccount.canWithdraw(amount)) throw new Error("Insufficient funds");
    if (toAccount.status !== "active") throw new Error("Destination account is not active");

    const updatedFrom = await Account.findOneAndUpdate(
      { _id: fromAccountId, version: fromAccount.version },
      { $inc: { balance: -amount, version: 1 } },
      { new: true, session }
    );
    const updatedTo = await Account.findOneAndUpdate(
      { _id: toAccountId, version: toAccount.version },
      { $inc: { balance: amount, version: 1 } },
      { new: true, session }
    );
    if (!updatedFrom || !updatedTo) throw new Error("Concurrent update conflict, please retry");

    const [outTxn] = await Transaction.create(
      [{
        referenceId: Transaction.generateReferenceId(),
        account: fromAccountId,
        relatedAccount: toAccountId,
        type: "transfer_out",
        amount,
        balanceAfter: parseFloat(updatedFrom.balance.toString()),
        performedBy,
        description,
        status: "completed",
      }],
      { session }
    );

    const [inTxn] = await Transaction.create(
      [{
        referenceId: Transaction.generateReferenceId(),
        account: toAccountId,
        relatedAccount: fromAccountId,
        type: "transfer_in",
        amount,
        balanceAfter: parseFloat(updatedTo.balance.toString()),
        performedBy,
        description,
        status: "completed",
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return { fromAccount: updatedFrom, toAccount: updatedTo, outTxn, inTxn };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};
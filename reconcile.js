// Payment reconciliation.

// Reads payments.jsonl and works out how much money we actually collected.

const fs = require("fs");

let total = 0;

let count = 0;

const latestPayments = new Map();

const lines = fs

  .readFileSync("payments.jsonl", "utf8")

  .split("\n");

for (const line of lines) {

  if (!line.trim()) continue;

  let event;

  try {

    event = JSON.parse(line);

  } catch {

    continue;

  }

  if (!event.txn_id) continue;

  const timestamp = Date.parse(event.ts);

  if (Number.isNaN(timestamp)) continue;

  const previous = latestPayments.get(event.txn_id);

  if (!previous || timestamp >= previous.timestamp) {

    latestPayments.set(event.txn_id, {

      status: event.status,

      amount: Number(event.amount),

      timestamp

    });

  }

}

for (const payment of latestPayments.values()) {

  if (payment.status === "success") {

    total += payment.amount;

    count += 1;

  }

}

const expected = parseInt(

  fs.readFileSync("expected.txt", "utf8").trim(),

  10

);

if (count !== expected) {

  console.log(

    `Check failed: counted ${count} successful payments, expected ${expected}.`

  );

  console.log(

    "Something in the data isn't being handled the way the README describes."

  );

} else {

  console.log(`Check passed: ${count} successful payments.`);

  console.log(`Your code: KOYA-${Math.round(total)}`);

}

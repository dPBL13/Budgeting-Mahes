CREATE TYPE "TransactionType" AS ENUM ('income', 'expense');

CREATE TABLE "transactions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "description" TEXT NOT NULL,
    "transaction_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey"
        PRIMARY KEY ("id")
);

CREATE INDEX "transactions_user_id_transaction_date_idx"
ON "transactions"("user_id", "transaction_date");

ALTER TABLE "transactions"
ADD CONSTRAINT "transactions_user_id_fkey"
FOREIGN KEY ("user_id")
REFERENCES "users"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
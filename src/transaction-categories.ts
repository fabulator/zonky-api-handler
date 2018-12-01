// deposit to investor's wallet
const DEPOSIT = 'DEPOSIT';

// withdrawal from an investor's wallet to investor's personal bank account
const WITHDRAW = 'WITHDRAW';

// investment (transfer from investor's wallet to CREDIT account)
const INVESTMENT = 'INVESTMENT';

// return of investment (transfer from yet unknown account to investors' wallets)
const INVESTMENT_RETURN = 'INVESTMENT_RETURN';

// acquisition of an investment on SMP (debit)
const SMP_BUY = 'SMP_BUY';

// selling of an investment on SMP (credit)
const SMP_SELL = 'SMP_SELL';

// transfer of investment acquisition price from CREDIT to JUMBO (credit & debit)
const SMP_PRICE_TRANSFER = 'SMP_PRICE_TRANSFER';

// fee for selling an investment (debit)
const SMP_SALE_FEE = 'SMP_SALE_FEE';

// investment (transfer from CREDIT account to borrower's personal bank account)
const CREDIT = 'CREDIT';

// repayment (transfer from borrower's personal bank account to JUMBO account)
const PAYMENT = 'PAYMENT';

// manual resend (transfer from CREDIT account to JUMBO account)
const RESEND = 'RESEND';

// return payment or deposit to original bank account (transfer from JUMBO or CREDIT account to personal account)
const RETURN = 'RETURN';

// initial credit fee (transfer from CREDIT account to FEE account)
const CREDIT_FEE = 'CREDIT_FEE';

// return of initial credit fee in case of loan withdrawal (transfer from FEE account to JUMBO account)
const CREDIT_FEE_RETURN = 'CREDIT_FEE_RETURN';

// fee for investments (transfer from JUMBO account to FEE account)
const INVESTMENT_FEE = 'INVESTMENT_FEE';

// return of investment fees (transfer from FEE account to JUMBO account and to investors's wallets)
const INVESTMENT_FEE_RETURN = 'INVESTMENT_FEE_RETURN';

// commission of collected loans (transfer to FEE account)
const COLLECTION_FEE = 'COLLECTION_FEE';

// interest paid by bank
const INTEREST = 'INTEREST';

// ignored transactions (category set manually to specific nonstandard transactions)
const IGNORE = 'IGNORE';

// unspecified incoming transaction
const UNSPECIFIED_IN = 'UNSPECIFIED_IN';

// unspecified outgoing transaction
const UNSPECIFIED_OUT = 'UNSPECIFIED_OUT';

export type TransactionCategory = typeof DEPOSIT |
    typeof WITHDRAW |
    typeof INVESTMENT |
    typeof INVESTMENT_RETURN |
    typeof SMP_BUY |
    typeof SMP_SELL |
    typeof SMP_PRICE_TRANSFER |
    typeof SMP_SALE_FEE |
    typeof CREDIT |
    typeof PAYMENT |
    typeof RESEND |
    typeof RETURN |
    typeof CREDIT_FEE |
    typeof CREDIT_FEE_RETURN |
    typeof INVESTMENT_FEE |
    typeof INVESTMENT_FEE_RETURN |
    typeof COLLECTION_FEE |
    typeof INTEREST |
    typeof IGNORE |
    typeof UNSPECIFIED_IN |
    typeof UNSPECIFIED_OUT;

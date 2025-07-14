import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import dotenv from 'dotenv';
dotenv.config({ path: require('path').resolve(__dirname, '../../.env.development') });

const config = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(config);

// Helper to enrich a transaction using Plaid
export async function enrichTransactionWithPlaid({
  accountId,
  accessToken,
  transactionId,
  description,
  amount,
  date,
}: {
  accountId?: string;
  accessToken?: string;
  transactionId?: string;
  description: string;
  amount: number;
  date: string;
}) {
  try {
    // For MVP, we assume you have an access_token for the user
    // (In production, you’d store this after Plaid Link)
    if (!accessToken) throw new Error('No Plaid access token provided');

    // Fetch transactions for the date range (Plaid does not support single-transaction enrichment)
    const startDate = date;
    const endDate = date;
    const response = await plaidClient.transactionsGet({
      access_token: accessToken,
      start_date: startDate,
      end_date: endDate,
      options: {
        account_ids: accountId ? [accountId] : undefined,
      },
    });

    // Try to find the matching transaction by description/amount
    const match = response.data.transactions.find((t: any) =>
      t.name.toLowerCase().includes(description.toLowerCase().slice(0, 8)) &&
      Math.abs(t.amount - Math.abs(amount)) < 0.01
    );

    if (match) {
      return {
        plaidCategory: match.category ? match.category.join(' > ') : undefined,
        plaidMerchant: match.merchant_name,
        plaidLogo: match.logo_url,
        plaidWebsite: match.website,
      };
    }
    return null;
  } catch (err) {
    // Plaid failed or not found
    return null;
  }
} 
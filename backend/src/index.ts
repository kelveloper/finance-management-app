import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '8000', 10);

const plaidClient = new PlaidApi(new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
}));

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('EmpowerFlow backend is running!');
});

app.post('/api/create_link_token', async (req: Request, res: Response) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: 'user-id', // This should be a unique ID for the user
      },
      client_name: 'EmpowerFlow',
      products: [Products.Auth, Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({ error: 'Failed to create link token' });
  }
});

let ACCESS_TOKEN: string | null = null;
let ITEM_ID: string | null = null;

app.post('/api/exchange_public_token', async (req: Request, res: Response) => {
  const { public_token } = req.body;
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });
    ACCESS_TOKEN = response.data.access_token;
    ITEM_ID = response.data.item_id;
    res.json({ public_token_exchange: 'complete' });
  } catch (error) {
    console.error('Error exchanging public token:', error);
    res.status(500).json({ error: 'Failed to exchange public token' });
  }
});

app.post('/api/data', (req: Request, res: Response) => {
  const fetchData = async () => {
    if (!ACCESS_TOKEN) {
      return res.status(400).json({ error: 'No access token' });
    }
    const accountsResponse = await plaidClient.accountsGet({ access_token: ACCESS_TOKEN });
    const transactionsResponse = await plaidClient.transactionsSync({ access_token: ACCESS_TOKEN });
    return {
      accounts: accountsResponse.data.accounts,
      transactions: transactionsResponse.data.added,
    };
  };

  fetchData()
    .then(data => res.json(data))
    .catch(error => {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
    });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port: ${port}`);
}); 
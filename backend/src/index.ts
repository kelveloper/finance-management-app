import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import moment from 'moment';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'stream';
import { supabase } from './supabase';
import { detectRecurringTransactions } from './services/recurring';
import { PersonalizedAI } from './services/personalized-ai';
import { UserProfileService } from './services/user-profile';
import { Transaction } from '../../common/types';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// This is the primary data structure for a transaction in our system.
// The local Transaction interface has been removed.

// This function analyzes an array of transactions to find spending anomalies.
export function analyzeTransactions(transactions: Transaction[]) {
    const spendingByCategory: { [category: string]: number } = {};
    const weeklyAverages: { [category: string]: number } = {};
    const anomalies: any[] = [];
    const fourWeeksAgo = moment().subtract(28, 'days');
    const oneWeekAgo = moment().subtract(7, 'days');

    transactions.forEach((t) => {
        // Only include debits (expenses) in anomaly detection that have a category
        if (t.category && moment(t.posted_date).isAfter(fourWeeksAgo) && t.amount < 0) {
            const positiveAmount = Math.abs(t.amount);
            spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + positiveAmount;
        }
    });

    for (const category in spendingByCategory) {
        weeklyAverages[category] = spendingByCategory[category] / 4;
    }

    const weeklySpending: { [category: string]: number } = {};
    transactions.forEach((t) => {
        if (t.category && moment(t.posted_date).isAfter(oneWeekAgo) && t.amount < 0) {
            const positiveAmount = Math.abs(t.amount);
            weeklySpending[t.category] = (weeklySpending[t.category] || 0) + positiveAmount;
        }
    });

    for (const category in weeklySpending) {
        if (weeklyAverages[category] && weeklySpending[category] > weeklyAverages[category] * 1.01) {
            anomalies.push({
                category,
                thisWeek: weeklySpending[category],
                weeklyAverage: weeklyAverages[category],
                insight: `You've spent $${weeklySpending[category].toFixed(2)} on ${category} this week, which is higher than your recent average of $${weeklyAverages[category].toFixed(2)}/week.`,
                advice: getAdviceForCategory(category)
            });
        }
    }
    return anomalies;
}

// Provides templated advice based on spending category.
function getAdviceForCategory(category: string): string {
    const adviceMap: { [key: string]: string[] } = {
        'Food and Drink': ['Trending high on Dining Out? Challenge yourself to pack lunch twice this week.'],
        'Shops': ['Your shopping spending is up. Try a "no-spend" weekend to reset your habits.'],
        'Travel': ['Travel costs are higher than usual. Look for off-peak travel deals for your next trip.'],
        'Entertainment': ['Entertainment spending is on the rise. Explore free local events or a movie night at home.'],
        'Default': ['Your spending in this category is higher than usual. Take a moment to review the transactions.']
    };
    return adviceMap[category] ? adviceMap[category][0] : adviceMap['Default'][0];
}

dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const app = express();
const port = parseInt(process.env.PORT || '8000', 10);

app.use(cors());
app.use(express.json());

// Root endpoint for health checks.
app.get('/', (req: Request, res: Response) => {
    res.send('EmpowerFlow backend is running and connected to Supabase!');
});

// JWT Secret (in production, this should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Helper function to generate JWT tokens
const generateToken = (userId: string) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
};

// User Registration
app.post('/api/auth/register', (async (req: Request, res: Response) => {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        // Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([{
                email: email.toLowerCase(),
                password_hash: hashedPassword,
                first_name: firstName,
                last_name: lastName,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (error) throw error;

        // Generate token
        const token = generateToken(newUser.id);

        res.status(201).json({
            message: 'User created successfully',
            accessToken: token,
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.first_name,
                lastName: newUser.last_name
            },
            hasData: false // New user has no data yet
        });

    } catch (error: any) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
}) as express.RequestHandler);

// User Login
app.post('/api/auth/login', (async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Get user by email
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Check if user has transaction data
        const { data: transactions, error: transactionError } = await supabase
            .from('transactions')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);

        if (transactionError) throw transactionError;

        // Generate token
        const token = generateToken(user.id);

        res.json({
            message: 'Login successful',
            accessToken: token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name
            },
            hasData: transactions && transactions.length > 0
        });

    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
}) as express.RequestHandler);

// Middleware to verify JWT tokens (simplified for now)
// const authenticateToken = (req: any, res: Response, next: express.NextFunction) => {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

//     if (!token) {
//         return res.status(401).json({ error: 'Access token required' });
//     }

//     jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
//         if (err) {
//             return res.status(403).json({ error: 'Invalid or expired token' });
//         }
//         req.userId = decoded.userId;
//         next();
//     });
// };

// Fetches all relevant financial data for the user dashboard.
app.get('/api/data', (async (req: Request, res: Response) => {
    // For now, get user ID from header or default to mock user
    // In production, this would come from authenticated JWT token
    const userId = req.headers['x-user-id'] as string || 'mock_user_123';

    try {
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('posted_date', { ascending: false });

        if (error) throw error;
        if (!transactions) throw new Error('No transactions found.');

        const anomalies = analyzeTransactions(transactions);
        const recurring = detectRecurringTransactions(transactions);
        
        // Create a temporary user profile from transaction analysis (no database needed for now)
        const personality = UserProfileService.analyzeSpendingPersonality(transactions);
        const userProfile = {
            id: userId,
            financial_personality: personality,
            preferences: {
                risk_tolerance: 'moderate' as const,
                financial_goals: UserProfileService.generatePersonalizedGoals(
                    { financial_personality: personality } as any, 
                    transactions
                ),
                spending_priorities: [],
                notification_preferences: {
                    anomaly_alerts: true,
                    goal_reminders: true,
                    saving_suggestions: true,
                }
            },
            learning_data: {
                category_corrections: [],
                ignored_suggestions: [],
                approved_suggestions: [],
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        // Generate personalized AI insights with user profile context
        const personalizedAI = new PersonalizedAI(transactions, userProfile);
        const personalizedInsights = personalizedAI.generatePersonalizedInsights();
        const smartGoalSuggestions = personalizedAI.generateSmartGoalSuggestions();
        
        // Mock account data to keep the frontend happy.
        const accounts = [{
            account_id: 'mock-chase-8793',
            name: 'Chase Checking (...8793)',
            balances: { current: 12345.67 },
            type: 'depository',
            subtype: 'checking'
        }];

        res.json({
            accounts,
            transactions,
            insights: { 
                anomalies, 
                recurring,
                personalized: personalizedInsights,
                smartGoals: smartGoalSuggestions
            },
        });

    } catch (error: any) {
        console.error("Error fetching data from Supabase:", error);
        res.status(500).json({ error: error.message || 'An unexpected error occurred.' });
    }
}) as express.RequestHandler);

// Updates the category for a specific transaction.
app.patch('/api/transactions/:transactionId', (async (req: Request, res: Response) => {
    const { transactionId } = req.params;
    const { category } = req.body;
    const userId = req.headers['x-user-id'] as string || 'mock_user_123';

    if (!category) {
        return res.status(400).json({ error: 'Category is required.' });
    }

    try {
        const { error } = await supabase
            .from('transactions')
            .update({ category })
            .eq('id', transactionId)
            .eq('user_id', userId);

        if (error) throw error;
        res.json({ message: 'Transaction category updated successfully.' });
    } catch (error: any) {
        console.error('Error updating transaction category:', error);
        res.status(500).json({ error: 'Failed to update transaction category.' });
    }
}) as express.RequestHandler);

// Updates the "essential" or "discretionary" tag for a transaction.
app.patch('/api/transactions/:transactionId/tag', (async (req: Request, res: Response) => {
    const { transactionId } = req.params;
    const { tag } = req.body;
    const userId = req.headers['x-user-id'] as string || 'mock_user_123';

    if (!tag || !['essential', 'discretionary'].includes(tag)) {
        return res.status(400).json({ error: 'A valid tag ("essential" or "discretionary") is required.' });
    }

    try {
        const { error } = await supabase
            .from('transactions')
            .update({ tag: tag })
            .eq('id', transactionId)
            .eq('user_id', userId);

        if (error) throw error;
        res.json({ message: 'Tag updated successfully.' });
    } catch (error: any) {
        console.error('Error updating transaction tag:', error);
        res.status(500).json({ error: 'Failed to update transaction tag.' });
    }
}) as express.RequestHandler);


// Applies a categorization rule to all matching transactions.
app.post('/api/rules/apply', (async (req: Request, res: Response) => {
    const { keyword, category } = req.body;
    const userId = 'mock_user_123';

    if (!keyword || !category) {
        return res.status(400).json({ error: 'Keyword and category are required.' });
    }

    try {
        const { count, error } = await supabase
            .from('transactions')
            .update({ category: category })
            .ilike('description', `%${keyword}%`) // Case-insensitive search
            .eq('user_id', userId);
        
        if (error) throw error;

        res.json({ message: `Rule applied successfully. Updated ${count} transactions.` });

    } catch (error: any) {
        console.error('Error applying categorization rule:', error);
        res.status(500).json({ error: 'Failed to apply categorization rule.' });
    }
}) as express.RequestHandler);


// Checks if data exists for the mock user and creates a session.
app.post('/api/session/start', (async (req, res) => {
    const userId = 'mock_user_123';

    try {
        const { data, error, count } = await supabase
            .from('transactions')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (error) throw error;

        if (count && count > 0) {
            // Data exists, create a session token and return it.
            const accessToken = new Date().getTime().toString();
            res.json({ 
                message: 'Session started.',
                accessToken: accessToken 
            });
        } else {
            // No data found for this user.
            res.status(404).json({ error: 'No data found. Please upload a CSV.' });
        }
    } catch (error: any) {
        console.error('Error starting session:', error);
        res.status(500).json({ error: 'Failed to start session.' });
    }
}) as express.RequestHandler);

// Gets user profile information (temporarily disabled - requires database table)
app.get('/api/profile', (async (req: Request, res: Response) => {
    res.json({ message: 'User profile feature coming soon - requires database setup' });
}) as express.RequestHandler);

// Updates user profile information (temporarily disabled - requires database table)
app.patch('/api/profile', (async (req: Request, res: Response) => {
    res.json({ message: 'User profile updates coming soon - requires database setup' });
}) as express.RequestHandler);

// Records feedback on AI suggestions (temporarily disabled - requires database table)
app.post('/api/suggestions/feedback', (async (req: Request, res: Response) => {
    res.json({ message: 'Feedback recording coming soon - requires database setup' });
}) as express.RequestHandler);


// --- CSV Upload Endpoint ---
const upload = multer({ storage: multer.memoryStorage() });

interface ChaseCsvRow {
  'Details': 'DEBIT' | 'CREDIT';
  'Posting Date': string;
  'Description': string;
  'Amount': string;
  'Type': string;
  'Balance'?: string;
}

app.post('/api/upload-csv', upload.single('file'), (async (req, res) => {
    const userId = req.headers['x-user-id'] as string || 'mock_user_123'; 

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const transactions: any[] = [];
    const readable = new Readable();
    readable._read = () => {}; // _read is required
    readable.push(req.file.buffer);
    readable.push(null);

    readable
        .pipe(csv({ skipLines: 1, mapHeaders: ({ header }) => header.trim() }))
        .on('data', (row: ChaseCsvRow) => {
            const amount = parseFloat(row.Amount);
            const balance = row.Balance ? parseFloat(row.Balance) : undefined;

            if (!isNaN(amount) && row['Posting Date']) {
                transactions.push({
                    user_id: userId,
                    transaction_type: row.Details,
                    posted_date: moment(row['Posting Date'], 'MM/DD/YYYY').format('YYYY-MM-DD'),
                    description: row.Description.trim(),
                    amount: amount,
                    details: row.Type,
                    balance: balance,
                });
            }
        })
        .on('end', async () => {
            if (transactions.length === 0) {
                return res.status(400).json({ error: 'No valid transactions found in the CSV.' });
            }

            try {
                // Clear old transactions for this user
                await supabase.from('transactions').delete().eq('user_id', userId);

                // Insert new ones
                const { error } = await supabase.from('transactions').insert(transactions);

                if (error) {
                    throw error;
                }
                
                // Use a simple timestamp as the access token for the session
                const accessToken = new Date().getTime().toString();
                res.status(200).json({ 
                    message: `${transactions.length} transactions uploaded successfully.`,
                    accessToken: accessToken,
                });

            } catch (error: any) {
                console.error('Error during CSV-Supabase operation:', error);
                res.status(500).json({ error: error.message || 'Failed to process CSV file.' });
            }
        });
}) as express.RequestHandler);

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend server is running on http://0.0.0.0:${port}`);
});

export { app }; 
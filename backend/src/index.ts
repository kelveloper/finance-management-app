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
import { categorizeTransactions, learnFromUserFeedback, getSubcategoryStructure } from './categorize-transactions';
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

        // Check if user has completed personalization
        const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('id', user.id)
            .limit(1);

        if (profileError) throw profileError;

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
            hasData: transactions && transactions.length > 0,
            hasCompletedPersonalization: userProfile && userProfile.length > 0
        });

    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
}) as express.RequestHandler);

// Middleware to verify JWT tokens
const authenticateToken: express.RequestHandler = (req: any, res: Response, next: express.NextFunction): void => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
        if (err) {
            res.status(403).json({ error: 'Invalid or expired token' });
            return;
        }
        req.userId = decoded.userId;
        next();
    });
};

// User Personalization  
app.post('/api/user/personalization', authenticateToken, (async (req: Request, res: Response) => {
    const { userId, answers } = req.body;
    const authenticatedUserId = (req as any).userId;

    // Ensure user can only update their own profile
    if (userId !== authenticatedUserId) {
        res.status(403).json({ error: 'Access denied' });
        return;
    }

    if (!answers || typeof answers !== 'object') {
        res.status(400).json({ error: 'Invalid answers data' });
        return;
    }

    try {
        console.log('Saving personalization for user:', userId, answers);

        // Create user profile with personalization data
        const profileData = {
            id: userId,
            preferences: {
                risk_tolerance: 'moderate', // Default, can be updated later
                financial_goals: answers.primary_goal ? [answers.primary_goal] : [],
                spending_priorities: [],
                notification_preferences: {
                    anomaly_alerts: answers.coaching_style === 'proactive_alerts',
                    goal_reminders: true,
                    saving_suggestions: answers.coaching_style !== 'show_patterns',
                }
            },
            financial_personality: {
                spender_type: answers.financial_personality || 'balanced',
                impulse_score: getImpulseScore(answers.financial_personality),
                planning_horizon: getPlanningHorizon(answers.financial_personality),
                coaching_style: answers.coaching_style || 'show_patterns'
            },
            learning_data: {
                category_corrections: [],
                ignored_suggestions: [],
                approved_suggestions: [],
                onboarding_answers: answers
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('user_profiles')
            .upsert(profileData)
            .select()
            .single();

        if (error) throw error;

        res.json({
            message: 'Personalization saved successfully',
            profile: data
        });

    } catch (error: any) {
        console.error('Personalization error:', error);
        res.status(500).json({ error: 'Failed to save personalization' });
    }
}) as express.RequestHandler);

// Helper functions for personalization mapping
function getImpulseScore(personality: string): number {
    switch (personality) {
        case 'planner': return 2;
        case 'goal_focused': return 4;
        case 'go_with_flow': return 7;
        case 'stressed': return 6;
        default: return 5;
    }
}

function getPlanningHorizon(personality: string): 'short' | 'medium' | 'long' {
    switch (personality) {
        case 'planner': return 'long';
        case 'goal_focused': return 'medium';
        case 'go_with_flow': return 'short';
        case 'stressed': return 'short';
        default: return 'medium';
    }
}

// Fetches all relevant financial data for the user dashboard.
app.get('/api/data', (async (req: Request, res: Response) => {
    // For now, get user ID from header or default to mock user
    // In production, this would come from authenticated JWT token
    const requestedUserId = req.headers['x-user-id'] as string || 'mock_user_123';
    
    // DEVELOPMENT ONLY: Always use dev_user_2025 to see test data
    const userId = process.env.NODE_ENV === 'development' ? 'dev_user_2025' : requestedUserId;

    try {
        console.log(`🔍 Fetching transactions for user: ${userId}`);
        
        // Get all transactions without limit using pagination
        let allTransactions: any[] = [];
        let from = 0;
        const pageSize = 1000;
        
        while (true) {
            const { data: pageTransactions, error, count } = await supabase
                .from('transactions')
                .select('*', { count: 'exact' })
                .eq('user_id', userId)
                .order('posted_date', { ascending: false })
                .range(from, from + pageSize - 1);
            
            if (error) throw error;
            if (!pageTransactions || pageTransactions.length === 0) break;
            
            allTransactions.push(...pageTransactions);
            console.log(`📊 Fetched ${pageTransactions.length} transactions (${from + 1}-${from + pageTransactions.length}) of ${count} total`);
            
            if (pageTransactions.length < pageSize) break; // Last page
            from += pageSize;
        }
        
        const transactions = allTransactions;
        console.log(`✅ Total transactions fetched: ${transactions.length}`);
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
        const personalizedInsights = personalizedAI.generatePersonalizedInsightsWithLearning();
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
    const { category, subcategory } = req.body;
    const userId = req.headers['x-user-id'] as string || 'dev_user_2025';

    if (!category) {
        res.status(400).json({ error: 'Category is required.' });
        return;
    }

    try {
        const { error } = await supabase
            .from('transactions')
            .update({ 
                category,
                subcategory: subcategory || null
            })
            .eq('id', transactionId)
            .eq('user_id', userId);

        if (error) throw error;
        res.json({ message: 'Transaction category and subcategory updated successfully.' });
    } catch (error: any) {
        console.error('Error updating transaction:', error);
        res.status(500).json({ error: 'Failed to update transaction.' });
    }
}) as express.RequestHandler);

// Updates the "essential" or "discretionary" tag for a transaction.
app.patch('/api/transactions/:transactionId/tag', (async (req: Request, res: Response) => {
    const { transactionId } = req.params;
    const { tag } = req.body;
    const userId = req.headers['x-user-id'] as string || 'mock_user_123';

    if (!tag || !['essential', 'discretionary'].includes(tag)) {
        res.status(400).json({ error: 'A valid tag ("essential" or "discretionary") is required.' });
        return;
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
        res.status(400).json({ error: 'Keyword and category are required.' });
        return;
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


// Checks if data exists for the dev user and creates a session.
app.post('/api/session/start', (async (req, res) => {
    const userId = 'dev_user_2025';

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

// --- Smart Categorization Endpoints ---

// Enhanced endpoint to get available categories and subcategories
app.get('/api/categories', (async (req: Request, res: Response) => {
    const categories = [
        'Income',
        'Food & Drink', 
        'Transportation',
        'Shopping',
        'Entertainment',
        'Bills & Utilities',
        'Financial & Transfers',
        'Health & Medical',
        'Personal Care',
        'General'
    ];
    
    const subcategoryStructure = getSubcategoryStructure();
    
    res.json({ 
        categories,
        subcategories: subcategoryStructure
    });
}) as express.RequestHandler);

// Enhanced endpoint to update transaction category and subcategory
app.post('/api/categorize/smart', (async (req: Request, res: Response) => {
    try {
        const result = await categorizeTransactions();
        res.json({
            message: 'Smart categorization completed successfully.',
            ...result
        });
    } catch (error: any) {
        console.error('Error during smart categorization:', error);
        res.status(500).json({ error: 'Failed to run smart categorization.' });
    }
}) as express.RequestHandler);

// Enhanced smart categorization feedback endpoint with AI learning
app.post('/api/categorize/feedback', (async (req: Request, res: Response) => {
    const { transactionId, category, subcategory, originalCategory, originalSubcategory, reasoning } = req.body;
    const userId = req.headers['x-user-id'] as string || 'dev_user_2025';
    
    if (!transactionId || !category) {
        res.status(400).json({ error: 'Transaction ID and category are required.' });
        return;
    }

    try {
        // First, update the transaction in the database
        const success = await learnFromUserFeedback(transactionId, category, subcategory);
        
        if (success) {
            // Get the updated transaction to feed into AI learning
            const { data: transaction, error: transactionError } = await supabase
                .from('transactions')
                .select('*')
                .eq('id', transactionId)
                .eq('user_id', userId)
                .single();

            if (transactionError) throw transactionError;

            // If we have original category info, learn from the correction
            if (originalCategory && transaction) {
                // Get user's transactions to initialize PersonalizedAI
                const { data: allTransactions, error: allTransactionsError } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', userId)
                    .order('posted_date', { ascending: false });

                if (allTransactionsError) throw allTransactionsError;

                // Initialize PersonalizedAI with user's data
                const personalizedAI = new PersonalizedAI(allTransactions);

                // Learn from the user's correction
                personalizedAI.learnFromUserBehavior({
                    original_category: originalCategory,
                    corrected_category: category,
                    original_subcategory: originalSubcategory,
                    corrected_subcategory: subcategory,
                    merchant: transaction.description,
                    amount: Math.abs(transaction.amount),
                    reasoning: reasoning
                });

                // Get learning statistics for debugging
                const learningStats = personalizedAI.getLearningStatistics();
                
                res.json({ 
                    message: 'Feedback received and learned successfully.',
                    learned: { category, subcategory },
                    ai_learning: {
                        correction_recorded: true,
                        has_reasoning: !!reasoning,
                        learning_stats: learningStats
                    }
                });
            } else {
                res.json({ 
                    message: 'Feedback received successfully.',
                    learned: { category, subcategory }
                });
            }
        } else {
            res.status(500).json({ error: 'Failed to process feedback.' });
        }
    } catch (error: any) {
        console.error('Error processing feedback:', error);
        res.status(500).json({ error: 'Failed to process feedback.' });
    }
}) as express.RequestHandler);

// NEW: AI suggestion feedback endpoint for learning
app.post('/api/ai/suggestion-feedback', (async (req: Request, res: Response) => {
    const { suggestionId, action, userModification, reasoning } = req.body;
    const userId = req.headers['x-user-id'] as string || 'dev_user_2025';
    
    if (!suggestionId || !action) {
        res.status(400).json({ error: 'Suggestion ID and action are required.' });
        return;
    }

    if (!['accepted', 'dismissed', 'modified'].includes(action)) {
        res.status(400).json({ error: 'Action must be accepted, dismissed, or modified.' });
        return;
    }

    try {
        // Get user's transactions to initialize PersonalizedAI
        const { data: allTransactions, error: allTransactionsError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('posted_date', { ascending: false });

        if (allTransactionsError) throw allTransactionsError;

        // Initialize PersonalizedAI with user's data
        const personalizedAI = new PersonalizedAI(allTransactions);

        // Track the suggestion feedback
        personalizedAI.trackSuggestionFeedback(suggestionId, action, userModification);

        // Get learning statistics
        const learningStats = personalizedAI.getLearningStatistics();
        
        res.json({ 
            message: 'Suggestion feedback recorded successfully.',
            action: action,
            ai_learning: {
                feedback_recorded: true,
                learning_stats: learningStats
            }
        });
    } catch (error: any) {
        console.error('Error processing suggestion feedback:', error);
        res.status(500).json({ error: 'Failed to process suggestion feedback.' });
    }
}) as express.RequestHandler);

// NEW: Get AI learning statistics endpoint
app.get('/api/ai/learning-stats', (async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string || 'dev_user_2025';
    
    try {
        // Get user's transactions to initialize PersonalizedAI
        const { data: allTransactions, error: allTransactionsError } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('posted_date', { ascending: false });

        if (allTransactionsError) throw allTransactionsError;

        // Initialize PersonalizedAI with user's data
        const personalizedAI = new PersonalizedAI(allTransactions);

        // Get learning statistics
        const learningStats = personalizedAI.getLearningStatistics();
        
        res.json({
            message: 'Learning statistics retrieved successfully.',
            stats: learningStats
        });
    } catch (error: any) {
        console.error('Error getting learning statistics:', error);
        res.status(500).json({ error: 'Failed to get learning statistics.' });
    }
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
    // Use consistent development userID for development phase
    const userId = req.headers['x-user-id'] as string || 'dev_user_2025'; 

    // Development mode: Check if we should use real Supabase or mock data
    const hasSupabaseUrl = process.env.SUPABASE_URL && process.env.SUPABASE_URL.length > 0;
    const hasSupabaseKey = process.env.SUPABASE_ANON_KEY && process.env.SUPABASE_ANON_KEY.length > 0;
    const forceDevelopmentMode = process.env.FORCE_DEVELOPMENT_MODE === 'true';
    const isDevelopmentMode = !hasSupabaseUrl || !hasSupabaseKey || forceDevelopmentMode;
    
    console.log('🔍 Development mode check:', {
        hasSupabaseUrl,
        hasSupabaseKey,
        forceDevelopmentMode,
        isDevelopmentMode,
        userId,
        supabaseUrl: process.env.SUPABASE_URL ? '[PRESENT]' : '[MISSING]',
        supabaseKey: process.env.SUPABASE_ANON_KEY ? '[PRESENT]' : '[MISSING]'
    });
    
    // For development, we'll process the CSV and store it in Supabase with fallback handling
    if (!req.file) {
        res.status(400).json({ error: 'No file uploaded.' });
        return;
    }
    
    // Always try to process the CSV file and upload to Supabase
    console.log(`📝 Processing CSV upload for user: ${userId}`);

    const transactions: any[] = [];
    const readable = new Readable();
    readable._read = () => {}; // _read is required
    readable.push(req.file.buffer);
    readable.push(null);

    let rowCount = 0;

    readable
        .pipe(csv({ headers: false })) // Don't treat first row as headers
        .on('data', (row: any) => {
            rowCount++;
            console.log(`Row ${rowCount}:`, row);

            // Chase CSV format (without headers):
            // Column 0: Details (DEBIT/CREDIT)
            // Column 1: Posting Date
            // Column 2: Description
            // Column 3: Amount
            // Column 4: Type (ACH_DEBIT, etc.)
            // Column 5: Balance (optional)

            if (Object.keys(row).length >= 4) {
                const amountValue = row['3'];
                const amount = parseFloat(amountValue);
                const dateValue = row['1'];
                const descriptionValue = row['2'];

                if (!isNaN(amount) && dateValue && descriptionValue) {
                    // Try multiple date formats
                    let parsedDate;
                    try {
                        // Try MM/DD/YYYY format first
                        parsedDate = moment(dateValue, 'MM/DD/YYYY').format('YYYY-MM-DD');
                        if (!moment(parsedDate).isValid()) {
                            // Try other common formats
                            parsedDate = moment(dateValue, 'YYYY-MM-DD').format('YYYY-MM-DD');
                            if (!moment(parsedDate).isValid()) {
                                parsedDate = moment(dateValue, 'M/D/YYYY').format('YYYY-MM-DD');
                            }
                        }
                    } catch (e) {
                        console.error('Date parsing error:', e);
                        return; // Skip this row
                    }
                    
                    // Generate unique transaction ID
                    const transactionId = `${userId}_${Date.now()}_${transactions.length}`;
                    
                    transactions.push({
                        id: transactionId,
                        user_id: userId,
                        account_id: 'chase-8793', // Default account ID for Chase uploads
                        posted_date: parsedDate,
                        description: descriptionValue.trim(),
                        amount: amount,
                        category: 'Uncategorized', // Will be categorized automatically by AI
                        tag: null, // Will be tagged later by AI
                    });
                }
            }
        })
        .on('end', async () => {
            console.log(`Processed ${transactions.length} transactions from CSV (${rowCount} total rows)`);
            
            if (transactions.length === 0) {
                res.status(400).json({ 
                    error: 'No valid transactions found in the CSV.',
                    details: `Processed ${rowCount} rows. Expected Chase CSV format with columns: Details, Posting Date, Description, Amount, Type, Balance.`
                });
                return;
            }

            try {
                console.log(`🗑️  Clearing old transactions for user: ${userId}`);
                
                // Clear old transactions for this user
                const { error: deleteError } = await supabase.from('transactions').delete().eq('user_id', userId);
                if (deleteError) {
                    console.log('⚠️  Could not clear old transactions:', deleteError.message);
                }

                console.log(`📤 Inserting ${transactions.length} new transactions...`);
                
                // Insert new ones with better error handling
                const { error } = await supabase.from('transactions').insert(transactions);

                if (error) {
                    console.error('❌ Supabase insert error:', error);
                    
                    // If it's a schema cache error, provide a development workaround
                    if (error.message.includes('schema cache') || error.message.includes('account_id')) {
                        console.log('🚧 Schema cache issue detected - providing development response');
                        
                        const accessToken = new Date().getTime().toString();
                        const mockCategorization = {
                            total: transactions.length,
                            categorized: {
                                'Food and Drink': Math.floor(transactions.length * 0.3),
                                'Shops': Math.floor(transactions.length * 0.2),
                                'Transportation': Math.floor(transactions.length * 0.15),
                                'Entertainment': Math.floor(transactions.length * 0.1),
                                'Bills and Utilities': Math.floor(transactions.length * 0.1),
                                'General': Math.floor(transactions.length * 0.15)
                            },
                            uncategorized: 0
                        };
                        
                        res.status(200).json({ 
                            message: `🚧 Dev mode: ${transactions.length} transactions processed from CSV! Schema cache issue bypassed.`,
                            accessToken: accessToken,
                            categorization: mockCategorization,
                            note: 'Development mode: CSV processed but not stored due to schema cache issue'
                        });
                        return;
                    }
                    
                    throw error;
                }
                
                // Automatically categorize the newly uploaded transactions
                console.log('Running automatic categorization after CSV upload...');
                const categorizationResults = await categorizeTransactions();
                
                // Use a simple timestamp as the access token for the session
                const accessToken = new Date().getTime().toString();
                
                // Build detailed categorization message
                const categoryBreakdown = Object.entries(categorizationResults.categorized)
                    .map(([category, count]) => `${count} ${category}`)
                    .join(', ');
                
                const message = categorizationResults.total > 0 
                    ? `${transactions.length} transactions uploaded and automatically categorized! ${categoryBreakdown}${categorizationResults.uncategorized > 0 ? `, ${categorizationResults.uncategorized} General` : ''}.`
                    : `${transactions.length} transactions uploaded successfully.`;
                
                res.status(200).json({ 
                    message,
                    accessToken: accessToken,
                    categorization: categorizationResults
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
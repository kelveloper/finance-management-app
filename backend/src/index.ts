import express from 'express';
import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { TagPredictorService } from './services/tag-predictor';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const app = express();
const PORT = process.env.PORT || 8000;
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// Get all transactions for a user
app.get('/api/data', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string || 'dev_user_2025';
    
    try {
        // Get all transactions for the user
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('posted_date', { ascending: false });
            
        if (error) throw error;
        if (!transactions) {
            return res.status(404).json({ error: 'No transactions found.' });
        }
        
        // Mock insights data for now
        const insights = {
            anomalies: [],
            recurring: [],
            personalized: []
        };
        
        res.json({
            transactions,
            insights
        });
    } catch (error: any) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data.' });
    }
});

// Update transaction tag (essential/discretionary)
app.post('/api/transactions/:id/tag', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { tag } = req.body;
    const userId = req.headers['x-user-id'] as string || 'dev_user_2025';
    
    if (!tag || (tag !== 'essential' && tag !== 'discretionary')) {
        return res.status(400).json({ error: 'Invalid tag value. Must be "essential" or "discretionary".' });
    }
    
    try {
        // Update the transaction tag
        const { data, error } = await supabase
            .from('transactions')
            .update({ tag })
            .eq('id', id)
            .eq('user_id', userId)
            .select();
            
        if (error) throw error;
        if (!data || data.length === 0) {
            return res.status(404).json({ error: 'Transaction not found or not authorized.' });
        }
        
        res.json({
            message: 'Transaction tag updated successfully.',
            transaction: data[0]
        });
    } catch (error: any) {
        console.error('Error updating transaction tag:', error);
        res.status(500).json({ error: 'Failed to update transaction tag.' });
    }
});

// Predicts tags (essential/discretionary) for transactions
app.get('/api/transactions/predict-tags', async (req: Request, res: Response) => {
    const userId = req.headers['x-user-id'] as string || 'dev_user_2025';
    
    try {
        // Get all transactions for the user
        const { data: transactions, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('posted_date', { ascending: false });
            
        if (error) throw error;
        if (!transactions) {
            return res.status(404).json({ error: 'No transactions found.' });
        }
        
        // Filter transactions that don't have tags yet
        const untaggedTransactions = transactions.filter(t => !t.tag);
        
        if (untaggedTransactions.length === 0) {
            return res.json({ 
                message: 'All transactions are already tagged.',
                predictions: {}
            });
        }
        
        // Use the tag predictor service to predict tags
        const tagPredictor = new TagPredictorService();
        const predictions = tagPredictor.predictTags(untaggedTransactions);
        
        console.log(`🏷️ Predicted tags for ${Object.keys(predictions).length} transactions`);
        
        res.json({
            message: `Successfully predicted tags for ${Object.keys(predictions).length} transactions.`,
            predictions
        });
    } catch (error: any) {
        console.error('Error predicting tags:', error);
        res.status(500).json({ error: 'Failed to predict tags.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`EmpowerFlow backend listening on port ${PORT}, connected to Supabase.`);
});
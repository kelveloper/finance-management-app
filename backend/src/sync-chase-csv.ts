import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { supabase } from './supabase';
import moment from 'moment';

interface ChaseTransaction {
  'Details': 'DEBIT' | 'CREDIT';
  'Posting Date': string;
  'Description': string;
  'Amount': string;
  'Type': string;
  'Balance': string;
}

export const runSync = async (transactionsToProcess?: any[]): Promise<number> => {
  if (transactionsToProcess) {
    // If transactions are provided directly, use them
    try {
      await processTransactions(transactionsToProcess);
      return transactionsToProcess.length;
    } catch (error) {
      console.error('Error processing provided transactions:', error);
      throw error;
    }
  }

  // If no transactions are provided, read from CSV
  return new Promise((resolve, reject) => {
    const transactions: any[] = [];
    const filePath = path.join(__dirname, '..', '..', 'env', 'Chase8793_Activity_2025-2YRS.csv');

    console.log('Reading and parsing CSV file...');
    fs.createReadStream(filePath)
      .pipe(csv({
        skipLines: 1,
      }))
      .on('data', (row: ChaseTransaction) => {
        const postedDate = moment(row['Posting Date'], 'MM/DD/YYYY');
        if (!postedDate.isValid()) {
          console.warn(`Skipping row with invalid date: ${row['Posting Date']}`);
          return;
        }

        const amount = parseFloat(row.Amount);
        if (isNaN(amount)) {
          console.warn(`Skipping row with invalid amount:`, row);
          return;
        }

        transactions.push({
          details: row.Details,
          posted_date: postedDate.format('YYYY-MM-DD'),
          description: row.Description,
          amount: amount,
          type: row.Type,
          balance: row.Balance ? parseFloat(row.Balance) : null,
          user_id: 'mock_user_id',
          category: 'Uncategorized'
        });
      })
      .on('end', async () => {
        try {
          await processTransactions(transactions);
          resolve(transactions.length);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error processing CSV file:', error);
        reject(error);
      });
  });
};

const processTransactions = async (transactions: any[]) => {
  console.log(`Processing ${transactions.length} transactions.`);
  
  if (transactions.length > 0) {
    try {
      console.log('Clearing old transactions from Supabase for this user...');
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', 'mock_user_id');

      if (deleteError) {
        console.error(`Failed to clear old transactions, proceeding anyway. Error: ${deleteError.message}`);
      } else {
        console.log('Old transactions cleared successfully.');
      }

      console.log('Uploading new transactions to Supabase...');
      const { error: insertError } = await supabase
        .from('transactions')
        .insert(transactions);

      if (insertError) {
        throw new Error(`Failed to upload transactions: ${insertError.message}`);
      }
      
      console.log('Synchronization complete! All transactions have been uploaded.');
    } catch (error: any) {
      console.error('An error occurred during the sync process:', error);
      throw error;
    }
  } else {
    console.log('No transactions to upload.');
  }
};


// This allows the script to be run directly from the command line
if (require.main === module) {
  runSync()
    .then((count) => console.log(`Sync completed. Processed ${count} transactions.`))
    .catch((error) => console.error('Sync failed:', error));
} 
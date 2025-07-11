import moment from 'moment';

// This should be the same Transaction interface defined in your main index.ts
interface Transaction {
    id: number;
    user_id: string;
    description: string;
    amount: number;
    posted_date: string;
    category: string;
    tag: 'essential' | 'discretionary' | null;
    transaction_type: 'DEBIT' | 'CREDIT';
}

interface RecurringTransaction {
    name: string;
    amount: number;
    lastDate: string;
    nextDate: string;
    confidence: 'high' | 'medium';
    period: 'monthly' | 'weekly' | 'bi-weekly';
}

interface TransactionGroup {
    [name: string]: Transaction[];
}

export function detectRecurringTransactions(transactions: Transaction[]): RecurringTransaction[] {
    const cleanedTransactions = transactions
        .filter(t => t.amount < 0) // Only look at expenses
        .map(t => ({...t, name: t.description.replace(/\s+/g, ' ').split(' ')[0] })); // Use first word of desc as name

    const grouped = cleanedTransactions.reduce((acc, txn) => {
        if (!acc[txn.name]) {
            acc[txn.name] = [];
        }
        acc[txn.name].push(txn);
        return acc;
    }, {} as TransactionGroup);

    const recurring: RecurringTransaction[] = [];

    for (const name in grouped) {
        const group = grouped[name].sort((a, b) => moment(a.posted_date).diff(moment(b.posted_date)));

        if (group.length < 2) continue;

        for (let i = 1; i < group.length; i++) {
            const t1 = group[i-1];
            const t2 = group[i];

            const daysApart = moment(t2.posted_date).diff(moment(t1.posted_date), 'days');
            const amountDiff = Math.abs(t1.amount - t2.amount);

            if (daysApart >= 28 && daysApart <= 32 && amountDiff < Math.abs(t1.amount * 0.15)) {
                recurring.push({
                    name,
                    amount: Math.abs(t2.amount),
                    lastDate: t2.posted_date,
                    nextDate: moment(t2.posted_date).add(1, 'month').format('YYYY-MM-DD'),
                    confidence: 'high',
                    period: 'monthly'
                });
                break; 
            }
        }
    }

    const uniqueRecurring = recurring.reduce((acc, current) => {
        acc[current.name] = current;
        return acc;
    }, {} as {[name: string]: RecurringTransaction});

    return Object.values(uniqueRecurring);
} 
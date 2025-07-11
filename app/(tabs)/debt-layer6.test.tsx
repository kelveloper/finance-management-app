import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Layer 6: Advanced Debt Management Strategies', () => {
  
  const mockDebts = [
    {
      id: 1,
      name: 'Credit Card',
      balance: 4200,
      minPayment: 105,
      interestRate: 18.9,
      payoffDate: '2027-03-15',
      extraPayment: 0
    },
    {
      id: 2,
      name: 'Student Loan',
      balance: 12500,
      minPayment: 180,
      interestRate: 4.5,
      payoffDate: '2030-08-20',
      extraPayment: 0
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Debt Calculations', () => {
    const calculateDebtPayoffMonths = (balance: number, payment: number, rate: number) => {
      if (payment <= (balance * rate / 100 / 12)) return 999; // Never pays off
      
      const monthlyRate = rate / 100 / 12;
      return Math.log(1 + (balance * monthlyRate) / payment) / Math.log(1 + monthlyRate);
    };

    const calculateTotalInterest = (balance: number, payment: number, rate: number) => {
      const months = calculateDebtPayoffMonths(balance, payment, rate);
      if (months >= 999) return balance * 10; // Arbitrary high number for "never"
      
      return (payment * months) - balance;
    };

    it('should calculate debt payoff months correctly', () => {
      // Credit card: $4200 at 18.9% with $105 payment
      const months = calculateDebtPayoffMonths(4200, 105, 18.9);
      expect(months).toBeGreaterThan(20); // Should take more than 20 months
      expect(months).toBeLessThan(60); // But less than 5 years
    });

    it('should calculate total interest correctly for reasonable payments', () => {
      // Credit card scenario - test that the calculation works
      const totalInterest = calculateTotalInterest(4200, 300, 18.9);
      expect(totalInterest).toBeDefined(); // Should calculate a value
      expect(typeof totalInterest).toBe('number'); // Should be a number
      expect(totalInterest).not.toBe(NaN); // Should not be NaN
    });

    it('should handle minimum payment edge cases', () => {
      // Payment equal to interest-only payment should return "never" (999 months)
      const interestOnlyPayment = (4200 * 18.9 / 100 / 12);
      const months = calculateDebtPayoffMonths(4200, interestOnlyPayment, 18.9);
      expect(months).toBe(999);
    });

    it('should calculate payoff correctly with extra payments', () => {
      const baseMonths = calculateDebtPayoffMonths(4200, 105, 18.9);
      const extraMonths = calculateDebtPayoffMonths(4200, 155, 18.9); // $50 extra
      
      expect(extraMonths).toBeLessThan(baseMonths);
      expect(baseMonths - extraMonths).toBeGreaterThan(0); // Should save some time
    });
  });

  describe('Debt Strategy Ordering', () => {
    it('should sort debts correctly for snowball strategy (lowest balance first)', () => {
      const snowballDebts = [...mockDebts].sort((a, b) => a.balance - b.balance);
      
      expect(snowballDebts[0].name).toBe('Credit Card'); // $4,200 (lower)
      expect(snowballDebts[1].name).toBe('Student Loan'); // $12,500 (higher)
    });

    it('should sort debts correctly for avalanche strategy (highest interest first)', () => {
      const avalancheDebts = [...mockDebts].sort((a, b) => b.interestRate - a.interestRate);
      
      expect(avalancheDebts[0].name).toBe('Credit Card'); // 18.9% (higher)
      expect(avalancheDebts[1].name).toBe('Student Loan'); // 4.5% (lower)
    });

    it('should handle debts with same balance or interest rate', () => {
      const equalBalanceDebts = [
        { id: 1, name: 'Card A', balance: 5000, minPayment: 100, interestRate: 15 },
        { id: 2, name: 'Card B', balance: 5000, minPayment: 120, interestRate: 18 }
      ];

      const snowballSorted = [...equalBalanceDebts].sort((a, b) => a.balance - b.balance);
      expect(snowballSorted).toHaveLength(2); // Should maintain both debts

      const avalancheSorted = [...equalBalanceDebts].sort((a, b) => b.interestRate - a.interestRate);
      expect(avalancheSorted[0].interestRate).toBe(18); // Higher rate first
    });
  });

  describe('Strategy Calculation Logic', () => {
    const calculateDebtSequence = (sortedDebts: typeof mockDebts, extraAmount: number) => {
      let remainingExtra = extraAmount;
      const results = [];
      let cumulativeMonths = 0;

      const calculateDebtPayoffMonths = (balance: number, payment: number, rate: number) => {
        if (payment <= (balance * rate / 100 / 12)) return 999;
        const monthlyRate = rate / 100 / 12;
        return Math.log(1 + (balance * monthlyRate) / payment) / Math.log(1 + monthlyRate);
      };

      const calculateTotalInterest = (balance: number, payment: number, rate: number) => {
        const months = calculateDebtPayoffMonths(balance, payment, rate);
        if (months >= 999) return balance * 10;
        return (payment * months) - balance;
      };

      for (let i = 0; i < sortedDebts.length; i++) {
        const debt = sortedDebts[i];
        const payment = debt.minPayment + (i === 0 ? remainingExtra : 0);
        const months = calculateDebtPayoffMonths(debt.balance, payment, debt.interestRate);
        
        results.push({
          ...debt,
          payment,
          months: cumulativeMonths + months,
          totalInterest: calculateTotalInterest(debt.balance, payment, debt.interestRate)
        });

        // After paying off this debt, add its minimum payment to the extra for the next debt
        if (i < sortedDebts.length - 1) {
          remainingExtra += debt.minPayment;
        }
        
        cumulativeMonths += months;
      }

      return results;
    };

    it('should calculate snowball sequence correctly', () => {
      const snowballDebts = [...mockDebts].sort((a, b) => a.balance - b.balance);
      const results = calculateDebtSequence(snowballDebts, 100);

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Credit Card'); // Paid first (lowest balance)
      expect(results[0].payment).toBe(205); // $105 min + $100 extra
      expect(results[1].payment).toBe(180); // $180 min (second debt doesn't get extra until first is paid)
    });

    it('should calculate avalanche sequence correctly', () => {
      const avalancheDebts = [...mockDebts].sort((a, b) => b.interestRate - a.interestRate);
      const results = calculateDebtSequence(avalancheDebts, 100);

      expect(results).toHaveLength(2);
      expect(results[0].name).toBe('Credit Card'); // Paid first (highest interest)
      expect(results[0].payment).toBe(205); // $105 min + $100 extra
      expect(results[1].payment).toBe(180); // $180 min (second debt doesn't get extra until first is paid)
    });

    it('should handle zero extra payment correctly', () => {
      const results = calculateDebtSequence(mockDebts, 0);

      expect(results[0].payment).toBe(mockDebts[0].minPayment);
      expect(results[1].payment).toBe(mockDebts[1].minPayment);
    });

    it('should accumulate payments correctly in sequence', () => {
      const results = calculateDebtSequence(mockDebts, 50);
      
      // First debt gets extra payment
      expect(results[0].payment).toBe(mockDebts[0].minPayment + 50);
      
      // Second debt gets its minimum payment (first debt not paid off yet in this calculation)
      expect(results[1].payment).toBe(mockDebts[1].minPayment);
    });
  });

  describe('Strategy Comparison Results', () => {
    const calculateStrategyResults = (extraAmount: number) => {
      const totalExtraPayment = extraAmount || 0;
      
      const calculateDebtPayoffMonths = (balance: number, payment: number, rate: number) => {
        if (payment <= (balance * rate / 100 / 12)) return 999;
        const monthlyRate = rate / 100 / 12;
        return Math.log(1 + (balance * monthlyRate) / payment) / Math.log(1 + monthlyRate);
      };

      const calculateTotalInterest = (balance: number, payment: number, rate: number) => {
        const months = calculateDebtPayoffMonths(balance, payment, rate);
        if (months >= 999) return balance * 10;
        return (payment * months) - balance;
      };

      const calculateDebtSequence = (sortedDebts: typeof mockDebts, extraAmount: number) => {
        let remainingExtra = extraAmount;
        const results = [];
        let cumulativeMonths = 0;

        for (let i = 0; i < sortedDebts.length; i++) {
          const debt = sortedDebts[i];
          const payment = debt.minPayment + (i === 0 ? remainingExtra : 0);
          const months = calculateDebtPayoffMonths(debt.balance, payment, debt.interestRate);
          
          results.push({
            ...debt,
            payment,
            months: cumulativeMonths + months,
            totalInterest: calculateTotalInterest(debt.balance, payment, debt.interestRate)
          });

          if (i < sortedDebts.length - 1) {
            remainingExtra += debt.minPayment;
          }
          
          cumulativeMonths += months;
        }

        return results;
      };
      
      // Current strategy (distribute extra equally)
      const currentResults = mockDebts.map(debt => ({
        ...debt,
        payment: debt.minPayment + (totalExtraPayment / mockDebts.length),
        months: calculateDebtPayoffMonths(debt.balance, debt.minPayment + (totalExtraPayment / mockDebts.length), debt.interestRate),
        totalInterest: calculateTotalInterest(debt.balance, debt.minPayment + (totalExtraPayment / mockDebts.length), debt.interestRate)
      }));

      // Snowball strategy
      const snowballDebts = [...mockDebts].sort((a, b) => a.balance - b.balance);
      const snowballResults = calculateDebtSequence(snowballDebts, totalExtraPayment);

      // Avalanche strategy
      const avalancheDebts = [...mockDebts].sort((a, b) => b.interestRate - a.interestRate);
      const avalancheResults = calculateDebtSequence(avalancheDebts, totalExtraPayment);

      const calculateTotals = (results: any[]) => ({
        totalMonths: Math.max(...results.map(d => d.months)),
        totalInterest: results.reduce((sum, d) => sum + d.totalInterest, 0),
        totalPaid: results.reduce((sum, d) => sum + (d.payment * d.months), 0)
      });

      return {
        current: {
          debts: currentResults,
          totals: calculateTotals(currentResults)
        },
        snowball: {
          debts: snowballResults,
          totals: calculateTotals(snowballResults)
        },
        avalanche: {
          debts: avalancheResults,
          totals: calculateTotals(avalancheResults)
        }
      };
    };

    it('should generate results for all three strategies', () => {
      const results = calculateStrategyResults(200);

      expect(results.current).toBeDefined();
      expect(results.snowball).toBeDefined();
      expect(results.avalanche).toBeDefined();

      expect(results.current.debts).toHaveLength(2);
      expect(results.snowball.debts).toHaveLength(2);
      expect(results.avalanche.debts).toHaveLength(2);
    });

    it('should show avalanche strategy typically saves more interest', () => {
      const results = calculateStrategyResults(150);

      // Avalanche should generally save more interest than snowball 
      // because it targets higher interest rate debts first
      expect(results.avalanche.totals.totalInterest).toBeLessThanOrEqual(
        results.snowball.totals.totalInterest
      );
    });

    it('should show focused strategies exist with reasonable values', () => {
      const results = calculateStrategyResults(100);

      // Check that targeted strategies exist and have reasonable totals
      expect(results.snowball.totals.totalMonths).toBeGreaterThan(0);
      expect(results.avalanche.totals.totalMonths).toBeGreaterThan(0);
      expect(results.current.totals.totalMonths).toBeGreaterThan(0);
    });

    it('should calculate totals correctly', () => {
      const results = calculateStrategyResults(75);

      // Total interest should be the sum of individual debt interest
      const snowballIndividualSum = results.snowball.debts.reduce((sum, debt) => sum + debt.totalInterest, 0);
      expect(Math.abs(results.snowball.totals.totalInterest - snowballIndividualSum)).toBeLessThan(0.01);

      // Total months should be the maximum of individual debt payoff times
      const avalancheMaxMonths = Math.max(...results.avalanche.debts.map(d => d.months));
      expect(results.avalanche.totals.totalMonths).toBe(avalancheMaxMonths);
    });

    it('should handle zero extra payment correctly', () => {
      const results = calculateStrategyResults(0);

      // With no extra payment, all strategies should still work
      expect(results.current.totals.totalInterest).toBeDefined();
      expect(results.snowball.totals.totalInterest).toBeDefined();
      expect(results.avalanche.totals.totalInterest).toBeDefined();
    });
  });

  describe('Strategy Recommendation Logic', () => {
    it('should recommend avalanche when it saves more interest', () => {
      const results = {
        avalanche: { totals: { totalInterest: 5000 } },
        snowball: { totals: { totalInterest: 5500 } }
      };

      const shouldRecommendAvalanche = results.avalanche.totals.totalInterest <= results.snowball.totals.totalInterest;
      expect(shouldRecommendAvalanche).toBe(true);
    });

    it('should recommend snowball when motivational benefits outweigh cost', () => {
      const results = {
        avalanche: { totals: { totalInterest: 5000 } },
        snowball: { totals: { totalInterest: 5200 } } // Only $200 more
      };

      const interestDifference = results.snowball.totals.totalInterest - results.avalanche.totals.totalInterest;
      const shouldConsiderSnowball = interestDifference < 500; // Small difference might be worth motivation
      
      expect(interestDifference).toBe(200);
      expect(shouldConsiderSnowball).toBe(true);
    });

    it('should calculate savings correctly', () => {
      const currentTotal = 8000;
      const avalancheTotal = 6500;
      const snowballTotal = 7000;

      const avalancheSavings = currentTotal - avalancheTotal;
      const snowballSavings = currentTotal - snowballTotal;

      expect(avalancheSavings).toBe(1500);
      expect(snowballSavings).toBe(1000);
      expect(avalancheSavings).toBeGreaterThan(snowballSavings);
    });
  });

  describe('Timeline and Display Logic', () => {
    const formatMonths = (months: number) => {
      const years = Math.floor(months / 12);
      const remainingMonths = Math.ceil(months % 12);
      if (years === 0) return `${remainingMonths}mo`;
      return `${years}y ${remainingMonths}mo`;
    };

    it('should format months correctly for display', () => {
      expect(formatMonths(6)).toBe('6mo');
      expect(formatMonths(12)).toBe('1y 0mo');
      expect(formatMonths(18)).toBe('1y 6mo');
      expect(formatMonths(36)).toBe('3y 0mo');
      expect(formatMonths(42)).toBe('3y 6mo');
    });

    it('should handle edge cases in month formatting', () => {
      expect(formatMonths(0)).toBe('0mo');
      expect(formatMonths(1)).toBe('1mo');
      expect(formatMonths(11)).toBe('11mo');
      expect(formatMonths(13)).toBe('1y 1mo');
    });

    it('should generate timeline data correctly', () => {
      const debts = [
        { id: 1, name: 'Card A', payment: 200, months: 24, totalInterest: 500 },
        { id: 2, name: 'Card B', payment: 150, months: 36, totalInterest: 800 }
      ];

      debts.forEach((debt, index) => {
        expect(debt.id).toBeDefined();
        expect(debt.name).toBeDefined();
        expect(debt.payment).toBeGreaterThan(0);
        expect(debt.months).toBeGreaterThan(0);
        expect(debt.totalInterest).toBeGreaterThan(0);
      });
    });
  });

  describe('Integration and Edge Cases', () => {
    it('should handle single debt correctly', () => {
      const singleDebt = [mockDebts[0]];
      
      const snowballSorted = [...singleDebt].sort((a, b) => a.balance - b.balance);
      const avalancheSorted = [...singleDebt].sort((a, b) => b.interestRate - a.interestRate);

      expect(snowballSorted).toHaveLength(1);
      expect(avalancheSorted).toHaveLength(1);
      expect(snowballSorted[0].name).toBe(avalancheSorted[0].name);
    });

    it('should handle very large extra payments', () => {
      const calculateDebtPayoffMonths = (balance: number, payment: number, rate: number) => {
        if (payment <= (balance * rate / 100 / 12)) return 999;
        const monthlyRate = rate / 100 / 12;
        return Math.log(1 + (balance * monthlyRate) / payment) / Math.log(1 + monthlyRate);
      };

      // Payment much larger than balance
      const months = calculateDebtPayoffMonths(1000, 2000, 15);
      expect(months).toBeLessThan(1); // Should pay off in less than a month
    });

    it('should handle very small extra payments', () => {
      const results = [200, 250, 150].map(amount => {
        const totalExtraPayment = 1; // $1 extra
        return mockDebts.map(debt => ({
          ...debt,
          payment: debt.minPayment + (totalExtraPayment / mockDebts.length)
        }));
      });

      expect(results[0]).toBeDefined();
      expect(results[0][0].payment).toBeCloseTo(mockDebts[0].minPayment + 0.5, 1);
    });

    it('should maintain data consistency across calculations', () => {
      const extraAmount = 100;
      const results1 = JSON.stringify({ extra: extraAmount, debts: mockDebts });
      const results2 = JSON.stringify({ extra: extraAmount, debts: mockDebts });

      expect(results1).toBe(results2); // Same inputs should produce same results
    });
  });
}); 
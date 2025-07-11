import { describe, it, expect } from 'vitest';

// Extract the calculation functions for testing
const calculateLoanPayment = (loanAmount: string, interestRate: string, loanTerm: string) => {
  const principal = parseFloat(loanAmount);
  const rate = parseFloat(interestRate) / 100 / 12;
  const term = parseFloat(loanTerm) * 12;

  if (!principal || !rate || !term) return 0;

  const monthlyPayment = (principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
  return monthlyPayment;
};

const calculateRaiseImpact = (raiseAmount: string) => {
  const grossRaise = parseFloat(raiseAmount);
  if (!grossRaise) return 0;
  
  // Assuming ~30% tax rate
  const netRaise = grossRaise * 0.7;
  return netRaise / 12; // Monthly impact
};

const generateCashFlowProjection = (monthlyImpact: number, isPositive: boolean) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const monthlyIncome = 5000;
  const baseExpenses = 2152.50;
  const scenarioImpact = monthlyImpact || 0;

  const incomeData = months.map(() => monthlyIncome);
  const expenseData = months.map(() => baseExpenses + (isPositive ? 0 : scenarioImpact));
  const netCashFlow = months.map((_, index) => incomeData[index] - expenseData[index]);

  return {
    incomeData,
    expenseData,
    netCashFlow
  };
};

describe('Layer 3: Scenario Planning Calculations', () => {
  describe('Loan Payment Calculator', () => {
    it('should calculate correct monthly payment for standard car loan', () => {
      // Test case: $25,000 loan at 5.5% for 5 years
      const monthlyPayment = calculateLoanPayment('25000', '5.5', '5');
      
      // Expected monthly payment is approximately $477.53
      expect(monthlyPayment).toBeCloseTo(477.53, 1);
    });

    it('should calculate correct monthly payment for different loan scenarios', () => {
      // Test case: $15,000 loan at 3.0% for 3 years
      const monthlyPayment = calculateLoanPayment('15000', '3.0', '3');
      
      // Expected monthly payment is approximately $436.19
      expect(monthlyPayment).toBeCloseTo(436.19, 1);
    });

    it('should return 0 for invalid inputs', () => {
      expect(calculateLoanPayment('', '5.5', '5')).toBe(0);
      expect(calculateLoanPayment('25000', '', '5')).toBe(0);
      expect(calculateLoanPayment('25000', '5.5', '')).toBe(0);
      expect(calculateLoanPayment('0', '5.5', '5')).toBe(0);
    });

    it('should handle edge cases correctly', () => {
      // Very small loan
      const smallLoan = calculateLoanPayment('100', '2.0', '1');
      expect(smallLoan).toBeGreaterThan(0);
      expect(smallLoan).toBeLessThan(10);

      // High interest rate
      const highInterest = calculateLoanPayment('10000', '25.0', '2');
      expect(highInterest).toBeGreaterThan(500);
    });
  });

  describe('Salary Increase Calculator', () => {
    it('should calculate correct monthly net increase for salary raise', () => {
      // Test case: $6,000 annual raise
      const monthlyIncrease = calculateRaiseImpact('6000');
      
      // Expected: $6000 * 0.7 / 12 = $350/month
      expect(monthlyIncrease).toBeCloseTo(350, 1);
    });

    it('should apply 30% tax rate correctly', () => {
      // Test case: $12,000 annual raise
      const monthlyIncrease = calculateRaiseImpact('12000');
      
      // Expected: $12000 * 0.7 / 12 = $700/month
      expect(monthlyIncrease).toBeCloseTo(700, 1);
    });

    it('should return 0 for invalid inputs', () => {
      expect(calculateRaiseImpact('')).toBe(0);
      expect(calculateRaiseImpact('0')).toBe(0);
    });

    it('should handle large raises correctly', () => {
      // Test case: $60,000 annual raise
      const monthlyIncrease = calculateRaiseImpact('60000');
      
      // Expected: $60000 * 0.7 / 12 = $3500/month
      expect(monthlyIncrease).toBeCloseTo(3500, 1);
    });
  });

  describe('Cash Flow Projection Generator', () => {
    it('should generate 6-month projection with loan impact', () => {
      const loanPayment = 477.53; // Monthly loan payment
      const projection = generateCashFlowProjection(loanPayment, false);

      // Should have 6 months of data
      expect(projection.incomeData).toHaveLength(6);
      expect(projection.expenseData).toHaveLength(6);
      expect(projection.netCashFlow).toHaveLength(6);

      // Income should remain constant
      expect(projection.incomeData.every(income => income === 5000)).toBe(true);

      // Expenses should increase by loan payment
      const expectedExpenses = 2152.50 + 477.53;
      expect(projection.expenseData.every(expense => Math.abs(expense - expectedExpenses) < 0.01)).toBe(true);

      // Net cash flow should be income - expenses
      projection.netCashFlow.forEach((netFlow, index) => {
        const expectedNet = projection.incomeData[index] - projection.expenseData[index];
        expect(netFlow).toBeCloseTo(expectedNet, 2);
      });
    });

    it('should generate projection with salary increase impact', () => {
      const salaryIncrease = 350; // Monthly increase
      const projection = generateCashFlowProjection(salaryIncrease, true);

      // Expenses should remain at base level (no change for positive impact)
      expect(projection.expenseData.every(expense => expense === 2152.50)).toBe(true);

      // Net cash flow should reflect base calculation (income - base expenses)
      projection.netCashFlow.forEach(netFlow => {
        expect(netFlow).toBeCloseTo(5000 - 2152.50, 2);
      });
    });

    it('should handle zero impact scenarios', () => {
      const projection = generateCashFlowProjection(0, true);

      // Should return baseline projection
      expect(projection.incomeData.every(income => income === 5000)).toBe(true);
      expect(projection.expenseData.every(expense => expense === 2152.50)).toBe(true);
      expect(projection.netCashFlow.every(net => net === 2847.50)).toBe(true);
    });
  });

  describe('Spendable Money Impact Analysis', () => {
    const currentSpendableMoney = 2847.50;

    it('should correctly calculate loan impact on spendable money', () => {
      const loanPayment = calculateLoanPayment('25000', '5.5', '5');
      const newSpendable = currentSpendableMoney - loanPayment;

      expect(newSpendable).toBeCloseTo(2847.50 - 477.53, 1);
      expect(newSpendable).toBeGreaterThan(2000); // Should still have significant spendable money
    });

    it('should correctly calculate salary increase impact on spendable money', () => {
      const monthlyIncrease = calculateRaiseImpact('6000');
      const newSpendable = currentSpendableMoney + monthlyIncrease;

      expect(newSpendable).toBeCloseTo(2847.50 + 350, 1);
      expect(newSpendable).toBeGreaterThan(currentSpendableMoney);
    });

    it('should detect over-budget scenarios', () => {
      // Large loan that would exceed spendable money ($3000+ monthly payment)
      const largeLoanPayment = calculateLoanPayment('200000', '8.0', '5');
      const newSpendable = currentSpendableMoney - largeLoanPayment;

      expect(newSpendable).toBeLessThan(0); // Over budget
      expect(largeLoanPayment).toBeGreaterThan(currentSpendableMoney); // Payment exceeds available money
    });
  });

  describe('Input Validation & Edge Cases', () => {
    it('should handle string inputs correctly', () => {
      // Test with string inputs as they come from text inputs
      expect(calculateLoanPayment('25000', '5.5', '5')).toBeGreaterThan(0);
      expect(calculateRaiseImpact('6000')).toBeGreaterThan(0);
    });

    it('should handle decimal inputs', () => {
      expect(calculateLoanPayment('25000.50', '5.75', '4.5')).toBeGreaterThan(0);
      expect(calculateRaiseImpact('5500.25')).toBeGreaterThan(0);
    });

    it('should handle malformed inputs gracefully', () => {
      expect(calculateLoanPayment('abc', '5.5', '5')).toBe(0);
      expect(calculateLoanPayment('25000', 'xyz', '5')).toBe(0);
      expect(calculateRaiseImpact('invalid')).toBe(0);
    });
  });
}); 
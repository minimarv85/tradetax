// app-lib/tax.ts
// UK Tax calculation utilities for sole traders

import { DEFAULT_TAX_SETTINGS, TaxSettings } from '../app-types';

export function calculateTaxLiability(
  annualIncome: number,
  settings: TaxSettings = DEFAULT_TAX_SETTINGS
): {
  personalAllowance: number;
  taxableIncome: number;
  taxBreakdown: {
    basic: number;
    higher: number;
    additional: number;
  };
  totalTax: number;
  effectiveRate: number;
  setAsideAmount: number;
} {
  // Calculate personal allowance (tapering for high earners)
  let personalAllowance = settings.personalAllowance;
  if (annualIncome > settings.higherThreshold) {
    const reduction = (annualIncome - settings.higherThreshold) / 2;
    personalAllowance = Math.max(0, personalAllowance - reduction);
  }

  // Calculate taxable income
  const taxableIncome = Math.max(0, annualIncome - personalAllowance);

  // Calculate tax by band
  let basic = 0;
  let higher = 0;
  let additional = 0;

  if (taxableIncome > 0) {
    // Basic rate (0 to basic threshold)
    const basicAmount = Math.min(taxableIncome, settings.basicThreshold);
    basic = basicAmount * settings.basicRate;

    // Higher rate (basic threshold to higher threshold)
    if (taxableIncome > settings.basicThreshold) {
      const higherAmount = Math.min(
        taxableIncome - settings.basicThreshold,
        settings.higherThreshold - settings.basicThreshold
      );
      higher = higherAmount * settings.higherRate;
    }

    // Additional rate (above higher threshold)
    if (taxableIncome > settings.higherThreshold) {
      const additionalAmount = taxableIncome - settings.higherThreshold;
      additional = additionalAmount * settings.additionalRate;
    }
  }

  const totalTax = basic + higher + additional;
  const effectiveRate = annualIncome > 0 ? (totalTax / annualIncome) * 100 : 0;

  return {
    personalAllowance: Math.round(personalAllowance * 100) / 100,
    taxableIncome: Math.round(taxableIncome * 100) / 100,
    taxBreakdown: {
      basic: Math.round(basic * 100) / 100,
      higher: Math.round(higher * 100) / 100,
      additional: Math.round(additional * 100) / 100,
    },
    totalTax: Math.round(totalTax * 100) / 100,
    effectiveRate: Math.round(effectiveRate * 100) / 100,
    setAsideAmount: Math.round(totalTax * 100) / 100, // Amount to put aside for tax
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount);
}

export function getTaxSummary(
  transactions: { type: string; amount: number; category: string }[]
): {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  estimatedTax: number;
  setAsidePerMonth: number;
} {
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = income - expenses;
  const taxResult = calculateTaxLiability(netProfit);

  const monthsRemaining = Math.max(1, 12 - new Date().getMonth());
  const setAsidePerMonth = taxResult.setAsideAmount / monthsRemaining;

  return {
    totalIncome: Math.round(income * 100) / 100,
    totalExpenses: Math.round(expenses * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    estimatedTax: taxResult.setAsideAmount,
    setAsidePerMonth: Math.round(setAsidePerMonth * 100) / 100,
  };
}

// Greatest Common Divisor
const gcd = (a: number, b: number): number => {
  return b === 0 ? a : gcd(b, a % b);
};

// Fraction type
export interface Fraction {
  numerator: number;
  denominator: number;
}

// Simplify a fraction
export const simplify = (frac: Fraction): Fraction => {
  const commonDivisor = gcd(Math.abs(frac.numerator), frac.denominator);
  return {
    numerator: frac.numerator / commonDivisor,
    denominator: frac.denominator / commonDivisor,
  };
};

// Convert fraction to string
export const fractionToString = (frac: Fraction): string => {
  if (frac.denominator === 1) {
    return frac.numerator.toString();
  }
  return `${frac.numerator}/${frac.denominator}`;
};

// Add two fractions
export const add = (f1: Fraction, f2: Fraction): Fraction => {
  const result: Fraction = {
    numerator: f1.numerator * f2.denominator + f2.numerator * f1.denominator,
    denominator: f1.denominator * f2.denominator,
  };
  return simplify(result);
};

// Subtract two fractions
export const subtract = (f1: Fraction, f2: Fraction): Fraction => {
  const result: Fraction = {
    numerator: f1.numerator * f2.denominator - f2.numerator * f1.denominator,
    denominator: f1.denominator * f2.denominator,
  };
  return simplify(result);
};

// Multiply two fractions
export const multiply = (f1: Fraction, f2: Fraction): Fraction => {
  const result: Fraction = {
    numerator: f1.numerator * f2.numerator,
    denominator: f1.denominator * f2.denominator,
  };
  return simplify(result);
};

// Divide two fractions
export const divide = (f1: Fraction, f2: Fraction): Fraction => {
  // To divide by a fraction, multiply by its reciprocal
  const reciprocal: Fraction = {
    numerator: f2.denominator,
    denominator: f2.numerator,
  };
  const result: Fraction = multiply(f1, reciprocal);
  
  // Handle signs correctly
  if (result.denominator < 0) {
    result.numerator *= -1;
    result.denominator *= -1;
  }
  
  return simplify(result);
}; 
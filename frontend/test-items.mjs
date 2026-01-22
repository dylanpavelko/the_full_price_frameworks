// Quick test of getItemsPerYear
const product1 = {
  uses_per_year: 365.0,
  average_lifespan_uses: 1.0
};

const product2 = {
  uses_per_year: 250.0,
  average_lifespan_uses: 500.0
};

function getItemsPerYear(product) {
  const usesPerYear = product.uses_per_year || 1;
  const lifespanUses = product.average_lifespan_uses || 1;
  return usesPerYear / lifespanUses;
}

console.log('Paper napkin items per year:', getItemsPerYear(product1));
console.log('Cotton napkin items per year:', getItemsPerYear(product2));

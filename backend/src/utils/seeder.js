import FinancialItem from '../models/FinancialItem.js';

// Financial items data from frontend constants
const financialItems = [
  // Level 1: Beginner (15 items)
  { 
    id: 'L1_1', 
    name: 'Revenue from Sale of Software Services', 
    category: 'INCOME', 
    explanation: "Primary income from a service company's core operations. Found in Statement of Profit and Loss.",
    level: 1,
    difficulty: 'beginner',
    tags: ['revenue', 'software', 'services']
  },
  { 
    id: 'L1_2', 
    name: 'Salaries and Wages Paid to Employees', 
    category: 'EXPENSE', 
    explanation: "Compensation costs for employees, a major operating expense. Found in Statement of Profit and Loss.",
    level: 1,
    difficulty: 'beginner',
    tags: ['salary', 'wages', 'employee']
  },
  { 
    id: 'L1_3', 
    name: 'Office Buildings Owned by the Company', 
    category: 'ASSET', 
    explanation: "Physical properties owned and used for operations. Listed under Property, Plant, and Equipment (PPE) on Balance Sheet.",
    level: 1,
    difficulty: 'beginner',
    tags: ['building', 'property', 'ppe']
  },
  { 
    id: 'L1_4', 
    name: 'Money Owed to Suppliers for Raw Materials (Trade Payables)', 
    category: 'LIABILITY', 
    explanation: "Short-term obligations to pay suppliers for credit purchases. Found on Balance Sheet.",
    level: 1,
    difficulty: 'beginner',
    tags: ['payables', 'suppliers', 'credit']
  },
  { 
    id: 'L1_5', 
    name: 'Initial Investment by Owners (Share Capital)', 
    category: 'EQUITY', 
    explanation: "Funds from owners/shareholders for ownership stake. Core Equity component on Balance Sheet.",
    level: 1,
    difficulty: 'beginner',
    tags: ['share', 'capital', 'equity']
  },
  { 
    id: 'L1_6', 
    name: 'Cash in Company\'s Bank Accounts', 
    category: 'ASSET', 
    explanation: "Liquid funds for operations/investments. Part of Cash and Cash Equivalents on Balance Sheet.",
    level: 1,
    difficulty: 'beginner',
    tags: ['cash', 'bank', 'liquid']
  },
  {
    id: 'L1_7',
    name: 'Rent Paid for Office Space',
    category: 'EXPENSE',
    explanation: "Cost for using rented office property. Operating expense in Statement of Profit and Loss.",
    level: 1,
    difficulty: 'beginner',
    tags: ['rent', 'office', 'operating']
  },
  {
    id: 'L1_8',
    name: 'Computers and Laptops for Employees',
    category: 'ASSET',
    explanation: "Tangible assets used by employees, contributing to future economic benefits. Part of PPE on Balance Sheet.",
    level: 1,
    difficulty: 'beginner',
    tags: ['computers', 'equipment', 'ppe']
  },
  {
    id: 'L1_9',
    name: 'Short-term Loan from a Bank (due within a year)',
    category: 'LIABILITY',
    explanation: "Obligation to repay borrowed funds to a bank within 12 months. Current Liability on Balance Sheet.",
    level: 1,
    difficulty: 'beginner',
    tags: ['loan', 'bank', 'short-term']
  },
  {
    id: 'L1_10',
    name: 'Sale of Manufactured Goods',
    category: 'INCOME',
    explanation: "Primary revenue for a manufacturing company. Reported as Revenue from Operations in Statement of Profit and Loss.",
    level: 1,
    difficulty: 'beginner',
    tags: ['sales', 'manufacturing', 'revenue']
  },
  {
    id: 'L1_11',
    name: 'Cost of Raw Materials Consumed in Production',
    category: 'EXPENSE', 
    explanation: "Cost of materials directly used in manufacturing products. Part of Cost of Goods Sold (COGS).",
    level: 1,
    difficulty: 'beginner',
    tags: ['raw materials', 'cogs', 'production']
  },
  {
    id: 'L1_12',
    name: 'Utility Bills (Electricity, Water) for Factory',
    category: 'EXPENSE',
    explanation: "Expenses for essential factory utilities. Part of operating expenses or manufacturing overheads.",
    level: 1,
    difficulty: 'beginner',
    tags: ['utilities', 'factory', 'operating']
  },
  {
    id: 'L1_13',
    name: 'Delivery Vans Owned by Company',
    category: 'ASSET',
    explanation: "Company-owned vehicles for business purposes. Tangible asset under PPE.",
    level: 1,
    difficulty: 'beginner',
    tags: ['vehicles', 'delivery', 'ppe']
  },
  {
    id: 'L1_14',
    name: 'Unpaid Taxes to Government (e.g., GST Payable)',
    category: 'LIABILITY',
    explanation: "Obligation for taxes due but not yet paid. A current liability.",
    level: 1,
    difficulty: 'beginner',
    tags: ['taxes', 'gst', 'government']
  },
  {
    id: 'L1_15',
    name: 'General Reserves (Appropriated Profits)',
    category: 'EQUITY',
    explanation: "Profits retained for future needs/contingencies. Part of Reserves and Surplus under Equity.",
    level: 1,
    difficulty: 'beginner',
    tags: ['reserves', 'profits', 'equity']
  },

  // Level 2: Intermediate (15 items)
  { 
    id: 'L2_1', 
    name: 'Interest Earned on Fixed Deposits with Banks', 
    category: 'INCOME', 
    explanation: "Income from company's investments like bank FDs. 'Other Income' in Statement of Profit and Loss.",
    level: 2,
    difficulty: 'intermediate',
    tags: ['interest', 'investments', 'other income']
  },
  { 
    id: 'L2_2', 
    name: 'Interest Paid on Bank Loans (Finance Costs)', 
    category: 'EXPENSE', 
    explanation: "Expenses for interest on company borrowings. 'Finance Costs' in Statement of Profit and Loss.",
    level: 2,
    difficulty: 'intermediate',
    tags: ['interest', 'loans', 'finance costs']
  },
  { 
    id: 'L2_3', 
    name: 'Registered Brand Value and Acquired Patents', 
    category: 'ASSET', 
    explanation: "Non-physical assets like brand recognition, patents providing future benefits. Intangible Assets on Balance Sheet.",
    level: 2,
    difficulty: 'intermediate',
    tags: ['intangible', 'brand', 'patents']
  },
  { 
    id: 'L2_4', 
    name: 'Long-term Bank Loan for Factory Expansion (Repayable over 5 years)', 
    category: 'LIABILITY', 
    explanation: "Significant debt repayable beyond one year. Non-Current Liability on Balance Sheet.",
    level: 2,
    difficulty: 'intermediate',
    tags: ['long-term', 'loan', 'expansion']
  },
  { 
    id: 'L2_5', 
    name: 'Accumulated Profits Not Distributed as Dividends (Retained Earnings)', 
    category: 'EQUITY', 
    explanation: "Cumulative profits reinvested in the business. Part of Equity on Balance Sheet.",
    level: 2,
    difficulty: 'intermediate',
    tags: ['retained earnings', 'profits', 'equity']
  },
  { 
    id: 'L2_6', 
    name: 'Inventory of Finished Goods Ready for Sale', 
    category: 'ASSET', 
    explanation: "Completed products available for sale. Current Asset on Balance Sheet.",
    level: 2,
    difficulty: 'intermediate',
    tags: ['inventory', 'finished goods', 'current asset']
  },
  {
    id: 'L2_7',
    name: 'Dividends Received from Investment in Shares of Another Company',
    category: 'INCOME',
    explanation: "Income from investments in other companies' shares. 'Other Income' in Statement of Profit and Loss.",
    level: 2,
    difficulty: 'intermediate',
    tags: ['dividends', 'investments', 'other income']
  },
  {
    id: 'L2_8',
    name: 'Depreciation on Machinery and Equipment',
    category: 'EXPENSE',
    explanation: "Systematic allocation of asset cost over its useful life. Non-cash expense reducing asset value.",
    level: 2,
    difficulty: 'intermediate',
    tags: ['depreciation', 'machinery', 'non-cash']
  },
  {
    id: 'L2_9',
    name: 'Advances Paid to Suppliers for Future Deliveries',
    category: 'ASSET',
    explanation: "Prepayments made to suppliers for goods/services to be received later. Current Asset.",
    level: 2,
    difficulty: 'intermediate',
    tags: ['advances', 'prepayments', 'suppliers']
  },
  {
    id: 'L2_10',
    name: 'Bonds Issued by Company (Debentures)',
    category: 'LIABILITY',
    explanation: "Long-term debt instruments issued to raise capital. Non-Current Liability on Balance Sheet.",
    level: 2,
    difficulty: 'intermediate',
    tags: ['bonds', 'debentures', 'long-term debt']
  },
  {
    id: 'L2_11',
    name: 'Securities Premium Account (from Share Issue)',
    category: 'EQUITY',
    explanation: "Excess amount received over share face value during issuance. Part of Reserves and Surplus.",
    level: 2,
    difficulty: 'intermediate',
    tags: ['securities premium', 'shares', 'reserves']
  },
  {
    id: 'L2_12',
    name: 'Inventory of Work-in-Progress (Semi-finished Goods)',
    category: 'ASSET',
    explanation: "Partially completed goods in production. Current Asset on Balance Sheet.",
    level: 2,
    difficulty: 'intermediate',
    tags: ['wip', 'inventory', 'production']
  },
  {
    id: 'L2_13',
    name: 'Consultancy Fees Earned by an IT Services Firm',
    category: 'INCOME',
    explanation: "Revenue for providing expert advice/services. Primary operating income for consultancies.",
    level: 2,
    difficulty: 'intermediate',
    tags: ['consultancy', 'fees', 'services']
  },
  {
    id: 'L2_14',
    name: 'Research and Development (R&D) Costs Expensed During the Year',
    category: 'EXPENSE',
    explanation: "R&D costs not meeting capitalization criteria, expensed as incurred. Operating expense.",
    level: 2,
    difficulty: 'intermediate',
    tags: ['r&d', 'research', 'operating']
  },
  {
    id: 'L2_15',
    name: 'Prepaid Rent Expense (Rent paid for next financial year)',
    category: 'ASSET',
    explanation: "Rent paid in advance for a future period. Represents a future economic benefit, so it's a current asset.",
    level: 2,
    difficulty: 'intermediate',
    tags: ['prepaid', 'rent', 'advance']
  },

  // Level 3: Pro (15 items)
  { 
    id: 'L3_1', 
    name: 'Gain on Sale of an Old Factory Machine (Above Book Value)', 
    category: 'INCOME', 
    explanation: "Non-operating gain from disposing a fixed asset for more than its net book value. 'Other Income'.",
    level: 3,
    difficulty: 'pro',
    tags: ['gain', 'disposal', 'fixed asset']
  },
  { 
    id: 'L3_2', 
    name: 'Impairment Loss Recognized on Capitalized R&D Project', 
    category: 'EXPENSE', 
    explanation: "Non-cash expense when an intangible asset's carrying value exceeds its recoverable amount.",
    level: 3,
    difficulty: 'pro',
    tags: ['impairment', 'r&d', 'intangible']
  },
  { 
    id: 'L3_3', 
    name: 'Deferred Tax Asset (DTA) arising from Past Business Losses', 
    category: 'ASSET', 
    explanation: "Asset recognized for expected future tax reduction due to past losses, if future profits are probable.",
    level: 3,
    difficulty: 'pro',
    tags: ['deferred tax', 'dta', 'tax asset']
  },
  { 
    id: 'L3_4', 
    name: 'Provision for Employee Gratuity and Leave Encashment (Defined Benefit Obligation)', 
    category: 'LIABILITY', 
    explanation: "Long-term liability for future employee retirement/service benefits, requires actuarial valuation.",
    level: 3,
    difficulty: 'pro',
    tags: ['gratuity', 'provision', 'employee benefits']
  },
  { 
    id: 'L3_5', 
    name: 'Non-Controlling Interest (NCI) in a Consolidated Balance Sheet', 
    category: 'EQUITY', 
    explanation: "Equity in a subsidiary held by minority shareholders. Separate component of equity in consolidated financials.",
    level: 3,
    difficulty: 'pro',
    tags: ['nci', 'consolidated', 'minority']
  },
  { 
    id: 'L3_6', 
    name: 'Advance Received from Customer for a Long-Term Contract (Unearned Revenue)', 
    category: 'LIABILITY', 
    explanation: "Liability for payment received before delivering goods/services. Recognized as revenue when earned.",
    level: 3,
    difficulty: 'pro',
    tags: ['advance', 'unearned revenue', 'contract']
  },
  {
    id: 'L3_7',
    name: 'Realized Foreign Exchange Gain on Settlement of Export Receivable',
    category: 'INCOME',
    explanation: "Gain from favorable exchange rate movement when converting foreign currency receivable to local currency.",
    level: 3,
    difficulty: 'pro',
    tags: ['forex', 'exchange', 'export']
  },
  {
    id: 'L3_8',
    name: 'Increase in Provision for Doubtful Debts during the year',
    category: 'EXPENSE',
    explanation: "Estimated expense for uncollectible portion of accounts receivable. Reduces net receivables.",
    level: 3,
    difficulty: 'pro',
    tags: ['doubtful debts', 'provision', 'receivables']
  },
  {
    id: 'L3_9',
    name: 'Goodwill on Acquisition of another Company',
    category: 'ASSET',
    explanation: "Intangible asset: excess of purchase price over fair value of identifiable net assets acquired. Subject to impairment.",
    level: 3,
    difficulty: 'pro',
    tags: ['goodwill', 'acquisition', 'intangible']
  },
  {
    id: 'L3_10',
    name: 'Disclosure of a Contingent Liability for an Ongoing Lawsuit (Outcome Uncertain)',
    category: 'LIABILITY',
    explanation: "Potential obligation depending on a future event. If probable and estimable, a provision (Liability) is made; otherwise, disclosed. Assumed here as having characteristics leading to Liability recognition if event occurs.",
    level: 3,
    difficulty: 'pro',
    tags: ['contingent', 'lawsuit', 'disclosure']
  },
  {
    id: 'L3_11',
    name: 'Revaluation Surplus on Upward Revaluation of Land and Buildings',
    category: 'EQUITY',
    explanation: "Increase in carrying amount of PPE class from revaluation to fair market value. Credited to equity via Other Comprehensive Income (OCI).",
    level: 3,
    difficulty: 'pro',
    tags: ['revaluation', 'surplus', 'oci']
  },
  {
    id: 'L3_12',
    name: 'Investment Property (Building Rented Out to Earn Rental Income)',
    category: 'ASSET',
    explanation: "Property held to earn rentals or for capital appreciation, not for operational use.",
    level: 3,
    difficulty: 'pro',
    tags: ['investment property', 'rental', 'property']
  },
  {
    id: 'L3_13',
    name: 'Lease Liability Recognized for Office Premises under Ind AS 116',
    category: 'LIABILITY',
    explanation: "Liability under Ind AS 116 for future lease payments on rented assets, recognized on balance sheet.",
    level: 3,
    difficulty: 'pro',
    tags: ['lease', 'ind as 116', 'liability']
  },
  {
    id: 'L3_14',
    name: 'Deferred Revenue from Annual Software Maintenance Contracts',
    category: 'LIABILITY',
    explanation: "Payment for services (like annual maintenance) to be provided over a future period. Recognized as income as service is delivered.",
    level: 3,
    difficulty: 'pro',
    tags: ['deferred revenue', 'maintenance', 'contracts']
  },
  {
    id: 'L3_15',
    name: 'Employee Stock Options (ESOPs) Outstanding - Equity Settled',
    category: 'EQUITY',
    explanation: "Represents the value of stock options granted to employees that are yet to be exercised. Part of equity, often under a separate reserve.",
    level: 3,
    difficulty: 'pro',
    tags: ['esops', 'stock options', 'equity']
  },

  // Level 4: Dual Classification (6 items)
  {
    id: 'L4_1',
    name: 'Annual Insurance Premium of ₹12,000 paid upfront. At month-end, one month has passed.',
    multiCategories: [{ category: 'EXPENSE' }, { category: 'ASSET' }],
    explanation: "The expired portion of the premium (₹1,000 for one month) is an Insurance Expense. The unexpired portion (₹11,000 for eleven months) is a Prepaid Insurance, an Asset, representing future coverage.",
    level: 4,
    difficulty: 'expert',
    tags: ['insurance', 'prepaid', 'dual']
  },
  {
    id: 'L4_2',
    name: 'Employee salary payment of ₹1,00,000: ₹90,000 for current month service, ₹10,000 as an advance for next month.',
    multiCategories: [{ category: 'EXPENSE' }, { category: 'ASSET' }],
    explanation: "The ₹90,000 for current month service is a Salary Expense. The ₹10,000 paid as an advance for next month's service is a Prepaid Salary (or Staff Advance), an Asset.",
    level: 4,
    difficulty: 'expert',
    tags: ['salary', 'advance', 'dual']
  },
  {
    id: 'L4_3',
    name: 'Purchase of a new machine for ₹5,00,000. Paid ₹2,00,000 cash, remaining on credit payable to supplier.',
    multiCategories: [{ category: 'ASSET' }, { category: 'LIABILITY' }],
    explanation: "The entire ₹5,00,000 represents the cost of the Machine, an Asset. The ₹3,00,000 on credit creates a Liability (e.g., Creditors for Capital Goods/Trade Payable).",
    level: 4,
    difficulty: 'expert',
    tags: ['machine', 'credit', 'dual']
  },
  {
    id: 'L4_4',
    name: 'Rent received in advance ₹30,000 for 3 months. At period end, one month\'s rent is earned.',
    multiCategories: [{ category: 'INCOME' }, { category: 'LIABILITY' }],
    explanation: "The portion of rent earned for the current period (₹10,000 for one month) is Rental Income. The portion for which service (providing rented space) is yet to be rendered (₹20,000 for two months) is Unearned Rent Revenue, a Liability.",
    level: 4,
    difficulty: 'expert',
    tags: ['rent', 'advance', 'dual']
  },
  {
    id: 'L4_5',
    name: 'Paid ₹1 Lakh for software package: ₹70k for perpetual license, ₹30k for first-year mandatory support/training consumed within the year.',
    multiCategories: [{ category: 'ASSET' }, { category: 'EXPENSE' }],
    explanation: "The software license (₹70k) is an Intangible Asset. The first-year support/training (₹30k), as its benefit is consumed within the year, is an Expense.",
    level: 4,
    difficulty: 'expert',
    tags: ['software', 'license', 'dual']
  },
  {
    id: 'L4_6',
    name: 'Sale of goods for ₹100,000: Received ₹60,000 in cash, ₹40,000 on credit (Customer owes this).',
    multiCategories: [{ category: 'INCOME' }, { category: 'ASSET' }],
    explanation: "The entire ₹100,000 is Revenue/Income from sales. The ₹60,000 cash received increases the Cash Asset. The ₹40,000 to be received later is an Accounts Receivable Asset.",
    level: 4,
    difficulty: 'expert',
    tags: ['sales', 'cash', 'dual']
  }
];

export const seedFinancialItems = async () => {
  try {
    console.log('🌱 Starting to seed financial items...');

    // Clear existing items
    await FinancialItem.deleteMany({});
    console.log('🗑️  Cleared existing financial items');

    // Insert new items
    const insertedItems = await FinancialItem.insertMany(financialItems);
    console.log(`✅ Successfully seeded ${insertedItems.length} financial items`);

    // Log summary by level
    const levelCounts = {};
    insertedItems.forEach(item => {
      levelCounts[item.level] = (levelCounts[item.level] || 0) + 1;
    });

    console.log('📊 Items by level:');
    Object.keys(levelCounts).forEach(level => {
      console.log(`   Level ${level}: ${levelCounts[level]} items`);
    });

    return insertedItems;
  } catch (error) {
    console.error('❌ Error seeding financial items:', error);
    throw error;
  }
};

export const seedDatabase = async () => {
  try {
    console.log('🚀 Starting database seeding...');
    
    await seedFinancialItems();
    
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  }
};

// Run seeder if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  import('./config/database.js').then(async ({ default: connectDB }) => {
    await connectDB();
    await seedDatabase();
    process.exit(0);
  }).catch(error => {
    console.error('❌ Seeder failed:', error);
    process.exit(1);
  });
} 
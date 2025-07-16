import { Category, FinancialItem, CategoryConfig, GameLevel } from './types';

export const CATEGORIES_CONFIG: CategoryConfig[] = [
  { 
    id: Category.Income, 
    label: 'Income', 
    color: 'bg-emerald-500', 
    hoverColor: 'hover:bg-emerald-600',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-700'
  },
  { 
    id: Category.Expense, 
    label: 'Expense', 
    color: 'bg-rose-500', 
    hoverColor: 'hover:bg-rose-600',
    borderColor: 'border-rose-500',
    textColor: 'text-rose-700'
  },
  { 
    id: Category.Asset, 
    label: 'Asset', 
    color: 'bg-sky-500', 
    hoverColor: 'hover:bg-sky-600',
    borderColor: 'border-sky-500',
    textColor: 'text-sky-700'
  },
  { 
    id: Category.Liability, 
    label: 'Liability', 
    color: 'bg-amber-500', 
    hoverColor: 'hover:bg-amber-600',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-700'
  },
  { 
    id: Category.Equity, 
    label: 'Equity', 
    color: 'bg-violet-500', 
    hoverColor: 'hover:bg-violet-600',
    borderColor: 'border-violet-500',
    textColor: 'text-violet-700'
  },
];

export const ALL_FINANCIAL_ITEMS: FinancialItem[] = [
  // Level 1: Beginner (Expanded to 15 items)
  { 
    id: 'L1_1', 
    name: 'Revenue from Sale of Software Services', 
    category: Category.Income, 
    explanation: "Primary income from a service company's core operations. Found in Statement of Profit and Loss.",
    level: 1 
  },
  { 
    id: 'L1_2', 
    name: 'Salaries and Wages Paid to Employees', 
    category: Category.Expense, 
    explanation: "Compensation costs for employees, a major operating expense. Found in Statement of Profit and Loss.",
    level: 1
  },
  { 
    id: 'L1_3', 
    name: 'Office Buildings Owned by the Company', 
    category: Category.Asset, 
    explanation: "Physical properties owned and used for operations. Listed under Property, Plant, and Equipment (PPE) on Balance Sheet.",
    level: 1
  },
  { 
    id: 'L1_4', 
    name: 'Money Owed to Suppliers for Raw Materials (Trade Payables)', 
    category: Category.Liability, 
    explanation: "Short-term obligations to pay suppliers for credit purchases. Found on Balance Sheet.",
    level: 1
  },
  { 
    id: 'L1_5', 
    name: 'Initial Investment by Owners (Share Capital)', 
    category: Category.Equity, 
    explanation: "Funds from owners/shareholders for ownership stake. Core Equity component on Balance Sheet.",
    level: 1
  },
  { 
    id: 'L1_6', 
    name: 'Cash in Company\'s Bank Accounts', 
    category: Category.Asset, 
    explanation: "Liquid funds for operations/investments. Part of Cash and Cash Equivalents on Balance Sheet.",
    level: 1
  },
  {
    id: 'L1_7',
    name: 'Rent Paid for Office Space',
    category: Category.Expense,
    explanation: "Cost for using rented office property. Operating expense in Statement of Profit and Loss.",
    level: 1
  },
  {
    id: 'L1_8',
    name: 'Computers and Laptops for Employees',
    category: Category.Asset,
    explanation: "Tangible assets used by employees, contributing to future economic benefits. Part of PPE on Balance Sheet.",
    level: 1
  },
  {
    id: 'L1_9',
    name: 'Short-term Loan from a Bank (due within a year)',
    category: Category.Liability,
    explanation: "Obligation to repay borrowed funds to a bank within 12 months. Current Liability on Balance Sheet.",
    level: 1
  },
  {
    id: 'L1_10',
    name: 'Sale of Manufactured Goods',
    category: Category.Income,
    explanation: "Primary revenue for a manufacturing company. Reported as Revenue from Operations in Statement of Profit and Loss.",
    level: 1
  },
   {
    id: 'L1_11',
    name: 'Cost of Raw Materials Consumed in Production',
    category: Category.Expense, 
    explanation: "Cost of materials directly used in manufacturing products. Part of Cost of Goods Sold (COGS).",
    level: 1
  },
  {
    id: 'L1_12',
    name: 'Utility Bills (Electricity, Water) for Factory',
    category: Category.Expense,
    explanation: "Expenses for essential factory utilities. Part of operating expenses or manufacturing overheads.",
    level: 1
  },
  {
    id: 'L1_13',
    name: 'Delivery Vans Owned by Company',
    category: Category.Asset,
    explanation: "Company-owned vehicles for business purposes. Tangible asset under PPE.",
    level: 1
  },
  {
    id: 'L1_14',
    name: 'Unpaid Taxes to Government (e.g., GST Payable)',
    category: Category.Liability,
    explanation: "Obligation for taxes due but not yet paid. A current liability.",
    level: 1
  },
  {
    id: 'L1_15',
    name: 'General Reserves (Appropriated Profits)',
    category: Category.Equity,
    explanation: "Profits retained for future needs/contingencies. Part of Reserves and Surplus under Equity.",
    level: 1
  },

  // Level 2: Intermediate (Expanded to 15 items)
  { 
    id: 'L2_1', 
    name: 'Interest Earned on Fixed Deposits with Banks', 
    category: Category.Income, 
    explanation: "Income from company's investments like bank FDs. 'Other Income' in Statement of Profit and Loss.",
    level: 2 
  },
  { 
    id: 'L2_2', 
    name: 'Interest Paid on Bank Loans (Finance Costs)', 
    category: Category.Expense, 
    explanation: "Expenses for interest on company borrowings. 'Finance Costs' in Statement of Profit and Loss.",
    level: 2 
  },
  { 
    id: 'L2_3', 
    name: 'Registered Brand Value and Acquired Patents', 
    category: Category.Asset, 
    explanation: "Non-physical assets like brand recognition, patents providing future benefits. Intangible Assets on Balance Sheet.",
    level: 2
  },
  { 
    id: 'L2_4', 
    name: 'Long-term Bank Loan for Factory Expansion (Repayable over 5 years)', 
    category: Category.Liability, 
    explanation: "Significant debt repayable beyond one year. Non-Current Liability on Balance Sheet.",
    level: 2 
  },
  { 
    id: 'L2_5', 
    name: 'Accumulated Profits Not Distributed as Dividends (Retained Earnings)', 
    category: Category.Equity, 
    explanation: "Cumulative profits reinvested in the business. Part of Equity on Balance Sheet.",
    level: 2 
  },
  { 
    id: 'L2_6', 
    name: 'Inventory of Finished Goods Ready for Sale', 
    category: Category.Asset, 
    explanation: "Completed products available for sale. Current Asset on Balance Sheet.",
    level: 2 
  },
  {
    id: 'L2_7',
    name: 'Dividends Received from Investment in Shares of Another Company',
    category: Category.Income,
    explanation: "Income from holding shares in other entities. 'Other Income' in Statement of Profit and Loss.",
    level: 2
  },
  {
    id: 'L2_8',
    name: 'Annual Depreciation Charge on Machinery',
    category: Category.Expense,
    explanation: "Systematic cost allocation of machinery over its useful life. Non-cash operating expense.",
    level: 2
  },
  {
    id: 'L2_9',
    name: 'Internally Developed Software Capitalized as an Asset',
    category: Category.Asset,
    explanation: "Costs of developing software for future benefits, treated as an intangible asset and amortized.",
    level: 2
  },
  {
    id: 'L2_10',
    name: 'Debentures Issued by the Company (Long-term Bonds Payable)',
    category: Category.Liability,
    explanation: "Long-term debt raised by selling bonds to investors. Non-Current Liability.",
    level: 2
  },
  {
    id: 'L2_11',
    name: 'Securities Premium Account (from Share Issue)',
    category: Category.Equity,
    explanation: "Excess amount received over share face value during issuance. Part of Reserves and Surplus.",
    level: 2
  },
  {
    id: 'L2_12',
    name: 'Inventory of Work-in-Progress (Semi-finished Goods)',
    category: Category.Asset,
    explanation: "Partially completed goods in production. Current Asset on Balance Sheet.",
    level: 2
  },
  {
    id: 'L2_13',
    name: 'Consultancy Fees Earned by an IT Services Firm',
    category: Category.Income,
    explanation: "Revenue for providing expert advice/services. Primary operating income for consultancies.",
    level: 2
  },
  {
    id: 'L2_14',
    name: 'Research and Development (R&D) Costs Expensed During the Year',
    category: Category.Expense,
    explanation: "R&D costs not meeting capitalization criteria, expensed as incurred. Operating expense.",
    level: 2
  },
  {
    id: 'L2_15',
    name: 'Prepaid Rent Expense (Rent paid for next financial year)',
    category: Category.Asset,
    explanation: "Rent paid in advance for a future period. Represents a future economic benefit, so it's a current asset.",
    level: 2
  },

  // Level 3: Pro (Expanded to 15 items)
  { 
    id: 'L3_1', 
    name: 'Gain on Sale of an Old Factory Machine (Above Book Value)', 
    category: Category.Income, 
    explanation: "Non-operating gain from disposing a fixed asset for more than its net book value. 'Other Income'.",
    level: 3 
  },
  { 
    id: 'L3_2', 
    name: 'Impairment Loss Recognized on Capitalized R&D Project', 
    category: Category.Expense, 
    explanation: "Non-cash expense when an intangible asset's carrying value exceeds its recoverable amount.",
    level: 3 
  },
  { 
    id: 'L3_3', 
    name: 'Deferred Tax Asset (DTA) arising from Past Business Losses', 
    category: Category.Asset, 
    explanation: "Asset recognized for expected future tax reduction due to past losses, if future profits are probable.",
    level: 3 
  },
  { 
    id: 'L3_4', 
    name: 'Provision for Employee Gratuity and Leave Encashment (Defined Benefit Obligation)', 
    category: Category.Liability, 
    explanation: "Long-term liability for future employee retirement/service benefits, requires actuarial valuation.",
    level: 3 
  },
  { 
    id: 'L3_5', 
    name: 'Non-Controlling Interest (NCI) in a Consolidated Balance Sheet', 
    category: Category.Equity, 
    explanation: "Equity in a subsidiary held by minority shareholders. Separate component of equity in consolidated financials.",
    level: 3 
  },
  { 
    id: 'L3_6', 
    name: 'Advance Received from Customer for a Long-Term Contract (Unearned Revenue)', 
    category: Category.Liability, 
    explanation: "Liability for payment received before delivering goods/services. Recognized as revenue when earned.",
    level: 3 
  },
  {
    id: 'L3_7',
    name: 'Realized Foreign Exchange Gain on Settlement of Export Receivable',
    category: Category.Income,
    explanation: "Gain from favorable exchange rate movement when converting foreign currency receivable to local currency.",
    level: 3
  },
  {
    id: 'L3_8',
    name: 'Increase in Provision for Doubtful Debts during the year',
    category: Category.Expense,
    explanation: "Estimated expense for uncollectible portion of accounts receivable. Reduces net receivables.",
    level: 3
  },
  {
    id: 'L3_9',
    name: 'Goodwill on Acquisition of another Company',
    category: Category.Asset,
    explanation: "Intangible asset: excess of purchase price over fair value of identifiable net assets acquired. Subject to impairment.",
    level: 3
  },
  {
    id: 'L3_10',
    name: 'Disclosure of a Contingent Liability for an Ongoing Lawsuit (Outcome Uncertain)',
    category: Category.Liability, // Represents a potential future liability
    explanation: "Potential obligation depending on a future event. If probable and estimable, a provision (Liability) is made; otherwise, disclosed. Assumed here as having characteristics leading to Liability recognition if event occurs.",
    level: 3
  },
  {
    id: 'L3_11',
    name: 'Revaluation Surplus on Upward Revaluation of Land and Buildings',
    category: Category.Equity,
    explanation: "Increase in carrying amount of PPE class from revaluation to fair market value. Credited to equity via Other Comprehensive Income (OCI).",
    level: 3
  },
  {
    id: 'L3_12',
    name: 'Investment Property (Building Rented Out to Earn Rental Income)',
    category: Category.Asset,
    explanation: "Property held to earn rentals or for capital appreciation, not for operational use.",
    level: 3
  },
   {
    id: 'L3_13',
    name: 'Lease Liability Recognized for Office Premises under Ind AS 116',
    category: Category.Liability,
    explanation: "Liability under Ind AS 116 for future lease payments on rented assets, recognized on balance sheet.",
    level: 3
  },
  {
    id: 'L3_14',
    name: 'Deferred Revenue from Annual Software Maintenance Contracts',
    category: Category.Liability,
    explanation: "Payment for services (like annual maintenance) to be provided over a future period. Recognized as income as service is delivered.",
    level: 3
  },
  {
    id: 'L3_15',
    name: 'Employee Stock Options (ESOPs) Outstanding - Equity Settled',
    category: Category.Equity,
    explanation: "Represents the value of stock options granted to employees that are yet to be exercised. Part of equity, often under a separate reserve.",
    level: 3
  },

  // Level 4: Dual Classification (6 items, requiring two distinct category selections)
  {
    id: 'L4_1',
    name: 'Annual Insurance Premium of ₹12,000 paid upfront. At month-end, one month has passed.',
    multiCategories: [{ category: Category.Expense }, { category: Category.Asset }],
    explanation: "The expired portion of the premium (₹1,000 for one month) is an Insurance Expense. The unexpired portion (₹11,000 for eleven months) is a Prepaid Insurance, an Asset, representing future coverage.",
    level: 4
  },
  {
    id: 'L4_2',
    name: 'Employee salary payment of ₹1,00,000: ₹90,000 for current month service, ₹10,000 as an advance for next month.',
    multiCategories: [{ category: Category.Expense }, { category: Category.Asset }],
    explanation: "The ₹90,000 for current month service is a Salary Expense. The ₹10,000 paid as an advance for next month's service is a Prepaid Salary (or Staff Advance), an Asset.",
    level: 4
  },
  {
    id: 'L4_3',
    name: 'Purchase of a new machine for ₹5,00,000. Paid ₹2,00,000 cash, remaining on credit payable to supplier.',
    multiCategories: [{ category: Category.Asset }, { category: Category.Liability }],
    explanation: "The entire ₹5,00,000 represents the cost of the Machine, an Asset. The ₹3,00,000 on credit creates a Liability (e.g., Creditors for Capital Goods/Trade Payable).",
    level: 4
  },
  {
    id: 'L4_4',
    name: 'Rent received in advance ₹30,000 for 3 months. At period end, one month\'s rent is earned.',
    multiCategories: [{ category: Category.Income }, { category: Category.Liability }],
    explanation: "The portion of rent earned for the current period (₹10,000 for one month) is Rental Income. The portion for which service (providing rented space) is yet to be rendered (₹20,000 for two months) is Unearned Rent Revenue, a Liability.",
    level: 4
  },
  {
    id: 'L4_5',
    name: 'Paid ₹1 Lakh for software package: ₹70k for perpetual license, ₹30k for first-year mandatory support/training consumed within the year.',
    multiCategories: [{ category: Category.Asset }, { category: Category.Expense }],
    explanation: "The software license (₹70k) is an Intangible Asset. The first-year support/training (₹30k), as its benefit is consumed within the year, is an Expense.",
    level: 4
  },
  {
    id: 'L4_6',
    name: 'Sale of goods for ₹100,000: Received ₹60,000 in cash, ₹40,000 on credit (Customer owes this).',
    multiCategories: [{ category: Category.Income }, { category: Category.Asset }],
    explanation: "The entire ₹100,000 is Revenue/Income from sales. The ₹60,000 cash received increases the Cash Asset. The ₹40,000 to be received later is an Accounts Receivable Asset.",
    level: 4
  }
];

export const LEVEL_CONFIG: { level: GameLevel; name: string; description: string; color: string; hoverColor: string; borderColor: string;}[] = [
    { level: 1, name: "Beginner", description: "Basic financial terms from annual reports.", color: "bg-green-500", hoverColor: "hover:bg-green-600", borderColor: "border-green-700" },
    { level: 2, name: "Intermediate", description: "More specific terms requiring some analysis.", color: "bg-yellow-500", hoverColor: "hover:bg-yellow-600", borderColor: "border-yellow-700" },
    { level: 3, name: "Pro", description: "Complex terms for seasoned report readers.", color: "bg-red-500", hoverColor: "hover:bg-red-600", borderColor: "border-red-700" },
    { level: 4, name: "Expert", description: "Items with dual financial classifications.", color: "bg-purple-500", hoverColor: "hover:bg-purple-600", borderColor: "border-purple-700" },
];

// Note on item volume: The list has been significantly expanded (total 51 items).
// For a production app with hundreds of items per level, managing this data in a backend database is recommended.
// Level 4 items are designed to require selection of two *distinct* category buttons.
// Explanations aim to provide context from an Indian annual report perspective.

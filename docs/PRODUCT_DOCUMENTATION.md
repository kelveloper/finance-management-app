# Product Documentation: "EmpowerFlow" (Working Title)

## 1. Product Vision

EmpowerFlow aims to be the user's intelligent financial co-pilot, moving beyond passive reporting to provide proactive, personalized insights and actionable advice. We empower users to understand not just what they spend, but why, and guide them effectively towards their financial goals through smart automation and intuitive planning tools.

## 2. Core Problem Statements Addressed

- [x] **"One Size Doesn't Fit All"**: Generic categorization and budgeting fail to accommodate unique financial situations and individual preferences.
- [x] **Manual Data Entry/Categorization Burden**: Users spend too much time manually correcting or tagging transactions.
- [x] **Lack of Proactive Behavioral Nudging**: Current apps often just show data; they don't actively help users change habits or avoid pitfalls.
- [x] **Limited "Why" Analysis**: Users don't get deep insights into the root causes of their spending patterns.
- [x] **Static Advice**: Generic tips don't resonate or provide concrete steps tailored to an individual's situation.
- [x] **Absence of Predictive Alerts**: Users often discover problems after they've occurred, rather than being warned proactively.
- [x] **Insufficient Granular Categorization**: Difficulty in distinguishing "essential" from "discretionary" within categories.
- [ ] **Lack of Robust Scenario Planning**: Users can't easily model the financial impact of major life decisions.
- [x] **Disconnected Goal Tracking**: Goals feel separate from daily spending and don't provide real-time impact.
- [x] **Rigid Planning Tools**: No flexible space for ad-hoc financial thoughts or temporary adjustments.
- [x] **Basic Debt Management**: Limited support for strategic debt reduction.

## 3. MVP (Minimum Viable Product) Scope

The MVP will focus on establishing a robust data foundation and delivering Smarter, More Proactive AI Financial Coaching through insightful "Why" analysis, personalized actionable advice, and predictive alerts, alongside enhanced categorization, basic goal integration, simplified scenario planning, a flexible planning space, and initial debt management tools.

### MVP Features Breakdown (by Layers)

#### Layer 1: Data Integration & Enhanced Categorization
*(Fixes: "Manual Data Entry/Categorization," "One Size Doesn't Fit All")*

- [x] **Secure Bank/Credit Card Linking**:
    - [x] **Mechanism**: Integration with a leading financial data aggregation API (e.g., Plaid or Finicity). Users will authenticate directly with their financial institutions via a secure OAuth flow.
    - [x] **Scope**: Initially support checking, savings, and credit card accounts (as per your Chase data sample).
    - [x] **Data Pulled**: Transaction history (description, amount, date, merchant, initial category), account balances.
- [x] **Initial Automatic Categorization**:
    - [x] **Mechanism**: Leverage the default categorization provided by the data aggregator (Plaid's Transactions API offers this).
- [x] **User-Correctable Categories**:
    - [x] **UI**: Simple, intuitive interface to edit any transaction's primary category.
    - [x] **Persistence**: User corrections are stored and override default categorization for future identical (or very similar) transactions.
- [x] **Smart Categorization (AI 1.0 - Learning from User Corrections)**:
    - [x] **Mechanism**: A machine learning model (e.g., a simple classifier like Naive Bayes or a rule-based system) will learn from every user-corrected category.
    - [x] **Training Data**: User's historical transactions, especially those with manual re-categorizations.
    - [x] **Functionality**: If a user consistently re-categorizes "Starbucks" as "Coffee" instead of "Dining Out," the AI will learn this preference for their account.
- [x] **More Granular Categorization/Tagging ("Essential vs. Discretionary")**:
    - [x] **UI**: For each transaction (or category), allow users to assign a secondary tag: "Essential" or "Discretionary."
    - [x] **Initial Classification**: The app can provide a sensible default (e.g., Rent = Essential, most Dining Out = Discretionary), but user override is paramount.
    - [x] **Impact**: This tagging will feed into "Why" analysis and advice.

#### Layer 2: Foundational AI Coaching & Transaction Management
*(Fixes: "Lack of Proactive Behavioral Nudging," "Limited 'Why' Analysis")*

- [x] **Transaction Feed & Initial Categorization**:
    - [x] **UI**: A clear, scrollable list of all transactions fetched from Plaid, displayed on the main dashboard.
    - [x] **Data Displayed**: Each list item should show Merchant Name, Amount, Date, and the initial Category provided by Plaid.
    - [x] **Mechanism**: The frontend will fetch this data from the existing `/api/data` endpoint upon loading the dashboard.
- [x] **"Why Did I Spend That?" Analysis (AI 1.0 - Anomaly Detection)**:
    - [x] **Insight**: "You've spent $X on [Category] this week, which is [Y%] higher than your 4-week average."
    - [x] **Mechanism (Backend)**: Create a new backend service that, for a given user and category, calculates the average weekly spend over the last 4 weeks and compares it to the current week's spending.
- [x] **Personalized, Actionable Advice (Rule-Based & Template-Driven)**:
    - [x] **Mechanism**: Simple, rule-based advice triggered by the anomaly detection.
    - [x] **Example**: If the "Dining Out" category anomaly is detected, display a card with advice like: "Trending high on Dining Out? Challenge yourself to pack lunch twice this week."
- [x] **Proactive Alerts and Predictions (Foundation)**:
    - [x] **Upcoming Recurring Bills**:
        - [x] **Mechanism (Backend)**: Implement a service to scan transaction history for recurring payments (e.g., same merchant, similar amount, regular interval).
        - [x] **UI (Frontend)**: Display a notification for a predicted upcoming bill: "We expect your [Bill Name] payment of ~$X around [Date]."

#### Layer 3: Robust Scenario Planning & Forecasting (Simplified for MVP)

- [x] **Goal**: Allow users to explore financial impacts of future decisions.
- [x] **MVP Plan**:
    - [x] **Focused "What If" Scenarios (2 initial types)**:
        - [x] **New Debt/Loan Impact (e.g., Car Loan)**:
            - [x] **User Input**: Loan amount, interest rate, term (years).
            - [x] **Output**: Calculate and display estimated monthly payment. Show its impact on "monthly free cash flow" (income - essential expenses - current discretionary spend - new loan payment). "A $30,000 car loan at 6% over 5 years would add approx. $580/month to your expenses, reducing your monthly free cash by that amount."
        - [x] **Raise/Income Increase Impact**:
            - [x] **User Input**: New monthly take-home income increase.
            - [x] **Output**: Show the increase in "free cash flow." Suggest potential allocations based on best practices (e.g., "With an extra $X/month, you could put $Y towards savings goals and $Z towards debt repayment.").
    - [x] **Basic Future Cash Flow Visualization**: A simple line graph projecting estimated income vs. planned expenses (including new scenario impacts) over the next 3-6 months.

#### Layer 4: Enhanced Integration with Financial Goals

- [x] **Goal**: Make goal tracking more dynamic and connected to daily spending.
- [x] **MVP Plan**:
    - [x] **Goal Definition**: Users can create custom savings goals with a name, target amount, and target date.
    - [x] **Manual Goal Contributions**: Allow users to manually designate money from their checking account as a contribution to a specific goal.
    - [x] **Real-time Spending Impact on Goals**:
        - [x] **Mechanism**: If the app detects a reduction in discretionary spending based on historical patterns, or if a user specifically reduces a budget category, link this to goal progress.
        - [x] **Nudge**: "Great work cutting down on impulse buys! That extra $20 this week brings you closer to your [Goal Name] goal!" (Connects directly to behavioral nudging).

#### Layer 5: "Scratch Pad" or Flexible Planning Space - ENHANCED ✅

- [x] **Goal**: Provide a less formal, low-friction area for ad-hoc financial thoughts.
- [x] **MVP Plan**:
    - [x] **Free-Form Notes Section**: A dedicated area for users to jot down any financial notes, thoughts, or upcoming expenses not yet tied to a formal budget (e.g., "Estimate $500 for car service next month," "Need new tires soon").
    - [x] **Temporary Budget Adjustments**: Allow users to temporarily "pause" or "reduce" a specific budget category for a defined period (e.g., "Reducing dining out by $100 for the next 2 weeks to save for concert tickets"). This doesn't permanently change the core budget but provides flexibility.
- [x] **Enhanced Features**:
    - [x] **Auto-Save Functionality**: Notes automatically save every 30 seconds with last-saved timestamp tracking
    - [x] **Note Templates**: Quick-start templates for Monthly Planning, Goal Setting, and Expense Tracking
    - [x] **Smart Suggestions**: Intelligent budget adjustment recommendations based on user behavior
    - [x] **Persistent Storage**: All notes and adjustments persist using AsyncStorage
    - [x] **Active/Expired Tracking**: Budget adjustments automatically expire and are visually separated
    - [x] **Category Suggestions**: Quick-select buttons for common spending categories
    - [x] **Duration Suggestions**: Predefined time periods for budget adjustments
    - [x] **Input Validation**: Comprehensive validation with user-friendly error messages
    - [x] **Visual Status Indicators**: Real-time feedback for save states and adjustment status

#### Layer 6: More Advanced Debt Management Strategies - COMPLETE ✅

- [x] **Goal**: Provide actionable strategies beyond just tracking balances.
- [x] **MVP Plan**:
    - [x] **Debt Overview**: Pull in all linked debt accounts (credit cards, loans) showing current balance, interest rate, and minimum payment.
    - [x] **"What If I Pay More?" Calculator**: An interactive slider/input to show the impact of an increased payment on estimated payoff date and total interest saved.
    - [x] **Simple Avalanche/Snowball Modeler**:
        - [x] **Mechanism**: Allow the user to select either "Debt Snowball" (pay lowest balance first) or "Debt Avalanche" (pay highest interest first) strategy.
        - [x] **Visualization**: Show a projected timeline for debt payoff based on current payments + any extra payments, and how this changes under the chosen strategy. This won't automatically execute payments, but models the impact.
- [x] **Advanced Features**:
    - [x] **Strategy Comparison**: Side-by-side comparison of Current, Snowball, and Avalanche approaches
    - [x] **Intelligent Recommendations**: AI-powered suggestions based on interest savings vs psychological benefits
    - [x] **Interactive Timeline**: Step-by-step payoff sequence with payment amounts and dates
    - [x] **Total Interest Calculations**: Comprehensive interest savings analysis across all strategies
    - [x] **Payment Sequencing**: Automatic calculation of payment acceleration as debts are eliminated
    - [x] **Visual Strategy Selection**: Intuitive cards showing payoff time and interest for each approach

### MVP Technical Stack (Recommended)

- [x] **Frontend**: React (Web) / React Native (Mobile) - for rapid cross-platform development.
- [x] **Backend**: Python with Flask/FastAPI (for REST APIs) or Node.js with Express (for speed and async operations). Python is excellent for ML integration.
- [ ] **Database**: PostgreSQL (relational, robust, scales well for financial data) or MongoDB (flexible schema for varied transaction data).
- [x] **Financial Data Aggregation**: Plaid (preferred for developer experience and comprehensive APIs).
- [ ] **Machine Learning**: Scikit-learn (Python) for initial classification, clustering, and regression for "Why" analysis and predictions. Utilize libraries for time series analysis.
- [ ] **Deployment**: AWS (EC2, S3, RDS, Lambda) or Google Cloud Platform (Compute Engine, Cloud Storage, Cloud SQL, Cloud Functions) for scalability and security.

### MVP Data Sample Usage (Your Chase Accounts)

- [ ] **Testing & Refinement**: Your own Chase checking/debit and credit card transaction data will be invaluable for testing the categorization, pattern recognition, and nudging algorithms. This real-world data will expose nuances that synthetic data might miss.
- [ ] **Privacy**: Ensure any local testing with your data is done with extreme caution and no exposure. For actual app use, users connect their own accounts.

## 4. Future Enhancements (Post-MVP)

These features are important for the long-term vision but should be explicitly excluded from the MVP to maintain focus and speed to market.

### 4.1. Advanced AI & Automation

- [ ] **AI-Driven Bill Negotiation/Subscription Cancellation**:
    - [ ] **Mechanism**: AI identifies recurring subscriptions/bills. With user permission, it could automatically draft cancellation letters, find lower rates, or connect users to services that negotiate on their behalf.
    - [ ] **Integration**: Partnership with third-party negotiation services or direct API integrations with service providers (if available).
- [ ] **Smarter "Why" Analysis with External Context**:
    - [ ] **Integration**: Connect to external APIs (weather, news, calendar) to correlate spending with external events (e.g., "We noticed you tend to order takeout more often on rainy days," or "Your spending spiked after the big [sports team] game").
- [ ] **Proactive "Money Left to Spend"**: Calculate true "free cash" after all bills, planned savings, and committed spending, and proactively suggest "you have $X remaining for discretionary spending this week/day."

### 4.2. Holistic Financial Management

- [ ] **Limited Investment Integration and Insight**:
    - [ ] **Mechanism**: Connect to investment accounts (brokerages, robo-advisors).
    - [ ] **Insights**: Display portfolio performance, asset allocation, analyze investment fees, suggest rebalancing opportunities, connect investments to long-term financial goals (e.g., retirement planning).
- [ ] **Hyper-Personalized Benchmarking**:
    - [ ] **Mechanism**: Anonymously compare user spending to aggregated data of "similar" demographics (age, income bracket, location, family size).
    - [ ] **Caveats**: Emphasize that this is for informational purposes only and not a judgment. Focus on actionable insights rather than just comparison. "Users like you tend to spend X% less on dining out."
- [ ] **Easier Handling of Irregular Income**:
    - [ ] **Features**: Tools to forecast variable income, "buffer" accounts for lean months, and intelligent allocation of windfalls (e.g., bonus, tax refund).
- [ ] **Improved Accessibility and Multi-Device Sync**:
    - [ ] **Seamless Experience**: True real-time sync across web, iOS, Android, and potentially even smartwatches for quick glances at spending.
    - [ ] **Accessibility**: WCAG compliance, voice commands, larger text options.

### 4.3. Enhanced Planning & Gamification

- [ ] **Advanced Scenario Planning**:
    - [ ] **Features**: Model impacts of job changes, housing purchases, having children, early retirement, college savings, etc., with multi-year projections.
- [ ] **Collaborative Planning**: Ability to share financial views and collaborate on budgets/goals with partners or family members.
- [ ] **Sophisticated Gamification**: Beyond simple progress bars, incorporate challenges, streaks, rewards, and perhaps a community aspect (optional).

## 5. Security & Privacy

This is paramount for any fintech application.

- [ ] **Data Encryption**: All data in transit (TLS 1.2+ for APIs) and at rest (AES-256 for databases, backups).
- [ ] **Authentication & Authorization**: Multi-Factor Authentication (MFA) for all users. Implement robust role-based access control (RBAC).
- [ ] **Data Minimization**: Only collect and store the data absolutely necessary for the core functionality.
- [ ] **Regular Security Audits**: Conduct penetration testing and vulnerability assessments regularly.
- [ ] **Compliance**: Adhere to relevant data privacy regulations (e.g., GDPR, CCPA, state-specific privacy laws). Explicitly state data handling policies in a clear and transparent privacy policy.
- [ ] **Secure Development Lifecycle (SDLC)**: Integrate security checks into every stage of development.
- [ ] **Tokenization**: Financial institution credentials are never stored directly by EmpowerFlow; they are securely handled by the data aggregator (Plaid/Finicity) and represented by secure tokens.

## 6. Monetization Strategy (Later Consideration)

While not part of the MVP build, a future monetization strategy could include:

- [ ] **Subscription Model (Freemium)**: A basic free tier with limited features, and a premium tier unlocking advanced AI insights, scenario planning, and more integrations.
- [ ] **Affiliate Partnerships**: Carefully selected partnerships for financial products (e.g., high-yield savings accounts, debt consolidation loans, insurance) where the app's insights naturally lead to a recommendation, always with full transparency.
- [ ] **B2B Licensing**: Licensing the core AI insights engine to other financial institutions.

## 7. Technical Debt

- [ ] **Fix Unit Test Suite**: The Jest test suite for React Native components is currently non-functional. It fails with a `React.jsx: type is invalid` error, indicating a fundamental misconfiguration in the test environment setup (likely related to module transforms or mocking). A dedicated effort is needed to reconfigure Jest, its presets, and setup files to work correctly with the Expo and React Native versions in use.
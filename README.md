# EmpowerFlow - Personal Finance Management App 🚀

EmpowerFlow is a **complete AI-driven personal finance application** that provides users with a personalized financial coach that learns and adapts to their unique spending habits and financial goals.

## 🎉 **MVP COMPLETED - ALL LAYERS IMPLEMENTED**

### 🧠 **Personalized AI Financial Coach**
- **Individual Learning**: AI analyzes each user's unique spending patterns and financial personality
- **Smart Insights**: Behavioral nudges, saving opportunities, and goal optimization suggestions
- **Confidence Scoring**: AI recommendations come with confidence levels (60-90%+)
- **Spending Pattern Analysis**: Detects trends, seasonal patterns, and merchant preferences
- **Proactive Coaching**: "Late night spending detected" and other behavioral insights

### 🔐 **Secure User Authentication System**
- **Individual Accounts**: Each user gets their own personalized AI experience
- **JWT Authentication**: Secure login/registration with password hashing
- **Data Privacy**: Complete isolation between users - no shared data
- **Session Management**: Persistent login with secure token storage

### 📊 **All MVP Layers Completed**

#### ✅ **Layer 1: Data Integration & Enhanced Categorization**
- CSV transaction upload with secure processing
- AI-powered automatic categorization that learns from user corrections
- Essential/discretionary transaction tagging
- Smart categorization rules that improve over time

#### ✅ **Layer 2: AI-Powered Insights & Proactive Nudges**
- Real-time spending anomaly detection
- Recurring bill predictions with confidence scoring
- Personalized behavioral insights (weekend spending, late-night purchases)
- Proactive financial coaching with actionable advice

#### ✅ **Layer 3: Robust Scenario Planning & Forecasting**
- What-if scenario modeling (new loans, salary increases, expenses)
- Future cash flow visualization and impact analysis
- Monthly budget planning with scenario comparisons

#### ✅ **Layer 4: Enhanced Goal Integration**
- Dynamic goal tracking connected to spending analysis
- Smart goal suggestions based on personal financial data
- Debt management with optimization strategies
- Progress monitoring with AI-powered recommendations

#### ✅ **Layer 5: Flexible Planning Space**
- Financial notes and scratchpad for planning
- Budget adjustment tracking with reasoning
- Template-based financial planning tools
- Monthly review and goal setting templates

#### ✅ **Layer 6: Debt Management Tools**
- Comprehensive debt analysis and payoff strategies
- Payment strategy comparisons (snowball vs avalanche)
- Integration with overall financial health monitoring
- High-interest debt prioritization recommendations

### 🎯 **Personalized AI Features**
- **Financial Personality Analysis**: Automatically determines spending type (saver/spender/balanced)
- **Impulse Score Calculation**: Rates impulsive buying behavior (1-10 scale)
- **Planning Horizon Assessment**: Identifies short/medium/long-term planning style
- **Smart Goal Generation**: Creates personalized goals based on spending patterns
- **Saving Opportunity Detection**: Finds unused subscriptions and wasteful spending
- **Behavioral Pattern Recognition**: Time-based spending analysis and nudges

### 🚀 **Technical Architecture**
- **Frontend**: React Native with Expo Router, TypeScript, dark theme
- **Backend**: Node.js/Express with TypeScript, JWT authentication
- **Database**: Supabase for secure data storage
- **AI Engine**: Custom financial analysis algorithms with confidence scoring
- **Testing**: Comprehensive test suite with Jest and Vitest
- **Mobile**: Fully responsive design optimized for all devices

## Getting Started

### Prerequisites

*   Node.js 18+ and npm
*   Supabase account for database (https://supabase.com/)

### Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file with your Supabase credentials:
    ```env
    SUPABASE_URL=your_supabase_project_url
    SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
    JWT_SECRET=your_super_secret_jwt_key
    PORT=8000
    ```
4.  Start the backend server:
    ```bash
    npm run dev
    ```

### Frontend Setup

1.  In a new terminal, navigate to the root directory:
    ```bash
    cd ..
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the frontend application:
    ```bash
    npx expo start --web
    ```

### First Time Setup

1. **Create Account**: Visit the welcome page and create your user account
2. **Upload Data**: Upload a CSV file of your transaction history (Chase format supported)
3. **AI Analysis**: Watch as your personal AI analyzes your spending patterns
4. **Explore Features**: Navigate through all tabs to see your personalized insights

### 📱 **User Experience Flow**

```
Welcome Screen → Create Account → Upload CSV Data → Personal AI Dashboard
```

The application provides a complete personalized financial coaching experience that learns about your unique spending habits!

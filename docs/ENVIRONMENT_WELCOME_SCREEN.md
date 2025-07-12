# Environment-Specific Welcome Screen Behavior

This document explains how the welcome screen behaves differently in each environment and how to use it effectively.

## 🎯 **Environment-Specific Behavior**

### **Development Environment**
- **Purpose**: Faster development and testing
- **Behavior**: Auto-checks for existing data and skips welcome if found
- **User Experience**: 
  - If you have data: Goes directly to dashboard
  - If no data: Shows welcome screen
- **When to use**: Daily coding and feature development

### **Staging Environment** 
- **Purpose**: Production-like testing with realistic user flow
- **Behavior**: Always shows welcome screen first
- **User Experience**: 
  - Every user sees the welcome screen
  - Must go through onboarding flow
  - Tests the complete user journey
- **When to use**: Pre-production testing, stakeholder demos

### **Production Environment**
- **Purpose**: Live app for real users
- **Behavior**: Always shows welcome screen first
- **User Experience**: 
  - New users see welcome and onboarding
  - Existing users see welcome (can improve later with user preferences)
  - Professional first impression
- **When to use**: Live app for real users

---

## 🔄 **How It Works**

### **Development Flow**
```
App Launch → Check for existing data → 
  ├─ Data found → Skip to Dashboard
  └─ No data → Show Welcome Screen
```

### **Staging/Production Flow**
```
App Launch → Always show Welcome Screen → 
  User clicks "Get Started" → Onboarding Flow
```

---

## 🚀 **How to Test Each Environment**

### **Testing Development Environment**
```bash
# Start development server
npm run dev

# Open app on phone/simulator
# Behavior: Auto-checks for data, may skip welcome
```

### **Testing Staging Environment**
```bash
# Build staging version
eas build --profile staging

# Or use release channel
expo start --release-channel staging

# Behavior: Always shows welcome screen first
```

### **Testing Production Environment**
```bash
# Build production version
eas build --profile production

# Or use release channel
expo start --release-channel production

# Behavior: Always shows welcome screen first
```

---

## 🎨 **Visual Differences**

### **Development**
- No environment badge shown
- Loading text: "Checking for existing data..."
- May skip welcome screen entirely

### **Staging**
- Green "Staging Environment" badge
- Loading text: "Loading..."
- Always shows welcome screen

### **Production**
- Green "Production Environment" badge
- Loading text: "Loading..."
- Always shows welcome screen

---

## 🔧 **Configuration Files**

### **app.json**
```json
{
  "expo": {
    "name": "EmpowerFlow",
    "slug": "empowerflow-finance",
    "extra": {
      "environment": "development"
    }
  }
}
```

### **eas.json**
```json
{
  "build": {
    "development": {
      "env": {
        "EXPO_PUBLIC_ENVIRONMENT": "development"
      }
    },
    "staging": {
      "releaseChannel": "staging",
      "env": {
        "EXPO_PUBLIC_ENVIRONMENT": "staging"
      }
    },
    "production": {
      "releaseChannel": "production",
      "env": {
        "EXPO_PUBLIC_ENVIRONMENT": "production"
      }
    }
  }
}
```

---

## 🛠️ **Technical Implementation**

### **Environment Detection**
```typescript
// utils/environment.ts
export function getCurrentEnvironment(): Environment {
  if (__DEV__) return 'development';
  
  // Check release channel
  const releaseChannel = getReleaseChannel();
  if (releaseChannel?.includes('staging')) return 'staging';
  if (releaseChannel?.includes('production')) return 'production';
  
  return 'development';
}
```

### **Routing Logic**
```typescript
// app/_layout.tsx
const isProductionEnvironment = isProductionLike();

if (isProductionEnvironment && !inOnboardingGroup) {
  // In staging/production, always show welcome first
  router.replace('/onboarding/welcome');
}
```

### **Welcome Screen Logic**
```typescript
// app/onboarding/welcome.tsx
if (!isDevEnvironment) {
  // In staging/production, always show welcome screen
  setIsLoading(false);
  return;
}

// In development, try to auto-start session
```

---

## 📊 **When to Use Each Environment**

### **Development Environment**
**Use for:**
- Daily coding and feature development
- Quick testing without onboarding flow
- Debugging and troubleshooting
- Local development

**Don't use for:**
- Stakeholder demos
- User testing
- Production releases

### **Staging Environment**
**Use for:**
- Pre-production testing
- Stakeholder demos
- User acceptance testing
- QA testing
- Testing complete user flow

**Don't use for:**
- Daily development
- Production releases

### **Production Environment**
**Use for:**
- Live app for real users
- App store releases
- Production deployments

**Don't use for:**
- Development or testing

---

## 🎯 **Best Practices**

### **For Developers**
1. **Use development** for daily coding - it's faster
2. **Test on staging** before any production release
3. **Always verify** production behavior before releasing

### **For QA/Testing**
1. **Use staging** for all pre-production testing
2. **Test complete user flow** including welcome screen
3. **Verify environment badges** are showing correctly

### **For Stakeholders**
1. **Use staging** for demos and reviews
2. **See the real user experience** with welcome screen
3. **Provide feedback** before production release

---

## 🚨 **Troubleshooting**

### **Welcome Screen Not Showing in Staging**
- Check if `EXPO_PUBLIC_ENVIRONMENT` is set to 'staging'
- Verify release channel is 'staging'
- Check console logs for environment detection

### **Development Auto-Skip Not Working**
- Ensure you're in development mode (`__DEV__` is true)
- Check if backend is running and accessible
- Verify API URL is correct for development

### **Environment Badge Not Showing**
- Check environment detection in console logs
- Verify `getCurrentEnvironment()` returns correct value
- Ensure `isProductionLike()` returns true for staging/production

---

## 📝 **Console Logs**

The app logs environment information to help with debugging:

```
[DEVELOPMENT] Welcome screen loaded
[STAGING] Production environment - showing welcome screen
[PRODUCTION] Welcome screen loaded
```

These logs help you verify which environment is detected and how the welcome screen behaves.

---

## 🎉 **Benefits**

### **For Development**
- ⚡ Faster development cycle
- 🔍 Easy debugging
- 🚀 Quick feature testing

### **For Staging**
- 🎭 Real user experience
- 🧪 Complete flow testing
- 👥 Stakeholder confidence

### **For Production**
- 🏆 Professional user experience
- 🛡️ Consistent onboarding
- 📈 Better user engagement

This environment-specific behavior ensures you get the best development experience while maintaining professional user experience in production! 
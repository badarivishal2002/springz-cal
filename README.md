# 🏋️ BodyComp - Advanced Body Composition Calculator

A responsive Next.js application that calculates body composition metrics, calorie needs, and protein requirements using scientifically-backed formulas. Built with modern UI/UX principles and optimized for all device types.

![BodyComp App](https://img.shields.io/badge/Next.js-14.0.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 📊 **Two-Step Calculation Process**
- **Step 1**: Body composition analysis with comprehensive metrics
- **Step 2**: Goal-based nutrition planning with smart recommendations

### 🧬 **Scientific Calculations**
- **Body Fat %**: U.S. Navy formula with gender-specific calculations
- **Lean Body Mass**: Precise body composition analysis
- **Calories**: Katch-McArdle formula for accurate BMR calculation
- **Protein**: Exercise-adjusted requirements based on activity level

### 🎯 **Smart Goal System**
- **Intelligent Restrictions**: Recommendations based on body fat category
- **5 Goal Types**: Maintenance, Fat Loss, Muscle Gain, Weight Gain, Body Recomposition
- **Personalized Targets**: Custom calorie and protein adjustments

### 📱 **Fully Responsive Design**
- **Mobile-First**: Optimized for smartphones (320px+)
- **Tablet Enhanced**: Improved spacing and typography (640px+)
- **Desktop Layout**: Two-column design with sticky results (1024px+)
- **Large Screens**: Scaled components for monitors (1440px+)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/badarivishal2002/springz-cal.git
   cd springz-cal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 How to Use

### Step 1: Enter Your Details
1. **Personal Info**: Gender, age, weight, height
2. **Body Measurements**: Neck, waist, and hip (for females)
3. **Activity Level**: Choose from 5 exercise levels
4. Click **"Calculate My Body Stats"**

### Step 2: Choose Your Goal
1. Review your body composition results
2. Select an appropriate fitness goal
3. Get personalized calorie and protein targets

## 🧮 Calculation Methods

### Body Fat Percentage (U.S. Navy Formula)

**Male Formula:**
```
BF% = 86.010 × log₁₀(waist - neck) - 70.041 × log₁₀(height) + 36.76
```

**Female Formula:**
```
BF% = 163.205 × log₁₀(waist + hip - neck) - 97.684 × log₁₀(height) - 78.387
```

### Calories (Katch-McArdle Formula)
```
BMR = 370 + (21.6 × Lean Body Mass)
Daily Calories = BMR × Activity Factor
```

### Activity Multipliers
| Activity Level | BMR Multiplier | Protein Multiplier |
|---------------|----------------|-------------------|
| Sedentary | 1.2 | 1.2 |
| 1-2x/week | 1.375 | 1.5 |
| 3-5x/week | 1.55 | 1.7 |
| Daily | 1.725 | 1.95 |
| Twice/day | 1.9 | 2.2 |

### Goal Adjustments
| Goal | Calorie Multiplier | Protein Multiplier |
|------|-------------------|-------------------|
| Maintenance | 1.0 | 1.0 |
| Fat Loss | 0.8 | 1.2 |
| Muscle Gain | 1.1 | 1.25 |
| Weight Gain | 1.2 | 1.2 |
| Body Recomposition | 1.0 | 1.25 |

## 📱 Responsive Breakpoints

| Device Type | Screen Size | Features |
|------------|-------------|----------|
| **Mobile** | 320px - 640px | Single column, touch-optimized |
| **Tablet** | 640px - 1024px | Enhanced spacing, better typography |
| **Laptop** | 1024px - 1440px | Two-column layout, sticky results |
| **Desktop** | 1440px+ | Scaled components, maximum width |

## 🏗️ Project Structure

```
springz-cal/
├── app/
│   ├── globals.css          # Global styles and Tailwind directives
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Main calculator component
├── public/                  # Static assets
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## 🛠️ Built With

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React Hooks](https://reactjs.org/docs/hooks-intro.html)** - State management

## 🎨 Design Features

- **Modern UI**: Clean, health-focused design
- **Gradient Backgrounds**: Emerald to teal color scheme
- **Interactive Elements**: Hover effects and smooth transitions
- **Visual Feedback**: Progress indicators and status messages
- **Accessibility**: Proper contrast ratios and focus states

## 📋 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- U.S. Navy for the body fat calculation formula
- Katch-McArdle research for BMR calculations
- Modern fitness science for goal-based recommendations

## 📞 Contact

Badari Vishal - [@badarivishal2002](https://github.com/badarivishal2002)

Project Link: [https://github.com/badarivishal2002/springz-cal](https://github.com/badarivishal2002/springz-cal)

---

⭐ **Star this repo if you found it helpful!** 
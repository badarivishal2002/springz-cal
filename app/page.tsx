'use client'

import { useState } from 'react'

interface FormData {
  gender: 'male' | 'female'
  age: number
  weight: number
  height: number
  neck: number
  waist: number
  hip: number
  exerciseLevel: 'sedentary' | '1-2x' | '3-5x' | 'daily' | 'twice-daily'
}

interface BaseResults {
  bodyFatPercentage: number
  bodyFatCategory: string
  leanBodyMass: number
  baseCalories: number
  baseProtein: number
  allowedGoals: string[]
  restrictionMessage: string
}

interface GoalResults {
  goal: 'maintenance' | 'fat-loss' | 'muscle-gain' | 'weight-gain' | 'recomposition'
  revisedCalorieTarget: number
  revisedProteinTarget: number
}

const EXERCISE_MULTIPLIERS = {
  sedentary: 1.2,
  '1-2x': 1.5,
  '3-5x': 1.7,
  daily: 1.95,
  'twice-daily': 2.2
}

const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  '1-2x': 1.375,
  '3-5x': 1.55,
  daily: 1.725,
  'twice-daily': 1.9
}

const GOAL_ADJUSTMENTS = {
  maintenance: { calorie: 1.0, protein: 1.0 },
  'fat-loss': { calorie: 0.8, protein: 1.2 },
  'muscle-gain': { calorie: 1.1, protein: 1.25 },
  'weight-gain': { calorie: 1.2, protein: 1.2 },
  recomposition: { calorie: 1.0, protein: 1.25 }
}

// U.S. Navy Body Fat Categories
const BODY_FAT_CATEGORIES = {
  male: [
    { max: 13, category: 'Excellent', color: 'green' },
    { max: 16, category: 'Good', color: 'blue' },
    { max: 20, category: 'Average', color: 'yellow' },
    { max: 22, category: 'Above Average', color: 'orange' },
    { max: Infinity, category: 'Obese', color: 'red' }
  ],
  female: [
    { max: 16, category: 'Excellent', color: 'green' },
    { max: 19, category: 'Good', color: 'blue' },
    { max: 28, category: 'Average', color: 'yellow' },
    { max: 33, category: 'Above Average', color: 'orange' },
    { max: Infinity, category: 'Obese', color: 'red' }
  ]
}

export default function BodyCompositionCalculator() {
  const [formData, setFormData] = useState<FormData>({
    gender: 'male',
    age: 25,
    weight: 70,
    height: 175,
    neck: 35,
    waist: 80,
    hip: 95,
    exerciseLevel: 'sedentary'
  })

  const [baseResults, setBaseResults] = useState<BaseResults | null>(null)
  const [goalResults, setGoalResults] = useState<GoalResults | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<string>('')

  const calculateBodyFat = (data: FormData): number => {
    // Convert measurements from cm to inches (U.S. Navy formula uses inches)
    const waistInches = data.waist / 2.54
    const neckInches = data.neck / 2.54
    const heightInches = data.height / 2.54
    const hipInches = data.hip / 2.54

    if (data.gender === 'male') {
      // Male: BF% = 86.010 × log10(waist - neck) - 70.041 × log10(height) + 36.76
      return 86.010 * Math.log10(waistInches - neckInches) - 70.041 * Math.log10(heightInches) + 36.76
    } else {
      // Female: BF% = 163.205 × log10(waist + hip - neck) - 97.684 × log10(height) - 78.387
      return 163.205 * Math.log10(waistInches + hipInches - neckInches) - 97.684 * Math.log10(heightInches) - 78.387
    }
  }

  const getBodyFatCategory = (bodyFat: number, gender: 'male' | 'female') => {
    const categories = BODY_FAT_CATEGORIES[gender]
    return categories.find(cat => bodyFat <= cat.max) || categories[categories.length - 1]
  }

  const getAllowedGoals = (bodyFat: number, gender: 'male' | 'female') => {
    const isObese = (gender === 'male' && bodyFat > 22) || (gender === 'female' && bodyFat > 33)
    const isAboveAverage = (gender === 'male' && bodyFat > 20 && bodyFat <= 22) || 
                          (gender === 'female' && bodyFat > 28 && bodyFat <= 33)

    if (isObese) {
      return {
        allowed: ['fat-loss'],
        message: 'Due to elevated body fat levels, only Fat Loss goal is recommended for health.'
      }
    } else if (isAboveAverage) {
      return {
        allowed: ['maintenance', 'fat-loss', 'muscle-gain', 'recomposition'],
        message: 'Weight Gain is not recommended at current body fat levels.'
      }
    } else {
      return {
        allowed: ['maintenance', 'fat-loss', 'muscle-gain', 'weight-gain', 'recomposition'],
        message: 'All goals are available based on your current body composition.'
      }
    }
  }

  const calculateBaseStats = () => {
    const bodyFatPercentage = Math.max(0, Math.min(50, calculateBodyFat(formData)))
    const leanBodyMass = formData.weight * (1 - bodyFatPercentage / 100)
    
    // Katch-McArdle BMR = 370 + (21.6 × lean body mass)
    const bmr = 370 + (21.6 * leanBodyMass)
    const baseCalories = bmr * ACTIVITY_FACTORS[formData.exerciseLevel]
    
    const baseProtein = formData.weight * EXERCISE_MULTIPLIERS[formData.exerciseLevel]
    
    const category = getBodyFatCategory(bodyFatPercentage, formData.gender)
    const goalRestrictions = getAllowedGoals(bodyFatPercentage, formData.gender)

    setBaseResults({
      bodyFatPercentage,
      bodyFatCategory: category.category,
      leanBodyMass,
      baseCalories,
      baseProtein,
      allowedGoals: goalRestrictions.allowed,
      restrictionMessage: goalRestrictions.message
    })

    // Reset goal results when recalculating base stats
    setGoalResults(null)
    setSelectedGoal('')
  }

  const calculateGoalResults = (goal: string) => {
    if (!baseResults) return

    const goalKey = goal as keyof typeof GOAL_ADJUSTMENTS
    const goalAdjustment = GOAL_ADJUSTMENTS[goalKey]
    
    const revisedCalorieTarget = baseResults.baseCalories * goalAdjustment.calorie
    const revisedProteinTarget = baseResults.baseProtein * goalAdjustment.protein

    setGoalResults({
      goal: goalKey,
      revisedCalorieTarget,
      revisedProteinTarget
    })
    setSelectedGoal(goal)
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Excellent': return 'text-green-700 bg-green-50 border-green-200'
      case 'Good': return 'text-blue-700 bg-blue-50 border-blue-200'
      case 'Average': return 'text-yellow-700 bg-yellow-50 border-yellow-200'
      case 'Above Average': return 'text-orange-700 bg-orange-50 border-orange-200'
      case 'Obese': return 'text-red-700 bg-red-50 border-red-200'
      default: return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  const getGoalLabel = (goal: string) => {
    switch (goal) {
      case 'maintenance': return 'Maintenance'
      case 'fat-loss': return 'Fat Loss'
      case 'muscle-gain': return 'Muscle Gain'
      case 'weight-gain': return 'Weight Gain'
      case 'recomposition': return 'Body Recomposition'
      default: return goal
    }
  }

           return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        {/* Responsive App Header */}
        <div className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 lg:space-x-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900">BodyComp</h1>
                  <p className="text-xs lg:text-sm text-gray-500">Health Calculator</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center space-x-4">
                <div className="text-sm text-gray-500">Step-by-step body composition analysis</div>
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-md sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 xl:py-10">

                   {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-3 lg:space-x-4 mb-6 lg:mb-8 xl:mb-10">
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm lg:text-base font-bold ${baseResults ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                ✓
              </div>
              <span className="hidden sm:block text-sm lg:text-base font-medium text-gray-700">Body Stats</span>
            </div>
            <div className={`flex-1 max-w-20 sm:max-w-32 lg:max-w-40 h-1 lg:h-1.5 rounded-full ${baseResults ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
            <div className="flex items-center space-x-2 lg:space-x-3">
              <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm lg:text-base font-bold ${goalResults ? 'bg-emerald-500 text-white' : baseResults ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
                2
              </div>
              <span className="hidden sm:block text-sm lg:text-base font-medium text-gray-700">Goals</span>
            </div>
          </div>

                   {/* Step 1: Body Stats Calculator */}
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-10 space-y-6 lg:space-y-0">
            {/* Form Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 xl:p-10">
              <div className="text-center lg:text-left mb-6 lg:mb-8">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-3 lg:mb-4">
                  <svg className="w-8 h-8 lg:w-10 lg:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1 lg:mb-2">Enter Your Details</h2>
                <p className="text-sm lg:text-base text-gray-500">Let's calculate your body composition</p>
              </div>
            
                                        <div className="space-y-5 lg:space-y-6 xl:space-y-8">
                 {/* Gender */}
                 <div>
                   <label className="block text-sm lg:text-base font-semibold text-gray-900 mb-3 lg:mb-4">Gender</label>
                   <div className="grid grid-cols-2 gap-3 lg:gap-4">
                     <button
                       type="button"
                       onClick={() => handleInputChange('gender', 'male')}
                       className={`py-4 lg:py-5 xl:py-6 px-4 lg:px-6 rounded-2xl border-2 transition-all flex items-center justify-center space-x-2 lg:space-x-3 ${
                         formData.gender === 'male'
                           ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200'
                           : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                       }`}
                     >
                       <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                       </svg>
                       <span className="font-medium text-sm lg:text-base">Male</span>
                     </button>
                     <button
                       type="button"
                       onClick={() => handleInputChange('gender', 'female')}
                       className={`py-4 lg:py-5 xl:py-6 px-4 lg:px-6 rounded-2xl border-2 transition-all flex items-center justify-center space-x-2 lg:space-x-3 ${
                         formData.gender === 'female'
                           ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200'
                           : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                       }`}
                     >
                       <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                       </svg>
                       <span className="font-medium text-sm lg:text-base">Female</span>
                     </button>
                   </div>
                 </div>

                                              {/* Basic Info */}
                 <div className="space-y-4 lg:space-y-5">
                   <div className="grid grid-cols-2 gap-3 lg:gap-4">
                     <div className="relative">
                       <label className="block text-sm lg:text-base font-semibold text-gray-900 mb-2 lg:mb-3">Age</label>
                       <div className="relative">
                         <input
                           type="number"
                           value={formData.age}
                           onChange={(e) => handleInputChange('age', Number(e.target.value))}
                           className="w-full px-4 lg:px-5 py-4 lg:py-5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg lg:text-xl font-medium text-gray-900 transition-all"
                           placeholder="25"
                         />
                         <span className="absolute right-4 lg:right-5 top-1/2 transform -translate-y-1/2 text-sm lg:text-base text-gray-500">yrs</span>
                       </div>
                     </div>
                     <div className="relative">
                       <label className="block text-sm lg:text-base font-semibold text-gray-900 mb-2 lg:mb-3">Weight</label>
                       <div className="relative">
                         <input
                           type="number"
                           value={formData.weight}
                           onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                           className="w-full px-4 lg:px-5 py-4 lg:py-5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg lg:text-xl font-medium text-gray-900 transition-all"
                           placeholder="70"
                         />
                         <span className="absolute right-4 lg:right-5 top-1/2 transform -translate-y-1/2 text-sm lg:text-base text-gray-500">kg</span>
                       </div>
                     </div>
                   </div>

                   <div className="relative">
                     <label className="block text-sm lg:text-base font-semibold text-gray-900 mb-2 lg:mb-3">Height</label>
                     <div className="relative">
                       <input
                         type="number"
                         value={formData.height}
                         onChange={(e) => handleInputChange('height', Number(e.target.value))}
                         className="w-full px-4 lg:px-5 py-4 lg:py-5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg lg:text-xl font-medium text-gray-900 transition-all"
                         placeholder="175"
                       />
                       <span className="absolute right-4 lg:right-5 top-1/2 transform -translate-y-1/2 text-sm lg:text-base text-gray-500">cm</span>
                     </div>
                   </div>
                 </div>

                             {/* Body Measurements */}
               <div className="space-y-4">
                 <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                   <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                     <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4 4 4 0 004-4V5z" />
                     </svg>
                     Body Measurements
                   </h3>
                   <div className="grid grid-cols-2 gap-3">
                     <div className="relative">
                       <label className="block text-sm font-medium text-blue-900 mb-2">Neck</label>
                       <div className="relative">
                         <input
                           type="number"
                           value={formData.neck}
                           onChange={(e) => handleInputChange('neck', Number(e.target.value))}
                           className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium text-gray-900 transition-all"
                           placeholder="35"
                         />
                         <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-blue-600">cm</span>
                       </div>
                     </div>
                     <div className="relative">
                       <label className="block text-sm font-medium text-blue-900 mb-2">Waist</label>
                       <div className="relative">
                         <input
                           type="number"
                           value={formData.waist}
                           onChange={(e) => handleInputChange('waist', Number(e.target.value))}
                           className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium text-gray-900 transition-all"
                           placeholder="80"
                         />
                         <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-blue-600">cm</span>
                       </div>
                     </div>
                   </div>
                   
                   {formData.gender === 'female' && (
                     <div className="mt-3 relative">
                       <label className="block text-sm font-medium text-blue-900 mb-2">Hip</label>
                       <div className="relative">
                         <input
                           type="number"
                           value={formData.hip}
                           onChange={(e) => handleInputChange('hip', Number(e.target.value))}
                           className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium text-gray-900 transition-all"
                           placeholder="95"
                         />
                         <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-blue-600">cm</span>
                       </div>
                     </div>
                   )}
                 </div>
               </div>

                             {/* Exercise Level */}
               <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                 <label className="block text-sm font-semibold text-purple-900 mb-3 flex items-center">
                   <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                   </svg>
                   Activity Level
                 </label>
                 <select
                   value={formData.exerciseLevel}
                   onChange={(e) => handleInputChange('exerciseLevel', e.target.value)}
                   className="w-full px-4 py-4 bg-white border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base font-medium text-gray-900 transition-all appearance-none cursor-pointer"
                 >
                   <option value="sedentary">💺 Sedentary - Little to no exercise</option>
                   <option value="1-2x">🚶 Light - 1-2 times per week</option>
                   <option value="3-5x">🏃 Moderate - 3-5 times per week</option>
                   <option value="daily">🏋️ Active - Daily exercise</option>
                   <option value="twice-daily">💪 Very Active - Twice daily</option>
                 </select>
               </div>

                                <button
                   onClick={calculateBaseStats}
                   className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-5 lg:py-6 xl:py-7 px-6 lg:px-8 rounded-2xl font-bold text-lg lg:text-xl xl:text-2xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300 transform hover:scale-[1.02] active:scale-[0.98]"
                 >
                   Calculate My Body Stats ✨
                 </button>
               </div>
             </div>

             {/* Step 1 Results */}
             <div className="lg:sticky lg:top-6">
               {baseResults ? (
                 <div className="space-y-4 lg:space-y-6">
                   {/* Body Composition Card */}
                   <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 lg:p-8 border border-blue-100 shadow-sm">
                     <div className="flex items-center justify-between mb-4 lg:mb-6">
                       <h3 className="text-lg lg:text-xl xl:text-2xl font-bold text-blue-900 flex items-center">
                         <div className="w-8 h-8 lg:w-10 lg:h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                           <svg className="w-5 h-5 lg:w-6 lg:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                           </svg>
                         </div>
                         Body Composition
                       </h3>
                       <div className={`px-3 lg:px-4 py-1 lg:py-2 rounded-full text-xs lg:text-sm font-bold border ${getCategoryColor(baseResults.bodyFatCategory)}`}>
                         {baseResults.bodyFatCategory}
                       </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4 lg:gap-6">
                       <div className="bg-white rounded-xl p-4 lg:p-6 text-center">
                         <p className="text-xs lg:text-sm font-medium text-blue-600 mb-1 lg:mb-2">Body Fat</p>
                         <p className="text-2xl lg:text-3xl xl:text-4xl font-bold text-blue-900">
                           {baseResults.bodyFatPercentage.toFixed(1)}%
                         </p>
                       </div>
                       <div className="bg-white rounded-xl p-4 lg:p-6 text-center">
                         <p className="text-xs lg:text-sm font-medium text-blue-600 mb-1 lg:mb-2">Lean Mass</p>
                         <p className="text-2xl lg:text-3xl xl:text-4xl font-bold text-blue-900">
                           {baseResults.leanBodyMass.toFixed(1)} kg
                         </p>
                       </div>
                     </div>
                   </div>

                   {/* Base Targets Grid */}
                   <div className="grid grid-cols-2 gap-4 lg:gap-6">
                     {/* Calories Card */}
                     <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 lg:p-6 border border-emerald-100 shadow-sm">
                       <div className="flex items-center mb-3 lg:mb-4">
                         <div className="w-6 h-6 lg:w-8 lg:h-8 bg-emerald-500 rounded-lg flex items-center justify-center mr-2 lg:mr-3">
                           <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                           </svg>
                         </div>
                         <span className="text-xs lg:text-sm font-semibold text-emerald-900">Base Calories</span>
                       </div>
                       <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-emerald-900 mb-1">
                         {Math.round(baseResults.baseCalories)}
                       </p>
                       <p className="text-xs lg:text-sm text-emerald-700">per day</p>
                     </div>

                     {/* Protein Card */}
                     <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 lg:p-6 border border-purple-100 shadow-sm">
                       <div className="flex items-center mb-3 lg:mb-4">
                         <div className="w-6 h-6 lg:w-8 lg:h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-2 lg:mr-3">
                           <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                           </svg>
                         </div>
                         <span className="text-xs lg:text-sm font-semibold text-purple-900">Base Protein</span>
                       </div>
                       <p className="text-xl lg:text-2xl xl:text-3xl font-bold text-purple-900 mb-1">
                         {Math.round(baseResults.baseProtein)}g
                       </p>
                       <p className="text-xs lg:text-sm text-purple-700">per day</p>
                     </div>
                   </div>

                   {/* Goal Restrictions */}
                   <div className={`p-4 lg:p-6 rounded-2xl border ${baseResults.allowedGoals.length === 1 ? 'bg-red-50 border-red-200' : baseResults.allowedGoals.length === 4 ? 'bg-orange-50 border-orange-200' : 'bg-emerald-50 border-emerald-200'}`}>
                     <div className="flex items-start space-x-3 lg:space-x-4">
                       <div className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${baseResults.allowedGoals.length === 1 ? 'bg-red-500' : baseResults.allowedGoals.length === 4 ? 'bg-orange-500' : 'bg-emerald-500'}`}>
                         {baseResults.allowedGoals.length === 5 ? (
                           <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                           </svg>
                         ) : (
                           <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                           </svg>
                         )}
                       </div>
                       <p className={`text-sm lg:text-base font-medium flex-1 ${baseResults.allowedGoals.length === 1 ? 'text-red-700' : baseResults.allowedGoals.length === 4 ? 'text-orange-700' : 'text-emerald-700'}`}>
                         {baseResults.restrictionMessage}
                       </p>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-10 xl:p-12">
                   <div className="text-center">
                     <div className="w-20 h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                       <svg className="w-10 h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                       </svg>
                     </div>
                     <h3 className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 mb-2 lg:mb-3">Ready to Calculate?</h3>
                     <p className="text-gray-500 text-sm lg:text-base">
                       Fill in your details and tap the button to see your body composition results
                     </p>
                   </div>
                 </div>
               )}
                                         </div>
            </div>

                    {/* Step 2: Goal-Based Calculator */}
          {baseResults && (
            <div className="space-y-6 lg:space-y-8 xl:space-y-10 mt-8 lg:mt-12 xl:mt-16">
              {/* Goal Selection Header */}
              <div className="text-center">
                <div className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4">
                  <svg className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1 lg:mb-2">Choose Your Goal</h2>
                <p className="text-sm lg:text-base xl:text-lg text-gray-500">Get personalized targets based on your objective</p>
              </div>

              {/* Goal Selection */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 xl:p-10">
                               <div className="space-y-4 lg:space-y-6">
                  {[
                    { key: 'maintenance', label: 'Maintenance', desc: 'Maintain current weight and composition', emoji: '⚖️', color: 'blue' },
                    { key: 'fat-loss', label: 'Fat Loss', desc: 'Reduce body fat while preserving muscle', emoji: '🔥', color: 'red' },
                    { key: 'muscle-gain', label: 'Muscle Gain', desc: 'Build muscle with minimal fat gain', emoji: '💪', color: 'orange' },
                    { key: 'weight-gain', label: 'Weight Gain', desc: 'Increase overall body weight', emoji: '📈', color: 'green' },
                    { key: 'recomposition', label: 'Body Recomposition', desc: 'Build muscle while losing fat', emoji: '🎯', color: 'purple' }
                  ].map((goalOption) => {
                    const isAllowed = baseResults.allowedGoals.includes(goalOption.key)
                    const isSelected = selectedGoal === goalOption.key
                    
                    return (
                      <button
                        key={goalOption.key}
                        disabled={!isAllowed}
                        onClick={() => calculateGoalResults(goalOption.key)}
                        className={`w-full p-4 lg:p-6 xl:p-7 rounded-2xl border-2 text-left transition-all transform ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100 scale-[1.02] shadow-lg shadow-emerald-200'
                            : isAllowed
                            ? 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-md hover:scale-[1.01]'
                            : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div className="flex items-center space-x-4 lg:space-x-6">
                          <div className={`w-12 h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16 rounded-2xl flex items-center justify-center text-xl lg:text-2xl xl:text-3xl ${
                            isSelected 
                              ? 'bg-emerald-500 shadow-lg shadow-emerald-300' 
                              : isAllowed 
                              ? 'bg-gray-100' 
                              : 'bg-gray-100'
                          }`}>
                            {isSelected ? '✓' : goalOption.emoji}
                          </div>
                          <div className="flex-1">
                            <div className={`font-bold text-base lg:text-lg xl:text-xl ${isSelected ? 'text-emerald-700' : isAllowed ? 'text-gray-900' : 'text-gray-400'}`}>
                              {goalOption.label}
                            </div>
                            <div className={`text-sm lg:text-base mt-1 lg:mt-2 ${isSelected ? 'text-emerald-600' : isAllowed ? 'text-gray-600' : 'text-gray-400'}`}>
                              {goalOption.desc}
                            </div>
                            {!isAllowed && (
                              <div className="text-xs lg:text-sm text-red-500 mt-1 lg:mt-2 font-semibold">
                                🚫 Not recommended for your body composition
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 lg:w-5 lg:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
             </div>

             {/* Goal Results */}
             {goalResults ? (
               <div className="space-y-4">
                 {/* Success Message */}
                 <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg">
                   <div className="flex items-center space-x-3 mb-3">
                     <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                       </svg>
                     </div>
                     <div>
                       <h3 className="text-lg font-bold">Your Goal: {getGoalLabel(goalResults.goal)}</h3>
                       <p className="text-emerald-100 text-sm">Here are your personalized targets!</p>
                     </div>
                   </div>
                 </div>

                 {/* Target Cards */}
                 <div className="grid grid-cols-2 gap-4">
                   {/* Calories Target */}
                   <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-5 border border-orange-100 shadow-sm">
                     <div className="flex items-center mb-3">
                       <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center mr-3">
                         <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                         </svg>
                       </div>
                     </div>
                     <p className="text-xs font-medium text-orange-700 mb-1">Daily Calories</p>
                     <p className="text-2xl font-bold text-orange-900 mb-1">
                       {Math.round(goalResults.revisedCalorieTarget)}
                     </p>
                     <div className="flex items-center text-xs text-orange-600">
                       <span className="bg-orange-100 px-2 py-1 rounded-lg">
                         {goalResults.revisedCalorieTarget > baseResults.baseCalories ? '+' : ''}
                         {Math.round(goalResults.revisedCalorieTarget - baseResults.baseCalories)} from base
                       </span>
                     </div>
                   </div>

                   {/* Protein Target */}
                   <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100 shadow-sm">
                     <div className="flex items-center mb-3">
                       <div className="w-8 h-8 bg-violet-500 rounded-xl flex items-center justify-center mr-3">
                         <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                         </svg>
                       </div>
                     </div>
                     <p className="text-xs font-medium text-violet-700 mb-1">Daily Protein</p>
                     <p className="text-2xl font-bold text-violet-900 mb-1">
                       {Math.round(goalResults.revisedProteinTarget)}g
                     </p>
                     <div className="flex items-center text-xs text-violet-600">
                       <span className="bg-violet-100 px-2 py-1 rounded-lg">
                         {goalResults.revisedProteinTarget > baseResults.baseProtein ? '+' : ''}
                         {Math.round(goalResults.revisedProteinTarget - baseResults.baseProtein)}g from base
                       </span>
                     </div>
                   </div>
                 </div>

                 {/* Summary Card */}
                 <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                   <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                     <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                     </svg>
                     Your Daily Targets
                   </h4>
                   <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                     <div className="grid grid-cols-2 gap-4 text-center">
                       <div>
                         <div className="text-2xl font-bold text-emerald-700">
                           {Math.round(goalResults.revisedCalorieTarget)}
                         </div>
                         <div className="text-sm text-emerald-600">Calories</div>
                       </div>
                       <div>
                         <div className="text-2xl font-bold text-emerald-700">
                           {Math.round(goalResults.revisedProteinTarget)}g
                         </div>
                         <div className="text-sm text-emerald-600">Protein</div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             ) : (
               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                 <div className="text-center">
                   <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                     </svg>
                   </div>
                   <h3 className="text-lg font-bold text-gray-900 mb-2">Choose Your Goal</h3>
                   <p className="text-gray-500 text-sm">
                     Select a goal above to see your personalized nutrition targets
                   </p>
                 </div>
               </div>
             )}
           </div>
                    )}

          {/* App Info Footer */}
          <div className="mt-8 lg:mt-12 xl:mt-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8 xl:p-10">
            <div className="text-center mb-4 lg:mb-6">
              <div className="w-12 h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4">
                <svg className="w-6 h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 mb-2">How It Works</h3>
            </div>
            <div className="space-y-3 lg:space-y-4 xl:space-y-5 text-sm lg:text-base text-gray-600">
              <div className="flex items-start space-x-3 lg:space-x-4">
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs lg:text-sm font-bold text-blue-600">1</span>
                </div>
                <p><strong className="text-gray-900">Body Analysis:</strong> Uses U.S. Navy formula to calculate body fat % and Katch-McArdle for calories</p>
              </div>
              <div className="flex items-start space-x-3 lg:space-x-4">
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs lg:text-sm font-bold text-purple-600">2</span>
                </div>
                <p><strong className="text-gray-900">Smart Goals:</strong> AI-powered recommendations based on your body composition</p>
              </div>
              <div className="flex items-start space-x-3 lg:space-x-4">
                <div className="w-6 h-6 lg:w-8 lg:h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs lg:text-sm font-bold text-emerald-600">3</span>
                </div>
                <p><strong className="text-gray-900">Personalized:</strong> Custom calorie and protein targets for your specific goal</p>
              </div>
            </div>
          </div>
       </div>
     </div>
   )
} 
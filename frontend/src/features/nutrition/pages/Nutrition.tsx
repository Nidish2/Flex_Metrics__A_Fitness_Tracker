import React, { useState } from 'react'
import { 
  useNutritionSummaryQuery, 
  useMealsListQuery, 
  useFoodSearchQuery, 
  useLogMealMutation, 
  useDeleteMealMutation 
} from '../api/nutritionApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { toast } from 'sonner'
import { useSearchParams } from 'react-router-dom'
import { 
  Apple, 
  Search, 
  Trash2, 
  Calendar as CalendarIcon, 
  Sparkles,
  TrendingUp,
  Activity,
  PlusCircle,
  ClipboardList
} from 'lucide-react'

export const Nutrition: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'logger'

  // Input states
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  
  const [searchQuery, setSearchQuery] = useState('')

  // Log Form states
  const [mealName, setMealName] = useState('Breakfast')
  const [foodName, setFoodName] = useState('')
  const [calories, setCalories] = useState('')
  const [protein, setProtein] = useState('')
  const [carbs, setCarbs] = useState('')
  const [fat, setFat] = useState('')
  const [servingSize, setServingSize] = useState('100')
  const [servingsCount, setServingsCount] = useState('1')

  // Queries
  const { data: summary } = useNutritionSummaryQuery(selectedDate)
  const { data: mealsPage } = useMealsListQuery(selectedDate)
  
  // Backend food catalog search query hook
  const { data: searchResults = [], isFetching: isSearching } = useFoodSearchQuery(searchQuery)

  // Mutations
  const logMealMutation = useLogMealMutation(selectedDate, () => {
    toast.success('Food successfully logged!')
    // Clear manual fields
    setFoodName('')
    setCalories('')
    setProtein('')
    setCarbs('')
    setFat('')
    // Navigate back to Daily Log to view entry
    setTab('logger')
  })

  const deleteMealMutation = useDeleteMealMutation(selectedDate, () => {
    toast.success('Meal entry deleted.')
  })

  const handleSelectSearchedFood = (food: any) => {
    setFoodName(food.foodName)
    setCalories(String(food.calories))
    setProtein(String(food.proteinG))
    setCarbs(String(food.carbsG))
    setFat(String(food.fatG))
    setSearchQuery('')
  }

  const handleLogMeal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!foodName || !calories) {
      toast.error('Please specify food name and calories.')
      return
    }

    const payload = {
      name: mealName,
      loggedAt: `${selectedDate}T12:00:00`,
      items: [
        {
          foodName,
          calories: parseFloat(calories),
          proteinG: protein ? parseFloat(protein) : 0,
          carbsG: carbs ? parseFloat(carbs) : 0,
          fatG: fat ? parseFloat(fat) : 0,
          servingSizeG: parseFloat(servingSize),
          servingsCount: parseFloat(servingsCount),
        }
      ]
    }

    logMealMutation.mutate(payload)
  }

  const setTab = (tabName: string) => {
    setSearchParams({ tab: tabName })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Nutrition Tracker</h1>
          <p className="text-slate-650 dark:text-slate-400 mt-1">Log foods, scan products, and verify macronutrients goals.</p>
        </div>

        {/* Date Selector Styled Button */}
        <div className="relative overflow-hidden cursor-pointer flex items-center space-x-2 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 px-4 py-2.5 rounded-xl text-emerald-600 dark:text-emerald-400 shadow-sm font-bold text-xs hover:scale-[1.01] active:scale-[0.99] transition-all">
          <CalendarIcon className="h-4 w-4" />
          <span>Selected Date: {selectedDate}</span>
          <input
            type="date"
            className="absolute inset-0 opacity-0 cursor-pointer"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Section-Specific Sub Tabs */}
      <div className="flex space-x-2 border-b border-black/10 dark:border-white/10 pb-2">
        <button
          onClick={() => setTab('logger')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'logger'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Daily Food Log</span>
        </button>
        <button
          onClick={() => setTab('add')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'add'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Log New Meal</span>
        </button>
        <button
          onClick={() => setTab('charts')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'charts'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Macro Analysis</span>
        </button>
      </div>

      {/* Tab 1: Daily Food Log (List of logged meals) */}
      {activeTab === 'logger' && (
        <div className="space-y-8">
          
          {/* Calorie Stats Card (Large layout utilization) */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 flex-grow">
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Calories Summary</span>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                    {Math.round(summary?.totalCalories || 0)} <span className="text-base font-normal text-slate-500 dark:text-slate-400">of {summary?.calorieGoal || 2000} kcal target</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 mt-4">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-3 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(((summary?.totalCalories || 0) / (summary?.calorieGoal || 2000)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 p-4 rounded-xl flex items-center justify-center shrink-0">
                  <Sparkles className="h-8 w-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Daily Log Overview</CardTitle>
                <CardDescription>Meals logged for {selectedDate}</CardDescription>
              </div>
              <Button 
                onClick={() => setTab('add')}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
              >
                <PlusCircle className="h-4 w-4 mr-1.5" />
                Log New Meal
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {mealsPage?.content && mealsPage.content.length > 0 ? (
                <div className="space-y-4">
                  {mealsPage.content.map((meal: any) => (
                    <div 
                      key={meal.id} 
                      className="glass-panel rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                            {meal.name}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                            {new Date(meal.loggedAt).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        
                        {/* Display items logged inside meal */}
                        {meal.items?.map((item: any) => (
                          <div key={item.id} className="text-sm">
                            <span className="font-bold text-slate-800 dark:text-white">{item.foodName}</span>{' '}
                            <span className="text-slate-500 dark:text-slate-400">
                              ({item.servingSizeG * item.servingsCount}g) -{' '}
                              <span className="text-emerald-600 dark:text-emerald-300 font-semibold">{item.calories * item.servingsCount} kcal</span>
                            </span>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              P: {Math.round(item.proteinG * item.servingsCount)}g | 
                              C: {Math.round(item.carbsG * item.servingsCount)}g | 
                              F: {Math.round(item.fatG * item.servingsCount)}g
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-slate-450 hover:text-rose-500 hover:bg-rose-500/10 self-end md:self-center"
                        onClick={() => deleteMealMutation.mutate(meal.id)}
                        disabled={deleteMealMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400 text-sm text-center">
                  <Apple className="h-8 w-8 text-slate-400 dark:text-slate-500 mb-2" />
                  No food entries logged for this date.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Log New Meal (Form to add meals and OFF search) */}
      {activeTab === 'add' && (
        <div className="max-w-3xl mx-auto space-y-8">
          
          <Card className="glass-panel border-emerald-500/25">
            <CardHeader className="border-b border-black/5 dark:border-white/5 pb-3">
              <CardTitle className="text-lg font-black bg-gradient-to-r from-emerald-600 via-emerald-500 to-cyan-500 bg-clip-text text-transparent flex items-center space-x-2">
                <PlusCircle className="h-5 w-5 text-emerald-500" />
                <span>Log New Meal & Food Items</span>
              </CardTitle>
              <CardDescription>Search the OpenFoodFacts product database or input nutritional macros manually below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              
              {/* OpenFoodFacts Search */}
              <div className="space-y-2 relative">
                <Label className="font-bold text-slate-800 dark:text-slate-200">Search OpenFoodFacts Database</Label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search oatmeal, eggs, protein bar, sports drinks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                </div>

                {isSearching && (
                  <p className="text-xs text-cyan-600 dark:text-cyan-400 animate-pulse">Scanning food database...</p>
                )}

                {searchResults.length > 0 && (
                  <div className="absolute z-10 w-full glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/25 rounded-md mt-1 overflow-hidden shadow-2xl divide-y divide-slate-100 dark:divide-white/10">
                    {searchResults.map((food: any, idx: number) => (
                      <button
                        key={idx}
                        className="w-full text-left px-3 py-2.5 hover:bg-black/5 dark:hover:bg-white/10 text-xs text-slate-800 dark:text-slate-200 flex flex-col cursor-pointer"
                        onClick={() => handleSelectSearchedFood(food)}
                      >
                        <span className="font-bold text-slate-900 dark:text-white truncate">{food.foodName}</span>
                        <span className="text-slate-500 dark:text-slate-400 mt-0.5">
                          {food.calories} kcal | P: {food.proteinG}g C: {food.carbsG}g F: {food.fatG}g (per 100g)
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-black/5 dark:border-white/5 pt-4 my-2" />

              <form onSubmit={handleLogMeal} className="space-y-4">
                
                <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Macro Details Form</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="mealCategory">Meal Category</Label>
                  <select
                    id="mealCategory"
                    className="flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm bg-black/5 dark:bg-white/5 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-ring border-black/10 dark:border-white/10 cursor-pointer"
                    value={mealName}
                    onChange={(e) => setMealName(e.target.value)}
                  >
                    <option value="Breakfast" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Breakfast</option>
                    <option value="Lunch" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Lunch</option>
                    <option value="Dinner" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Dinner</option>
                    <option value="Snack" className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white">Snack</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="foodName">Food Name</Label>
                  <Input
                    id="foodName"
                    type="text"
                    placeholder="e.g. Chicken Breast"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="calories">Calories (kcal)</Label>
                    <Input
                      id="calories"
                      type="number"
                      placeholder="e.g. 165"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="protein">Protein (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 31"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="carbs">Carbs (g)</Label>
                    <Input
                      id="carbs"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 0"
                      value={carbs}
                      onChange={(e) => setCarbs(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fat">Fat (g)</Label>
                    <Input
                      id="fat"
                      type="number"
                      step="0.1"
                      placeholder="e.g. 3.6"
                      value={fat}
                      onChange={(e) => setFat(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="servingSize">Serving Size (g/ml)</Label>
                    <Input
                      id="servingSize"
                      type="number"
                      placeholder="100"
                      value={servingSize}
                      onChange={(e) => setServingSize(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="servingsCount">Servings Count</Label>
                    <Input
                      id="servingsCount"
                      type="number"
                      step="0.1"
                      placeholder="1"
                      value={servingsCount}
                      onChange={(e) => setServingsCount(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold mt-2"
                  disabled={logMealMutation.isPending}
                >
                  {logMealMutation.isPending ? 'Logging meal...' : 'Add Food Log Entry'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Macro Analysis View */}
      {activeTab === 'charts' && (
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Detailed Macronutrients Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Protein Goal Target Card */}
            <Card className="border-emerald-500/10">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Protein</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Goal: {summary?.proteinGoal || 150}g</span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {Math.round(summary?.totalProtein || 0)}g
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-3">
                  <div 
                    className="bg-emerald-500 h-1.5 rounded-full" 
                    style={{ width: `${Math.min(((summary?.totalProtein || 0) / (summary?.proteinGoal || 150)) * 100, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Carbs Card */}
            <Card className="border-yellow-500/10">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Carbohydrates</span>
                  <span className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">Goal: {summary?.carbsGoal || 200}g</span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {Math.round(summary?.totalCarbs || 0)}g
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-3">
                  <div 
                    className="bg-yellow-500 h-1.5 rounded-full" 
                    style={{ width: `${Math.min(((summary?.totalCarbs || 0) / (summary?.carbsGoal || 200)) * 100, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Fats Card */}
            <Card className="border-purple-500/10">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Fats</span>
                  <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">Goal: {summary?.fatGoal || 70}g</span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
                  {Math.round(summary?.totalFat || 0)}g
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-3">
                  <div 
                    className="bg-purple-500 h-1.5 rounded-full" 
                    style={{ width: `${Math.min(((summary?.totalFat || 0) / (summary?.fatGoal || 70)) * 100, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Simple Info Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                <span>Nutritional Insights</span>
              </CardTitle>
              <CardDescription>Track daily nutrient distributions</CardDescription>
            </CardHeader>
            <CardContent className="text-slate-600 dark:text-slate-400 text-sm space-y-4">
              <p>Maintaining a structured distribution of macronutrients is essential for energy regulation, recovery, and hypertrophy.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-100 dark:bg-slate-900/60 p-3 rounded-lg border border-black/5 dark:border-white/5">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block mb-1">Proteins Focus:</span>
                  <p className="text-xs">Essential for muscle repair. Try getting protein from lean poultry, eggs, tofu, or protein powders.</p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-900/60 p-3 rounded-lg border border-black/5 dark:border-white/5">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block mb-1">Carbs & Fats:</span>
                  <p className="text-xs">Fuels your intense gym sessions. Prioritize complex carbs like oats, brown rice, and healthy fats like avocados.</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      )}

    </div>
  )
}

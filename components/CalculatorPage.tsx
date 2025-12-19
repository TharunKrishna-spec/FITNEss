
import React, { useState } from 'react';
import { Activity, Scale, Info } from 'lucide-react';

const CalculatorPage: React.FC = () => {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [age, setAge] = useState(25);
  const [gender, setGender] = useState<'m' | 'f'>('m');
  const [activity, setActivity] = useState(1.2);

  const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
  
  // Harris-Benedict Equation
  const bmr = gender === 'm' 
    ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  
  const dailyCalories = Math.round(bmr * activity);

  const getBMICategory = (val: number) => {
    if (val < 18.5) return { label: 'Underweight', color: 'text-blue-400' };
    if (val < 25) return { label: 'Healthy', color: 'text-emerald-400' };
    if (val < 30) return { label: 'Overweight', color: 'text-yellow-400' };
    return { label: 'Obese', color: 'text-red-400' };
  };

  const bmiData = getBMICategory(parseFloat(bmi));

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Fitness Toolbox</h1>
        <p className="text-slate-400">Scientific tools to help you track your physical benchmarks.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8 space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="text-emerald-500" size={24} />
            <h3 className="text-xl font-bold">Your Metrics</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-500 font-bold uppercase mb-2">Gender</label>
              <div className="flex gap-2">
                <button onClick={() => setGender('m')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${gender === 'm' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Male</button>
                <button onClick={() => setGender('f')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${gender === 'f' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'}`}>Female</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-500 font-bold uppercase mb-2">Weight (kg)</label>
                <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full bg-slate-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm text-slate-500 font-bold uppercase mb-2">Height (cm)</label>
                <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full bg-slate-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-emerald-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-500 font-bold uppercase mb-2">Age</label>
              <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} className="w-full bg-slate-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-emerald-500" />
            </div>

            <div>
              <label className="block text-sm text-slate-500 font-bold uppercase mb-2">Activity Level</label>
              <select 
                value={activity} 
                onChange={e => setActivity(Number(e.target.value))}
                className="w-full bg-slate-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-emerald-500"
              >
                <option value={1.2}>Sedentary (Little to no exercise)</option>
                <option value={1.375}>Lightly active (1-3 days/week)</option>
                <option value={1.55}>Moderately active (3-5 days/week)</option>
                <option value={1.725}>Very active (6-7 days/week)</option>
                <option value={1.9}>Extra active (Hard training/2x per day)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-8">
            <div className="flex items-center space-x-2 mb-6">
              <Scale className="text-blue-500" size={24} />
              <h3 className="text-xl font-bold">BMI Analysis</h3>
            </div>
            <div className="text-center py-8">
              <div className={`text-7xl font-black mb-2 ${bmiData.color}`}>{bmi}</div>
              <div className={`text-xl font-bold uppercase tracking-widest ${bmiData.color}`}>{bmiData.label}</div>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-800/50 p-4 rounded-2xl">
              <Info size={16} />
              <p>Body Mass Index is a simple calculation using your height and weight.</p>
            </div>
          </div>

          <div className="bg-emerald-600 rounded-[32px] p-8 text-white shadow-xl shadow-emerald-600/20">
            <h3 className="text-emerald-100 text-sm font-bold uppercase tracking-widest mb-6">Est. Maintenance Calories</h3>
            <div className="flex items-baseline space-x-2 mb-4">
              <span className="text-6xl font-black">{dailyCalories}</span>
              <span className="text-xl font-medium opacity-80">kcal / day</span>
            </div>
            <p className="text-emerald-50 text-sm leading-relaxed opacity-90">To lose weight, aim for a deficit (approx. 2000 kcal). To gain muscle, aim for a surplus (approx. 2600 kcal).</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;

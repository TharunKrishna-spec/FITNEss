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
    <div className="max-w-4xl mx-auto px-4 py-32 md:py-48">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter italic mb-4">Fitness <br/><span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}>TOOLBOX.</span></h1>
        <p className="text-slate-400 uppercase tracking-widest text-xs font-bold">Scientific metrics for elite performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 lg:p-12 space-y-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="text-emerald-500" size={24} />
            <h3 className="text-xl font-black uppercase tracking-tight">Your Metrics</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">Gender</label>
              <div className="flex gap-2">
                <button onClick={() => setGender('m')} className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${gender === 'm' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>Male</button>
                <button onClick={() => setGender('f')} className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${gender === 'f' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>Female</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">Weight (kg)</label>
                <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white font-bold focus:border-emerald-500/50 transition-all outline-none" />
              </div>
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">Height (cm)</label>
                <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white font-bold focus:border-emerald-500/50 transition-all outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">Age</label>
              <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-white font-bold focus:border-emerald-500/50 transition-all outline-none" />
            </div>

            <div>
              <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-2">Activity Level</label>
              <select 
                value={activity} 
                onChange={e => setActivity(Number(e.target.value))}
                className="w-full bg-slate-900 border border-white/5 rounded-2xl p-4 text-white font-bold text-sm focus:border-emerald-500/50 transition-all outline-none"
              >
                <option value={1.2}>Sedentary (No exercise)</option>
                <option value={1.375}>Lightly active (1-3 days)</option>
                <option value={1.55}>Moderately active (3-5 days)</option>
                <option value={1.725}>Very active (6-7 days)</option>
                <option value={1.9}>Extra active (Hard training)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[40px] p-8 lg:p-12">
            <div className="flex items-center space-x-2 mb-6">
              <Scale className="text-blue-500" size={24} />
              <h3 className="text-xl font-black uppercase tracking-tight">BMI Analysis</h3>
            </div>
            <div className="text-center py-8">
              <div className={`text-8xl font-black mb-2 italic ${bmiData.color}`}>{bmi}</div>
              <div className={`text-xs font-black uppercase tracking-[0.4em] ${bmiData.color}`}>{bmiData.label}</div>
            </div>
            <div className="flex items-center space-x-3 text-[10px] font-bold text-slate-500 bg-white/5 p-4 rounded-2xl border border-white/5">
              <Info size={16} className="text-blue-400 shrink-0" />
              <p>Body Mass Index is a standard metric calculated using height and weight.</p>
            </div>
          </div>

          <div className="bg-emerald-500 rounded-[40px] p-8 lg:p-12 text-black shadow-2xl shadow-emerald-500/20">
            <h3 className="text-black/60 text-[10px] font-black uppercase tracking-widest mb-6 italic">Est. Maintenance Calories</h3>
            <div className="flex items-baseline space-x-2 mb-4">
              <span className="text-7xl font-black italic leading-none">{dailyCalories}</span>
              <span className="text-lg font-black uppercase tracking-tighter opacity-80">kcal / day</span>
            </div>
            <p className="text-black/80 text-sm font-bold leading-relaxed">
              To lose fat, target a deficit (e.g. {dailyCalories - 300} kcal). To build muscle, target a surplus (e.g. {dailyCalories + 300} kcal).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Sliders,
  Send,
  Bot,
  Lightbulb,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  ArrowRight,
  Repeat,
  Coffee,
  CheckCircle2,
  DollarSign,
  Loader2
} from 'lucide-react';
import api from '../../api/client';
import { useCurrency } from '../../context/CurrencyContext';

export default function AIInsightsView({ refreshTrigger }) {
  const { symbol, formatCurrency } = useCurrency();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulator state
  const [reductions, setReductions] = useState({
    'Food & Dining': 25,
    'Shopping': 20,
    'Entertainment': 30
  });
  const [simulationResult, setSimulationResult] = useState(null);
  const [simulating, setSimulating] = useState(false);

  // Chat Advisor state
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: `👋 Hello! I'm **FinTrack AI**, your intelligent financial advisor. I analyze your historical spending patterns to help you trim excess expenses and accelerate your savings goals. How can I assist you today?`,
      time: 'Just now'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai/insights');
      setData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [refreshTrigger]);

  // Run simulation whenever sliders move
  useEffect(() => {
    if (data?.patternAnalysis?.hasData) {
      const timer = setTimeout(async () => {
        try {
          setSimulating(true);
          const res = await api.post('/ai/simulate', { reductions });
          setSimulationResult(res.data);
        } catch (e) {
          console.error(e);
        } finally {
          setSimulating(false);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [reductions, data]);

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputMessage('');
    setChatLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: textToSend });
      const botMsg = {
        sender: 'bot',
        text: res.data.answer,
        source: res.data.source,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Sorry, I encountered an issue analyzing that request. Please try again.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-44 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-64 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const patternAnalysis = data?.patternAnalysis || {};
  const savingsSuggestions = data?.savingsSuggestions || { suggestions: [] };
  const suggestions = savingsSuggestions.suggestions || [];
  const fiftyThirty = patternAnalysis.fiftyThirtyTwenty;

  return (
    <div className="space-y-8">
      {/* Hero AI Platform Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-xl border border-indigo-800">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-blue-500/20 text-blue-300 rounded-xl border border-blue-400/30">
              <BrainCircuit className="w-5 h-5 text-blue-400" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-blue-300">
              Special AI Feature
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black mt-3 tracking-tight">
            Pattern-Based Savings Intelligence Engine
          </h1>
          <p className="text-xs text-indigo-100 mt-2 leading-relaxed">
            By analyzing historical transaction velocity, recurring fees, and month-over-month category deviations, FinTrack derives quantified, highly personalized savings opportunities for you.
          </p>

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">
                Identified Monthly Potential
              </span>
              <span className="text-xl font-black text-emerald-300">
                {formatCurrency(savingsSuggestions.totalPotentialMonthlySavings || 0)}
              </span>
              <span className="text-[10px] text-indigo-200 block">/ month</span>
            </div>

            <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">
                Annual Wealth Boost
              </span>
              <span className="text-xl font-black text-yellow-300">
                {formatCurrency(savingsSuggestions.totalPotentialYearlySavings || 0)}
              </span>
              <span className="text-[10px] text-indigo-200 block">/ year</span>
            </div>

            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">
                Pattern Triggers
              </span>
              <span className="text-xl font-black text-white">
                {suggestions.length} Actions
              </span>
              <span className="text-[10px] text-indigo-200 block">Ready to apply</span>
            </div>
          </div>
        </div>

        <div className="absolute -right-12 -top-12 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* SECTION 1: Actionable Savings Suggestions (Derived from previous patterns) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span>Tailored Savings Recommendations</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specific trims mathematically calculated from your previous month's spending patterns
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {suggestions.length} Suggestions Found
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((s) => {
            const isHigh = s.priority === 'high';
            return (
              <div
                key={s.id}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 relative overflow-hidden"
              >
                {/* Priority line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isHigh ? 'bg-rose-500' : 'bg-blue-500'
                  }`}
                ></div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {s.category}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        isHigh
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {s.priority} Impact • {s.difficulty}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm">{s.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {s.description}
                  </p>
                </div>

                {s.actionableTip && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Action Tip:</strong> {s.actionableTip}
                    </p>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Potential Monthly Trim
                    </span>
                    <span className="text-base font-black text-emerald-600">
                      +{formatCurrency(s.potentialMonthlySavings)} / mo
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Yearly Accumulation
                    </span>
                    <span className="text-xs font-black text-slate-800">
                      +{formatCurrency(s.potentialMonthlySavings * 12)} / yr
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Historical Pattern Insights & 50/30/20 Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 50/30/20 Rule Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">50/30/20 Rule Benchmark</h3>
            <p className="text-xs text-slate-400">Needs vs Wants vs Savings allocation</p>
          </div>

          {fiftyThirty && fiftyThirty.income > 0 ? (
            <div className="space-y-4">
              {/* Needs */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-slate-700">🏠 Needs (Ideal: 50%)</span>
                  <span className={fiftyThirty.needs.actualPct > 50 ? 'text-amber-600' : 'text-emerald-600'}>
                    {fiftyThirty.needs.actualPct}% ({formatCurrency(fiftyThirty.needs.actual)})
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, fiftyThirty.needs.actualPct)}%` }}
                  ></div>
                </div>
              </div>

              {/* Wants */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-slate-700">🎉 Wants (Ideal: 30%)</span>
                  <span className={fiftyThirty.wants.actualPct > 30 ? 'text-rose-600' : 'text-emerald-600'}>
                    {fiftyThirty.wants.actualPct}% ({formatCurrency(fiftyThirty.wants.actual)})
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, fiftyThirty.wants.actualPct)}%` }}
                  ></div>
                </div>
              </div>

              {/* Savings */}
              <div>
                <div className="flex justify-between text-xs mb-1 font-bold">
                  <span className="text-slate-700">💰 Savings (Ideal: 20%)</span>
                  <span className={fiftyThirty.savings.actualPct >= 20 ? 'text-emerald-600' : 'text-amber-600'}>
                    {fiftyThirty.savings.actualPct}% ({formatCurrency(fiftyThirty.savings.actual)})
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full"
                    style={{ width: `${Math.min(100, fiftyThirty.savings.actualPct)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-4">No income recorded for benchmark</p>
          )}

          {/* Micro Spends & Weekend Stats */}
          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Weekend Outflow</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {patternAnalysis.weekendAnalysis?.weekendPct || 0}%
              </span>
              <span className="text-[10px] text-slate-400 block">of expenses</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Micro Spends (&lt;{symbol}300)</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {patternAnalysis.microSpends?.count || 0} times
              </span>
              <span className="text-[10px] text-slate-400 block">
                {formatCurrency(patternAnalysis.microSpends?.total || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Interactive What-If Simulator */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>Interactive "What-If" Savings Simulator</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust discretionary category trimming sliders to observe instant annual savings & goal acceleration
              </p>
            </div>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Food & Dining Cut</span>
                <span className="text-blue-600">{reductions['Food & Dining'] || 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={reductions['Food & Dining'] || 0}
                onChange={(e) =>
                  setReductions({ ...reductions, 'Food & Dining': Number(e.target.value) })
                }
                className="w-full accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Shopping Cut</span>
                <span className="text-purple-600">{reductions['Shopping'] || 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={reductions['Shopping'] || 0}
                onChange={(e) =>
                  setReductions({ ...reductions, 'Shopping': Number(e.target.value) })
                }
                className="w-full accent-purple-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Entertainment Cut</span>
                <span className="text-emerald-600">{reductions['Entertainment'] || 0}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={reductions['Entertainment'] || 0}
                onChange={(e) =>
                  setReductions({ ...reductions, 'Entertainment': Number(e.target.value) })
                }
                className="w-full accent-emerald-600"
              />
            </div>
          </div>

          {/* Simulation Output Banner */}
          {simulationResult && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Simulated Capital Created
                </span>
                <div className="flex items-baseline space-x-3 mt-1">
                  <span className="text-2xl font-black text-emerald-700">
                    +{formatCurrency(simulationResult.monthlySaved)} / mo
                  </span>
                  <span className="text-xs font-bold text-emerald-800">
                    ({formatCurrency(simulationResult.yearlySaved)} / year)
                  </span>
                </div>
              </div>

              {simulationResult.goalImpact && simulationResult.goalImpact.length > 0 && (
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Fastest Goal Impact
                  </span>
                  <span className="text-xs font-black text-slate-900 block">
                    "{simulationResult.goalImpact[0].goalName}"
                  </span>
                  <span className="text-xs text-indigo-600 font-extrabold">
                    ~{simulationResult.goalImpact[0].timeSavedMonths} months sooner!
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 4: AI Financial Advisor Chat Assistant */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
        {/* Chat Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-tight">FinTrack AI Financial Advisor</h3>
              <p className="text-[11px] text-slate-300">
                Powered by spending heuristics & Google Gemini AI
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online
          </span>
        </div>

        {/* Chat Message Window */}
        <div className="p-6 space-y-4 max-h-96 overflow-y-auto bg-slate-50/50">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-800 rounded-bl-none border border-slate-200/80 shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                {msg.source && (
                  <div className="mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400 font-semibold">
                    via {msg.source}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
            </div>
          ))}

          {chatLoading && (
            <div className="flex items-center space-x-2 text-xs text-slate-400 italic">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>FinTrack AI is analyzing your finances...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-white border-t border-slate-100 flex flex-wrap gap-2">
          {[
            'How can I save ₹10,000 next month?',
            'Analyze my food & dining spend',
            'Explain my 50/30/20 budget breakdown',
            'How do I reach my savings goals faster?'
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-full text-xs font-medium transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <div className="p-4 bg-white border-t border-slate-200/80 flex items-center space-x-3">
          <input
            type="text"
            placeholder="Ask FinTrack AI about your savings, budgets, or spending habits..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={chatLoading || !inputMessage.trim()}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl shadow-md transition active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

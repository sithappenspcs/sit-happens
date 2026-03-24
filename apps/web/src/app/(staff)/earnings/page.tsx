import { DollarSign, TrendingUp, Download, ArrowUpRight } from 'lucide-react';

const mockEarnings = {
  currentPeriod: {
    start: "Oct 15, 2026",
    end: "Oct 31, 2026",
    total: 845.50
  },
  history: [
    { id: 1, period: "Oct 1 - Oct 14, 2026", amount: 1250.00, status: 'paid' },
    { id: 2, period: "Sep 16 - Sep 30, 2026", amount: 1100.25, status: 'paid' },
    { id: 3, period: "Sep 1 - Sep 15, 2026", amount: 980.00, status: 'paid' },
  ]
};

export default function EarningsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-neutral-900">Earnings</h1>
          <p className="text-neutral-500 mt-1">Track your payouts and download pay stubs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Period */}
        <div className="bg-sage-600 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <DollarSign className="w-32 h-32" />
          </div>
          <div className="relative z-10">
            <p className="text-sage-100 font-medium uppercase tracking-wider text-sm mb-2">Current Pay Period</p>
            <p className="text-sm text-sage-200 mb-6">{mockEarnings.currentPeriod.start} - {mockEarnings.currentPeriod.end}</p>
            
            <h2 className="text-5xl font-bold tracking-tight">${mockEarnings.currentPeriod.total.toFixed(2)}</h2>
            
            <div className="mt-8 flex items-center text-sm font-medium bg-sage-700/50 inline-flex px-4 py-2 rounded-lg">
              <TrendingUp className="w-4 h-4 mr-2" />
              +12% vs last period
            </div>
          </div>
        </div>

        {/* Next Payout Info */}
        <div className="bg-white border text-center border-neutral-200 rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-sage-50 rounded-full flex items-center justify-center mb-4">
            <ArrowUpRight className="w-8 h-8 text-sage-600" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">Next Payout</h3>
          <p className="text-neutral-500 mt-2">Funds transfer automatically on the 1st and 16th of every month directly to your linked bank account.</p>
          <button className="mt-6 text-sage-600 font-medium hover:text-sage-700 underline underline-offset-4">Manage Bank Details</button>
        </div>
      </div>

      {/* History */}
      <h2 className="text-xl font-bold text-neutral-900 pt-4">Payout History</h2>
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
        <ul className="divide-y divide-neutral-100">
          {mockEarnings.history.map((payout) => (
            <li key={payout.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-neutral-50 transition-colors">
              <div className="mb-4 sm:mb-0">
                <p className="font-bold text-neutral-900">{payout.period}</p>
                <div className="flex items-center mt-1">
                  <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Paid</span>
                </div>
              </div>
              <div className="flex items-center justify-between sm:w-48">
                <p className="text-xl font-bold text-neutral-900">${payout.amount.toFixed(2)}</p>
                <button className="p-2 text-neutral-400 hover:text-sage-600 hover:bg-sage-50 rounded-lg transition-colors" title="Download Paystub">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

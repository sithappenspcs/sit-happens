import { DollarSign, Download, PieChart, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, CreditCard } from 'lucide-react';

export default function AdminFinancialsPage() {
  const stats = [
    { label: 'Total Revenue', value: '$24,580', change: '+12.5%', isUp: true, icon: DollarSign },
    { label: 'Staff Payouts', value: '$16,210', change: '+8.2%', isUp: true, icon: Wallet },
    { label: 'Net Profit', value: '$8,370', change: '+24.1%', isUp: true, icon: PieChart },
    { label: 'Refunds Issued', value: '$450', change: '-15%', isUp: false, icon: CreditCard },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-playfair font-bold text-neutral-900">Financial Performance</h1>
          <p className="text-neutral-500 mt-1">Real-time revenue and payout tracking across all business zones.</p>
        </div>
        <button className="flex items-center px-4 py-2.5 bg-sage-600 text-white rounded-xl font-medium shadow-sm hover:bg-sage-700 transition-colors">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm group hover:border-sage-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="p-3 bg-neutral-50 text-neutral-600 rounded-xl group-hover:bg-sage-50 group-hover:text-sage-600 transition-colors">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${stat.isUp ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {stat.isUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-neutral-500">{stat.label}</p>
              <p className="text-3xl font-bold text-neutral-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payout Queue */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900 font-playfair italic">Pending Staff Payouts</h2>
            <button className="text-sm font-bold text-sage-600 hover:text-sage-700">Process All</button>
          </div>
          <div className="divide-y divide-neutral-100">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center font-bold text-neutral-500">
                    S{i}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900">Staff Member {i}</p>
                    <p className="text-xs text-neutral-500">Period: Oct 1 - Oct 15</p>
                  </div>
                </div>
                <div className="flex items-center space-x-8">
                  <div className="text-right">
                    <p className="text-sm font-bold text-neutral-900">$840.50</p>
                    <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">12 Sessions</p>
                  </div>
                  <button className="px-3 py-1.5 border border-neutral-200 rounded-lg text-xs font-bold text-neutral-700 hover:bg-white hover:border-sage-600 hover:text-sage-600 transition-all">
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Zone */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-100">
            <h2 className="text-lg font-bold text-neutral-900 font-playfair italic">Revenue by Zone</h2>
          </div>
          <div className="p-6 space-y-6">
            {[
              { zone: 'Edmonton Core', value: '$12,400', pct: 65, color: 'bg-sage-500' },
              { zone: 'Sherwood Park', value: '$5,200', pct: 24, color: 'bg-amber-400' },
              { zone: 'St. Albert', value: '$3,180', pct: 11, color: 'bg-indigo-400' },
            ].map((zone) => (
              <div key={zone.zone} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-neutral-700">{zone.zone}</span>
                  <span className="font-medium text-neutral-500">{zone.value}</span>
                </div>
                <div className="h-2 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div className={`h-full ${zone.color}`} style={{ width: `${zone.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

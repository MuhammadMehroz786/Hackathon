import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  Wallet,
  Send,
  FileText,
  CreditCard,
  ShieldCheck,
  ShoppingBag,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronUp,
  ChevronDown,
  Search,
  AlertTriangle,
  CheckCircle,
  Link as LinkIcon,
  TrendingUp,
  Activity,
  Users,
  PieChart,
  Landmark,
  FileCheck,
  BarChart3,
  BrainCircuit,
  Globe,
  Download,
  Star,
  MapPin,
  Calendar,
  Hash,
  ExternalLink,
  Filter,
  ChevronRight,
  Eye,
  Lock,
  Unlock,
  Moon,
  Zap,
  Award,
  Target,
  DollarSign,
  Percent,
  Clock,
  Shield,
  Database,
  GitBranch,
  Smartphone,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  BadgeCheck,
  CircleDollarSign,
  HandCoins,
  Banknote,
  HeartPulse,
  PiggyBank,
  Layers
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

/**
 * ==============================================================================
 * MOCK BACKEND & UTILITIES
 * ==============================================================================
 */

// Colors
const COLORS = {
  primary: '#1B4D3E', // JS Bank Green
  primaryLight: '#2D7A5F',
  accent: '#F5A623', // Gold
  background: '#F8FAFB',
  text: '#1A1A2E',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6'
};

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Formatters
const formatPKR = (amount) => {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatUSD = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
};

// API Helper — sends JWT token from localStorage
const api = async (path, options = {}) => {
  const token = localStorage.getItem('sarmaya_token');
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
  if (options.body) {
    config.method = options.method || 'POST';
    config.body = JSON.stringify(options.body);
  }
  if (options.method) config.method = options.method;
  const res = await fetch(`/api${path}`, config);
  return res.json();
};

const SPENDING_COLORS = ['#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444', '#EC4899', '#6366F1', '#14B8A6'];

const formatDate = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
};

const LoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 h-48 bg-gray-200 rounded-2xl" />
      <div className="h-48 bg-gray-200 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 h-80 bg-gray-200 rounded-xl" />
      <div className="h-80 bg-gray-200 rounded-xl" />
    </div>
  </div>
);

/**
 * ==============================================================================
 * UI COMPONENTS (ATOMS)
 * ==============================================================================
 */

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: `bg-[${COLORS.primary}] text-white hover:bg-[${COLORS.primaryLight}]`,
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    accent: `bg-[${COLORS.accent}] text-white hover:bg-opacity-90`,
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "text-gray-600 hover:bg-gray-100"
  };

  // Custom handling for dynamic colors in Tailwind classes can be tricky, using inline for primary
  const style = variant === 'primary'
    ? { backgroundColor: COLORS.primary, color: 'white' }
    : variant === 'accent'
    ? { backgroundColor: COLORS.accent, color: 'white' }
    : {};

  const variantClass = variant === 'primary' || variant === 'accent' ? '' : variants[variant];

  return (
    <button
      className={`${baseStyle} ${variantClass} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'success' }) => {
  const styles = {
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
    neutral: "bg-gray-100 text-gray-700"
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[variant]}`}>
      {children}
    </span>
  );
};

const Input = ({ label, ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
      {...props}
    />
  </div>
);

const StatCard = ({ title, value, trend, icon: Icon, trendUp }) => (
  <Card>
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 rounded-lg bg-gray-50">
        <Icon className="w-6 h-6 text-gray-600" />
      </div>
      {trend && (
        <div className={`flex items-center text-sm font-medium ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
          {trendUp ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1 transform rotate-180" />}
          {trend}
        </div>
      )}
    </div>
    <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
  </Card>
);

/**
 * ==============================================================================
 * AUTH CONTEXT & ROUTER
 * ==============================================================================
 */

const AuthContext = React.createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('sarmaya_token');
    const stored = localStorage.getItem('sarmaya_user');
    if (token && stored) {
      setUser(JSON.parse(stored));
      const acc = localStorage.getItem('sarmaya_account');
      const prof = localStorage.getItem('sarmaya_profile');
      if (acc) setAccount(JSON.parse(acc));
      if (prof) setProfile(JSON.parse(prof));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError('');
    try {
      const res = await api('/auth/login', { method: 'POST', body: { email, password } });
      if (res.success) {
        localStorage.setItem('sarmaya_token', res.token);
        localStorage.setItem('sarmaya_user', JSON.stringify(res.user));
        if (res.account) localStorage.setItem('sarmaya_account', JSON.stringify(res.account));
        if (res.profile) localStorage.setItem('sarmaya_profile', JSON.stringify(res.profile));
        setUser(res.user);
        setAccount(res.account);
        setProfile(res.profile);
      } else {
        setAuthError(res.message || 'Invalid credentials');
      }
    } catch (e) {
      setAuthError('Server unreachable. Is the backend running?');
    }
    setLoading(false);
  };

  const register = async (name, email, password, phone) => {
    setLoading(true);
    setAuthError('');
    try {
      const res = await api('/auth/register', { method: 'POST', body: { name, email, password, phone } });
      if (res.success) {
        localStorage.setItem('sarmaya_token', res.token);
        localStorage.setItem('sarmaya_user', JSON.stringify(res.user));
        if (res.account) localStorage.setItem('sarmaya_account', JSON.stringify(res.account));
        if (res.profile) localStorage.setItem('sarmaya_profile', JSON.stringify(res.profile));
        setUser(res.user);
        setAccount(res.account);
        setProfile(res.profile);
        return { success: true };
      } else {
        setAuthError(res.message || 'Registration failed');
        return { success: false, message: res.message };
      }
    } catch (e) {
      setAuthError('Server unreachable. Is the backend running?');
      return { success: false, message: 'Server error' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sarmaya_token');
    localStorage.removeItem('sarmaya_user');
    localStorage.removeItem('sarmaya_account');
    localStorage.removeItem('sarmaya_profile');
    setUser(null);
    setAccount(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, account, profile, login, register, logout, loading, authError }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * ==============================================================================
 * PAGE VIEWS (FREELANCER)
 * ==============================================================================
 */

const UserHome = ({ setView }) => {
  const { account } = React.useContext(AuthContext);
  const [balance, setBalance] = useState(null);
  const [txns, setTxns] = useState([]);
  const [rates, setRates] = useState({});
  const [score, setScore] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/banking/balance'),
      api('/banking/transactions?limit=5'),
      api('/banking/rates'),
      api('/credit/score'),
      api('/banking/profile'),
    ]).then(([balRes, txnRes, rateRes, creditRes, profRes]) => {
      if (balRes.success) setBalance(balRes);
      if (txnRes.success) setTxns(txnRes.transactions);
      if (rateRes.success) setRates(rateRes.rates);
      if (creditRes.success) setScore(creditRes.creditScore);
      if (profRes.success && profRes.profile.monthlyEarnings) {
        setChartData(profRes.profile.monthlyEarnings.slice(-6).map(e => ({
          name: new Date(e.month + '-01').toLocaleString('en', { month: 'short' }),
          income: e.amountPKR
        })));
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSkeleton />;

  const displayRates = rates ? {
    USD: rates.USD_TO_PKR,
    EUR: rates.EUR_TO_PKR,
    GBP: rates.GBP_TO_PKR,
  } : {};

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-r from-emerald-900 to-emerald-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Landmark size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-emerald-100 mb-1">Total Balance</p>
            <h1 className="text-4xl font-bold mb-2">{formatPKR(balance?.balance || 0)}</h1>
            <div className="flex items-center gap-4 text-sm text-emerald-200 mb-6">
              <span>≈ {formatUSD(balance?.balanceUSD || 0)}</span>
              <span className="w-1 h-1 bg-emerald-200 rounded-full"></span>
              <span>Account: {balance?.accountNumber || account?.accountNumber || ''}</span>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setView('transfer')} className="bg-white text-emerald-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-emerald-50 transition">
                <Send size={18} /> Transfer
              </button>
              <button onClick={() => setView('bills')} className="bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-emerald-600 transition">
                <FileText size={18} /> Pay Bill
              </button>
            </div>
          </div>
        </div>

        <Card className="flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">Credit Score</h3>
                <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Updated Today</span>
              </div>
              <div className="flex items-center justify-center py-4 relative">
                 <div className="absolute text-center">
                    <span className="text-3xl font-bold text-gray-900">{score?.score || '—'}</span>
                    <p className="text-xs text-emerald-600 font-medium">{score?.range || ''}</p>
                 </div>
                 <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                    <circle cx="64" cy="64" r="56" stroke={COLORS.primary} strokeWidth="12" fill="none" strokeDasharray="351" strokeDashoffset={351 - (351 * ((score?.score || 0) / 850))} strokeLinecap="round" />
                 </svg>
              </div>
            </div>
            <Button variant="secondary" onClick={() => setView('credit-score')} className="w-full text-sm">View Report</Button>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-gray-900">Income Trend</h3>
            <div className="flex gap-2">
              <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded cursor-pointer">PKR</span>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded cursor-pointer">USD</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} formatter={(value) => formatPKR(value)} />
                <Line type="monotone" dataKey="income" stroke={COLORS.accent} strokeWidth={3} dot={{r: 4, fill: COLORS.accent, strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Exchange Rates</h3>
            <div className="space-y-4">
              {Object.entries(displayRates).map(([currency, rate]) => (
                <div key={currency} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">{currency[0]}</div>
                    <div>
                      <p className="font-medium text-gray-900">{currency}</p>
                      <p className="text-xs text-gray-500">to PKR</p>
                    </div>
                  </div>
                  <p className="font-mono font-medium">{rate?.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-amber-50 border-amber-100">
             <div className="flex gap-3">
               <div className="mt-1"><AlertTriangle className="w-5 h-5 text-amber-600"/></div>
               <div>
                 <h4 className="text-sm font-semibold text-amber-800">Complete Profile</h4>
                 <p className="text-xs text-amber-700 mt-1">Add one more income source to boost your credit score to Excellent.</p>
               </div>
             </div>
          </Card>
        </div>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
          <button onClick={() => setView('transactions')} className="text-sm text-emerald-700 hover:text-emerald-800 font-medium">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100">
                <th className="py-3 font-medium">Description</th>
                <th className="py-3 font-medium">Date</th>
                <th className="py-3 font-medium">Category</th>
                <th className="py-3 font-medium">Status</th>
                <th className="py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {txns.map((txn) => (
                <tr key={txn.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="py-4 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${txn.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                         {txn.type === 'CREDIT' ? <TrendingUp size={16} /> : <TrendingUp size={16} className="rotate-180" />}
                      </div>
                      <span className="font-medium text-gray-900">{txn.description}</span>
                    </div>
                  </td>
                  <td className="py-4 border-b border-gray-50 text-sm text-gray-600">{formatDate(txn.timestamp)}</td>
                  <td className="py-4 border-b border-gray-50 text-sm text-gray-600">{txn.category}</td>
                  <td className="py-4 border-b border-gray-50"><Badge>{txn.status}</Badge></td>
                  <td className={`py-4 border-b border-gray-50 text-right font-medium ${txn.type === 'CREDIT' ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {txn.type === 'CREDIT' ? '+' : '-'}{formatPKR(txn.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const TransferPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ account: '', amount: '', desc: '' });
  const [risk, setRisk] = useState(null);
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setRisk({ level: Number(formData.amount) > 100000 ? 'High' : Number(formData.amount) > 50000 ? 'Medium' : 'Low', score: Number(formData.amount) > 100000 ? 85 : Number(formData.amount) > 50000 ? 50 : 10, action: 'Reviewing' });
    setStep(2);
  };

  const confirmTransfer = async () => {
    setSending(true);
    const res = await api('/banking/transfer', { method: 'POST', body: { toAccount: formData.account, amount: Number(formData.amount), description: formData.desc } });
    if (res.success) {
      setResult(res);
      if (res.risk) setRisk({ level: res.risk.riskLevel || 'Low', score: res.risk.riskScore || 0, action: res.risk.action || 'APPROVE' });
      setStep(3);
    } else {
      alert(res.message || 'Transfer failed');
    }
    setSending(false);
  };

  if (step === 3) {
    return (
      <div className="flex flex-col items-center justify-center py-12 animate-in zoom-in duration-300">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfer Successful!</h2>
        <p className="text-gray-500 mb-8">PKR {formatPKR(formData.amount)} sent to {formData.account}</p>

        <Card className="w-full max-w-md bg-gray-50 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Transaction ID</span>
            <span className="font-mono text-sm">{result?.transaction?.id || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Blockchain Hash</span>
            <a href="#" className="flex items-center text-xs text-blue-600 hover:underline">
              {result?.blockchain?.txHash ? `${result.blockchain.txHash.slice(0,8)}...${result.blockchain.txHash.slice(-4)}` : 'Pending'} <LinkIcon size={10} className="ml-1"/>
            </a>
          </div>
        </Card>

        <Button onClick={() => { setStep(1); setFormData({account:'', amount:'', desc:''}); }} className="mt-8">
          Make Another Transfer
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Send Money</h1>
      <Card>
        {step === 1 ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Recipient Account Number"
              placeholder="JSBXXXXXXXXXXXXXXXX"
              value={formData.account}
              onChange={e => setFormData({...formData, account: e.target.value})}
              required
            />
            <Input
              label="Amount (PKR)"
              type="number"
              placeholder="0.00"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              required
            />
            <Input
              label="Description (Optional)"
              placeholder="e.g. Project payment"
              value={formData.desc}
              onChange={e => setFormData({...formData, desc: e.target.value})}
            />
            <Button type="submit" className="w-full">Review Transfer</Button>
          </form>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">To</span>
                <span className="font-medium text-gray-900">{formData.account}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-lg text-emerald-700">{formatPKR(formData.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Fee</span>
                <span className="font-medium text-gray-900">PKR 0.00</span>
              </div>
            </div>

            {/* Risk Assessment UI */}
            <div className={`p-4 rounded-lg border flex items-start gap-3 ${
              risk.level === 'Low' ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'
            }`}>
              <ShieldCheck className={`w-5 h-5 mt-0.5 ${
                risk.level === 'Low' ? 'text-blue-600' : 'text-amber-600'
              }`} />
              <div>
                <h4 className={`text-sm font-semibold ${
                  risk.level === 'Low' ? 'text-blue-800' : 'text-amber-800'
                }`}>Fraud Risk Assessment: {risk.level}</h4>
                <p className={`text-xs mt-1 ${
                  risk.level === 'Low' ? 'text-blue-700' : 'text-amber-700'
                }`}>AI confidence score: {100 - risk.score}% safe. {risk.action} required.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setStep(1)}>Edit</Button>
              <Button onClick={confirmTransfer} className="flex-1" disabled={sending}>{sending ? 'Sending...' : 'Confirm Send'}</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

const CreditScorePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/credit/score').then(res => {
      if (res.success || res.creditScore) setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!data?.creditScore) return <Card><p className="text-gray-500 text-center py-8">No credit data available yet.</p></Card>;

  const scoreData = data.creditScore;
  const factors = data.components || [];
  const loan = data.loanEligibility || {};
  const tips = data.recommendations || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Credit Health</h1>
        <Button variant="secondary" className="text-sm"><Download size={16} /> Download Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 flex flex-col items-center justify-center text-center">
          <div className="relative w-48 h-48 flex items-center justify-center mb-4">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="#e5e7eb" strokeWidth="16" fill="none" />
                <circle cx="96" cy="96" r="88" stroke={COLORS.primary} strokeWidth="16" fill="none" strokeDasharray="552" strokeDashoffset={552 - (552 * (scoreData.score / (scoreData.maxScore || 850)))} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
             </svg>
             <div className="absolute flex flex-col items-center transform rotate-90">
                <span className="text-4xl font-bold text-gray-900">{scoreData.score}</span>
                <span className="text-sm text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full mt-2">{scoreData.range}</span>
             </div>
          </div>
          <p className="text-sm text-gray-500 max-w-[200px]">Your score is better than 85% of freelancers on Sarmaya.</p>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <h3 className="font-semibold mb-4">Score Factors</h3>
          <div className="space-y-4">
            {factors.map((factor, idx) => (
              <div key={idx} className="group">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{factor.factor}</span>
                  <span className="text-gray-900 font-bold">{factor.score}/{factor.maxScore || 100}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-emerald-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${factor.score}%` }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-1 hidden group-hover:block transition-all">Impact: {factor.weight}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
           <h3 className="font-bold text-emerald-900 flex items-center gap-2 mb-2"><Wallet size={20}/> Pre-Approved Loan</h3>
           <p className="text-emerald-800 text-sm mb-4">Based on your score, you are eligible for:</p>
           <div className="text-3xl font-bold text-emerald-700 mb-1">{loan.maxLoanAmountFormatted || formatPKR(loan.maxLoanAmount || 0)}</div>
           <div className="flex gap-4 text-sm text-emerald-600 mb-6">
             <span>Rate: {loan.interestRate || '18%'}</span>
             <span>Tenure: {loan.tenure || '24 Months'}</span>
           </div>
           <Button>{loan.eligible ? 'Apply Now' : 'Not Eligible Yet'}</Button>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Improvement Tips</h3>
          <ul className="space-y-3">
            {tips.length > 0 ? tips.map((t, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-600">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                {t.tip}
              </li>
            )) : (
              <>
                <li className="flex gap-3 text-sm text-gray-600"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />Diversify to a 3rd freelancing platform to reduce dependency.</li>
                <li className="flex gap-3 text-sm text-gray-600"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />Maintain a monthly balance above PKR 50k for 3 more months.</li>
              </>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
};

const TransactionsPage = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/banking/transactions?limit=100').then(res => {
      if (res.success) setTxns(res.transactions);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSkeleton />;

  const filtered = txns.filter(t => {
    const matchesType = filter === 'all' || (filter === 'credit' && t.type === 'CREDIT') || (filter === 'debit' && t.type === 'DEBIT');
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || (t.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalIn = txns.filter(t => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
  const totalOut = txns.filter(t => t.type === 'DEBIT').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <Button variant="secondary" className="text-sm"><Download size={16} /> Export CSV</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-emerald-50 border-emerald-100">
          <p className="text-sm text-emerald-700 mb-1">Total Income</p>
          <p className="text-xl font-bold text-emerald-800">{formatPKR(totalIn)}</p>
        </Card>
        <Card className="bg-red-50 border-red-100">
          <p className="text-sm text-red-700 mb-1">Total Spent</p>
          <p className="text-xl font-bold text-red-800">{formatPKR(totalOut)}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500 mb-1">Net Flow</p>
          <p className="text-xl font-bold text-gray-900">{formatPKR(totalIn - totalOut)}</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'credit', 'debit'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 text-xs font-medium rounded-lg capitalize transition-colors ${
                  filter === f ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100">
                <th className="py-3 font-medium">Description</th>
                <th className="py-3 font-medium">Date</th>
                <th className="py-3 font-medium">Category</th>
                <th className="py-3 font-medium">Blockchain</th>
                <th className="py-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(txn => (
                <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full ${txn.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        {txn.type === 'CREDIT' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{txn.description}</span>
                    </div>
                  </td>
                  <td className="py-3 border-b border-gray-50 text-sm text-gray-500">{formatDate(txn.timestamp)}</td>
                  <td className="py-3 border-b border-gray-50"><Badge variant="neutral">{txn.category}</Badge></td>
                  <td className="py-3 border-b border-gray-50">
                    {txn.blockchainHash ? (
                      <a href="#" className="text-xs text-blue-600 hover:underline font-mono flex items-center gap-1">
                        {txn.blockchainHash.slice(0, 8)}...{txn.blockchainHash.slice(-4)} <ExternalLink size={10} />
                      </a>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className={`py-3 border-b border-gray-50 text-right font-semibold text-sm ${txn.type === 'CREDIT' ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {txn.type === 'CREDIT' ? '+' : '-'}{formatPKR(txn.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">Showing {filtered.length} of {txns.length} transactions</p>
        </div>
      </Card>
    </div>
  );
};

const BillsPage = () => {
  const [step, setStep] = useState(1);
  const [billType, setBillType] = useState('');
  const [amount, setAmount] = useState('');
  const [ref, setRef] = useState('');
  const [result, setResult] = useState(null);
  const [paying, setPaying] = useState(false);

  const billTypes = [
    { id: 'electricity', name: 'K-Electric', icon: Zap, color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
    { id: 'gas', name: 'SSGC Gas', icon: Landmark, color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { id: 'phone', name: 'PTCL Phone', icon: Smartphone, color: 'bg-purple-50 text-purple-600 border-purple-200' },
    { id: 'internet', name: 'Internet', icon: Globe, color: 'bg-green-50 text-green-600 border-green-200' },
    { id: 'mobile', name: 'Mobile Top-up', icon: Smartphone, color: 'bg-pink-50 text-pink-600 border-pink-200' },
  ];

  const handlePay = async () => {
    setPaying(true);
    const res = await api('/banking/pay-bill', { method: 'POST', body: { billType, amount: Number(amount), reference: ref } });
    if (res.success) {
      setResult(res);
      setStep(3);
    } else {
      alert(res.message || 'Payment failed');
    }
    setPaying(false);
  };

  if (step === 3) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6">
          <CheckCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Bill Paid!</h2>
        <p className="text-gray-500 mb-6">{formatPKR(Number(amount))} paid to {billTypes.find(b => b.id === billType)?.name}</p>
        <Card className="w-full max-w-sm bg-gray-50">
          <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Reference</span><span className="font-mono">{ref || 'N/A'}</span></div>
          <div className="flex justify-between text-sm mb-2"><span className="text-gray-500">Transaction ID</span><span className="font-mono text-xs">{result?.transaction?.id || 'N/A'}</span></div>
          <div className="flex justify-between text-sm"><span className="text-gray-500">Blockchain</span><span className="text-blue-600 text-xs flex items-center gap-1">{result?.blockchain?.txHash ? `${result.blockchain.txHash.slice(0,8)}...` : 'Pending'} <ExternalLink size={10}/></span></div>
        </Card>
        <Button onClick={() => { setStep(1); setBillType(''); setAmount(''); setRef(''); }} className="mt-6">Pay Another Bill</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pay Bills</h1>

      {step === 1 && (
        <Card>
          <h3 className="font-semibold mb-4">Select Bill Type</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {billTypes.map(bt => (
              <button
                key={bt.id}
                onClick={() => { setBillType(bt.id); setStep(2); }}
                className={`p-4 rounded-xl border-2 text-center transition-all hover:shadow-md ${
                  billType === bt.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg ${bt.color} flex items-center justify-center mx-auto mb-2`}>
                  <bt.icon size={20} />
                </div>
                <p className="text-sm font-medium text-gray-900">{bt.name}</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <button onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-600"><X size={18}/></button>
            <h3 className="font-semibold">{billTypes.find(b => b.id === billType)?.name}</h3>
          </div>
          <div className="space-y-4">
            <Input label="Bill Reference / Consumer Number" placeholder="Enter reference number" value={ref} onChange={e => setRef(e.target.value)} />
            <Input label="Amount (PKR)" type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
            <div className="flex gap-2 flex-wrap">
              {[1000, 2000, 5000, 10000].map(a => (
                <button key={a} onClick={() => setAmount(String(a))} className="px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-emerald-50 text-gray-700 rounded-lg transition">
                  PKR {a.toLocaleString()}
                </button>
              ))}
            </div>
            <Button onClick={handlePay} className="w-full" disabled={!amount || paying}>{paying ? 'Processing...' : `Pay ${amount ? formatPKR(Number(amount)) : 'Bill'}`}</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

const IncomeProofPage = () => {
  const [proof, setProof] = useState(null);
  const [bcProof, setBcProof] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/banking/income-proof').then(res => {
      if (res.success) setProof(res.incomeProof);
      setLoading(false);
    });
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    const res = await api('/blockchain/income-proof', { method: 'POST' });
    if (res.success) setBcProof(res);
    setGenerating(false);
  };

  if (loading) return <LoadingSkeleton />;
  if (!proof) return <Card><p className="text-gray-500 text-center py-8">No income data available yet.</p></Card>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Blockchain Income Proof</h1>
        <div className="flex gap-3">
          <Button variant="secondary" className="text-sm" onClick={handleGenerate}>
            {generating ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600"></div> : <><GitBranch size={16}/> Generate New</>}
          </Button>
          <Button variant="secondary" className="text-sm"><Download size={16} /> Download PDF</Button>
        </div>
      </div>

      {/* Certificate */}
      <Card className="border-2 border-emerald-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-50 rounded-tr-full opacity-50"></div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{backgroundColor: COLORS.primary}}>
                <span className="font-bold text-white text-lg">S</span>
              </div>
              <div>
                <h2 className="font-bold text-lg" style={{color: COLORS.primary}}>Sarmaya</h2>
                <p className="text-xs text-gray-500">سرمایہ by JS Bank</p>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="success">Bank Certified</Badge>
              <p className="text-xs text-gray-400 mt-1">Blockchain Verified</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Certificate of Freelance Income</h3>
            <p className="text-sm text-gray-500">Immutable proof logged on Polygon blockchain</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div>
              <p className="text-xs text-gray-500 mb-1">Freelancer</p>
              <p className="font-semibold text-gray-900">{proof.freelancerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Account</p>
              <p className="font-mono text-sm text-gray-900">{proof.accountNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Period</p>
              <p className="font-semibold text-gray-900">{proof.period}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Verification Date</p>
              <p className="font-semibold text-gray-900">{formatDate(proof.verificationTimestamp)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-emerald-50 border-emerald-100 text-center">
              <p className="text-xs text-emerald-700 mb-1">Total Income (PKR)</p>
              <p className="text-lg font-bold text-emerald-800">{formatPKR(proof.earnings?.totalPKR || 0)}</p>
            </Card>
            <Card className="bg-blue-50 border-blue-100 text-center">
              <p className="text-xs text-blue-700 mb-1">Total Income (USD)</p>
              <p className="text-lg font-bold text-blue-800">${proof.earnings?.totalUSD || 0}</p>
            </Card>
            <Card className="bg-amber-50 border-amber-100 text-center">
              <p className="text-xs text-amber-700 mb-1">Monthly Average</p>
              <p className="text-lg font-bold text-amber-800">{formatPKR(proof.earnings?.avgMonthlyPKR || 0)}</p>
            </Card>
            <Card className="bg-purple-50 border-purple-100 text-center">
              <p className="text-xs text-purple-700 mb-1">Transactions</p>
              <p className="text-lg font-bold text-purple-800">{proof.transactionCount}</p>
            </Card>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <p className="text-xs text-gray-500 mr-2">Platforms:</p>
            {(proof.platforms || []).map((p, i) => <Badge key={i} variant="info">{typeof p === 'string' ? p : p.name}</Badge>)}
          </div>
        </div>
      </Card>

      {/* Blockchain Verification */}
      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Database size={18} className="text-emerald-600" /> Blockchain Verification</h3>
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <span className="text-sm text-gray-500">Transaction Hash</span>
            <a href="#" className="font-mono text-xs text-blue-600 hover:underline flex items-center gap-1 break-all">
              {bcProof?.txHash || 'Generate to get hash'} <ExternalLink size={10} />
            </a>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Block Number</span>
            <span className="font-mono text-sm">{bcProof?.blockNumber?.toLocaleString() || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Network</span>
            <Badge variant="info">Polygon Amoy Testnet</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Status</span>
            <Badge variant="success">Verified On-Chain</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [shariahFilter, setShariahFilter] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/products/recommendations').then(res => {
      if (res.success && res.recommendations) {
        setProducts(res.recommendations.map(r => ({
          id: r.product.id, name: r.product.name, nameUrdu: r.product.nameUrdu,
          type: r.product.type, description: r.product.description,
          eligible: r.eligibility?.isEligible, matchScore: r.eligibility?.matchScore || 0,
          icon: r.product.type === 'Lending' ? 'Banknote' : r.product.type === 'Card' ? 'CreditCard' : r.product.type === 'Insurance' ? 'Shield' : r.product.type === 'Investment' ? 'TrendingUp' : r.product.type === 'Savings' ? 'PiggyBank' : 'Award',
        })));
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSkeleton />;

  const iconMap = { Banknote, CircleDollarSign, CreditCard, Shield, HeartPulse, TrendingUp, PiggyBank, Award };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recommended Products</h1>
          <p className="text-sm text-gray-500 mt-1">AI-powered recommendations based on your profile</p>
        </div>
        <button
          onClick={() => setShariahFilter(!shariahFilter)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            shariahFilter ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Moon size={16} /> Shariah Only
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => {
          const IconComp = iconMap[product.icon] || ShoppingBag;
          return (
            <Card key={product.id} className="flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg bg-emerald-50">
                    <IconComp size={20} className="text-emerald-700" />
                  </div>
                  <Badge variant={product.type === 'Lending' ? 'info' : product.type === 'Card' ? 'neutral' : product.type === 'Insurance' ? 'warning' : 'success'}>
                    {product.type}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-900 mb-0.5">{product.name}</h3>
                <p className="text-xs text-emerald-600 mb-2">{product.nameUrdu}</p>
                <p className="text-sm text-gray-500 mb-4">{product.description}</p>

                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Match Score</span>
                    <span className="font-bold text-gray-700">{product.matchScore}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${product.matchScore}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                {product.eligible ? (
                  <Badge variant="success">Eligible</Badge>
                ) : (
                  <Badge variant="danger">Not Eligible</Badge>
                )}
                <Button className="text-sm px-3 py-1.5" disabled={!product.eligible}>
                  {product.eligible ? 'Apply' : 'View Details'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const [prof, setProf] = useState(null);
  const [spending, setSpending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api('/banking/profile'), api('/banking/spending')]).then(([profRes, spendRes]) => {
      if (profRes.success) setProf(profRes.profile);
      if (spendRes.success) setSpending((spendRes.breakdown || []).map((s, i) => ({ ...s, amount: s.total, color: SPENDING_COLORS[i % SPENDING_COLORS.length] })));
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (!prof) return <Card><p className="text-gray-500 text-center py-8">Profile not available.</p></Card>;

  const user = prof;
  const earnings = (prof.monthlyEarnings || []).map(e => ({ month: e.month, usd: e.amountUSD, pkr: e.amountPKR }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

      {/* Profile Header */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-emerald-900 to-emerald-800"></div>
        <div className="relative z-10 pt-10 flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center text-2xl font-bold" style={{color: COLORS.primary}}>
            {user.name.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <Badge variant="success">KYC Verified</Badge>
              {user.esfcaEnabled && <Badge variant="info">ESFCA</Badge>}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><MapPin size={14} /> {user.city}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> Joined {user.registeredSince || ''}</span>
              <span className="flex items-center gap-1"><Hash size={14} /> {user.cnic || ''}</span>
              <span className="flex items-center gap-1"><Smartphone size={14} /> +{user.phone}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Account</p>
            <p className="font-mono text-sm font-semibold">{user.accountNumber || ''}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platforms */}
        <Card>
          <h3 className="font-semibold mb-4">Freelancing Platforms</h3>
          <div className="space-y-4">
            {user.platforms.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                    {p.name[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.activeMonths} months active</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-500 mb-1">
                    <Star size={14} fill="currentColor" />
                    <span className="font-bold text-sm text-gray-900">{p.rating}</span>
                  </div>
                  <p className="text-xs text-gray-500">{formatUSD(p.totalEarned)} earned</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Spending Breakdown */}
        <Card>
          <h3 className="font-semibold mb-4">Spending Breakdown</h3>
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={spending} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="amount" paddingAngle={3}>
                  {spending.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatPKR(value)} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {spending.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: s.color}}></div>
                  <span className="text-gray-700">{s.category}</span>
                </div>
                <span className="font-medium">{formatPKR(s.amount)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Skills */}
      <Card>
        <h3 className="font-semibold mb-4">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {user.skills.map((skill, i) => (
            <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">{skill}</span>
          ))}
        </div>
      </Card>

      {/* Monthly Earnings Table */}
      <Card>
        <h3 className="font-semibold mb-4">Monthly Earnings</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-gray-100">
                <th className="py-3 font-medium">Month</th>
                <th className="py-3 font-medium text-right">USD</th>
                <th className="py-3 font-medium text-right">PKR</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((e, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-3 font-medium text-gray-900">{e.month}</td>
                  <td className="py-3 text-right text-gray-600">{formatUSD(e.usd)}</td>
                  <td className="py-3 text-right font-semibold">{formatPKR(e.pkr)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const SettingsPage = () => {
  const [shariahMode, setShariahModeState] = useState(false);
  const [consents, setConsents] = useState({});
  const [language, setLanguage] = useState('english');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api('/ai/consents'), api('/shariah/mode')]).then(([consentRes, shariahRes]) => {
      if (consentRes.success && consentRes.consents) {
        const mapped = {};
        Object.entries(consentRes.consents).forEach(([key, val]) => { mapped[key] = val.granted; });
        setConsents(mapped);
      }
      if (shariahRes.success) setShariahModeState(shariahRes.enabled);
      setLoading(false);
    });
  }, []);

  const toggleConsent = async (key) => {
    const newVal = !consents[key];
    setConsents(prev => ({ ...prev, [key]: newVal }));
    api('/ai/consent', { method: 'POST', body: { consentType: key, granted: newVal } });
  };

  const toggleShariah = async () => {
    const newVal = !shariahMode;
    setShariahModeState(newVal);
    api('/shariah/mode', { method: 'POST', body: { enabled: newVal } });
  };

  if (loading) return <LoadingSkeleton />;

  const consentDescriptions = {
    voice_data: { title: "Voice Data", desc: "Allow storage of voice biometric data for WhatsApp authentication" },
    transaction_logging: { title: "Transaction Logging", desc: "Log transactions on Polygon blockchain for income verification" },
    credit_scoring: { title: "Credit Scoring", desc: "Use your transaction data for alternative credit scoring" },
    ai_analysis: { title: "AI Analysis", desc: "Allow GPT-4o to analyze spending patterns and provide recommendations" },
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      {/* Shariah Mode */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50">
              <Moon size={24} className="text-emerald-700" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Islamic Banking Mode</h3>
              <p className="text-sm text-gray-500">Switch to Shariah-compliant products and terminology</p>
              {shariahMode && <p className="text-xs text-emerald-600 mt-1">شریعہ موڈ فعال ہے</p>}
            </div>
          </div>
          <button
            onClick={toggleShariah}
            className={`relative w-12 h-6 rounded-full transition-colors ${shariahMode ? 'bg-emerald-600' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${shariahMode ? 'translate-x-6' : 'translate-x-0.5'}`}></span>
          </button>
        </div>
        {shariahMode && (
          <div className="mt-4 p-3 bg-emerald-50 rounded-lg text-sm text-emerald-800">
            Products will show as: Murabaha (financing), Takaful (insurance), Sukuk (bonds), Wadiah (savings). Interest → Profit sharing.
          </div>
        )}
      </Card>

      {/* Consent Management */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Lock size={20} className="text-gray-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Data & Privacy Consents</h3>
            <p className="text-xs text-gray-500">Manage how your data is used (Responsible AI)</p>
          </div>
        </div>
        <div className="space-y-4">
          {Object.entries(consentDescriptions).map(([key, info]) => (
            <div key={key} className="flex items-start justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex-1 mr-4">
                <p className="font-medium text-gray-900 text-sm">{info.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{info.desc}</p>
              </div>
              <button
                onClick={() => toggleConsent(key)}
                className={`relative shrink-0 w-10 h-5 rounded-full transition-colors ${consents[key] ? 'bg-emerald-600' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${consents[key] ? 'translate-x-5' : 'translate-x-0.5'}`}></span>
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Language */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2"><Globe size={18}/> Language Preference</h3>
        <div className="flex gap-3">
          {[{id: 'english', label: 'English'}, {id: 'urdu', label: 'اردو (Urdu)'}].map(lang => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id)}
              className={`flex-1 p-3 rounded-xl border-2 text-center font-medium transition-all ${
                language === lang.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

/**
 * ==============================================================================
 * PAGE VIEWS (ADMIN)
 * ==============================================================================
 */

const AdminDashboard = () => {
  const data = [
    { name: 'Mon', Active: 4000, Fraud: 240 },
    { name: 'Tue', Active: 3000, Fraud: 139 },
    { name: 'Wed', Active: 2000, Fraud: 980 },
    { name: 'Thu', Active: 2780, Fraud: 390 },
    { name: 'Fri', Active: 1890, Fraud: 480 },
    { name: 'Sat', Active: 2390, Fraud: 380 },
    { name: 'Sun', Active: 3490, Fraud: 430 },
  ];

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <StatCard title="Total Customers" value="1,247" trend="12.5%" trendUp={true} icon={Users} />
         <StatCard title="Deposits (PKR)" value="185M" trend="8.2%" trendUp={true} icon={Wallet} />
         <StatCard title="Fraud Alerts" value="23" trend="2.1%" trendUp={false} icon={AlertTriangle} />
         <StatCard title="NPL Ratio" value="1.8%" trend="0.2%" trendUp={true} icon={Activity} />
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card>
           <h3 className="font-semibold mb-6">Transaction Volume vs Fraud Attempts</h3>
           <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Legend />
                  <Bar dataKey="Active" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Fraud" fill={COLORS.danger} radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
           </div>
         </Card>

         <Card>
           <h3 className="font-semibold mb-6">Revenue Breakdown</h3>
           <div className="h-72 flex justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <RePieChart>
                  <Pie
                    data={[
                      { name: 'FX Margins', value: 42 },
                      { name: 'Lending', value: 28 },
                      { name: 'Deposits', value: 15 },
                      { name: 'Cross-sell', value: 10 },
                      { name: 'Fees', value: 5 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {CHART_COLORS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
               </RePieChart>
             </ResponsiveContainer>
           </div>
         </Card>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="col-span-2">
            <h3 className="font-semibold mb-4">Recent Fraud Alerts</h3>
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-3 rounded-l-lg">User</th>
                  <th className="p-3">Risk Score</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3 rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                   <td className="p-3 font-medium">92300123...</td>
                   <td className="p-3 text-red-600 font-bold">85</td>
                   <td className="p-3">Velocity limit exceeded</td>
                   <td className="p-3"><Badge variant="danger">Blocked</Badge></td>
                </tr>
                <tr className="border-b border-gray-50">
                   <td className="p-3 font-medium">92321456...</td>
                   <td className="p-3 text-amber-600 font-bold">55</td>
                   <td className="p-3">New device login</td>
                   <td className="p-3"><Badge variant="warning">Review</Badge></td>
                </tr>
              </tbody>
            </table>
         </Card>
         <Card>
           <h3 className="font-semibold mb-4">Compliance</h3>
           <div className="space-y-4">
             <div className="flex justify-between items-center">
               <span className="text-sm text-gray-600">SBP Reporting</span>
               <Badge variant="success">Compliant</Badge>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm text-gray-600">AML Screening</span>
               <Badge variant="success">Active</Badge>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm text-gray-600">KYC Completion</span>
               <span className="font-bold text-gray-900">94%</span>
             </div>
             <div className="pt-4 border-t border-gray-100">
               <Button variant="secondary" className="w-full text-xs">Generate SBP Report</Button>
             </div>
           </div>
         </Card>
       </div>
    </div>
  );
};

const AdminCustomersPage = ({ setView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/admin/customers').then(res => {
      if (res.success) {
        setCustomers(res.customers.map(c => ({
          id: c.phone, name: c.name, phone: c.phone,
          city: c.profile?.city || '—', balance: c.balance || 0,
          score: c.creditScore || 0,
          risk: (c.creditScore || 0) >= 700 ? 'Low' : (c.creditScore || 0) >= 500 ? 'Medium' : 'High',
          platforms: (c.profile?.platforms || []).map(p => p.name),
          joinedDate: c.profile?.registeredSince || '',
        })));
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSkeleton />;

  const filtered = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm) || c.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === 'all' || c.risk.toLowerCase() === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const riskColor = (risk) => {
    if (risk === 'Low') return 'success';
    if (risk === 'Medium') return 'warning';
    return 'danger';
  };

  const scoreColor = (score) => {
    if (score >= 750) return 'text-emerald-600';
    if (score >= 650) return 'text-blue-600';
    if (score >= 500) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500">{customers.length} total registered freelancers</p>
        </div>
        <Button variant="secondary" className="text-sm"><Download size={16} /> Export</Button>
      </div>

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Search by name, phone, or city..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="flex gap-2">
            {['all', 'low', 'medium', 'high'].map(f => (
              <button key={f} onClick={() => setRiskFilter(f)}
                className={`px-3 py-2 text-xs font-medium rounded-lg capitalize transition-colors ${riskFilter === f ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>
                {f === 'all' ? 'All Risk' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 bg-gray-50">
                <th className="p-3 rounded-l-lg font-medium">Name</th>
                <th className="p-3 font-medium">City</th>
                <th className="p-3 font-medium">Balance</th>
                <th className="p-3 font-medium">Credit Score</th>
                <th className="p-3 font-medium">Platforms</th>
                <th className="p-3 font-medium">Risk</th>
                <th className="p-3 font-medium">Joined</th>
                <th className="p-3 rounded-r-lg font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-700">{c.name.split(' ').map(n=>n[0]).join('')}</div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{c.name}</p>
                        <p className="text-xs text-gray-400">{c.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-600">{c.city}</td>
                  <td className="p-3 text-sm font-medium">{formatPKR(c.balance)}</td>
                  <td className="p-3"><span className={`font-bold text-sm ${scoreColor(c.score)}`}>{c.score}</span></td>
                  <td className="p-3">
                    <div className="flex gap-1">{c.platforms.map(p => <Badge key={p} variant="neutral">{p}</Badge>)}</div>
                  </td>
                  <td className="p-3"><Badge variant={riskColor(c.risk)}>{c.risk}</Badge></td>
                  <td className="p-3 text-xs text-gray-500">{c.joinedDate}</td>
                  <td className="p-3">
                    <button className="text-gray-400 hover:text-emerald-600"><Eye size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">Showing {filtered.length} of {customers.length}</p>
        </div>
      </Card>
    </div>
  );
};

const AdminFraudPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/fraud/dashboard').then(res => {
      if (res.success) setDashboard(res.dashboard);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSkeleton />;

  const overview = dashboard?.overview || {};
  const tb = dashboard?.threatBreakdown || {};
  const alerts = (dashboard?.recentAlerts || []).map(a => ({
    id: a.id, userId: a.id, userName: a.id, riskScore: a.riskScore,
    level: a.riskScore >= 80 ? 'Critical' : a.riskScore >= 60 ? 'High' : a.riskScore >= 40 ? 'Medium' : 'Low',
    action: a.action, factors: [a.topFactor], amount: a.amount, timestamp: a.time,
  }));
  const critical = alerts.filter(a => a.level === 'Critical').length;
  const high = alerts.filter(a => a.level === 'High').length;
  const medium = alerts.filter(a => a.level === 'Medium').length;
  const low = alerts.filter(a => a.level === 'Low').length;

  const factorData = Object.entries(tb).map(([key, val]) => ({
    name: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
    count: val?.count || 0,
    weight: val?.percentage || '0%',
  }));

  const riskDistribution = [
    { name: 'Low', value: 68, color: '#10B981' },
    { name: 'Medium', value: 20, color: '#F59E0B' },
    { name: 'High', value: 9, color: '#F97316' },
    { name: 'Critical', value: 3, color: '#EF4444' },
  ];

  const levelColor = (level) => {
    if (level === 'Critical') return 'danger';
    if (level === 'High') return 'warning';
    if (level === 'Medium') return 'info';
    return 'success';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Fraud Detection</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-red-50 border-red-100 text-center">
          <p className="text-xs text-red-600 font-medium mb-1">Critical</p>
          <p className="text-3xl font-bold text-red-700">{critical}</p>
        </Card>
        <Card className="bg-orange-50 border-orange-100 text-center">
          <p className="text-xs text-orange-600 font-medium mb-1">High</p>
          <p className="text-3xl font-bold text-orange-700">{high}</p>
        </Card>
        <Card className="bg-blue-50 border-blue-100 text-center">
          <p className="text-xs text-blue-600 font-medium mb-1">Medium</p>
          <p className="text-3xl font-bold text-blue-700">{medium}</p>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100 text-center">
          <p className="text-xs text-emerald-600 font-medium mb-1">Low</p>
          <p className="text-3xl font-bold text-emerald-700">{low}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution */}
        <Card>
          <h3 className="font-semibold mb-4">Transaction Risk Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                  {riskDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Factor Analysis */}
        <Card>
          <h3 className="font-semibold mb-4">Trigger Factor Analysis</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={factorData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={100} tick={{fontSize: 11}} />
                <Tooltip />
                <Bar dataKey="count" fill={COLORS.danger} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Alert List */}
      <Card>
        <h3 className="font-semibold mb-4">All Fraud Alerts</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="p-3 rounded-l-lg font-medium">User</th>
                <th className="p-3 font-medium">Risk Score</th>
                <th className="p-3 font-medium">Level</th>
                <th className="p-3 font-medium">Amount</th>
                <th className="p-3 font-medium">Factors</th>
                <th className="p-3 font-medium">Action</th>
                <th className="p-3 rounded-r-lg font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map(a => (
                <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-3">
                    <p className="font-medium text-gray-900">{a.userName}</p>
                    <p className="text-xs text-gray-400">{a.userId}</p>
                  </td>
                  <td className="p-3">
                    <span className={`font-bold ${a.riskScore >= 80 ? 'text-red-600' : a.riskScore >= 50 ? 'text-amber-600' : 'text-blue-600'}`}>
                      {a.riskScore}
                    </span>
                  </td>
                  <td className="p-3"><Badge variant={levelColor(a.level)}>{a.level}</Badge></td>
                  <td className="p-3 font-medium">{formatPKR(a.amount)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1">{a.factors.map((f,i) => <span key={i} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{f}</span>)}</div>
                  </td>
                  <td className="p-3"><Badge variant={a.action === 'BLOCK' ? 'danger' : a.action === 'REQUIRE_VERIFICATION' ? 'warning' : 'info'}>{a.action.replace(/_/g, ' ')}</Badge></td>
                  <td className="p-3 text-xs text-gray-500">{new Date(a.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const AdminBusinessCasePage = () => {
  const [y1Rate, setY1Rate] = useState(5);
  const [y2Rate, setY2Rate] = useState(12);
  const [y3Rate, setY3Rate] = useState(20);

  const TAM = 2300000;
  const banked = 38000;
  const gap = TAM - banked;

  const projections = [
    { year: 'Year 1', customers: Math.round(gap * y1Rate / 100), deposits: Math.round(gap * y1Rate / 100 * 278500), revenue: Math.round(gap * y1Rate / 100 * 18600) },
    { year: 'Year 2', customers: Math.round(gap * y2Rate / 100), deposits: Math.round(gap * y2Rate / 100 * 278500), revenue: Math.round(gap * y2Rate / 100 * 18600) },
    { year: 'Year 3', customers: Math.round(gap * y3Rate / 100), deposits: Math.round(gap * y3Rate / 100 * 278500), revenue: Math.round(gap * y3Rate / 100 * 18600) },
  ];

  const revenueBreakdown = [
    { name: 'FX Margins', value: 42 },
    { name: 'Lending', value: 28 },
    { name: 'Deposits', value: 15 },
    { name: 'Cross-sell', value: 10 },
    { name: 'Fees', value: 5 },
  ];

  const chartData = projections.map(p => ({...p, revenue: p.revenue / 1000000, deposits: p.deposits / 1000000000}));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Business Case</h1>

      {/* Market Opportunity */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="TAM (Freelancers)" value="2.3M" icon={Users} />
        <StatCard title="Currently Banked" value="38K" icon={Building2} />
        <StatCard title="Exclusion Rate" value="96.8%" icon={Target} />
        <StatCard title="Market Gap" value="2.26M" icon={TrendingUp} />
      </div>

      {/* Interactive Sliders */}
      <Card>
        <h3 className="font-semibold mb-4">Penetration Rate Assumptions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Year 1', value: y1Rate, setter: setY1Rate },
            { label: 'Year 2', value: y2Rate, setter: setY2Rate },
            { label: 'Year 3', value: y3Rate, setter: setY3Rate },
          ].map(s => (
            <div key={s.label}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">{s.label}</span>
                <span className="font-bold text-emerald-700">{s.value}%</span>
              </div>
              <input type="range" min="1" max="30" value={s.value} onChange={e => s.setter(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
            </div>
          ))}
        </div>
      </Card>

      {/* 3-Year Projections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold mb-4">3-Year Revenue Projection (PKR M)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `PKR ${v.toFixed(0)}M`} />
                <Bar dataKey="revenue" fill={COLORS.primary} radius={[4, 4, 0, 0]} name="Revenue (M)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Revenue Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={revenueBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={4}>
                  {CHART_COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip formatter={v => `${v}%`} />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Projection Table */}
      <Card>
        <h3 className="font-semibold mb-4">Projection Details</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="p-3 rounded-l-lg font-medium">Year</th>
                <th className="p-3 font-medium">Penetration</th>
                <th className="p-3 font-medium">New Customers</th>
                <th className="p-3 font-medium">Deposits</th>
                <th className="p-3 rounded-r-lg font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((p, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="p-3 font-semibold">{p.year}</td>
                  <td className="p-3">{[y1Rate, y2Rate, y3Rate][i]}%</td>
                  <td className="p-3 font-medium">{p.customers.toLocaleString()}</td>
                  <td className="p-3">PKR {(p.deposits / 1e9).toFixed(1)}B</td>
                  <td className="p-3 font-bold text-emerald-700">PKR {(p.revenue / 1e6).toFixed(0)}M</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Competitive Advantage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-emerald-50 border-emerald-100 text-center">
          <Percent size={24} className="text-emerald-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-emerald-800">60%</p>
          <p className="text-sm text-emerald-700">CAC Reduction vs Traditional</p>
        </Card>
        <Card className="bg-blue-50 border-blue-100 text-center">
          <ShieldCheck size={24} className="text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-800">40%</p>
          <p className="text-sm text-blue-700">NPL Reduction with AI Scoring</p>
        </Card>
        <Card className="bg-amber-50 border-amber-100 text-center">
          <Smartphone size={24} className="text-amber-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-amber-800">96%</p>
          <p className="text-sm text-amber-700">WhatsApp Smartphone Reach</p>
        </Card>
      </div>
    </div>
  );
};

const AdminCompliancePage = () => {
  const checks = [
    { category: "SBP Regulatory", items: [
      { name: "NFIS Alignment", status: "pass", detail: "Fully aligned with National Financial Inclusion Strategy 2023-2028" },
      { name: "Digital Banking License", status: "pass", detail: "JS Bank holds valid EMI license for digital services" },
      { name: "KYC/CDD Requirements", status: "pass", detail: "Tiered KYC with biometric verification — 94% completion rate" },
      { name: "AML/CFT Screening", status: "pass", detail: "Real-time screening against UNSC & NACTA lists" },
      { name: "Transaction Monitoring", status: "pass", detail: "AI-powered fraud detection with 7-factor risk assessment" },
    ]},
    { category: "ESFCA Compliance", items: [
      { name: "Export Freelancer Registration", status: "pass", detail: "Auto-registration with SBP for IT service exporters" },
      { name: "Purpose Code Tagging", status: "pass", detail: "SBP-9471 auto-tagged on all freelance income receipts" },
      { name: "FX Receipt Reporting", status: "warning", detail: "Monthly reporting — 2 filings pending for current quarter" },
    ]},
    { category: "Data Protection", items: [
      { name: "Consent Management", status: "pass", detail: "4-tier consent system with granular user control" },
      { name: "Data Encryption", status: "pass", detail: "AES-256 at rest, TLS 1.3 in transit" },
      { name: "Audit Trail", status: "pass", detail: "Complete AI decision logging with explainability" },
      { name: "Bias Testing", status: "pass", detail: "Regular fairness audits — no demographic bias detected" },
    ]},
  ];

  const totalChecks = checks.reduce((s, c) => s + c.items.length, 0);
  const passedChecks = checks.reduce((s, c) => s + c.items.filter(i => i.status === 'pass').length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Compliance Dashboard</h1>
        <Button variant="secondary" className="text-sm"><Download size={16} /> Generate SBP Report</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-emerald-50 border-emerald-100 text-center">
          <p className="text-3xl font-bold text-emerald-800">{passedChecks}/{totalChecks}</p>
          <p className="text-sm text-emerald-700">Checks Passed</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-900">94%</p>
          <p className="text-sm text-gray-500">KYC Completion Rate</p>
        </Card>
        <Card className="text-center">
          <p className="text-3xl font-bold text-gray-900">100%</p>
          <p className="text-sm text-gray-500">AML Screening Coverage</p>
        </Card>
      </div>

      {checks.map((section, si) => (
        <Card key={si}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileCheck size={18} className="text-emerald-600" />
            {section.category}
          </h3>
          <div className="space-y-3">
            {section.items.map((item, ii) => (
              <div key={ii} className={`flex items-start gap-3 p-3 rounded-lg ${item.status === 'pass' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                {item.status === 'pass' ? (
                  <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                </div>
                <div className="ml-auto">
                  <Badge variant={item.status === 'pass' ? 'success' : 'warning'}>
                    {item.status === 'pass' ? 'PASS' : 'WARNING'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

const AdminResponsibleAIPage = () => {
  const biasChecks = [
    { name: "Gender Neutrality", status: "PASS", detail: "No gender-based features in credit scoring model. Score variance < 0.5% across demographics." },
    { name: "Location Neutrality", status: "PASS", detail: "City/province not used as a scoring factor. Equal opportunity regardless of geography." },
    { name: "Demographic Blindness", status: "PASS", detail: "No ethnic, religious, or caste data collected or processed." },
    { name: "Income Source Equity", status: "PASS", detail: "All freelance platforms (Upwork, Fiverr, Freelancer, Toptal) weighted equally." },
    { name: "Age Neutrality", status: "PASS", detail: "Account age is used but biological age is never a factor." },
  ];

  const consentStats = [
    { type: "Voice Data", granted: 1180, total: 1247, percentage: 95 },
    { type: "Transaction Logging", granted: 1210, total: 1247, percentage: 97 },
    { type: "Credit Scoring", granted: 1150, total: 1247, percentage: 92 },
    { type: "AI Analysis", granted: 1100, total: 1247, percentage: 88 },
  ];

  const recentDecisions = [
    { userId: "923001234567", type: "Credit Score", confidence: "94%", result: "742 - Good", timestamp: "2025-02-12 10:30" },
    { userId: "923045678901", type: "Fraud Detection", confidence: "91%", result: "Blocked - Critical", timestamp: "2025-02-12 09:15" },
    { userId: "923012345678", type: "Product Recommendation", confidence: "87%", result: "Nano Loan - Eligible", timestamp: "2025-02-11 16:45" },
    { userId: "923023456789", type: "Credit Score", confidence: "89%", result: "625 - Fair", timestamp: "2025-02-11 14:20" },
    { userId: "923034567890", type: "Income Proof", confidence: "99%", result: "Verified On-Chain", timestamp: "2025-02-11 11:00" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Responsible AI</h1>

      {/* Overall Status */}
      <Card className="bg-emerald-50 border-emerald-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl">
            <BrainCircuit size={28} className="text-emerald-700" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-900">AI System: COMPLIANT</h3>
            <p className="text-sm text-emerald-700">All {biasChecks.length} bias checks passed. No fairness violations detected.</p>
          </div>
        </div>
      </Card>

      {/* Bias Report */}
      <Card>
        <h3 className="font-semibold mb-4">AI Bias & Fairness Report</h3>
        <div className="space-y-3">
          {biasChecks.map((check, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{check.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{check.detail}</p>
              </div>
              <Badge variant="success">{check.status}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Consent Audit */}
      <Card>
        <h3 className="font-semibold mb-4 flex items-center gap-2"><Lock size={18} /> Consent Audit</h3>
        <div className="space-y-4">
          {consentStats.map((c, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{c.type}</span>
                <span className="text-gray-500">{c.granted}/{c.total} ({c.percentage}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{width: `${c.percentage}%`}}></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent AI Decisions */}
      <Card>
        <h3 className="font-semibold mb-4">Recent AI Decisions (Audit Log)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="p-3 rounded-l-lg font-medium">User ID</th>
                <th className="p-3 font-medium">Decision Type</th>
                <th className="p-3 font-medium">Confidence</th>
                <th className="p-3 font-medium">Result</th>
                <th className="p-3 rounded-r-lg font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentDecisions.map((d, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="p-3 font-mono text-xs">{d.userId}</td>
                  <td className="p-3"><Badge variant="neutral">{d.type}</Badge></td>
                  <td className="p-3 font-medium text-emerald-600">{d.confidence}</td>
                  <td className="p-3 font-medium text-gray-900">{d.result}</td>
                  <td className="p-3 text-xs text-gray-500">{d.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Data Transparency */}
      <Card>
        <h3 className="font-semibold mb-4">Data Transparency</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl">
            <Database size={20} className="text-gray-600 mb-2" />
            <h4 className="font-medium text-gray-900 text-sm mb-1">Data Collected</h4>
            <p className="text-xs text-gray-500">Transaction history, platform ratings, voice biometrics (hashed), account metadata</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <Eye size={20} className="text-gray-600 mb-2" />
            <h4 className="font-medium text-gray-900 text-sm mb-1">How It's Used</h4>
            <p className="text-xs text-gray-500">Credit scoring (7 factors), fraud detection, personalized product matching, income verification</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <Clock size={20} className="text-gray-600 mb-2" />
            <h4 className="font-medium text-gray-900 text-sm mb-1">Retention Policy</h4>
            <p className="text-xs text-gray-500">Voice data: until consent revoked. Transactions: 7 years (SBP requirement). Blockchain: permanent (immutable)</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

/**
 * ==============================================================================
 * MAIN LAYOUT & APP SHELL
 * ==============================================================================
 */

const Sidebar = ({ user, currentView, setView, mobileOpen, setMobileOpen }) => {
  const menuItems = user.role === 'admin' ? [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'fraud', label: 'Fraud Detection', icon: ShieldCheck },
    { id: 'business', label: 'Business Case', icon: BarChart3 },
    { id: 'compliance', label: 'Compliance', icon: FileCheck },
    { id: 'ai', label: 'Responsible AI', icon: BrainCircuit },
  ] : [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: FileText },
    { id: 'transfer', label: 'Send Money', icon: Send },
    { id: 'bills', label: 'Pay Bills', icon: CreditCard },
    { id: 'credit-score', label: 'Credit Score', icon: TrendingUp },
    { id: 'income-proof', label: 'Income Proof', icon: LinkIcon },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-emerald-950 text-emerald-50 transform transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-emerald-900">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center mr-3">
             <span className="font-bold text-emerald-900 text-lg">S</span>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">Sarmaya</h1>
            <p className="text-[10px] text-emerald-400 uppercase tracking-wider">سرمایہ by JS Bank</p>
          </div>
          <button
            className="ml-auto lg:hidden text-emerald-300"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'text-emerald-100 hover:bg-emerald-900 hover:text-white'
                }`}
              >
                <item.icon size={18} className={`mr-3 ${isActive ? 'text-amber-400' : 'text-emerald-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-emerald-900 bg-emerald-950">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center text-xs font-bold">
                {user.name.charAt(0)}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium truncate">{user.name}</p>
               <p className="text-xs text-emerald-400 truncate capitalize">{user.role}</p>
             </div>
           </div>
        </div>
      </aside>
    </>
  );
};

const Layout = ({ children, user, logout }) => {
  const [currentView, setView] = useState(user.role === 'admin' ? 'dashboard' : 'home');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Simple View Router
  const renderView = () => {
    switch(currentView) {
      // Freelancer views
      case 'home': return <UserHome setView={setView} />;
      case 'transactions': return <TransactionsPage />;
      case 'transfer': return <TransferPage />;
      case 'bills': return <BillsPage />;
      case 'credit-score': return <CreditScorePage />;
      case 'income-proof': return <IncomeProofPage />;
      case 'products': return <ProductsPage />;
      case 'profile': return <ProfilePage />;
      case 'settings': return <SettingsPage />;
      // Admin views
      case 'dashboard': return <AdminDashboard />;
      case 'customers': return <AdminCustomersPage setView={setView} />;
      case 'fraud': return <AdminFraudPage />;
      case 'business': return <AdminBusinessCasePage />;
      case 'compliance': return <AdminCompliancePage />;
      case 'ai': return <AdminResponsibleAIPage />;
      default: return <div className="p-10 text-center text-gray-500">Page not found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      <Sidebar
        user={user}
        currentView={currentView}
        setView={setView}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center">
            <button
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-md mr-3"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            {user.role === 'admin' && (
              <div className="relative hidden md:block w-64">
                <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search customers, txns..."
                  className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
             <button className="relative p-2 text-gray-400 hover:text-gray-500">
               <Bell size={20} />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
             <div className="h-6 w-px bg-gray-200"></div>
             <button onClick={logout} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-red-600 transition">
               <LogOut size={16} />
               <span className="hidden sm:inline">Logout</span>
             </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

const LoginPage = ({ onSwitch }) => {
  const { login, loading, authError } = React.useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, pass);
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
           <span className="font-bold text-emerald-900 text-3xl">S</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Sarmaya</h1>
        <p className="text-emerald-200 mt-2 font-serif text-lg">سرمایہ</p>
        <p className="text-emerald-400 text-sm mt-1">Banking for Pakistan's Freelancers</p>
      </div>

      <Card className="w-full max-w-md animate-in zoom-in duration-300">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Sign In</h2>
        {authError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{authError}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={pass} onChange={e => setPass(e.target.value)} required />
          <Button type="submit" className="w-full h-11 flex justify-center" variant="primary">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500 mb-3">Demo Credentials (Tap to fill)</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button onClick={() => {setEmail('sarah.malik@jsbank.com'); setPass('admin');}} className="px-3 py-2 bg-gray-50 hover:bg-emerald-50 text-xs text-gray-700 rounded border border-gray-200 transition">Bank Admin</button>
            <button onClick={() => onSwitch()} className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-xs text-emerald-700 rounded border border-emerald-200 transition font-medium">Register New Account</button>
          </div>
          <p className="text-xs text-center text-gray-400">Don't have an account? <button onClick={onSwitch} className="text-emerald-500 hover:underline font-medium">Register here</button></p>
        </div>
      </Card>

      <div className="mt-8 flex gap-4 text-emerald-600/60">
        <Globe size={20} />
        <ShieldCheck size={20} />
        <BrainCircuit size={20} />
      </div>
    </div>
  );
};

const RegisterPage = ({ onSwitch }) => {
  const { register, loading, authError } = React.useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [phone, setPhone] = useState('923');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^923\d{9}$/.test(phone)) {
      alert('Phone must be in 923XXXXXXXXX format (12 digits)');
      return;
    }
    await register(name, email, pass, phone);
  };

  return (
    <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
           <span className="font-bold text-emerald-900 text-3xl">S</span>
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Sarmaya</h1>
        <p className="text-emerald-200 mt-2 font-serif text-lg">سرمایہ</p>
        <p className="text-emerald-400 text-sm mt-1">Create Your Freelancer Banking Account</p>
      </div>

      <Card className="w-full max-w-md animate-in zoom-in duration-300">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Register</h2>
        {authError && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{authError}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" placeholder="e.g. Ahmed Khan" value={name} onChange={e => setName(e.target.value)} required />
          <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="Password" type="password" placeholder="Choose a password" value={pass} onChange={e => setPass(e.target.value)} required />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Phone Number</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg border border-gray-300">+</span>
              <input
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="923001234567"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                maxLength={12}
                required
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Format: 923XXXXXXXXX (your WhatsApp number)</p>
          </div>
          <Button type="submit" className="w-full h-11 flex justify-center" variant="primary">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100">
          <p className="text-xs text-center text-gray-400">Already have an account? <button onClick={onSwitch} className="text-emerald-500 hover:underline font-medium">Sign in</button></p>
        </div>
      </Card>
    </div>
  );
};

const AppContent = () => {
  const { user, logout, loading } = React.useContext(AuthContext);
  const [showRegister, setShowRegister] = useState(false);

  if (loading) return <div className="min-h-screen bg-emerald-950 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div></div>;

  if (!user) {
    return showRegister
      ? <RegisterPage onSwitch={() => setShowRegister(false)} />
      : <LoginPage onSwitch={() => setShowRegister(true)} />;
  }

  return <Layout user={user} logout={logout} />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
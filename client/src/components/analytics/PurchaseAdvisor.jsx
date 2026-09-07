import React, { useState } from 'react';
import { IndianRupee } from 'lucide-react';
import { evaluatePurchaseRecommendation } from '../../services/aiService';
import Spinner from '../Spinner';

const CATEGORIES = ['Shopping', 'Food', 'Entertainment', 'Travel', 'Bills', 'Other'];

const PurchaseAdvisor = ({ allTransactions = [] }) => {
  const [product, setProduct] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Shopping');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!product || !price) return;

    setLoading(true);
    const evaluation = await evaluatePurchaseRecommendation(product, price, category, allTransactions);
    setResult(evaluation);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-500">
        Simulate a potential purchase. The AI will cross-reference your recent category velocity, purchase frequency, and budget before you spend.
      </div>

      <form onSubmit={handleEvaluate} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
        {/* Product Field */}
        <div className="sm:col-span-5">
          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Item / Product Name
          </label>
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="e.g. Cotton T-Shirt, Coffee Maker"
            className="app-input text-xs"
            required
            disabled={loading}
          />
        </div>

        {/* Price Field */}
        <div className="sm:col-span-3">
          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Estimated Price (₹)
          </label>
          <div className="relative">
            <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              step="1"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1999"
              className="app-input pl-8 text-xs"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Category Field */}
        <div className="sm:col-span-2">
          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="app-input text-xs"
            disabled={loading}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Action */}
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="w-full app-btn-primary text-xs py-2.5"
            disabled={loading || !product || !price}
          >
            {loading ? <Spinner size="sm" color="white" text="Analyzing..." /> : 'Analyze'}
          </button>
        </div>
      </form>

      {/* Result Card */}
      {result && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
            <div>
              <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                AI Recommendation for: <span className="text-slate-900 font-bold">{result.product} (₹{result.price.toLocaleString('en-IN')})</span>
              </span>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded font-bold text-xs ${
                result.tone === 'warning'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : result.tone === 'caution'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {result.recommendation}
            </span>
          </div>

          <p className="text-slate-700 leading-normal font-medium">
            {result.reasoning}
          </p>

          {/* Supporting Data Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-[11px]">
            <div className="p-2 bg-white border border-slate-200 rounded">
              <span className="text-slate-500 block">Category Total</span>
              <strong className="text-slate-900">₹{(result.stats?.categoryTotal || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div className="p-2 bg-white border border-slate-200 rounded">
              <span className="text-slate-500 block">Similar Purchases</span>
              <strong className="text-slate-900">{result.stats?.similarPurchaseCount || 0} recent record(s)</strong>
            </div>
            <div className="p-2 bg-white border border-slate-200 rounded col-span-2 sm:col-span-1">
              <span className="text-slate-500 block">Budget Impact</span>
              <strong className="text-slate-900">
                {result.stats?.categoryTotal > 0
                  ? `${Math.round((result.price / (result.stats.categoryTotal + result.price)) * 100)}% of category`
                  : 'New Category Entry'}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseAdvisor;

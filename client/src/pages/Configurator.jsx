import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Settings2, IndianRupee, Plus, FileText, RefreshCw, ChevronDown, AlertCircle } from 'lucide-react';
import api from '../services/api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import { useAuth } from '../context/AuthContext';

const INR = (v) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export default function Configurator() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [config, setConfig] = useState({});
  const [pricing, setPricing] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [calcLoading, setCalcLoading] = useState(false);
  const [quoteModal, setQuoteModal] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(null);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Load products on mount
  useEffect(() => {
    api.get('/products').then(res => {
      setProducts(res.data.data);
      if (res.data.data.length > 0) handleSelectProduct(res.data.data[0]);
    }).catch(() => setError('Failed to load products.')).finally(() => setLoadingProducts(false));
  }, []);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setPricing(null);
    setQuoteSuccess(null);
    // Build default config from first option of each select attribute, toggle defaults to false
    const defaults = {};
    product.attributes.forEach(attr => {
      if (attr.type === 'select') {
        defaults[attr.name] = attr.options[0]?.value ?? '';
      } else {
        defaults[attr.name] = 'false';
      }
    });
    setConfig(defaults);
  };

  const calculatePrice = useCallback(async (currentConfig) => {
    if (!selectedProduct) return;
    setCalcLoading(true);
    try {
      const res = await api.post('/pricing/calculate', {
        productId: selectedProduct._id,
        configuration: currentConfig,
      });
      setPricing(res.data.data);
    } catch {
      // silent
    } finally {
      setCalcLoading(false);
    }
  }, [selectedProduct]);

  // Recalculate whenever config or product changes
  useEffect(() => {
    if (selectedProduct && Object.keys(config).length > 0) {
      const timer = setTimeout(() => calculatePrice(config), 300);
      return () => clearTimeout(timer);
    }
  }, [config, selectedProduct, calculatePrice]);

  const handleConfigChange = (name, value) => {
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const onSubmitQuote = async (formData) => {
    setQuoteLoading(true);
    setError('');
    try {
      const res = await api.post('/quotes', {
        customer: formData,
        productId: selectedProduct._id,
        configuration: config,
        notes: formData.notes,
      });
      setQuoteSuccess(res.data.data);
      setQuoteModal(false);
      reset();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create quote.');
    } finally {
      setQuoteLoading(false);
    }
  };

  if (loadingProducts) return (
    <div className="flex items-center justify-center py-24">
      <Spinner size="lg" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {quoteSuccess && (
        <div className="flex items-center justify-between p-4 bg-emerald-900/30 border border-emerald-700/50 rounded-xl text-sm text-emerald-300">
          <div>
            ✅ Quote <strong className="font-mono">{quoteSuccess.quoteNumber}</strong> created successfully!
          </div>
          <a href="/quotes" className="btn-success text-xs py-1.5">View Quotes</a>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Config Form */}
        <div className="xl:col-span-2 space-y-4">
          {/* Product Selector */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Settings2 size={16} className="text-brand-400" /> Select Product
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {products.map(p => (
                <button
                  key={p._id}
                  onClick={() => handleSelectProduct(p)}
                  className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedProduct?._id === p._id
                      ? 'border-brand-500 bg-brand-600/10'
                      : 'border-surface-border hover:border-brand-700 bg-surface hover:bg-surface-card'
                  }`}
                >
                  <p className="font-semibold text-sm text-slate-100">{p.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{p.category} · Base: {INR(p.basePrice)}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Attribute Configuration */}
          {selectedProduct && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <ChevronDown size={16} className="text-brand-400" />
                Configure: <span className="text-brand-400">{selectedProduct.name}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...selectedProduct.attributes]
                  .sort((a, b) => a.order - b.order)
                  .map(attr => (
                    <div key={attr.name}>
                      <label className="label">{attr.displayName}</label>

                      {attr.type === 'select' ? (
                        <select
                          id={`attr-${attr.name}`}
                          value={config[attr.name] ?? ''}
                          onChange={e => handleConfigChange(attr.name, e.target.value)}
                          className="input-field"
                        >
                          {attr.options.map(opt => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}{opt.priceImpact > 0 ? ` (+₹${opt.priceImpact.toLocaleString('en-IN')})` : ''}
                            </option>
                          ))}
                        </select>
                      ) : (
                        /* Toggle */
                        <div className="flex items-center gap-3 mt-1">
                          <button
                            id={`toggle-${attr.name}`}
                            type="button"
                            onClick={() => handleConfigChange(attr.name, config[attr.name] === 'true' ? 'false' : 'true')}
                            className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
                              config[attr.name] === 'true' ? 'bg-brand-600' : 'bg-surface-border'
                            }`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                              config[attr.name] === 'true' ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                          </button>
                          <span className="text-sm text-slate-400">
                            {config[attr.name] === 'true' ? (
                              <span className="text-emerald-400 font-medium">Enabled</span>
                            ) : 'Disabled'}
                          </span>
                          {attr.options.find(o => o.value === 'true')?.priceImpact > 0 && (
                            <span className="text-xs text-amber-400">
                              +₹{attr.options.find(o => o.value === 'true').priceImpact.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Pricing Panel */}
        <div className="space-y-4">
          <div className="card p-5 sticky top-20">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <IndianRupee size={16} className="text-emerald-400" /> Price Summary
              {calcLoading && <Spinner size="sm" className="ml-auto" />}
            </h3>

            {pricing ? (
              <div className="space-y-3">
                {/* Base Price */}
                <div className="flex items-center justify-between py-2 border-b border-surface-border">
                  <span className="text-sm text-slate-400">Base Price</span>
                  <span className="text-sm font-medium text-slate-200">{INR(pricing.basePrice)}</span>
                </div>

                {/* Applied rules */}
                {pricing.rulesApplied.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Applied Rules</p>
                    {pricing.rulesApplied.map((rule, i) => (
                      <div key={i} className="flex items-start justify-between gap-2">
                        <span className="text-xs text-slate-400 leading-tight">{rule.description || rule.name}</span>
                        <span className="text-xs font-medium text-amber-400 whitespace-nowrap">+{INR(rule.addedPrice)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No additional rules applied.</p>
                )}

                {/* Total */}
                <div className="mt-3 pt-3 border-t border-surface-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-300">Total Price</span>
                    <span className="text-xl font-bold text-emerald-400">{INR(pricing.totalPrice)}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Inclusive of all applicable charges · {pricing.currency}</p>
                </div>

                <button
                  id="generate-quote-btn"
                  onClick={() => { setQuoteModal(true); setError(''); }}
                  className="btn-primary w-full justify-center mt-2"
                >
                  <FileText size={16} /> Generate Quote
                </button>
              </div>
            ) : (
              <div className="py-8 text-center">
                {calcLoading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Spinner size="md" />
                    <p className="text-xs text-slate-500">Calculating price...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle size={24} className="text-slate-600" />
                    <p className="text-sm text-slate-500">Select a product to see pricing</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Config Summary Card */}
          {selectedProduct && Object.keys(config).length > 0 && (
            <div className="card p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Current Configuration</p>
              <div className="space-y-1.5">
                {Object.entries(config).map(([k, v]) => {
                  const attr = selectedProduct.attributes.find(a => a.name === k);
                  const label = attr?.options?.find(o => o.value === v)?.label || (v === 'true' ? 'Yes' : v === 'false' ? 'No' : v);
                  return (
                    <div key={k} className="flex justify-between gap-2 text-xs">
                      <span className="text-slate-500">{attr?.displayName || k}</span>
                      <span className="text-slate-300 font-medium">{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate Quote Modal */}
      <Modal isOpen={quoteModal} onClose={() => setQuoteModal(false)} title="Generate Quotation" maxWidth="max-w-md">
        {error && (
          <div className="mb-4 p-3 bg-rose-900/30 border border-rose-700/50 rounded-lg text-xs text-rose-400">{error}</div>
        )}
        <form onSubmit={handleSubmit(onSubmitQuote)} className="space-y-4">
          <div>
            <label className="label">Customer Name *</label>
            <input className="input-field" placeholder="e.g. Mahindra Industries" {...register('name', { required: 'Required' })} />
            {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Customer Email *</label>
            <input type="email" className="input-field" placeholder="purchase@company.com" {...register('email', { required: 'Required' })} />
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Company</label>
              <input className="input-field" placeholder="Company Ltd" {...register('company')} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input-field" placeholder="+91-..." {...register('phone')} />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input-field h-20 resize-none" placeholder="Special requirements..." {...register('notes')} />
          </div>

          {/* Summary in modal */}
          {pricing && (
            <div className="p-3 bg-surface rounded-lg border border-surface-border text-xs space-y-1">
              <p className="font-semibold text-slate-400">Quote Summary</p>
              <div className="flex justify-between"><span className="text-slate-500">Product</span><span className="text-slate-300">{selectedProduct?.name}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="text-emerald-400 font-bold text-sm">{INR(pricing.totalPrice)}</span></div>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setQuoteModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={quoteLoading} className="btn-primary flex-1 justify-center">
              {quoteLoading ? <Spinner size="sm" /> : <Plus size={14} />}
              {quoteLoading ? 'Creating...' : 'Create Quote'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

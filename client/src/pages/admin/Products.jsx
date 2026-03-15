import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Pencil, Trash2, Package, XCircle, PlusCircle } from 'lucide-react';
import api from "../../services/api";
import Modal from "../../components/Modal";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";

const INR = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [attrModal, setAttrModal] = useState(null); /* product being configured */

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm({
    defaultValues: {
      name: '', description: '', category: 'Electrical', basePrice: '', currency: 'INR'
    }
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products');
      setProducts(res.data.data);
    } catch { setError('Failed to load products.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', description: '', category: 'Electrical', basePrice: '', currency: 'INR' });
    setFormModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    reset({ name: p.name, description: p.description, category: p.category, basePrice: p.basePrice, currency: p.currency });
    setFormModal(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.put(`/products/${editing._id}`, data);
      } else {
        await api.post('/products', data);
      }
      await load();
      setFormModal(false);
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      await load();
    } catch { setError('Delete failed.'); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {error && (
        <div className="p-3 bg-rose-900/30 border border-rose-700/50 rounded-lg text-sm text-rose-400">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{products.length} product(s) in catalogue</p>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={14} /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : products.length === 0 ? (
        <EmptyState icon={Package} title="No products yet" description="Add your first product to the catalogue." action={
          <button onClick={openCreate} className="btn-primary">
            <Plus size={14} /> Add Product
          </button>
        } />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {products.map(p => (
            <div key={p._id} className="card p-5 hover:border-brand-700/50 transition-colors group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-medium text-brand-400 bg-brand-900/30 border border-brand-800/50 px-2 py-0.5 rounded-full">{p.category}</span>
                  <h3 className="text-sm font-bold text-slate-100 mt-2">{p.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{p.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-border">
                <div>
                  <p className="text-xs text-slate-500">Base Price</p>
                  <p className="text-sm font-bold text-emerald-400">{INR(p.basePrice)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Attributes</p>
                  <p className="text-sm font-bold text-slate-200">{p.attributes?.length || 0}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setAttrModal(p)}
                  className="btn-secondary flex-1 justify-center text-xs py-1.5"
                >
                  <Package size={12} /> Attributes
                </button>
                <button onClick={() => openEdit(p)} className="p-2 text-slate-400 hover:text-brand-400 hover:bg-brand-900/30 rounded-lg transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => deleteProduct(p._id)} className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-900/30 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Product Modal */}
      <Modal isOpen={formModal} onClose={() => setFormModal(false)} title={editing ? 'Edit Product' : 'Add Product'} maxWidth="max-w-md">
        {error && <div className="mb-3 p-2 bg-rose-900/30 border border-rose-700/50 rounded text-xs text-rose-400">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Product Name *</label>
            <input className="input-field" placeholder="e.g. Industrial Transformer" {...register('name', { required: 'Required' })} />
            {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input-field h-16 resize-none" placeholder="Product description..." {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select className="input-field" {...register('category')}>
                {['Electrical','Mechanical','Industrial','Electronics','Chemical'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Base Price (₹) *</label>
              <input type="number" className="input-field" placeholder="15000" {...register('basePrice', { required: 'Required', min: 0 })} />
              {errors.basePrice && <p className="text-xs text-rose-400 mt-1">{errors.basePrice.message}</p>}
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setFormModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <Spinner size="sm" /> : <Plus size={14} />}
              {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Attributes View Modal */}
      <Modal
        isOpen={!!attrModal}
        onClose={() => setAttrModal(null)}
        title={`Attributes — ${attrModal?.name}`}
        maxWidth="max-w-lg"
      >
        {attrModal && (
          <div className="space-y-2">
            {attrModal.attributes?.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No attributes defined. Edit the product to add attributes via the API or seed script.</p>
            ) : (
              attrModal.attributes.map((attr, i) => (
                <div key={i} className="p-3 bg-surface rounded-lg border border-surface-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-200">{attr.displayName}</span>
                    <span className="badge bg-brand-900/40 text-brand-400 text-[10px]">{attr.type}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {attr.options.map((opt, j) => (
                      <span key={j} className="text-xs px-2 py-0.5 bg-surface-card border border-surface-border rounded text-slate-400">
                        {opt.label} {opt.priceImpact > 0 && <span className="text-amber-400">+₹{opt.priceImpact}</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
            <button onClick={() => setAttrModal(null)} className="btn-secondary w-full justify-center mt-2">Close</button>
          </div>
        )}
      </Modal>
    </div>
  );
}

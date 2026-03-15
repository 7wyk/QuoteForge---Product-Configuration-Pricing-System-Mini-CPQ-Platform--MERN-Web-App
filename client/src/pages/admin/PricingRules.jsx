import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, ShieldCheck, ToggleLeft } from 'lucide-react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import EmptyState from '../../components/EmptyState';

const OPERATORS = ['>', '<', '>=', '<=', '==', '!=', 'includes'];
const INR = (v) => `₹${Number(v).toLocaleString('en-IN')}`;

export default function PricingRules() {
  const [rules, setRules] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const load = async () => {
    setLoading(true);
    try {
      const [rulesRes, prodsRes] = await Promise.all([
        api.get('/admin/rules'),
        api.get('/products'),
      ]);
      setRules(rulesRes.data.data);
      setProducts(prodsRes.data.data);
    } catch { setError('Failed to load data.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    reset({ name: '', description: '', field: '', operator: '>', value: '', addedPrice: '', priority: 0, productId: '' });
    setFormModal(true);
  };

  const openEdit = (r) => {
    setEditing(r);
    reset({
      name: r.name, description: r.description,
      field: r.condition.field, operator: r.condition.operator, value: r.condition.value,
      addedPrice: r.addedPrice, priority: r.priority,
      productId: r.productId?._id || r.productId || '',
    });
    setFormModal(true);
  };

  const onSubmit = async (data) => {
    setSaving(true);
    setError('');
    const payload = {
      name: data.name,
      description: data.description,
      condition: { field: data.field, operator: data.operator, value: data.value },
      addedPrice: Number(data.addedPrice),
      priority: Number(data.priority || 0),
      productId: data.productId || null,
    };
    try {
      if (editing) {
        await api.put(`/admin/rules/${editing._id}`, payload);
      } else {
        await api.post('/admin/rules', payload);
      }
      await load();
      setFormModal(false);
    } catch (e) {
      setError(e.response?.data?.message || 'Save failed.');
    } finally { setSaving(false); }
  };

  const deleteRule = async (id) => {
    if (!confirm('Delete this rule?')) return;
    try {
      await api.delete(`/admin/rules/${id}`);
      await load();
    } catch { setError('Delete failed.'); }
  };

  const toggleActive = async (rule) => {
    try {
      await api.put(`/admin/rules/${rule._id}`, { isActive: !rule.isActive });
      await load();
    } catch { setError('Update failed.'); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {error && (
        <div className="p-3 bg-rose-900/30 border border-rose-700/50 rounded-lg text-sm text-rose-400">{error}</div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{rules.length} pricing rule(s)</p>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={14} /> Add Rule
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : rules.length === 0 ? (
        <EmptyState icon={ShieldCheck} title="No pricing rules" description="Define rules to dynamically adjust product prices." action={
          <button onClick={openCreate} className="btn-primary"><Plus size={14} /> Add Rule</button>
        } />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-surface-border bg-surface">
              <tr>
                <th className="table-th">Rule Name</th>
                <th className="table-th">Condition</th>
                <th className="table-th">Add Price</th>
                <th className="table-th">Product</th>
                <th className="table-th">Priority</th>
                <th className="table-th">Status</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {rules.map(r => (
                <tr key={r._id} className="hover:bg-surface-card/50 transition-colors">
                  <td className="table-td">
                    <p className="font-medium text-slate-200">{r.name}</p>
                    {r.description && <p className="text-xs text-slate-500">{r.description}</p>}
                  </td>
                  <td className="table-td">
                    <code className="text-xs bg-surface-card border border-surface-border px-2 py-0.5 rounded text-brand-300">
                      {r.condition.field} {r.condition.operator} "{r.condition.value}"
                    </code>
                  </td>
                  <td className="table-td font-bold text-amber-400">{INR(r.addedPrice)}</td>
                  <td className="table-td text-slate-400 text-xs">{r.productId?.name || '—'}</td>
                  <td className="table-td text-slate-400">{r.priority}</td>
                  <td className="table-td">
                    <button
                      onClick={() => toggleActive(r)}
                      className={`badge cursor-pointer transition-colors ${
                        r.isActive
                          ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700/50'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {r.isActive ? '● Active' : '○ Inactive'}
                    </button>
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-brand-400 hover:bg-brand-900/30 rounded-lg transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => deleteRule(r._id)} className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-900/30 rounded-lg transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Rule Modal */}
      <Modal isOpen={formModal} onClose={() => setFormModal(false)} title={editing ? 'Edit Pricing Rule' : 'Add Pricing Rule'} maxWidth="max-w-lg">
        {error && <div className="mb-3 p-2 bg-rose-900/30 border border-rose-700/50 rounded text-xs text-rose-400">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Rule Name *</label>
            <input className="input-field" placeholder="e.g. High Voltage Premium" {...register('name', { required: 'Required' })} />
            {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input-field" placeholder="Brief explanation" {...register('description')} />
          </div>

          {/* Condition */}
          <div>
            <label className="label">Condition</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <input className="input-field" placeholder="field (e.g. voltage)" {...register('field', { required: 'Required' })} />
                {errors.field && <p className="text-xs text-rose-400 mt-1">Required</p>}
              </div>
              <select className="input-field" {...register('operator', { required: true })}>
                {OPERATORS.map(op => <option key={op} value={op}>{op}</option>)}
              </select>
              <div>
                <input className="input-field" placeholder='value (e.g. 200 or "copper")' {...register('value', { required: 'Required' })} />
                {errors.value && <p className="text-xs text-rose-400 mt-1">Required</p>}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Example: <code className="text-brand-400">voltage &gt; 200</code>, <code className="text-brand-400">material == copper</code>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Added Price (₹) *</label>
              <input type="number" className="input-field" placeholder="e.g. 1500" {...register('addedPrice', { required: 'Required', min: 0 })} />
              {errors.addedPrice && <p className="text-xs text-rose-400 mt-1">{errors.addedPrice.message}</p>}
            </div>
            <div>
              <label className="label">Priority</label>
              <input type="number" className="input-field" placeholder="0 = lowest" {...register('priority')} />
            </div>
          </div>

          <div>
            <label className="label">Apply to Product (optional)</label>
            <select className="input-field" {...register('productId')}>
              <option value="">— Global (all products) —</option>
              {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setFormModal(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? <Spinner size="sm" /> : <Plus size={14} />}
              {saving ? 'Saving...' : editing ? 'Update' : 'Create Rule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

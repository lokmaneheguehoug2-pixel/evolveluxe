'use client';

import { useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { StoreSettings } from '@/lib/types';
import { toast } from 'sonner';
import { Loader2, Save, Truck } from 'lucide-react';
import { WILAYAS, normalizeWilayaRates } from '@/lib/wilayas';

export function SettingsTab({ settings, onSaved }: { settings: StoreSettings; onSaved: (settings: StoreSettings) => void }) {
  const [form, setForm] = useState({ ...settings, wilaya_shipping_rates: normalizeWilayaRates(settings.wilaya_shipping_rates) });
  const [saving, setSaving] = useState(false);
  const update = (key: keyof StoreSettings, value: string | number | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const updateWilayaRate = (code: string, method: 'home' | 'desk', value: number) => setForm((current) => ({ ...current, wilaya_shipping_rates: { ...current.wilaya_shipping_rates, [code]: { ...current.wilaya_shipping_rates[code], [method]: Math.max(0, Number.isFinite(value) ? value : 0) } } }));

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const nextSettings = form.free_shipping_enabled && form.free_shipping_mode === 'days'
        ? { ...form, free_shipping_until: new Date(Date.now() + Math.max(1, form.free_shipping_days) * 86400000).toISOString().slice(0, 10) }
        : form;
      await setDoc(doc(db, 'settings', 'store'), { ...nextSettings, updated_at: serverTimestamp() }, { merge: true });
      setForm(nextSettings);
      onSaved(nextSettings);
      toast.success('Store settings saved');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl text-burgundy-700">Store Settings</h1>
      <p className="text-burgundy/55 mt-2 mb-8">Manage the live footer content shown across your storefront.</p>
      <form onSubmit={handleSave} className="bg-champagne-100 rounded-lg p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {([
          ['phone', 'Contact phone number'], ['email', 'Contact email address'], ['address', 'Physical address'],
          ['instagram', 'Instagram URL'], ['tiktok', 'TikTok URL'], ['facebook', 'Facebook URL'],
        ] as const).map(([key, label]) => (
          <label key={key} className="block">
            <span className="luxe-label">{label}</span>
            <input value={form[key]} onChange={(event) => update(key, event.target.value)} className="luxe-input" />
          </label>
        ))}
        <label className="block md:col-span-2">
          <span className="luxe-label">Brand description</span>
          <textarea value={form.description} onChange={(event) => update('description', event.target.value)} className="luxe-input min-h-28" />
        </label>
        <div className="md:col-span-2 border-t border-burgundy/10 pt-5 mt-2">
          <h2 className="font-serif text-2xl text-burgundy-700 flex items-center gap-2"><Truck className="h-5 w-5" /> Shipping Settings</h2>
          <p className="text-sm text-burgundy/55 mt-1 mb-4">Set delivery prices for every Algerian Wilaya.</p>
          <div className="max-h-[480px] overflow-auto border border-burgundy/10 rounded-md">
            <div className="min-w-[34rem] grid grid-cols-[1fr_8rem_8rem] gap-3 px-4 py-3 bg-burgundy-700 text-champagne-100 text-xs uppercase tracking-wider sticky top-0">
              <span>Wilaya</span><span>Home (DZD)</span><span>Desk (DZD)</span>
            </div>
            {WILAYAS.map((wilaya) => {
              const rate = form.wilaya_shipping_rates[wilaya.code] || { home: 0, desk: 0 };
              return <div key={wilaya.code} className="min-w-[34rem] grid grid-cols-[1fr_8rem_8rem] gap-3 items-center px-4 py-2 border-b border-burgundy/5 last:border-0">
                <span className="text-sm text-burgundy-700"><b>{wilaya.code}</b> · {wilaya.name} <span className="text-burgundy/50">{wilaya.nameAr}</span></span>
                <input aria-label={`${wilaya.name} home delivery`} type="number" min="0" value={rate.home} onChange={(event) => updateWilayaRate(wilaya.code, 'home', Number(event.target.value))} className="luxe-input !py-2" />
                <input aria-label={`${wilaya.name} desk delivery`} type="number" min="0" value={rate.desk} onChange={(event) => updateWilayaRate(wilaya.code, 'desk', Number(event.target.value))} className="luxe-input !py-2" />
              </div>;
            })}
          </div>
          <label className="md:col-span-2 flex items-center gap-3"><input type="checkbox" checked={form.free_shipping_enabled} onChange={(event) => update('free_shipping_enabled', event.target.checked)} className="size-4 accent-burgundy-700" /><span className="text-sm text-burgundy-700">Enable free shipping promotion</span></label>
            {form.free_shipping_enabled && <>
              <label><span className="luxe-label">Promotion duration</span><select value={form.free_shipping_mode} onChange={(event) => update('free_shipping_mode', event.target.value)} className="luxe-input"><option value="days">For a number of days</option><option value="date">Until a specific date</option></select></label>
              {form.free_shipping_mode === 'days' ? <label><span className="luxe-label">Active for days</span><input type="number" min="1" value={form.free_shipping_days} onChange={(event) => update('free_shipping_days', Number(event.target.value))} className="luxe-input" /></label> : <label><span className="luxe-label">Active until</span><input type="date" value={form.free_shipping_until} onChange={(event) => update('free_shipping_until', event.target.value)} className="luxe-input" /></label>}
            </>}
        </div>
        <button type="submit" disabled={saving} className="luxe-btn-primary md:col-span-2 flex items-center justify-center gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Store Settings
        </button>
      </form>
    </div>
  );
}

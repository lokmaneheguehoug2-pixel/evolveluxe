'use client';

import { useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { StoreSettings } from '@/lib/types';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

export function SettingsTab({ settings, onSaved }: { settings: StoreSettings; onSaved: (settings: StoreSettings) => void }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const update = (key: keyof StoreSettings, value: string) => setForm((current) => ({ ...current, [key]: value }));

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'store'), { ...form, updated_at: serverTimestamp() }, { merge: true });
      onSaved(form);
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
        <button type="submit" disabled={saving} className="luxe-btn-primary md:col-span-2 flex items-center justify-center gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Store Settings
        </button>
      </form>
    </div>
  );
}

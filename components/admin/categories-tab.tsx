'use client';

import { useState } from 'react';
import { addDoc, collection, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Category } from '@/lib/types';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

export function CategoriesTab({ categories, setCategories }: { categories: Category[]; setCategories: React.Dispatch<React.SetStateAction<Category[]>> }) {
  const [editing, setEditing] = useState<Category | null>(null);
  const [showForm, setShowForm] = useState(false);

  const remove = async (category: Category) => {
    if (!category?.id || !confirm(`Delete ${category.name || 'this category'}? Products linked to it will remain uncategorized.`)) return;
    try {
      await deleteDoc(doc(db, 'categories', category.id));
      setCategories((current) => current.filter((item) => item.id !== category.id));
      toast.success('Category deleted');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete category');
    }
  };

  return <div>
    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
      <div><h1 className="font-serif text-3xl text-burgundy-700">Categories</h1><p className="text-sm text-burgundy/55 mt-1">Manage the collections shown across your storefront.</p></div>
      <button type="button" onClick={() => { setEditing(null); setShowForm(true); }} className="luxe-btn-primary min-h-11 flex items-center gap-2"><Plus className="h-4 w-4" /> Add Category</button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map((category) => <article key={category.id} className="bg-champagne-100 rounded-lg overflow-hidden">
        {category.image_url ? <img src={category.image_url} alt={category.name} className="h-40 w-full object-cover" /> : <div className="h-40 bg-burgundy/10" />}
        <div className="p-4 flex items-center justify-between gap-3"><div className="min-w-0"><h2 className="font-serif text-xl text-burgundy-700 truncate">{category.name}</h2><p className="text-xs text-burgundy/50 truncate">/{category.slug}</p></div><div className="flex shrink-0"><button type="button" aria-label={`Edit ${category.name}`} onClick={() => { setEditing(category); setShowForm(true); }} className="min-h-11 min-w-11 p-3 text-burgundy/70"><Pencil className="h-5 w-5" /></button><button type="button" aria-label={`Delete ${category.name}`} onClick={() => void remove(category)} className="min-h-11 min-w-11 p-3 text-red-600"><Trash2 className="h-5 w-5" /></button></div></div>
      </article>)}
    </div>
    {categories.length === 0 && <p className="bg-champagne-100 rounded-lg p-8 text-center text-burgundy/50">No categories yet.</p>}
    {showForm && <CategoryForm category={editing} onClose={() => setShowForm(false)} onSave={(saved) => { setCategories((current) => editing ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]); setShowForm(false); }} />}
  </div>;
}

function CategoryForm({ category, onClose, onSave }: { category: Category | null; onClose: () => void; onSave: (category: Category) => void }) {
  const [form, setForm] = useState({ name: category?.name || '', slug: category?.slug || '', description: category?.description || '', image_url: category?.image_url || '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = form.name.trim();
    const slug = (form.slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).toLowerCase();
    if (!name || !slug) { toast.error('Name and slug are required'); return; }
    setSaving(true);
    try {
      const payload = { name, slug, description: form.description.trim() || null, image_url: form.image_url.trim() || null };
      if (category?.id) { await updateDoc(doc(db, 'categories', category.id), payload); onSave({ ...category, ...payload, updated_at: new Date().toISOString() } as Category); }
      else { const ref = await addDoc(collection(db, 'categories'), { ...payload, created_at: serverTimestamp() }); onSave({ id: ref.id, ...payload, created_at: new Date().toISOString() } as Category); }
      toast.success(category ? 'Category updated' : 'Category created');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not save category'); }
    finally { setSaving(false); }
  };
  const upload = async (file: File | undefined) => { if (!file) return; setUploading(true); try { const imageUrl = await compressImage(file); setForm((current) => ({ ...current, image_url: imageUrl })); } catch { toast.error('Could not process image'); } finally { setUploading(false); } };
  return <div className="fixed inset-0 z-50 bg-burgundy-900/50 p-4 flex items-center justify-center"><form onSubmit={save} className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-champagne-50 rounded-lg p-6 space-y-4"><div className="flex items-center justify-between"><h2 className="font-serif text-2xl text-burgundy-700">{category ? 'Edit Category' : 'New Category'}</h2><button type="button" onClick={onClose} className="min-h-11 min-w-11 p-3"><X className="h-5 w-5" /></button></div><label><span className="luxe-label">Name</span><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="luxe-input" /></label><label><span className="luxe-label">Slug</span><input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="luxe-input" placeholder="category-slug" /></label><label><span className="luxe-label">Cover Image URL</span><input value={form.image_url.startsWith('data:') ? '' : form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="luxe-input" placeholder="https://..." /></label><label><span className="luxe-label">Or upload an image</span><input type="file" accept="image/*" onChange={(e) => void upload(e.target.files?.[0])} className="luxe-input" />{uploading && <span className="text-sm text-burgundy-700">Processing image...</span>}</label><label><span className="luxe-label">Description</span><textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} className="luxe-input min-h-24" /></label><div className="flex justify-end gap-3"><button type="button" onClick={onClose} className="luxe-btn-secondary">Cancel</button><button disabled={saving || uploading} className="luxe-btn-primary">{saving ? 'Saving...' : 'Save Category'}</button></div></form></div>;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => { const image = new Image(); const url = URL.createObjectURL(file); image.onload = () => { const scale = Math.min(1, 800 / Math.max(image.width, image.height)); const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.width * scale)); canvas.height = Math.max(1, Math.round(image.height * scale)); const context = canvas.getContext('2d'); if (!context) { reject(new Error('Canvas unavailable')); return; } context.drawImage(image, 0, 0, canvas.width, canvas.height); URL.revokeObjectURL(url); resolve(canvas.toDataURL('image/jpeg', 0.65)); }; image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Invalid image')); }; image.src = url; });
}

export default CategoriesTab;

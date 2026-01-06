import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Plus, Save, Trash2, User } from 'lucide-react';
import { ConfirmDialog } from '../ConfirmDialog';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  img: string;
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400';

const TestimonialsTab: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [title, setTitle] = useState('What Our Members Say');
  const [subtitle, setSubtitle] = useState('Real experiences from our vibrant community');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  /* ---------------- FETCH ---------------- */
  const fetchTestimonials = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('site_config')
      .select('key, value')
      .in('key', [
        'testimonials_title',
        'testimonials_subtitle',
        'testimonials_list'
      ]);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const config: Record<string, any> = {};
    data?.forEach(item => {
      config[item.key] = item.value;
    });

    setTitle(config.testimonials_title ?? 'What Our Members Say');
    setSubtitle(
      config.testimonials_subtitle ??
        'Real experiences from our vibrant community'
    );

    if (config.testimonials_list) {
      try {
        const parsed =
          typeof config.testimonials_list === 'string'
            ? JSON.parse(config.testimonials_list)
            : config.testimonials_list;

        setTestimonials(parsed);
      } catch (err) {
        console.error('JSON parse error:', err);
        setTestimonials([]);
      }
    } else {
      setTestimonials([]);
    }

    setLoading(false);
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    setSaving(true);

    const updates = [
      { key: 'testimonials_title', value: title },
      { key: 'testimonials_subtitle', value: subtitle },
      {
        key: 'testimonials_list',
        value: JSON.stringify(testimonials) // 🔑 IMPORTANT
      }
    ];

    for (const update of updates) {
      const { error } = await supabase
        .from('site_config')
        .upsert(update, { onConflict: 'key' })
        .select(); // 🔑 avoids cache issues

      if (error) {
        console.error(error);
        alert('Failed to save testimonials');
        setSaving(false);
        return;
      }
    }

    alert('Testimonials saved successfully!');
    setSaving(false);
  };

  /* ---------------- CRUD ---------------- */
  const addTestimonial = () => {
    setTestimonials(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: '',
        role: '',
        text: '',
        img: DEFAULT_IMAGE
      }
    ]);
  };

  const updateTestimonial = (
    id: string,
    field: keyof Testimonial,
    value: string
  ) => {
    setTestimonials(prev =>
      prev.map(t => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials(prev => prev.filter(t => t.id !== id));
    setDeleteConfirm(null);
  };

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Testimonials Management</h2>
          <p className="text-gray-600">
            Manage testimonials shown on landing page
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-emerald-500 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Headers */}
      <div className="bg-white p-6 rounded-xl border space-y-4">
        <h3 className="font-semibold">Section Headers</h3>

        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="Section title"
        />

        <input
          value={subtitle}
          onChange={e => setSubtitle(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="Section subtitle"
        />
      </div>

      {/* List */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">
          Testimonials ({testimonials.length})
        </h3>

        <button
          onClick={addTestimonial}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {testimonials.length === 0 ? (
        <div className="border-2 border-dashed rounded-xl p-12 text-center">
          <User className="mx-auto mb-4 text-gray-400" size={48} />
          No testimonials yet
        </div>
      ) : (
        testimonials.map(t => (
          <div key={t.id} className="bg-white p-6 rounded-xl border space-y-4">
            <input
              value={t.name}
              onChange={e => updateTestimonial(t.id, 'name', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Name"
            />

            <input
              value={t.role}
              onChange={e => updateTestimonial(t.id, 'role', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Role"
            />

            <textarea
              value={t.text}
              onChange={e => updateTestimonial(t.id, 'text', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              rows={3}
              placeholder="Testimonial"
            />

            <input
              value={t.img}
              onChange={e => updateTestimonial(t.id, 'img', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Image URL"
            />

            <button
              onClick={() => setDeleteConfirm(t.id)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        ))
      )}

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && deleteTestimonial(deleteConfirm)}
        title="Delete Testimonial"
        message="This action cannot be undone."
        variant="danger"
      />
    </div>
  );
};

export default TestimonialsTab;

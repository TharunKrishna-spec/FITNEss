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

  const fetchTestimonials = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_config')
      .select('key, value')
      .in('key', ['testimonials_title', 'testimonials_subtitle', 'testimonials_list']);

    if (error) {
      console.error('Error fetching testimonials:', error);
      setLoading(false);
      return;
    }

    const config: { [key: string]: any } = {};
    data?.forEach(item => {
      config[item.key] = item.value;
    });

    setTitle(config.testimonials_title || 'What Our Members Say');
    setSubtitle(config.testimonials_subtitle || 'Real experiences from our vibrant community');
    
    if (config.testimonials_list) {
      setTestimonials(config.testimonials_list);
    } else {
      // Default testimonials
      setTestimonials([
        {
          id: Date.now().toString(),
          name: 'Aryan Sharma',
          role: 'Club President 2023-24',
          text: 'Joining the Fitness Club transformed my college experience. I discovered leadership skills I never knew I had and built lifelong friendships.',
          img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400'
        }
      ]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const updates = [
      { key: 'testimonials_title', value: title },
      { key: 'testimonials_subtitle', value: subtitle },
      { key: 'testimonials_list', value: testimonials }
    ];

    for (const update of updates) {
      const { error } = await supabase
        .from('site_config')
        .upsert(update, { onConflict: 'key' });

      if (error) {
        console.error('Error saving testimonial config:', error);
        alert('Error saving changes');
        setSaving(false);
        return;
      }
    }

    alert('Testimonials saved successfully!');
    setSaving(false);
  };

  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: Date.now().toString(),
      name: '',
      role: '',
      text: '',
      img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400'
    };
    setTestimonials([...testimonials, newTestimonial]);
  };

  const updateTestimonial = (id: string, field: keyof Testimonial, value: string) => {
    setTestimonials(testimonials.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const deleteTestimonial = (id: string) => {
    setTestimonials(testimonials.filter(t => t.id !== id));
    setDeleteConfirm(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Testimonials Management</h2>
          <p className="text-gray-600 mt-1">Manage member testimonials displayed on the landing page</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Section Headers */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Section Headers</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="What Our Members Say"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Real experiences from our vibrant community"
            />
          </div>
        </div>
      </div>

      {/* Testimonials List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Testimonials ({testimonials.length})</h3>
          <button
            onClick={addTestimonial}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Testimonial
          </button>
        </div>

        {testimonials.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No testimonials yet</p>
            <button
              onClick={addTestimonial}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Add Your First Testimonial
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Name *</label>
                    <input
                      type="text"
                      value={testimonial.name}
                      onChange={(e) => updateTestimonial(testimonial.id, 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Aryan Sharma"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role/Position *</label>
                    <input
                      type="text"
                      value={testimonial.role}
                      onChange={(e) => updateTestimonial(testimonial.id, 'role', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Club President 2023-24"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Testimonial Text *</label>
                  <textarea
                    value={testimonial.text}
                    onChange={(e) => updateTestimonial(testimonial.id, 'text', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    rows={3}
                    placeholder="Share your experience with the fitness club..."
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image URL</label>
                  <input
                    type="url"
                    value={testimonial.img}
                    onChange={(e) => updateTestimonial(testimonial.id, 'img', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                  {testimonial.img && (
                    <div className="mt-2">
                      <img 
                        src={testimonial.img} 
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setDeleteConfirm(testimonial.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && deleteTestimonial(deleteConfirm)}
        title="Delete Testimonial"
        message="Are you sure you want to delete this testimonial? This action cannot be undone."
        variant="danger"
      />
    </div>
  );
};

export default TestimonialsTab;

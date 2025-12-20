import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Plus, Save, Trash2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { ConfirmDialog } from '../ConfirmDialog';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

const FAQTab: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [title, setTitle] = useState('Frequently Asked Questions');
  const [subtitle, setSubtitle] = useState('Everything you need to know about joining the Fitness Club');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_config')
      .select('key, value')
      .in('key', ['faq_title', 'faq_subtitle', 'faq_list']);

    if (error) {
      console.error('Error fetching FAQs:', error);
      setLoading(false);
      return;
    }

    const config: { [key: string]: any } = {};
    data?.forEach(item => {
      config[item.key] = item.value;
    });

    setTitle(config.faq_title || 'Frequently Asked Questions');
    setSubtitle(config.faq_subtitle || 'Everything you need to know about joining the Fitness Club');
    
    if (config.faq_list) {
      setFaqs(config.faq_list);
    } else {
      // Default FAQs
      setFaqs([
        {
          id: '1',
          question: 'Who can join the Fitness Club?',
          answer: 'Any VIT Chennai student passionate about fitness, sports science, or event management can join. No prior experience required - just bring your enthusiasm!'
        },
        {
          id: '2',
          question: 'What are the different departments?',
          answer: 'We have four core units: Scientific Training (coaching & form analysis), Creative Narrative (media & design), Event Architecture (organizing competitions), and Strategic Outreach (PR & sponsorships).'
        },
        {
          id: '3',
          question: 'Is there a membership fee?',
          answer: 'No! The Fitness Club is completely free to join. We believe in making fitness and professional development accessible to all VIT students.'
        }
      ]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const updates = [
      { key: 'faq_title', value: title },
      { key: 'faq_subtitle', value: subtitle },
      { key: 'faq_list', value: faqs }
    ];

    for (const update of updates) {
      const { error } = await supabase
        .from('site_config')
        .upsert(update, { onConflict: 'key' });

      if (error) {
        console.error('Error saving FAQ config:', error);
        alert('Error saving changes');
        setSaving(false);
        return;
      }
    }

    alert('FAQs saved successfully!');
    setSaving(false);
  };

  const addFAQ = () => {
    const newFAQ: FAQ = {
      id: Date.now().toString(),
      question: '',
      answer: ''
    };
    setFaqs([...faqs, newFAQ]);
    setExpandedFaq(newFAQ.id);
  };

  const updateFAQ = (id: string, field: keyof FAQ, value: string) => {
    setFaqs(faqs.map(f => 
      f.id === id ? { ...f, [field]: value } : f
    ));
  };

  const deleteFAQ = (id: string) => {
    setFaqs(faqs.filter(f => f.id !== id));
    setDeleteConfirm(null);
    if (expandedFaq === id) {
      setExpandedFaq(null);
    }
  };

  const moveFAQ = (index: number, direction: 'up' | 'down') => {
    const newFaqs = [...faqs];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFaqs.length) return;
    
    [newFaqs[index], newFaqs[targetIndex]] = [newFaqs[targetIndex], newFaqs[index]];
    setFaqs(newFaqs);
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
          <h2 className="text-2xl font-bold text-gray-900">FAQ Management</h2>
          <p className="text-gray-600 mt-1">Manage frequently asked questions on the Join page</p>
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
              placeholder="Frequently Asked Questions"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Everything you need to know..."
            />
          </div>
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Questions ({faqs.length})</h3>
          <button
            onClick={addFAQ}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>

        {faqs.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-12 text-center">
            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No FAQs yet</p>
            <button
              onClick={addFAQ}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Add Your First Question
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div 
                key={faq.id} 
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div 
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <HelpCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <span className="font-medium text-gray-900">
                      {faq.question || 'New Question'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveFAQ(index, 'up');
                      }}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveFAQ(index, 'down');
                      }}
                      disabled={index === faqs.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {expandedFaq === faq.id && (
                  <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Question *</label>
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => updateFAQ(faq.id, 'question', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Who can join the Fitness Club?"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Answer *</label>
                      <textarea
                        value={faq.answer}
                        onChange={(e) => updateFAQ(faq.id, 'answer', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        rows={4}
                        placeholder="Provide a detailed answer..."
                        required
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => setDeleteConfirm(faq.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Question
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-900">
          <p className="font-semibold mb-1">Tips for writing good FAQs:</p>
          <ul className="list-disc list-inside space-y-1 text-blue-800">
            <li>Keep questions clear and specific</li>
            <li>Provide concise but complete answers</li>
            <li>Use the order buttons to prioritize important questions</li>
            <li>Update regularly based on common member queries</li>
          </ul>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => deleteConfirm && deleteFAQ(deleteConfirm)}
        title="Delete Question"
        message="Are you sure you want to delete this FAQ? This action cannot be undone."
        variant="danger"
      />
    </div>
  );
};

export default FAQTab;

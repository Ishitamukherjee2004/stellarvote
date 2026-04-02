import { useState } from 'react';
import { PlusCircle, Trash2, Send } from 'lucide-react';

export default function CreatePoll({ onCreate }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validOptions = options.filter(o => o.trim() !== '');
    if (validOptions.length < 2 || !question.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreate(question, validOptions);
      setQuestion('');
      setOptions(['', '']);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-dark-800 rounded-xl p-6 shadow-xl border border-white/5 backdrop-blur-sm">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <PlusCircle className="text-primary-500" />
        Create New Poll
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Question</label>
          <input
            type="text"
            className="w-full bg-dark-900 border border-gray-700/50 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
            placeholder="What is your favorite..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-400 mb-1">Options</label>
          {options.map((option, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                className="flex-1 bg-dark-900 border border-gray-700/50 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                placeholder={`Option ${idx + 1}`}
                value={option}
                onChange={(e) => updateOption(idx, e.target.value)}
                required
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(idx)}
                  className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addOption}
          className="text-sm font-medium text-primary-400 hover:text-primary-300 transition-colors"
        >
          + Add another option
        </button>

        <div className="pt-4 mt-4 border-t border-white/5">
          <button
            type="submit"
            disabled={isSubmitting || options.filter(o => o.trim()).length < 2 || !question.trim()}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white px-5 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Creating...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Publish Poll
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

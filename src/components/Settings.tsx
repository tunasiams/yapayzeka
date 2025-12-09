import { useState } from 'react';
import { X, Save, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface SettingsProps {
  onClose: () => void;
}

const GROQ_MODELS = [
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant' },
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile' },
  { id: 'openai/gpt-oss-120b', name: 'GPT OSS 120B' },
];

export const Settings = ({ onClose }: SettingsProps) => {
  const { profile, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [apiKey, setApiKey] = useState(profile?.groq_api_key || '');
  const [selectedModel, setSelectedModel] = useState(profile?.selected_model || 'llama-3.3-70b-versatile');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    await updateProfile({
      groq_api_key: apiKey,
      selected_model: selectedModel,
    });

    setSaving(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-950 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Ayarlar</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tema</h3>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-between w-full p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center space-x-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-blue-500" />
                ) : (
                  <Sun className="w-5 h-5 text-blue-500" />
                )}
                <span className="text-gray-900 dark:text-white">
                  {theme === 'dark' ? 'Karanlık Tema' : 'Açık Tema'}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Değiştirmek için tıklayın
              </div>
            </button>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Groq API Anahtarı
            </h3>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="gsk_..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              API anahtarınızı{' '}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600"
              >
                Groq Console
              </a>
              'dan alabilirsiniz.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              AI Modeli
            </h3>
            <div className="space-y-2">
              {GROQ_MODELS.map((model) => (
                <label
                  key={model.id}
                  className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <input
                    type="radio"
                    name="model"
                    value={model.id}
                    checked={selectedModel === model.id}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-4 h-4 text-blue-500 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-gray-900 dark:text-white">{model.name}</span>
                </label>
              ))}
            </div>
          </div>

          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400">
              Ayarlar başarıyla kaydedildi!
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-800 text-white font-medium rounded-xl transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Kaydediliyor...' : 'Kaydet'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

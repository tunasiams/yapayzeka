import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Settings, LogOut, Menu, X, Trash2, Download, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Chat } from '../lib/supabase';

interface SidebarProps {
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  onDeleteChat: (chatId: string) => void;
  onExportChat: (chatId: string) => void;
  onImportChat: () => void;
}

export const Sidebar = ({
  currentChatId,
  onSelectChat,
  onNewChat,
  onOpenSettings,
  onDeleteChat,
  onExportChat,
  onImportChat,
}: SidebarProps) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { signOut, user } = useAuth();

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  const loadChats = async () => {
    const { data } = await supabase
      .from('chats')
      .select('*')
      .order('updated_at', { ascending: false });

    if (data) {
      setChats(data);
    }
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Bu sohbeti silmek istediğinizden emin misiniz?')) {
      await supabase.from('chats').delete().eq('id', chatId);
      setChats(chats.filter((c) => c.id !== chatId));
      onDeleteChat(chatId);
    }
  };

  const handleExportChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onExportChat(chatId);
  };

  const SidebarContent = () => (
    <div className="h-full flex flex-col bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">AI Sohbet</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <button
          onClick={() => {
            onNewChat();
            setIsOpen(false);
          }}
          className="w-full flex items-center justify-center space-x-2 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Sohbet</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {chats.length === 0 ? (
          <div className="text-center text-gray-400 dark:text-gray-600 text-sm py-8">
            Henüz sohbet yok
          </div>
        ) : (
          <div className="space-y-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => {
                  onSelectChat(chat.id);
                  setIsOpen(false);
                }}
                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                  currentChatId === chat.id
                    ? 'bg-gray-100 dark:bg-gray-900'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-900/50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {chat.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(chat.updated_at).toLocaleDateString('tr-TR')}
                  </div>
                </div>
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleExportChat(chat.id, e)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Dışa Aktar"
                  >
                    <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-gray-200 dark:border-gray-800 space-y-1">
        <button
          onClick={() => {
            onImportChat();
            setIsOpen(false);
          }}
          className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl transition-colors text-gray-700 dark:text-gray-300"
        >
          <Upload className="w-5 h-5" />
          <span>Sohbet İçe Aktar</span>
        </button>
        <button
          onClick={() => {
            onOpenSettings();
            setIsOpen(false);
          }}
          className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-xl transition-colors text-gray-700 dark:text-gray-300"
        >
          <Settings className="w-5 h-5" />
          <span>Ayarlar</span>
        </button>
        <button
          onClick={signOut}
          className="w-full flex items-center space-x-3 px-3 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-red-600 dark:text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg"
      >
        <Menu className="w-6 h-6 text-gray-900 dark:text-white" />
      </button>

      <div className="hidden lg:block w-80 h-full">
        <SidebarContent />
      </div>

      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 w-80 z-50">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
};

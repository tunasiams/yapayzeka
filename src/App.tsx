import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Auth } from './pages/Auth';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { Settings } from './components/Settings';
import { supabase, Message } from './lib/supabase';
import { sendMessageToGroq, GroqMessage } from './lib/groq';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoadingMessage, setIsLoadingMessage] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const handleNewChat = async () => {
    const { data } = await supabase
      .from('chats')
      .insert({
        user_id: user.id,
        title: 'Yeni Sohbet',
      })
      .select()
      .single();

    if (data) {
      setCurrentChatId(data.id);
    }
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
  };

  const handleDeleteChat = (chatId: string) => {
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
  };

  const handleExportChat = async (chatId: string) => {
    const { data: chat } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .single();

    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    const exportData = {
      chat,
      messages,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${chat?.title || 'export'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportChat = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        const { data: newChat } = await supabase
          .from('chats')
          .insert({
            user_id: user.id,
            title: data.chat?.title || 'İçe Aktarılan Sohbet',
          })
          .select()
          .single();

        if (newChat && data.messages) {
          const messagesToInsert = data.messages.map((msg: Message) => ({
            chat_id: newChat.id,
            role: msg.role,
            content: msg.content,
          }));

          await supabase.from('messages').insert(messagesToInsert);
          setCurrentChatId(newChat.id);
        }
      } catch (error) {
        alert('Dosya içe aktarılırken hata oluştu');
      }
    };
    input.click();
  };

  const handleSendMessage = async (content: string) => {
    if (!currentChatId || !profile?.groq_api_key) return;

    setIsLoadingMessage(true);

    try {
      await supabase.from('messages').insert({
        chat_id: currentChatId,
        role: 'user',
        content,
      });

      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', currentChatId)
        .order('created_at', { ascending: true });

      const groqMessages: GroqMessage[] = messages?.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })) || [];

      const assistantResponse = await sendMessageToGroq(
        profile.groq_api_key,
        profile.selected_model,
        groqMessages
      );

      await supabase.from('messages').insert({
        chat_id: currentChatId,
        role: 'assistant',
        content: assistantResponse,
      });

      const { data: chat } = await supabase
        .from('chats')
        .select('*')
        .eq('id', currentChatId)
        .single();

      if (chat && chat.title === 'Yeni Sohbet' && content.length > 0) {
        const newTitle = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        await supabase
          .from('chats')
          .update({ title: newTitle, updated_at: new Date().toISOString() })
          .eq('id', currentChatId);
      } else {
        await supabase
          .from('chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', currentChatId);
      }
    } catch (error) {
      alert('Mesaj gönderilirken hata oluştu: ' + (error as Error).message);
    } finally {
      setIsLoadingMessage(false);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-black">
      <Sidebar
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onOpenSettings={() => setShowSettings(true)}
        onDeleteChat={handleDeleteChat}
        onExportChat={handleExportChat}
        onImportChat={handleImportChat}
      />
      <ChatInterface
        chatId={currentChatId}
        onSendMessage={handleSendMessage}
        isLoading={isLoadingMessage}
      />
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

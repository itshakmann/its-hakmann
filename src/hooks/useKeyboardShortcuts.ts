import { useEffect, useCallback } from 'react';

interface KeyboardShortcuts {
  onNewChat?: () => void;
  onToggleSidebar?: () => void;
  onFocusInput?: () => void;
  onClearChat?: () => void;
  onToggleTheme?: () => void;
}

export const useKeyboardShortcuts = ({
  onNewChat,
  onToggleSidebar,
  onFocusInput,
  onClearChat,
  onToggleTheme
}: KeyboardShortcuts) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check if user is typing in an input/textarea
    const isTyping = event.target instanceof HTMLInputElement || 
                     event.target instanceof HTMLTextAreaElement ||
                     (event.target as HTMLElement)?.contentEditable === 'true';

    // Only trigger shortcuts when not typing (except for some global shortcuts)
    if (isTyping && !event.metaKey && !event.ctrlKey) {
      return;
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? event.metaKey : event.ctrlKey;

    // Cmd/Ctrl + N - New chat
    if (modifier && event.key === 'n' && onNewChat) {
      event.preventDefault();
      onNewChat();
    }

    // Cmd/Ctrl + B - Toggle sidebar
    if (modifier && event.key === 'b' && onToggleSidebar) {
      event.preventDefault();
      onToggleSidebar();
    }

    // Cmd/Ctrl + K - Focus input
    if (modifier && event.key === 'k' && onFocusInput) {
      event.preventDefault();
      onFocusInput();
    }

    // Cmd/Ctrl + Shift + Delete - Clear chat
    if (modifier && event.shiftKey && event.key === 'Delete' && onClearChat) {
      event.preventDefault();
      onClearChat();
    }

    // Cmd/Ctrl + Shift + T - Toggle theme
    if (modifier && event.shiftKey && event.key === 'T' && onToggleTheme) {
      event.preventDefault();
      onToggleTheme();
    }

    // Escape - Focus input if not already focused
    if (event.key === 'Escape' && onFocusInput && !isTyping) {
      onFocusInput();
    }
  }, [onNewChat, onToggleSidebar, onFocusInput, onClearChat, onToggleTheme]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    shortcuts: {
      newChat: navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘N' : 'Ctrl+N',
      toggleSidebar: navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘B' : 'Ctrl+B',
      focusInput: navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘K' : 'Ctrl+K',
      clearChat: navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘⇧⌫' : 'Ctrl+Shift+Del',
      toggleTheme: navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? '⌘⇧T' : 'Ctrl+Shift+T',
    }
  };
};
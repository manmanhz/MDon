import { useCallback } from 'react';

export function useFileOperations() {
  const handleNew = useCallback(() => {
    return '# New Document\n\nStart writing...';
  }, []);

  const handleSave = useCallback(async (currentFilePath, content) => {
    if (window.electronAPI) {
      const result = await window.electronAPI.saveFile(currentFilePath, content);
      return result;
    }
    return { success: false, error: 'No electron API' };
  }, []);

  return {
    handleNew,
    handleSave
  };
}

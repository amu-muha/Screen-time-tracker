import activeWin from 'active-win';

export async function getFocusedWindowOther() {
  const win = await activeWin();
  if (!win) {
    throw new Error('No active window detected');
  }
  return {
    app_name: win.owner?.name || 'unknown',
    window_title: win.title || null
  };
}
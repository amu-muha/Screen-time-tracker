import { getFocusedWindowWayland } from './wayland.js';
import { getFocusedWindowOther } from './other-platforms.js';

const sessionType = process.env.XDG_SESSION_TYPE;
const isLinuxWayland = process.platform === 'linux' && sessionType === 'wayland';

console.log(
  isLinuxWayland
    ? 'Detected Linux/Wayland session — using D-Bus "Focused Window D-Bus" extension'
    : `Detected ${process.platform}/${sessionType || 'n/a'} — using active-win`
);

export async function getFocusedWindow() {
  if (isLinuxWayland) {
    try {
      return await getFocusedWindowWayland();
    } catch (err) {
      // FR-6b: surface a clear message instead of silently recording nothing
      throw new Error(
        'Could not reach the "Focused Window D-Bus" GNOME extension. ' +
        'Make sure it is installed and enabled (Extension Manager → Focused Window D-Bus). ' +
        `Original error: ${err.message}`
      );
    }
  }
  return getFocusedWindowOther();
}
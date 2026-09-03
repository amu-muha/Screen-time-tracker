import dbus from 'dbus-next';

let interfaceCache = null;

async function getInterface() {
  if (interfaceCache) return interfaceCache;

  const bus = dbus.sessionBus();
  const obj = await bus.getProxyObject(
    'org.gnome.Shell',
    '/org/gnome/shell/extensions/FocusedWindow'
  );
  interfaceCache = obj.getInterface('org.gnome.shell.extensions.FocusedWindow');
  return interfaceCache;
}

export async function getFocusedWindowWayland() {
  const iface = await getInterface();
  const jsonStr = await iface.Get(); // raw string, no gdbus text-format escaping involved
  const data = JSON.parse(jsonStr);

  return {
    app_name: data.wm_class || 'unknown',
    window_title: data.title || null
  };
}
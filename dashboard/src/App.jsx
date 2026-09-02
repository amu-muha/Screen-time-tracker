import { useEffect, useState } from 'react';

export default function App() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/usage')
      .then(res => res.json())
      .then(setEvents)
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>Usage</h1>
      {events.map(e => (
        <p key={e.id}>{e.app_name} — {e.duration_seconds}s</p>
      ))}
    </div>
  );
}
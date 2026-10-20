import { useEffect, useState } from 'react';
import { fetchUsage, fetchInsights } from '../api/client';
import DashboardHeader from '../components/DashboardHeader';
import SummaryCards from '../components/SummaryCards';
import UsageBreakdown from '../components/UsageBreakdown';
import InsightPanel from '../components/InsightPanel';

export default function DashboardPage({ deviceId, onSelectDevice, onOpenSettings }) {
  const [range, setRange] = useState('daily');
  const [usage, setUsage] = useState([]);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    function loadData(isInitial = false) {
      if (isInitial) setLoading(true);
      Promise.all([fetchUsage(range, deviceId), fetchInsights(range, deviceId)])
        .then(([usageData, insightData]) => {
          if (cancelled) return;
          setUsage(usageData);
          setInsight(insightData);
          setError(null);
        })
        .catch(err => { if (!cancelled) setError(err.message); })
        .finally(() => { if (!cancelled && isInitial) setLoading(false); });
    }

    loadData(true);
    const interval = setInterval(() => loadData(false), 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [range, deviceId]);

  return (
    <div className="card">
      <DashboardHeader
        range={range}
        onRangeChange={setRange}
        deviceId={deviceId}
        onSelectDevice={onSelectDevice}
        onOpenSettings={onOpenSettings}
      />

      {error ? (
        <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
          Couldn't load data — is the API running?
        </p>
      ) : (
        <>
          <SummaryCards usage={usage} />
          <div className="dashboard-columns">
            <UsageBreakdown usage={usage} />
            <InsightPanel insight={insight} loading={loading} />
          </div>
        </>
      )}
    </div>
  );
}
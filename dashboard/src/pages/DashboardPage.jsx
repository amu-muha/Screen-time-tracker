import { useEffect, useState } from 'react';
import { fetchUsage, fetchInsights } from '../api/client';
import DashboardHeader from '../api/components/DashboardHeader';
import SummaryCards from '../api/components/SummaryCards';
import UsageBreakdown from '../api/components/UsageBreakdown';
import InsightPanel from '../api/components/InsightPanel';

export default function DashboardPage({ deviceId, onOpenSettings }) {
  const [range, setRange] = useState('daily');
  const [usage, setUsage] = useState([]);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([fetchUsage(range, deviceId), fetchInsights(range, deviceId)])
      .then(([usageData, insightData]) => {
        if (cancelled) return;
        setUsage(usageData);
        setInsight(insightData);
      })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [range, deviceId]);

  return (
    <div className="card">
      <DashboardHeader range={range} onRangeChange={setRange} onOpenSettings={onOpenSettings} />

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
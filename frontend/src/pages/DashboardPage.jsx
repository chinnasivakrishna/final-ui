import React from 'react';
import { useAuth } from '../context/authContext.js';
import { SalesOverviewCard } from '../components/SalesOverviewCard.jsx';
import {
  useDashboardSummary,
  useHostingMetrics,
} from '../hooks/useEnterpriseQueries.js';
import { PageSpinner } from '../components/PageSpinner.jsx';

function HostingMetricsBar({ data, loading, error }) {
  if (loading && !data) {
    return (
      <div className="cp-metrics-bar" style={{ justifyContent: 'center', padding: '24px 0' }}>
        <span className="cp-muted">Loading hosting metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cp-metrics-bar" style={{ justifyContent: 'center', padding: '24px 0' }}>
        <span className="cp-muted" style={{ color: 'var(--cp-danger)' }}>{error}</span>
      </div>
    );
  }

  if (!data) return null;

  const metricsConfig = [
    { key: 'cpu', label: 'CPU Usage', formatVal: (v) => `${v}%` },
    { key: 'memory', label: 'Memory', formatVal: (v) => `${v} MB` },
    { key: 'io', label: 'Disk I/O', formatVal: (v) => `${v} KB/s` },
    { key: 'iops', label: 'IOPS', formatVal: (v) => String(v) },
    { key: 'ep', label: 'Entry Processes', formatVal: (v) => String(v) },
    { key: 'nproc', label: 'Processes', formatVal: (v) => String(v) },
  ];

  const getTrendInfo = (datapoints) => {
    if (!datapoints || datapoints.length < 2) {
      return { text: '0%', color: 'var(--cp-text-muted)' };
    }
    const prev = datapoints[datapoints.length - 2].usage;
    const curr = datapoints[datapoints.length - 1].usage;
    if (prev === 0) {
      const diff = curr - prev;
      if (diff === 0) return { text: '0%', color: 'var(--cp-text-muted)' };
      const pct = diff > 0 ? `+${diff}` : `${diff}`;
      return { text: pct, color: diff > 0 ? '#ef4444' : '#10b981' };
    }
    const pct = ((curr - prev) / prev) * 100;
    const rounded = Math.round(pct * 10) / 10;
    if (rounded === 0) return { text: '0%', color: 'var(--cp-text-muted)' };
    const text = rounded > 0 ? `+${rounded}%` : `${rounded}%`;
    return { text, color: rounded > 0 ? '#ef4444' : '#10b981' };
  };

  return (
    <div className="cp-metrics-bar">
      {metricsConfig.map((cfg) => {
        const metric = data[cfg.key];
        if (!metric) return null;
        const latest = metric.datapoints?.[metric.datapoints.length - 1]?.usage ?? 0;
        const trend = getTrendInfo(metric.datapoints);
        return (
          <div key={cfg.key} className="cp-metrics-bar-col">
            <span className="cp-metrics-bar-label">{cfg.label}</span>
            <div className="cp-metrics-bar-value-row">
              <span className="cp-metrics-bar-value">
                {cfg.formatVal(latest)}
              </span>
              <span className="cp-metrics-bar-trend" style={{ color: trend.color }}>
                {trend.text}
              </span>
            </div>
            <span className="cp-metrics-bar-limit">
              Limit: {cfg.formatVal(metric.limit)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardPage() {
  const { token, activeOrganization, user, branding } = useAuth();
  const { data, loading, error, refresh } = useDashboardSummary(token);

  const currentRole = String(
    activeOrganization?.roleCode ||
      user?.roleCode ||
      user?.role ||
      ''
  ).toLowerCase();

  const isSysAdmin =
    currentRole === 'sys_admin' ||
    currentRole === 'system_admin' ||
    String(user?.org_code || '').toLowerCase() === 'techtrole';

  const isOrgAdmin =
    !isSysAdmin &&
    (currentRole === 'organization_admin' ||
      currentRole === 'org_admin' ||
      currentRole === 'super_admin' ||
      currentRole === 'admin');

  const {
    data: metricsData,
    loading: metricsLoading,
    error: metricsError,
    refresh: refreshMetrics,
  } = useHostingMetrics(isOrgAdmin ? token : null);

  const handleRefreshAll = () => {
    refresh();
    if (isOrgAdmin) {
      refreshMetrics();
    }
  };

  if (loading && !data) {
    return <PageSpinner />;
  }

  const summary = data?.summary || {};
  const mostVisitedPages = summary.mostVisitedPages || [];
  const maxViews = Math.max(...mostVisitedPages.map((p) => p.views || 1), 1);
  const activeOrgName = branding?.appName || activeOrganization?.name || user?.org_code || 'Organization';

  return (
    <div className="cp-stack" style={{ gap: '24px' }}>
      {/* Dashboard Header */}
      <div className="cp-page-head" style={{ marginBottom: '8px' }}>
        <div>
          <h1 className="cp-page-title">
            {isSysAdmin
              ? 'System Admin Dashboard'
              : isOrgAdmin
              ? 'Organization Admin Dashboard'
              : 'Dashboard'}
          </h1>
          <p className="cp-muted" style={{ fontSize: '13px', marginTop: '4px' }}>
            {isSysAdmin
              ? 'Global platform management & system tenant overview'
              : `Overview for ${activeOrgName}`}
          </p>
        </div>
        <button type="button" className="cp-btn cp-btn-secondary" onClick={handleRefreshAll}>
          Refresh Analytics
        </button>
      </div>

      {error ? <div className="cp-alert">{error}</div> : null}

      {/* 1. SYSTEM ADMIN ONLY VIEW: Only total organizations & system tenant widgets */}
      {isSysAdmin ? (
        <section className="cp-dashboard-widgets">
          <SalesOverviewCard
            accentColor="#7c3aed"
            title="System Overview"
            subtitle="Global Platform & Tenant Metrics"
            rows={[
              {
                label: 'Total Organizations',
                value: loading ? '—' : String(summary.totalOrganizations ?? 0),
                delta: null,
              },
              {
                label: 'Total Members (All Organizations)',
                value: loading ? '—' : String(summary.totalMembersAllOrgs ?? 0),
                delta: null,
              },
            ]}
          />
          <SalesOverviewCard
            accentColor="#2563eb"
            title="Platform System Status"
            subtitle="System health & server runtime"
            rows={[
              { label: 'System Engine', value: 'Online & Active', delta: null },
              { label: 'Database Connection', value: 'MySQL Connected', delta: null },
            ]}
          />
        </section>
      ) : isOrgAdmin ? (
        /* 2. ORGANIZATION ADMIN VIEW: Complete organization metrics & pages analytics */
        <>
          <HostingMetricsBar
            data={metricsData}
            loading={metricsLoading}
            error={metricsError}
          />

          {/* Grid of Organization Specific Widgets */}
          <section className="cp-dashboard-widgets">
            {/* Accounts Widget */}
            <SalesOverviewCard
              accentColor="#16a34a"
              title="Accounts & Users"
              subtitle={`User management for ${activeOrgName}`}
              rows={[
                { label: 'Active Account Members', value: loading ? '—' : String(summary.activeMembers ?? 0), delta: null },
                { label: 'Configured Roles', value: loading ? '—' : String(summary.totalRoles ?? 0), delta: null },
                { label: 'Pending Approvals', value: loading ? '—' : String(summary.pendingApprovals ?? 0), delta: null },
              ]}
            />

            {/* Products Widget */}
            <SalesOverviewCard
              accentColor="#2563eb"
              title="Products & Categories"
              subtitle="Inventory & catalog structure"
              rows={[
                { label: 'Total Products', value: loading ? '—' : String(summary.totalProducts ?? 0), delta: null },
                { label: 'Categories & Subcategories', value: loading ? '—' : `${summary.totalCategories ?? 0} Cat / ${summary.totalSubCategories ?? 0} Sub`, delta: null },
                { label: 'Total Product Variants', value: loading ? '—' : String(summary.totalVariants ?? 0), delta: null },
              ]}
            />

            {/* Blogs Widget */}
            <SalesOverviewCard
              accentColor="#ea580c"
              title="Blogs & Content"
              subtitle="Articles & post publications"
              rows={[
                { label: 'Total Blog Posts', value: loading ? '—' : String(summary.totalBlogs ?? 0), delta: null },
                { label: 'Live & Published Blogs', value: loading ? '—' : String(summary.liveBlogs ?? 0), delta: null },
              ]}
            />

            {/* Catalogs Widget */}
            <SalesOverviewCard
              accentColor="#0284c7"
              title="Catalogs & Documents"
              subtitle="Downloadable product files"
              rows={[
                { label: 'Active Catalogs', value: loading ? '—' : String(summary.totalCatalogs ?? 0), delta: null },
                { label: 'PDF Documents Status', value: 'Ready for Download', delta: null },
              ]}
            />

            {/* Careers Widget */}
            <SalesOverviewCard
              accentColor="#8b5cf6"
              title="Careers & Applications"
              subtitle="Job postings & candidates"
              rows={[
                { label: 'Active Job Openings', value: loading ? '—' : String(summary.totalCareers ?? 0), delta: null },
                { label: 'Applications & Requests', value: loading ? '—' : String(summary.totalApplications ?? 0), delta: null },
              ]}
            />

            {/* Web Visits Widget */}
            <SalesOverviewCard
              accentColor="#059669"
              title="Web Traffic & Visits"
              subtitle="Real-time website traffic metrics"
              rows={[
                { label: 'Total Web Visits', value: loading ? '—' : String(summary.totalWebVisits ?? 0), delta: null },
                { label: 'Unique Visitors', value: loading ? '—' : String(summary.uniqueVisitors ?? 0), delta: null },
              ]}
            />
          </section>

          {/* Most Visited Pages Table Widget */}
          <section className="cp-card cp-card-pad" style={{ marginTop: '8px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--cp-border, #E2E8F0)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9' }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0F172A', margin: 0, fontFamily: "'Poppins', sans-serif" }}>
                  Most Visited Pages ({activeOrgName})
                </h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>
                  Traffic breakdown of top pages visited by users of this organization
                </p>
              </div>
              <span className="cp-tag cp-tag-info" style={{ fontSize: '11px', padding: '4px 10px', fontWeight: '600' }}>
                Total Hits: {summary.totalWebVisits || 0}
              </span>
            </div>

            {mostVisitedPages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#64748B', fontSize: '13px' }}>
                No page visits logged for this organization yet.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="cp-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', fontSize: '11px', color: '#64748B', letterSpacing: '0.5px' }}>
                      <th style={{ textAlign: 'left', padding: '10px 14px' }}>Page Title</th>
                      <th style={{ textAlign: 'left', padding: '10px 14px' }}>URL Route</th>
                      <th style={{ textAlign: 'right', padding: '10px 14px' }}>Total Views</th>
                      <th style={{ textAlign: 'left', padding: '10px 14px', width: '220px' }}>Traffic Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mostVisitedPages.map((page, idx) => {
                      const pct = Math.round((page.views / maxViews) * 100);
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', fontSize: '13px', color: '#334155' }}>
                          <td style={{ padding: '12px 14px', fontWeight: '600', color: '#0F172A' }}>
                            {page.title}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <code style={{ fontSize: '12px', background: '#F1F5F9', padding: '2px 6px', borderRadius: '4px', color: '#0284C7' }}>
                              {page.route}
                            </code>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '700', color: '#0F172A' }}>
                            {page.views.toLocaleString()}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ flex: 1, background: '#E2E8F0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    width: `${pct}%`,
                                    height: '100%',
                                    background: idx === 0 ? '#2563EB' : idx === 1 ? '#0D63C9' : idx === 2 ? '#0284C7' : '#38BDF8',
                                    borderRadius: '4px',
                                    transition: 'width 0.4s ease',
                                  }}
                                />
                              </div>
                              <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748B', width: '36px', textAlign: 'right' }}>
                                {pct}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : (
        /* 3. NON-ADMIN MEMBER VIEW */
        <div className="cp-card cp-card-pad" style={{ padding: '32px', textAlign: 'center', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--cp-border)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', marginBottom: '8px' }}>
            Welcome to {activeOrgName} Workspace
          </h2>
          <p className="cp-muted" style={{ fontSize: '14px', maxWidth: '500px', margin: '0 auto' }}>
            Use the navigation sidebar to access your assigned modules, review content, and manage workflows.
          </p>
        </div>
      )}
    </div>
  );
}

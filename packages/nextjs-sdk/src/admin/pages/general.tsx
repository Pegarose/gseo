'use client';

import React, { useState } from 'react';
import { useAdminConfig } from '../context';
import { AdminBadge, AdminCard, AdminField, AdminInput } from '../components/ui';
import { SettingsLayout } from '../components/settings-layout';

export function SeoAdminGeneralSettings() {
  const { config, persist } = useAdminConfig();
  const editable = Boolean(persist);

  function updateField<K extends keyof typeof config>(key: K, value: (typeof config)[K]) {
    persist?.update({ [key]: value } as Partial<typeof config>);
  }

  const identity = (
    <AdminCard title="Site identity">
      {editable ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <AdminInput label="Site name" value={config.siteName} onChange={(v) => updateField('siteName', v)} />
          <AdminField label="Site URL (bootstrap)" value={config.siteUrl} mono />
          <AdminInput label="Default locale" value={config.defaultLocale} onChange={(v) => updateField('defaultLocale', v)} />
          <AdminInput label="Title separator" value={config.separator} onChange={(v) => updateField('separator', v)} />
          <AdminInput label="Default title" value={config.defaultTitle ?? ''} onChange={(v) => updateField('defaultTitle', v || undefined)} />
          <AdminInput label="Default description" value={config.defaultDescription ?? ''} onChange={(v) => updateField('defaultDescription', v || undefined)} />
        </div>
      ) : (
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <AdminField label="Site name" value={config.siteName} />
          <AdminField label="Site URL" value={config.siteUrl} mono />
        </dl>
      )}
    </AdminCard>
  );

  const links = (
    <AdminCard title="Links">
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={config.modules.links.nofollowExternal}
            disabled={!editable}
            onChange={(e) =>
              persist?.update({
                modules: { ...config.modules, links: { ...config.modules.links, nofollowExternal: e.target.checked } },
              })
            }
          />
          Nofollow external links
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={config.modules.links.openExternalInNewTab}
            disabled={!editable}
            onChange={(e) =>
              persist?.update({
                modules: { ...config.modules, links: { ...config.modules.links, openExternalInNewTab: e.target.checked } },
              })
            }
          />
          Open external links in new tab
        </label>
      </div>
    </AdminCard>
  );

  const breadcrumbs = (
    <AdminCard title="Breadcrumbs">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={config.schema.enableBreadcrumb}
          disabled={!editable}
          onChange={(e) =>
            persist?.update({ schema: { ...config.schema, enableBreadcrumb: e.target.checked } })
          }
        />
        Enable BreadcrumbList JSON-LD
      </label>
      <label className="mt-3 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={config.modules.breadcrumbs.enabled}
          disabled={!editable}
          onChange={(e) =>
            persist?.update({
              modules: { ...config.modules, breadcrumbs: { enabled: e.target.checked } },
            })
          }
        />
        Breadcrumbs module active
      </label>
    </AdminCard>
  );

  const webmaster = (
    <AdminCard title="Webmaster verification">
      {editable ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminInput label="Google" value={config.verification?.google ?? ''} onChange={(google) => persist?.update({ verification: { ...config.verification, google: google || undefined } })} />
          <AdminInput label="Bing" value={config.verification?.bing ?? ''} onChange={(bing) => persist?.update({ verification: { ...config.verification, bing: bing || undefined } })} />
          <AdminInput label="Yandex" value={config.verification?.yandex ?? ''} onChange={(yandex) => persist?.update({ verification: { ...config.verification, yandex: yandex || undefined } })} />
          <AdminInput label="Yahoo" value={config.verification?.yahoo ?? ''} onChange={(yahoo) => persist?.update({ verification: { ...config.verification, yahoo: yahoo || undefined } })} />
        </div>
      ) : (
        <p className="text-sm text-gray-500">Read-only — enable SettingsAdapter to edit.</p>
      )}
    </AdminCard>
  );

  const robots = (
    <>
      <AdminCard title="Robots defaults">
        {editable ? (
          <div className="flex flex-wrap gap-4">
            {(['index', 'follow', 'nocache'] as const).map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={config.robots[key]}
                  onChange={(e) => persist?.update({ robots: { ...config.robots, [key]: e.target.checked } })}
                />
                {key}
              </label>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <AdminBadge tone={config.robots.index ? 'success' : 'warning'}>Index</AdminBadge>
            <AdminBadge tone={config.robots.follow ? 'success' : 'warning'}>Follow</AdminBadge>
          </div>
        )}
      </AdminCard>
      <AdminCard title="Social defaults">
        {editable ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <AdminInput label="OG type" value={config.openGraph.type} onChange={(v) => persist?.update({ openGraph: { ...config.openGraph, type: v } })} />
            <AdminInput label="OG site name" value={config.openGraph.siteName ?? config.siteName} onChange={(v) => persist?.update({ openGraph: { ...config.openGraph, siteName: v } })} />
          </div>
        ) : null}
      </AdminCard>
      <AdminCard title="Organization schema">
        {config.schema.organization && editable ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <AdminInput label="Name" value={config.schema.organization.name} onChange={(name) => persist?.update({ schema: { ...config.schema, organization: { ...config.schema.organization!, name } } })} />
            <AdminInput label="Logo URL" value={config.schema.organization.logo ?? ''} onChange={(logo) => persist?.update({ schema: { ...config.schema, organization: { ...config.schema.organization!, logo: logo || undefined } } })} />
          </div>
        ) : (
          <p className="text-sm text-gray-500">{config.schema.organization?.name ?? 'Not configured'}</p>
        )}
      </AdminCard>
    </>
  );

  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
        <p className="mt-1 text-sm text-gray-500">RankMath-style global SEO configuration.</p>
      </div>
      <SettingsLayout
        defaultTab="identity"
        tabs={[
          { id: 'identity', label: 'Site Identity', content: identity },
          { id: 'links', label: 'Links', content: links },
          { id: 'breadcrumbs', label: 'Breadcrumbs', content: breadcrumbs },
          { id: 'webmaster', label: 'Webmaster', content: webmaster },
          { id: 'robots', label: 'Robots & Social', content: robots },
        ]}
      />
    </>
  );
}

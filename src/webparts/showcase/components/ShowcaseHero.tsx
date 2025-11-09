import * as React from 'react';

interface ShowcaseHeroProps {
  title: string;
  subtitle: string;
  gradient: string;
  badges?: string[];
  icon?: string;
}

/**
 * Shared hero/banner for showcase pages to keep look-and-feel consistent.
 */
export const ShowcaseHero: React.FC<ShowcaseHeroProps> = ({
  title,
  subtitle,
  gradient,
  badges = [],
  icon,
}) => {
  return (
    <section
      style={{
        background: gradient,
        color: 'white',
        padding: '48px 32px',
        borderRadius: '16px',
        marginBottom: '32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.14)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        {icon && (
          <div
            aria-hidden='true'
            style={{
              fontSize: '44px',
              background: 'rgba(255, 255, 255, 0.18)',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '72px',
              minHeight: '72px',
            }}
          >
            {icon}
          </div>
        )}
        <div style={{ flex: 1, minWidth: '240px' }}>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 700 }}>{title}</h1>
          <p style={{ margin: '12px 0 0 0', fontSize: '1.1rem', opacity: 0.95 }}>{subtitle}</p>
        </div>
      </div>

      {badges.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {badges.map((badge, index) => (
            <span
              key={`${badge}-${index}`}
              style={{
                background: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(8px)',
                padding: '10px 18px',
                borderRadius: '24px',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      )}
    </section>
  );
};

export default ShowcaseHero;

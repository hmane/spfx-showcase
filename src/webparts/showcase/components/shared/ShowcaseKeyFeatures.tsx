import * as React from 'react';

export interface ShowcaseFeature {
  title: string;
  description: string;
  icon?: string;
  color?: string;
}

interface ShowcaseKeyFeaturesProps {
  features: ShowcaseFeature[];
  title?: string;
}

/**
 * Consistent “Key Features” section reused across showcases.
 */
export const ShowcaseKeyFeatures: React.FC<ShowcaseKeyFeaturesProps> = ({
  features,
  title = 'Key Features',
}) => {
  if (!features.length) {
    return null;
  }

  return (
    <section
      style={{
        background: 'white',
        padding: '32px',
        borderRadius: '16px',
        marginTop: '32px',
        marginBottom: '32px',
        border: '2px solid #e9ecef',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
      }}
    >
      <h2 style={{ margin: '0 0 24px 0', fontSize: '1.8rem', color: '#323130' }}>{title}</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '18px',
        }}
      >
        {features.map((feature, index) => {
          const accent = feature.color || '#005a9e';
          return (
            <div
              key={`${feature.title}-${index}`}
              style={{
                background: `${accent}12`,
                padding: '24px',
                borderRadius: '12px',
                border: `2px solid ${accent}30`,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minHeight: '180px',
              }}
            >
              {feature.icon && (
                <div style={{ fontSize: '36px', lineHeight: 1 }} aria-hidden='true'>
                  {feature.icon}
                </div>
              )}
              <h3
                style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  color: accent,
                  fontWeight: 600,
                }}
              >
                {feature.title}
              </h3>
              <p style={{ margin: 0, color: '#323130', lineHeight: 1.6, fontSize: '0.95rem' }}>
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ShowcaseKeyFeatures;

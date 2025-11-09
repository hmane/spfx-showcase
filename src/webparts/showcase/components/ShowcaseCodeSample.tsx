import * as React from 'react';
import { Card, Content, Header } from 'spfx-toolkit/lib/components/Card';
import { CodeEditor } from '../../../components/CodeEditor';

interface ShowcaseCodeSampleProps {
  id: string;
  title: string;
  code: string;
  description?: string;
  language?: string;
}

/**
 * Shared code sample presenter so every showcase can display usage snippets consistently.
 * Now uses MonacoEditor for professional syntax highlighting.
 */
export const ShowcaseCodeSample: React.FC<ShowcaseCodeSampleProps> = ({
  id,
  title,
  code,
  description,
  language = 'tsx',
}) => {
  return (
    <Card id={id} elevation={3} defaultExpanded={true} style={{ marginTop: '24px' }}>
      <Header variant='info'>{title}</Header>
      <Content padding='comfortable'>
        {description && (
          <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: '#495057' }}>
            {description}
          </p>
        )}
        <CodeEditor
          value={code}
          language={language}
          readOnly={true}
          showLineNumbers={true}
          showMiniMap={false}
          theme="vs-dark"
          showCopyButton={true}
          showDownloadButton={false}
          languageBadge={language.toUpperCase()}
          autoHeight={true}
        />
      </Content>
    </Card>
  );
};

export default ShowcaseCodeSample;

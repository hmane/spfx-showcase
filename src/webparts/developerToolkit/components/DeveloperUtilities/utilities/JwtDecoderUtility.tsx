// src/components/DeveloperUtilities/utilities/JwtDecoderUtility.tsx

import {
  DefaultButton,
  IconButton,
  Label,
  MessageBar,
  MessageBarType,
  Stack,
  TextField
} from '@fluentui/react';
import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import { Card, CardAction, Content, Header } from 'spfx-toolkit/lib/components/Card';
import { useUtilityService } from '../context/UtilityContext';
import { useClipboard } from '../hooks/useClipboard';
import { useDebounce } from '../hooks/useDebounce';
import { BaseUtilityProps } from '../types/UtilityTypes';

interface JwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  headerRaw: string;
  payloadRaw: string;
}

interface JwtValidation {
  isValid: boolean;
  isExpired: boolean;
  expiresAt?: Date;
  issuedAt?: Date;
  notBefore?: Date;
  timeToExpiry?: string;
}

export const JwtDecoderUtility: React.FC<BaseUtilityProps> = ({
  id,
  title = 'JWT Decoder',
  shortcut = 'Ctrl+Shift+J',
}) => {
  const utilityService = useUtilityService();
  const { copyToClipboard, copyMessage, showMessage, clearMessage } = useClipboard();
  const [inputJwt, setInputJwt] = useState<string>('');
  const [jwtParts, setJwtParts] = useState<JwtParts | null>(null);
  const [validation, setValidation] = useState<JwtValidation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showRawPayload, setShowRawPayload] = useState<boolean>(false);

  // Base64 URL decode
  const base64UrlDecode = useCallback((str: string): string => {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    if (padding) {
      base64 += '='.repeat(4 - padding);
    }
    try {
      return decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      return atob(base64);
    }
  }, []);

  // Parse and decode JWT
  const parseJwt = useCallback(
    (token: string): JwtParts | null => {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format. Expected 3 parts separated by dots.');
      }

      try {
        const headerRaw = base64UrlDecode(parts[0]);
        const payloadRaw = base64UrlDecode(parts[1]);

        const header = JSON.parse(headerRaw);
        const payload = JSON.parse(payloadRaw);

        return {
          header,
          payload,
          signature: parts[2],
          headerRaw,
          payloadRaw,
        };
      } catch (error) {
        throw new Error(`Failed to parse JWT: ${(error as Error).message}`);
      }
    },
    [base64UrlDecode]
  );

  // Validate JWT claims
  const validateJwt = useCallback((payload: Record<string, unknown>): JwtValidation => {
    const now = Math.floor(Date.now() / 1000);

    const exp = typeof payload.exp === 'number' ? payload.exp : null;
    const iat = typeof payload.iat === 'number' ? payload.iat : null;
    const nbf = typeof payload.nbf === 'number' ? payload.nbf : null;

    const isExpired = exp !== null && exp < now;
    const isNotYetValid = nbf !== null && nbf > now;

    let timeToExpiry: string | undefined;
    if (exp !== null) {
      const seconds = exp - now;
      if (seconds > 0) {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (days > 0) {
          timeToExpiry = `${days}d ${hours}h ${minutes}m`;
        } else if (hours > 0) {
          timeToExpiry = `${hours}h ${minutes}m`;
        } else {
          timeToExpiry = `${minutes}m`;
        }
      } else {
        timeToExpiry = 'Expired';
      }
    }

    return {
      isValid: !isExpired && !isNotYetValid,
      isExpired,
      expiresAt: exp !== null ? new Date(exp * 1000) : undefined,
      issuedAt: iat !== null ? new Date(iat * 1000) : undefined,
      notBefore: nbf !== null ? new Date(nbf * 1000) : undefined,
      timeToExpiry,
    };
  }, []);

  // Process JWT
  const processJwt = useCallback(
    (token: string): void => {
      if (!token.trim()) {
        setJwtParts(null);
        setValidation(null);
        setErrorMessage('');
        return;
      }

      try {
        const parts = parseJwt(token);
        if (parts) {
          setJwtParts(parts);

          const val = validateJwt(parts.payload);
          setValidation(val);

          setErrorMessage('');
        }
      } catch (error) {
        setJwtParts(null);
        setValidation(null);
        setErrorMessage((error as Error).message);
      }
    },
    [parseJwt, validateJwt]
  );

  // Debounced input processing
  const debouncedProcess = useDebounce((token: string) => {
    processJwt(token);
  }, 300);

  // Handle input change
  const handleInputChange = useCallback(
    (ev?: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
      const value = newValue || '';
      setInputJwt(value);
      debouncedProcess(value);
    },
    [debouncedProcess]
  );

  // Copy section to clipboard
  const copySection = useCallback(
    async (data: unknown, label: string): Promise<void> => {
      const jsonString = JSON.stringify(data, null, 2);
      await copyToClipboard(jsonString, `${label} copied!`);
    },
    [copyToClipboard]
  );

  // Load sample JWT
  const loadSample = useCallback((): void => {
    // Sample JWT with common claims
    const sampleJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiZW1haWwiOiJqb2huLmRvZUBjb250b3NvLmNvbSIsInJvbGVzIjpbImFkbWluIiwidXNlciJdLCJpYXQiOjE3MDk4MzkzNjAsImV4cCI6MjAyNTE5OTM2MH0.6vC0qK9YZ4FJ-7jXPHs9_Q7Xk6ZnI8wV4J6BqY5g8hI';
    setInputJwt(sampleJwt);
    processJwt(sampleJwt);
  }, [processJwt]);

  // Copy individual claim value
  const copyClaim = useCallback(
    async (key: string, value: unknown): Promise<void> => {
      const valueStr = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
      await copyToClipboard(valueStr, `${key} copied!`);
    },
    [copyToClipboard]
  );

  // Clear all
  const clearAll = useCallback((): void => {
    setInputJwt('');
    setJwtParts(null);
    setValidation(null);
    setErrorMessage('');
    setShowRawPayload(false);
  }, []);

  // Set up keyboard shortcut
  React.useEffect(() => {
    const shortcuts = new Map<string, () => void>();
    shortcuts.set('ctrl+shift+j', () => {
      const textField = document.querySelector(`#${id} textarea`) as HTMLTextAreaElement;
      if (textField) {
        textField.focus();
      }
    });

    const cleanup = utilityService.setupGlobalShortcuts(shortcuts);
    return cleanup;
  }, [id, utilityService]);

  const actions: CardAction[] = useMemo(
    () => [
      {
        id: 'sample',
        label: 'Sample',
        icon: 'DocumentSet',
        onClick: loadSample,
        variant: 'primary',
        tooltip: 'Load sample JWT',
      },
      {
        id: 'clear',
        label: 'Clear',
        icon: 'Clear',
        onClick: clearAll,
        variant: 'secondary',
        tooltip: 'Clear JWT and results',
      },
    ],
    [clearAll, loadSample]
  );

  // Format claim value for display
  const formatClaimValue = useCallback((value: unknown): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    if (typeof value === 'number') {
      // Check if it looks like a timestamp
      if (value > 1000000000 && value < 9999999999) {
        const date = new Date(value * 1000);
        return `${value} (${date.toLocaleString()})`;
      }
    }
    return String(value);
  }, []);

  // Get common claim descriptions
  const getClaimDescription = useCallback((claim: string): string => {
    const descriptions: Record<string, string> = {
      iss: 'Issuer - identifies the principal that issued the JWT',
      sub: 'Subject - identifies the principal that is the subject of the JWT',
      aud: 'Audience - identifies the recipients that the JWT is intended for',
      exp: 'Expiration Time - identifies the expiration time after which the JWT must not be accepted',
      nbf: 'Not Before - identifies the time before which the JWT must not be accepted',
      iat: 'Issued At - identifies the time at which the JWT was issued',
      jti: 'JWT ID - provides a unique identifier for the JWT',
      name: 'Name - full name of the user',
      email: 'Email - email address of the user',
      email_verified: 'Email Verified - whether the email has been verified',
      preferred_username:
        'Preferred Username - shorthand name by which the user wishes to be referred to',
      given_name: 'Given Name - given or first name of the user',
      family_name: 'Family Name - surname or last name of the user',
      roles: 'Roles - list of roles assigned to the user',
      scope: 'Scope - list of OAuth 2.0 scopes',
      azp: 'Authorized Party - the party to which the ID Token was issued',
      auth_time: 'Authentication Time - time when the authentication occurred',
    };
    return descriptions[claim] || '';
  }, []);

  // Check if claim is important/standard
  const isImportantClaim = useCallback((claim: string): boolean => {
    const important = ['exp', 'iat', 'nbf', 'iss', 'sub', 'aud', 'roles', 'scope', 'email', 'name'];
    return important.includes(claim);
  }, []);

  return (
    <Card id={id} size='regular'>
      <Header actions={actions}>
        {title} ({shortcut})
      </Header>
      <Content>
        <Stack tokens={{ childrenGap: 12 }}>
          {/* Input JWT */}
          <div>
            <Label required>JWT Token</Label>
            <TextField
              placeholder='Paste JWT token here...'
              value={inputJwt}
              onChange={handleInputChange}
              multiline
              rows={4}
              styles={{
                field: {
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '11px',
                  wordBreak: 'break-all',
                },
                fieldGroup: {
                  borderColor: errorMessage ? '#d13438' : undefined,
                },
              }}
              ariaLabel='JWT token input'
            />
            {errorMessage && (
              <div style={{ color: '#d13438', fontSize: '11px', marginTop: '4px' }} role='alert'>
                {errorMessage}
              </div>
            )}
          </div>

          {/* Validation Status */}
          {validation && jwtParts && (
            <div
              style={{
                padding: '12px',
                backgroundColor: validation.isValid ? '#e8f5e9' : '#fff8f0',
                borderRadius: '4px',
                border: `1px solid ${validation.isValid ? '#81c784' : '#ffcc80'}`,
              }}
            >
              <Stack tokens={{ childrenGap: 8 }}>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>
                  Status: {validation.isValid ? '✓ Valid' : '⚠ Invalid'}
                </div>
                {validation.isExpired && (
                  <div style={{ fontSize: '11px', color: '#d13438' }}>Token is expired</div>
                )}
                {validation.expiresAt && (
                  <div style={{ fontSize: '11px' }}>
                    <strong>Expires:</strong> {validation.expiresAt.toLocaleString()}
                    {validation.timeToExpiry && ` (${validation.timeToExpiry})`}
                  </div>
                )}
                {validation.issuedAt && (
                  <div style={{ fontSize: '11px' }}>
                    <strong>Issued:</strong> {validation.issuedAt.toLocaleString()}
                  </div>
                )}
                {validation.notBefore && (
                  <div style={{ fontSize: '11px' }}>
                    <strong>Not Before:</strong> {validation.notBefore.toLocaleString()}
                  </div>
                )}
              </Stack>
            </div>
          )}

          {/* Header */}
          {jwtParts && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #e1e5e9',
              }}
            >
              <Stack
                horizontal
                horizontalAlign='space-between'
                verticalAlign='center'
                style={{ marginBottom: '8px' }}
              >
                <h4 style={{ margin: 0, fontSize: '14px' }}>Header</h4>
                <IconButton
                  iconProps={{ iconName: 'Copy' }}
                  title='Copy header'
                  ariaLabel='Copy JWT header'
                  onClick={() => copySection(jwtParts.header, 'Header')}
                  styles={{ root: { height: 24 } }}
                />
              </Stack>
              <pre
                style={{
                  margin: 0,
                  padding: '8px',
                  backgroundColor: '#ffffff',
                  borderRadius: '4px',
                  fontSize: '11px',
                  overflow: 'auto',
                  maxHeight: '200px',
                  fontFamily: 'Consolas, Monaco, monospace',
                }}
              >
                {JSON.stringify(jwtParts.header, null, 2)}
              </pre>
            </div>
          )}

          {/* Payload */}
          {jwtParts && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #e1e5e9',
              }}
            >
              <Stack
                horizontal
                horizontalAlign='space-between'
                verticalAlign='center'
                style={{ marginBottom: '8px' }}
              >
                <h4 style={{ margin: 0, fontSize: '14px' }}>Payload (Claims)</h4>
                <Stack horizontal tokens={{ childrenGap: 4 }}>
                  <DefaultButton
                    text={showRawPayload ? 'Formatted' : 'Raw'}
                    iconProps={{ iconName: showRawPayload ? 'TextDocument' : 'Code' }}
                    onClick={() => setShowRawPayload(!showRawPayload)}
                    styles={{ root: { height: 24, padding: '0 8px' } }}
                    title='Toggle between formatted and raw view'
                  />
                  <IconButton
                    iconProps={{ iconName: 'Copy' }}
                    title='Copy payload'
                    ariaLabel='Copy JWT payload'
                    onClick={() => copySection(jwtParts.payload, 'Payload')}
                    styles={{ root: { height: 24 } }}
                  />
                </Stack>
              </Stack>
              {showRawPayload ? (
                <pre
                  style={{
                    margin: 0,
                    padding: '8px',
                    backgroundColor: '#ffffff',
                    borderRadius: '4px',
                    fontSize: '11px',
                    overflow: 'auto',
                    maxHeight: '400px',
                    fontFamily: 'Consolas, Monaco, monospace',
                  }}
                >
                  {JSON.stringify(jwtParts.payload, null, 2)}
                </pre>
              ) : (
                <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', padding: '8px' }}>
                  {Object.entries(jwtParts.payload).map(([key, value]) => {
                    const important = isImportantClaim(key);
                    return (
                      <div
                        key={key}
                        style={{
                          padding: '8px',
                          borderBottom: '1px solid #f0f0f0',
                          backgroundColor: important ? '#f0f9ff' : 'transparent',
                          borderRadius: important ? '4px' : '0',
                          marginBottom: important ? '4px' : '0',
                        }}
                      >
                        <Stack horizontal horizontalAlign='space-between' verticalAlign='start'>
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: '11px',
                                fontWeight: 600,
                                color: important ? '#0078d4' : '#323130',
                              }}
                            >
                              {key}
                              {important && (
                                <span
                                  style={{
                                    marginLeft: '6px',
                                    fontSize: '9px',
                                    color: '#0078d4',
                                    fontWeight: 'normal',
                                  }}
                                >
                                  ⭐
                                </span>
                              )}
                            </div>
                            <div
                              style={{
                                fontSize: '11px',
                                fontFamily: 'Consolas, Monaco, monospace',
                                marginTop: '2px',
                                wordBreak: 'break-all',
                              }}
                            >
                              {formatClaimValue(value)}
                            </div>
                            {getClaimDescription(key) && (
                              <div
                                style={{
                                  fontSize: '10px',
                                  color: '#666',
                                  fontStyle: 'italic',
                                  marginTop: '2px',
                                }}
                              >
                                {getClaimDescription(key)}
                              </div>
                            )}
                          </div>
                          <IconButton
                            iconProps={{ iconName: 'Copy' }}
                            title={`Copy ${key} value`}
                            ariaLabel={`Copy ${key} value`}
                            onClick={() => copyClaim(key, value)}
                            styles={{ root: { minWidth: '24px', width: '24px', height: '24px' } }}
                          />
                        </Stack>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Signature */}
          {jwtParts && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #e1e5e9',
              }}
            >
              <Stack
                horizontal
                horizontalAlign='space-between'
                verticalAlign='center'
                style={{ marginBottom: '8px' }}
              >
                <h4 style={{ margin: 0, fontSize: '14px' }}>Signature</h4>
                <IconButton
                  iconProps={{ iconName: 'Copy' }}
                  title='Copy signature'
                  ariaLabel='Copy JWT signature'
                  onClick={() => copyToClipboard(jwtParts.signature, 'Signature copied!')}
                  styles={{ root: { height: 24 } }}
                />
              </Stack>
              <div
                style={{
                  padding: '8px',
                  backgroundColor: '#ffffff',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'Consolas, Monaco, monospace',
                  wordBreak: 'break-all',
                }}
              >
                {jwtParts.signature}
              </div>
              <div
                style={{ fontSize: '10px', color: '#666', marginTop: '4px', fontStyle: 'italic' }}
              >
                Note: Signature verification requires the secret key and is not performed by this
                tool
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
            <DefaultButton
              text='Load Sample'
              iconProps={{ iconName: 'DocumentSet' }}
              onClick={loadSample}
              title='Load sample JWT token'
              styles={{ root: { padding: '8px 16px' } }}
            />
            <DefaultButton
              text='Clear'
              iconProps={{ iconName: 'Clear' }}
              onClick={clearAll}
              title='Clear JWT and results'
              styles={{ root: { padding: '8px 16px' } }}
            />
          </Stack>

          {/* Success Messages */}
          {showMessage && (
            <MessageBar
              messageBarType={
                copyMessage.includes('Failed') ? MessageBarType.error : MessageBarType.success
              }
              isMultiline={false}
              onDismiss={clearMessage}
              dismissButtonAriaLabel='Close'
              role='alert'
              aria-live='polite'
            >
              {copyMessage}
            </MessageBar>
          )}

          {/* Information */}
          <div
            style={{
              fontSize: '11px',
              color: '#003a6b',
              padding: '8px',
              backgroundColor: '#f0f9ff',
              borderRadius: '4px',
              border: '1px solid #b3d6fc',
            }}
          >
            <strong>About JWT Tokens:</strong>
            <br />
            JSON Web Tokens consist of three parts: Header, Payload, and Signature.
            <br />
            This tool decodes and displays the content but does NOT verify signatures.
            <br />
            Never paste production tokens containing sensitive data in public tools.
          </div>

          {/* Tips */}
          <div
            style={{
              fontSize: '11px',
              color: '#666',
              fontStyle: 'italic',
            }}
          >
            Press {shortcut} to focus input • Auto-decodes as you paste • Shows expiration status •
            Click copy buttons to copy individual sections
          </div>
        </Stack>
      </Content>
    </Card>
  );
};

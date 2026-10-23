import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import CodeIcon from '@mui/icons-material/Code';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import '../theme/prism-vsc-theme.css';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'typescript',
  title,
}) => {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState('');

  useEffect(() => {
    const langKey = language.toLowerCase();
    const grammar =
      Prism.languages[langKey] ||
      Prism.languages.typescript ||
      Prism.languages.javascript;

    if (grammar) {
      try {
        const highlighted = Prism.highlight(code.trim(), grammar, langKey);
        setHighlightedCode(highlighted);
      } catch {
        setHighlightedCode(escapeHtml(code.trim()));
      }
    } else {
      setHighlightedCode(escapeHtml(code.trim()));
    }
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      sx={{
        borderRadius: '8px',
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? '#141414' : '#f7f7f8',
        overflow: 'hidden',
        my: 2.5,
        boxShadow: (theme) =>
          theme.palette.mode === 'dark'
            ? '0 4px 20px rgba(0,0,0,0.5)'
            : '0 2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* Code Header Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 0.85,
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? '#1a1a1a' : '#ececed',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          {/* Subtle Window Dots */}
          <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
            <Box
              sx={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? '#333333' : '#cccccc',
              }}
            />
            <Box
              sx={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? '#333333' : '#cccccc',
              }}
            />
            <Box
              sx={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? '#333333' : '#cccccc',
              }}
            />
          </Box>

          <CodeIcon sx={{ fontSize: 15, opacity: 0.6, ml: 0.5 }} />
          <Typography
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 700,
              fontSize: '11px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              opacity: 0.85,
            }}
          >
            {title || language}
          </Typography>
        </Box>

        <Tooltip title={copied ? 'Copied to clipboard' : 'Copy code'}>
          <IconButton
            size="small"
            onClick={handleCopy}
            sx={{
              p: 0.5,
              color: 'text.secondary',
              '&:hover': { color: 'text.primary' },
            }}
          >
            {copied ? <CheckIcon sx={{ fontSize: 16 }} /> : <ContentCopyIcon sx={{ fontSize: 16 }} />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Code Content Container */}
      <Box
        component="pre"
        className={`language-${language}`}
        sx={{
          p: 2,
          m: 0,
          overflowX: 'auto',
          fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
          fontSize: '13px',
          lineHeight: 1.65,
          backgroundColor: 'transparent',
        }}
      >
        <code
          className={`language-${language}`}
          dangerouslySetInnerHTML={{
            __html: highlightedCode || escapeHtml(code.trim()),
          }}
        />
      </Box>
    </Box>
  );
};

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

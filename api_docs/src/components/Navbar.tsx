import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Button,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useDocTheme } from '../theme/ThemeContext';

export type NavTab = 'home' | 'install' | 'frameworks' | 'quickstart' | 'architecture' | 'api';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenSearch,
}) => {
  const { themeMode, setThemeMode, resolvedMode } = useDocTheme();
  const [themeMenuAnchor, setThemeMenuAnchor] = useState<null | HTMLElement>(null);

  const handleOpenThemeMenu = (e: React.MouseEvent<HTMLElement>) => {
    setThemeMenuAnchor(e.currentTarget);
  };

  const handleCloseThemeMenu = () => {
    setThemeMenuAnchor(null);
  };

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'install', label: 'Installation' },
    { id: 'frameworks', label: 'Frameworks' },
    { id: 'quickstart', label: 'Quickstart' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'api', label: 'API Reference' },
  ];

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(10, 10, 10, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '60px', px: { xs: 2, md: 3 } }}>
        {/* Brand with White Logo */}
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
          onClick={() => onSelectTab('home')}
        >
          <Box
            component="img"
            src="/logo/whitelogo.png"
            alt="ThreeDot Logo"
            sx={{
              height: 28,
              width: 'auto',
              display: 'block',
              filter: resolvedMode === 'light' ? 'invert(1)' : 'none',
              transition: 'filter 0.2s ease',
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: '18px',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            ThreeDot
            <Box
              component="span"
              sx={{
                fontSize: '10px',
                fontFamily: 'monospace',
                px: 0.75,
                py: 0.2,
                borderRadius: '4px',
                border: '1px solid',
                borderColor: 'divider',
                color: 'text.secondary',
              }}
            >
              v0.1.0
            </Box>
          </Typography>
        </Box>

        {/* Main Navigation Links */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <Button
                key={item.id}
                size="small"
                onClick={() => onSelectTab(item.id)}
                sx={{
                  color: isActive ? 'text.primary' : 'text.secondary',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '13px',
                  px: 1.5,
                  py: 0.6,
                  borderRadius: '6px',
                  backgroundColor: isActive
                    ? (theme) => (theme.palette.mode === 'dark' ? '#1c1c1c' : '#eeeeee')
                    : 'transparent',
                  '&:hover': {
                    color: 'text.primary',
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? '#181818' : '#f4f4f4',
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>

        {/* Action Controls: Search, Theme, GitHub */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={onOpenSearch}
            startIcon={<SearchIcon sx={{ fontSize: 16 }} />}
            sx={{
              borderColor: 'divider',
              color: 'text.secondary',
              fontSize: '12px',
              px: 1.5,
              py: 0.5,
              borderRadius: '6px',
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? '#111111' : '#f7f7f7',
              '&:hover': {
                borderColor: 'text.primary',
                color: 'text.primary',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? '#181818' : '#efefef',
              },
            }}
          >
            Search
            <Box
              component="kbd"
              sx={{
                ml: 1,
                fontSize: '10px',
                fontFamily: 'monospace',
                px: 0.5,
                borderRadius: '3px',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              /
            </Box>
          </Button>

          {/* Theme Selector */}
          <Tooltip title={`Current theme: ${themeMode}`}>
            <IconButton
              size="small"
              onClick={handleOpenThemeMenu}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                p: 0.75,
              }}
            >
              {themeMode === 'system' ? (
                <SettingsBrightnessIcon sx={{ fontSize: 18 }} />
              ) : resolvedMode === 'dark' ? (
                <DarkModeOutlinedIcon sx={{ fontSize: 18 }} />
              ) : (
                <LightModeOutlinedIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={themeMenuAnchor}
            open={Boolean(themeMenuAnchor)}
            onClose={handleCloseThemeMenu}
            PaperProps={{
              sx: {
                minWidth: 140,
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 8px 24px rgba(0,0,0,0.6)'
                    : '0 8px 24px rgba(0,0,0,0.1)',
              },
            }}
          >
            <MenuItem
              selected={themeMode === 'light'}
              onClick={() => {
                setThemeMode('light');
                handleCloseThemeMenu();
              }}
            >
              <ListItemIcon>
                <LightModeOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: '13px' }}>Light</ListItemText>
            </MenuItem>
            <MenuItem
              selected={themeMode === 'dark'}
              onClick={() => {
                setThemeMode('dark');
                handleCloseThemeMenu();
              }}
            >
              <ListItemIcon>
                <DarkModeOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: '13px' }}>Dark</ListItemText>
            </MenuItem>
            <MenuItem
              selected={themeMode === 'system'}
              onClick={() => {
                setThemeMode('system');
                handleCloseThemeMenu();
              }}
            >
              <ListItemIcon>
                <SettingsBrightnessIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: '13px' }}>System</ListItemText>
            </MenuItem>
          </Menu>

          <Tooltip title="GitHub Repository">
            <IconButton
              size="small"
              component="a"
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                p: 0.75,
              }}
            >
              <GitHubIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

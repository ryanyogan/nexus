import React from 'react';
// Import the original MDX components
import MDXComponents from '@theme-original/MDXComponents';

// Import all custom components
import {
  Terminal,
  Line,
  Text,
  Check,
  Cross,
  Warning,
  Info,
  Star,
  FeatureCard,
  FeatureGrid,
  SearchIcon,
  ServerIcon,
  ZapIcon,
  HistoryIcon,
  BookOpenIcon,
  TerminalIcon,
  DatabaseIcon,
  BrainIcon,
  KeyIcon,
  CloudIcon,
  CodeIcon,
  SparklesIcon,
  ArrowRightIcon,
  QuickStart,
  StatsGrid,
  StatItem,
  HeroSection,
  Button,
  ButtonGroup,
  StepList,
  Step,
  ApiEndpoint,
  ApiParam,
  ApiResponse,
  Tabs,
  Tab,
  DocTabs,
} from '../components';

export default {
  // Keep all the original components
  ...MDXComponents,
  
  // Terminal components
  Terminal,
  Line,
  Text,
  Check,
  Cross,
  Warning,
  Info,
  Star,
  
  // Feature cards
  FeatureCard,
  FeatureGrid,
  SearchIcon,
  ServerIcon,
  ZapIcon,
  HistoryIcon,
  BookOpenIcon,
  TerminalIcon,
  DatabaseIcon,
  BrainIcon,
  KeyIcon,
  CloudIcon,
  CodeIcon,
  SparklesIcon,
  ArrowRightIcon,
  
  // Quick start / Hero
  QuickStart,
  StatsGrid,
  StatItem,
  HeroSection,
  Button,
  ButtonGroup,
  
  // Steps
  StepList,
  Step,
  
  // API docs
  ApiEndpoint,
  ApiParam,
  ApiResponse,
  
  // Tabs
  Tabs,
  Tab,
  DocTabs,
};

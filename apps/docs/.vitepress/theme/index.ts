import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './custom.css'

// Import custom components
import Terminal from './components/Terminal.vue'
import FeatureCard from './components/FeatureCard.vue'
import FeatureGrid from './components/FeatureGrid.vue'
import StatsGrid from './components/StatsGrid.vue'
import StatItem from './components/StatItem.vue'
import CliCommand from './components/CliCommand.vue'
import ApiEndpoint from './components/ApiEndpoint.vue'
import Tabs from './components/Tabs.vue'
import Tab from './components/Tab.vue'
import Callout from './components/Callout.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    // Register global components
    app.component('Terminal', Terminal)
    app.component('FeatureCard', FeatureCard)
    app.component('FeatureGrid', FeatureGrid)
    app.component('StatsGrid', StatsGrid)
    app.component('StatItem', StatItem)
    app.component('CliCommand', CliCommand)
    app.component('ApiEndpoint', ApiEndpoint)
    app.component('Tabs', Tabs)
    app.component('Tab', Tab)
    app.component('Callout', Callout)
  },
} satisfies Theme

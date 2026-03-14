import React, { useState, type ReactNode } from 'react';

interface TabItem {
  label: string;
  value: string;
  children: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
}

/**
 * Tabs component for switching between different content
 */
export function Tabs({ items, defaultValue }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue || items[0]?.value);
  
  const activeItem = items.find(item => item.value === activeTab);

  return (
    <div className="tabs-container">
      <div className="tabs">
        {items.map((item) => (
          <button
            key={item.value}
            className={`tabs__item ${activeTab === item.value ? 'tabs__item--active' : ''}`}
            onClick={() => setActiveTab(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="tabs__content">
        {activeItem?.children}
      </div>
    </div>
  );
}

interface TabProps {
  label: string;
  value: string;
  children: ReactNode;
}

/**
 * Individual tab (for use with DocTabs)
 */
export function Tab({ children }: TabProps) {
  return <>{children}</>;
}

interface DocTabsProps {
  children: ReactNode;
  defaultValue?: string;
}

/**
 * DocTabs - wrapper that converts Tab children to Tabs items
 */
export function DocTabs({ children, defaultValue }: DocTabsProps) {
  const tabs = React.Children.toArray(children)
    .filter(React.isValidElement)
    .map((child) => {
      const props = child.props as TabProps;
      return {
        label: props.label,
        value: props.value,
        children: props.children,
      };
    });

  return <Tabs items={tabs} defaultValue={defaultValue} />;
}

export default Tabs;

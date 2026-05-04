import { motion } from "motion/react";
import { useState } from "react";

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: "underline" | "filled" | "segmented";
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultTab,
  onChange,
  variant = "underline"
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  if (variant === "underline") {
    return (
      <div>
        <div
          className="flex gap-6 border-b"
          style={{ borderBottomColor: "var(--b1-border-subtle)" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className="relative flex items-center gap-2 px-4 py-3 transition-colors"
              style={{
                color: activeTab === tab.id ? "var(--b1-white-space)" : "var(--b1-neutral-gray)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
                letterSpacing: "0.05em"
              }}
            >
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}

              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: "var(--b1-gold-trim)" }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          ))}
        </div>

        {activeTabContent && <div className="mt-6">{activeTabContent}</div>}
      </div>
    );
  }

  if (variant === "filled") {
    return (
      <div>
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className="flex items-center gap-2 px-4 py-2 transition-all"
              style={{
                backgroundColor:
                  activeTab === tab.id ? "var(--b1-gold-minimal)" : "var(--b1-obsidian-panel)",
                color:
                  activeTab === tab.id ? "var(--b1-black-marble)" : "var(--b1-white-space)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)"
              }}
            >
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTabContent && <div className="mt-6">{activeTabContent}</div>}
      </div>
    );
  }

  if (variant === "segmented") {
    return (
      <div>
        <div
          className="inline-flex p-1 gap-1"
          style={{
            backgroundColor: "var(--b1-obsidian-panel)",
            borderRadius: "var(--radius-lg)"
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className="flex items-center gap-2 px-4 py-2 transition-all"
              style={{
                backgroundColor:
                  activeTab === tab.id ? "var(--b1-gold-minimal)" : "transparent",
                color:
                  activeTab === tab.id ? "var(--b1-black-marble)" : "var(--b1-white-space)",
                borderRadius: "var(--radius-md)",
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)"
              }}
            >
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTabContent && <div className="mt-6">{activeTabContent}</div>}
      </div>
    );
  }

  return null;
};

import { useState } from "react";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { Card } from "../../components/core/Card";
import { Badge } from "../../components/core/Badge";

type StepStatus = "complete" | "in-progress" | "pending" | "blocked";

interface ExecutionStep {
  id: number;
  title: string;
  description: string;
  status: StepStatus;
  substeps?: {
    name: string;
    status: StepStatus;
  }[];
}

const initialSteps: ExecutionStep[] = [
  {
    id: 1,
    title: "Create Root Blueprint",
    description: "Save SYSTEM_BLUEPRINT.json as source of truth",
    status: "complete",
  },
  {
    id: 2,
    title: "Lock the Contract",
    description: "Treat blueprint as immutable source of truth",
    status: "complete",
  },
  {
    id: 3,
    title: "Generate Core Artifacts",
    description: "Create OpenAPI, Events, Database, and Infrastructure files",
    status: "in-progress",
    substeps: [
      { name: "OpenAPI Spec (67 endpoints)", status: "pending" },
      { name: "Event Catalog (35+ events)", status: "pending" },
      { name: "Database Schema (25+ tables)", status: "pending" },
      { name: "CloudFormation Template", status: "pending" },
    ],
  },
  {
    id: 4,
    title: "Deploy Infrastructure",
    description: "Deploy CloudFormation stack (VPC, RDS, EventBridge, Cognito, etc.)",
    status: "pending",
    substeps: [
      { name: "VPC created", status: "pending" },
      { name: "RDS PostgreSQL running", status: "pending" },
      { name: "EventBridge bus active", status: "pending" },
      { name: "Cognito user pools configured", status: "pending" },
      { name: "API Gateway deployed", status: "pending" },
      { name: "Lambda execution roles created", status: "pending" },
      { name: "CloudWatch logs/alarms configured", status: "pending" },
      { name: "Secrets Manager ready", status: "pending" },
    ],
  },
  {
    id: 5,
    title: "Apply Database Schema",
    description: "Run COMPLETE_SCHEMA.sql against RDS",
    status: "pending",
    substeps: [
      { name: "All 25+ tables created", status: "pending" },
      { name: "Foreign keys established", status: "pending" },
      { name: "Indexes created", status: "pending" },
      { name: "RLS policies applied", status: "pending" },
      { name: "Triggers configured", status: "pending" },
    ],
  },
  {
    id: 6,
    title: "Deploy All 11 Services",
    description: "Deploy all microservices via Serverless Framework",
    status: "pending",
    substeps: [
      { name: "stores-service", status: "pending" },
      { name: "customers-service", status: "pending" },
      { name: "inventory-service", status: "pending" },
      { name: "orders-service", status: "pending" },
      { name: "payments-service", status: "pending" },
      { name: "drivers-service", status: "pending" },
      { name: "staff-service", status: "pending" },
      { name: "metrics-service", status: "pending" },
      { name: "compliance-service", status: "pending" },
      { name: "notifications-service", status: "pending" },
      { name: "grc-service", status: "pending" },
    ],
  },
  {
    id: 7,
    title: "Deploy All 3 Frontends",
    description: "Deploy COC Portal, Chic Web, and Ghetto Eats via Amplify",
    status: "pending",
    substeps: [
      { name: "coc-portal → coc.glenkeos.com", status: "pending" },
      { name: "chic-web → chic.glenkeos.com", status: "pending" },
      { name: "ghetto-web → ghettoeats.glenkeos.com", status: "pending" },
    ],
  },
  {
    id: 8,
    title: "Wire Brand Logic",
    description: "Configure Chic, Ghetto Eats, and COC Portal integrations",
    status: "pending",
    substeps: [
      { name: "Chic-on-Chain (CHIC_FOOD order type)", status: "pending" },
      { name: "Ghetto Eats (GHETTO_EATS + campus fields)", status: "pending" },
      { name: "COC Portal (metrics, compliance, grc)", status: "pending" },
    ],
  },
  {
    id: 9,
    title: "Smoke Test Flows",
    description: "Test all critical user journeys",
    status: "pending",
    substeps: [
      { name: "Chic food order flow", status: "pending" },
      { name: "Ghetto Eats campus order flow", status: "pending" },
      { name: "COC corporate portal access", status: "pending" },
    ],
  },
  {
    id: 10,
    title: "Freeze V1",
    description: "Mark system as READY FOR PRODUCTION",
    status: "pending",
    substeps: [
      { name: "Update SYSTEM_STATUS.md", status: "pending" },
      { name: "Tag release v1.0.0", status: "pending" },
      { name: "Document production URLs", status: "pending" },
      { name: "Enable monitoring and alerts", status: "pending" },
      { name: "Go live", status: "pending" },
    ],
  },
];

const statusConfig = {
  complete: {
    icon: CheckCircle2,
    color: "bg-green-500",
    textColor: "text-green-600",
    label: "Complete",
    badgeVariant: "success" as const,
  },
  "in-progress": {
    icon: Clock,
    color: "bg-blue-500",
    textColor: "text-blue-600",
    label: "In Progress",
    badgeVariant: "info" as const,
  },
  pending: {
    icon: Circle,
    color: "bg-gray-300",
    textColor: "text-gray-500",
    label: "Pending",
    badgeVariant: "default" as const,
  },
  blocked: {
    icon: AlertCircle,
    color: "bg-red-500",
    textColor: "text-red-600",
    label: "Blocked",
    badgeVariant: "error" as const,
  },
};

export function ExecutionDashboard() {
  const [steps] = useState<ExecutionStep[]>(initialSteps);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([3]));

  const toggleStep = (stepId: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const completedSteps = steps.filter((s) => s.status === "complete").length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">
            GlenKeos Execution Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Fortune-500 Grade Platform Deployment
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Overall Progress
              </h2>
              <p className="text-sm text-gray-600">
                {completedSteps} of {steps.length} steps complete
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-600">
                {Math.round(progressPercentage)}%
              </div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
          <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </Card>

        {/* System Info */}
        <Card className="mb-8 p-6">
          <h3 className="mb-4 font-semibold text-gray-900">System Overview</h3>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">11</div>
              <div className="text-sm text-gray-600">Microservices</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">67</div>
              <div className="text-sm text-gray-600">API Endpoints</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">35+</div>
              <div className="text-sm text-gray-600">Event Types</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">25+</div>
              <div className="text-sm text-gray-600">Database Tables</div>
            </div>
          </div>
        </Card>

        {/* Execution Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => {
            const config = statusConfig[step.status];
            const Icon = config.icon;
            const isExpanded = expandedSteps.has(step.id);

            return (
              <Card key={step.id} className="overflow-hidden">
                <button
                  onClick={() => step.substeps && toggleStep(step.id)}
                  className="w-full p-6 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-start gap-4">
                    {/* Step Number & Status Icon */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-600">
                        {step.id}
                      </div>
                      <Icon className={`h-6 w-6 ${config.textColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {step.title}
                        </h3>
                        <Badge variant={config.badgeVariant}>
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-gray-600">{step.description}</p>

                      {step.substeps && (
                        <div className="mt-2 text-sm text-gray-500">
                          {step.substeps.filter((s) => s.status === "complete")
                            .length}{" "}
                          / {step.substeps.length} substeps complete
                        </div>
                      )}
                    </div>

                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                      <div className="absolute left-[3.25rem] top-[5.5rem] h-8 w-0.5 bg-gray-200" />
                    )}
                  </div>
                </button>

                {/* Substeps */}
                {step.substeps && isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50 p-6 pl-24">
                    <div className="space-y-2">
                      {step.substeps.map((substep, subIndex) => {
                        const subConfig = statusConfig[substep.status];
                        const SubIcon = subConfig.icon;

                        return (
                          <div
                            key={subIndex}
                            className="flex items-center gap-3"
                          >
                            <SubIcon
                              className={`h-5 w-5 ${subConfig.textColor}`}
                            />
                            <span className="text-gray-700">
                              {substep.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Footer Info */}
        <Card className="mt-8 bg-blue-50 p-6">
          <h3 className="mb-2 font-semibold text-blue-900">
            Deployment Timeline
          </h3>
          <p className="text-sm text-blue-800">
            <strong>Start:</strong> 2026-04-21 | <strong>Target:</strong> 60
            minutes | <strong>Source of Truth:</strong>{" "}
            /SYSTEM_BLUEPRINT.json
          </p>
        </Card>
      </div>
    </div>
  );
}

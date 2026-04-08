export interface Category {
  id: string;           // Filename without .md
  title: string;        // Display name
  description: string;  // What it covers
  size: string;         // Approximate size
  recommended: boolean; // Is this in the starter set?
}

export const categories: Category[] = [
  {
    id: "building-apis",
    title: "Building APIs",
    description: "HTTP APIs, routing, middleware, authentication",
    size: "~53KB",
    recommended: true
  },
  {
    id: "building-data-pipelines",
    title: "Building Data Pipelines",
    description: "Data pipelines, backpressure, batching",
    size: "~36KB",
    recommended: false
  },
  {
    id: "concurrency",
    title: "Concurrency",
    description: "Parallel execution, fibers, Deferred, Semaphore",
    size: "~62KB",
    recommended: true
  },
  {
    id: "concurrency-getting-started",
    title: "Concurrency Getting Started",
    description: "Concurrency fundamentals",
    size: "~7KB",
    recommended: false
  },
  {
    id: "core-concepts",
    title: "Core Concepts",
    description: "Effect.gen, pipe, map, flatMap, Option, Either",
    size: "~66KB",
    recommended: true
  },
  {
    id: "domain-modeling",
    title: "Domain Modeling",
    description: "Brand, Schema contracts, TaggedError",
    size: "~27KB",
    recommended: false
  },
  {
    id: "error-handling",
    title: "Error Handling",
    description: "Error handling patterns",
    size: "~24KB",
    recommended: false
  },
  {
    id: "error-handling-resilience",
    title: "Error Handling Resilience",
    description: "Resilient error handling strategies",
    size: "~2KB",
    recommended: false
  },
  {
    id: "error-management",
    title: "Error Management",
    description: "catchTag/catchAll, retry, Cause",
    size: "~35KB",
    recommended: true
  },
  {
    id: "getting-started",
    title: "Getting Started",
    description: "New Effect projects, first programs",
    size: "~3KB",
    recommended: true
  },
  {
    id: "making-http-requests",
    title: "Making HTTP Requests",
    description: "HttpClient, timeouts, caching",
    size: "~42KB",
    recommended: false
  },
  {
    id: "observability",
    title: "Observability",
    description: "Logging, metrics, tracing, OpenTelemetry",
    size: "~36KB",
    recommended: false
  },
  {
    id: "platform",
    title: "Platform",
    description: "Filesystem, shell commands, environment variables",
    size: "~23KB",
    recommended: false
  },
  {
    id: "platform-getting-started",
    title: "Platform Getting Started",
    description: "Platform fundamentals",
    size: "~3KB",
    recommended: false
  },
  {
    id: "project-setup--execution",
    title: "Project Setup & Execution",
    description: "Project setup and execution",
    size: "~3KB",
    recommended: false
  },
  {
    id: "resource-management",
    title: "Resource Management",
    description: "acquireRelease, Scope, pools",
    size: "~17KB",
    recommended: false
  },
  {
    id: "scheduling",
    title: "Scheduling",
    description: "Repeated tasks, cron, debounce, throttle",
    size: "~9KB",
    recommended: false
  },
  {
    id: "scheduling-periodic-tasks",
    title: "Scheduling Periodic Tasks",
    description: "Periodic task scheduling",
    size: "~15KB",
    recommended: false
  },
  {
    id: "streams",
    title: "Streams",
    description: "Stream, Sink, transforms, stateful operations",
    size: "~44KB",
    recommended: false
  },
  {
    id: "streams-getting-started",
    title: "Streams Getting Started",
    description: "Streams fundamentals",
    size: "~7KB",
    recommended: false
  },
  {
    id: "streams-sinks",
    title: "Streams Sinks",
    description: "Working with Sinks",
    size: "~27KB",
    recommended: false
  },
  {
    id: "testing",
    title: "Testing",
    description: "Mock layers, testing services, property-based testing",
    size: "~37KB",
    recommended: true
  },
  {
    id: "tooling-and-debugging",
    title: "Tooling and Debugging",
    description: "Editor setup, CI/CD, linting",
    size: "~22KB",
    recommended: false
  },
  {
    id: "value-handling",
    title: "Value Handling",
    description: "Working with values in Effect",
    size: "~14KB",
    recommended: false
  }
];

export const starterPreset = categories
  .filter(c => c.recommended)
  .map(c => c.id);

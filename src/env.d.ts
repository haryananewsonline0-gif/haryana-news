/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    runtime?: {
      env?: Record<string, string>;
      cf?: unknown;
      caches?: unknown;
    };
  }
}

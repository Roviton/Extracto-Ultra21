// Content from the newly attached monaco-environment-soyD4CxfcRdnfv3huXYKsIJhWUdnWY.tsx
// Ensure this file is imported at the VERY TOP of your app/layout.tsx
// e.g., import '@/lib/monaco-environment';

if (typeof self !== "undefined" && typeof self.MonacoEnvironment === "undefined") {
  console.log("Configuring MonacoEnvironment...")
  self.MonacoEnvironment = {
    getWorker: (_moduleId: any, label: string) => {
      let workerPath
      if (label === "json") {
        workerPath = "monaco-editor/esm/vs/language/json/json.worker.js"
      } else if (label === "css" || label === "scss" || label === "less") {
        workerPath = "monaco-editor/esm/vs/language/css/css.worker.js"
      } else if (label === "html" || label === "handlebars" || label === "razor") {
        workerPath = "monaco-editor/esm/vs/language/html/html.worker.js"
      } else if (label === "typescript" || label === "javascript") {
        workerPath = "monaco-editor/esm/vs/language/typescript/ts.worker.js"
      } else {
        workerPath = "monaco-editor/esm/vs/editor/editor.worker.js"
      }

      try {
        // Using new URL with import.meta.url is generally preferred for module environments
        const workerUrl = new URL(workerPath, import.meta.url)
        // console.log(`Creating worker for label: ${label}, path: ${workerUrl.href}`);
        return new Worker(workerUrl, {
          type: "module",
          name: `${label}-worker`,
        })
      } catch (e) {
        console.error(`Failed to create worker for label ${label} with path ${workerPath}`, e)
        // Fallback or alternative loading strategy if new URL fails in some contexts
        // This part might need adjustment based on how Next.js bundles/serves these workers.
        // For now, we'll let it throw if the primary method fails, to make the error obvious.
        throw e
      }
    },
  }
} else if (typeof self !== "undefined") {
  // console.log("MonacoEnvironment already configured or self is undefined.");
}

// Optional: A function to explicitly ensure the environment is set up.
export function ensureMonacoEnvironment() {
  if (
    typeof self !== "undefined" &&
    typeof self.MonacoEnvironment === "object" &&
    typeof self.MonacoEnvironment.getWorker === "function"
  ) {
    console.log("MonacoEnvironment is configured.")
  } else {
    console.warn("MonacoEnvironment is NOT configured correctly.")
  }
}

// To initialize, import this file once in your application's main entry point,
// for example, at the very top of your root layout.tsx.
// import '@/lib/monaco-environment';

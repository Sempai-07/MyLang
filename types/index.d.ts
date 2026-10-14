declare global {
  interface MyLangJSON {
   name?: string;
   version?: string;
   description?: string;
   author?: string | { name?: string; email?: string; url?: string };
   license?: string;
   repository?: string | { url?: string };
   homepage?: string;
   keywords?: string[];
   main?: string;
   entry?: string;
   scripts?: Record<string, string>;
   dependencies?: Record<string, string>;
   devDependencies?: Record<string, string>;
   [key: string]: any;
  }
}

export {};

import fs from "node:fs";
import tls from "node:tls";
import { HttpMethodBuilder } from "./HttpBuilder";

class HttpsCertificateManager extends HttpMethodBuilder {
  override call() {
    const certificates = new Map();

    return {
      loadCertificate: class extends HttpMethodBuilder {
        override call() {
          const [domain, certPath, keyPath] = this.args;

          try {
            const cert = fs.readFileSync(certPath);
            const key = fs.readFileSync(keyPath);

            certificates.set(domain, { cert, key });
            return true;
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            throw this.throwErrorFormatters(
              new Error(`Failed to load certificate: ${errorMessage}`),
            );
          }
        }
      },

      getCertificate: class extends HttpMethodBuilder {
        override call() {
          const [domain] = this.args;
          return certificates.get(domain) || null;
        }
      },

      createSecureContext: class extends HttpMethodBuilder {
        override call() {
          const [domain] = this.args;
          const certData = certificates.get(domain);

          if (!certData) {
            throw this.throwErrorFormatters(
              new Error(`No certificate found for domain: ${domain}`),
            );
          }

          return tls.createSecureContext({
            cert: certData.cert,
            key: certData.key,
          });
        }
      },
    };
  }
}

export { HttpsCertificateManager };

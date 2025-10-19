export namespace config {
    namespace server {
        let port: string | number;
        let nodeEnv: string;
        let MONGODB_URI: string | undefined;
        let JWT_SECRET: string | undefined;
    }
    namespace pythonAPI {
        let url: string;
        let timeout: number;
    }
    namespace cors {
        let frontendUrl: string;
    }
    namespace rateLimit {
        let windowMs: number;
        let maxRequests: number;
    }
    namespace logging {
        let level: string;
        let file: string;
    }
    namespace websocket {
        let heartbeatInterval: number;
        let heartbeatTimeout: number;
    }
    namespace security {
        let jwtSecret: string;
        let sessionSecret: string;
    }
}

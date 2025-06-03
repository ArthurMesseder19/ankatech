"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
// backend/src/server.ts
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const clientes_1 = require("./routes/clientes");
const ativos_1 = require("./routes/ativos");
const alocacoes_1 = require("./routes/alocacoes");
exports.app = (0, fastify_1.default)();
exports.app.register(cors_1.default, {
    origin: '*',
});
exports.app.register(clientes_1.clientesRoutes);
exports.app.register(ativos_1.ativosRoutes);
exports.app.register(alocacoes_1.alocacoesRoutes);
//# sourceMappingURL=index.js.map
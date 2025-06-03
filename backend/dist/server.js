"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const clientes_1 = require("./routes/clientes");
const ativos_1 = require("./routes/ativos");
const alocacoes_1 = require("./routes/alocacoes");
const app = (0, fastify_1.default)({ logger: true });
// Habilita CORS para permitir chamadas do frontend
app.register(cors_1.default, {
    origin: '*',
});
// Registra as rotas da aplicação
app.register(clientes_1.clientesRoutes);
app.register(ativos_1.ativosRoutes);
app.register(alocacoes_1.alocacoesRoutes);
// Inicia o servidor
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield app.listen({ port: 3000, host: '0.0.0.0' });
        console.log('✅ Backend rodando na porta 3000');
    }
    catch (err) {
        app.log.error(err);
        process.exit(1);
    }
});
start();
//# sourceMappingURL=server.js.map
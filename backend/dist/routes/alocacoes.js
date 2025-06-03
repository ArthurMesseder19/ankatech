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
Object.defineProperty(exports, "__esModule", { value: true });
exports.alocacoesRoutes = alocacoesRoutes;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function alocacoesRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        app.post('/alocacoes', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const schema = zod_1.z.object({
                clienteId: zod_1.z.number().int().positive(),
                ativoId: zod_1.z.number().int().positive(),
                quantidade: zod_1.z.number().positive(),
            });
            try {
                const { clienteId, ativoId, quantidade } = schema.parse(request.body);
                const alocacao = yield prisma.alocacaoAtivo.create({
                    data: {
                        clienteId,
                        ativoId,
                        quantidade,
                    }
                });
                return reply.code(201).send(alocacao);
            }
            catch (error) {
                return reply.code(400).send({ message: 'Erro ao criar alocação', error });
            }
        }));
    });
}
//# sourceMappingURL=alocacoes.js.map
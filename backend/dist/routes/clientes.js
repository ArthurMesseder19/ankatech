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
exports.clientesRoutes = clientesRoutes;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function clientesRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        // Listar todos os clientes com suas alocações e ativos
        app.get('/clientes', () => __awaiter(this, void 0, void 0, function* () {
            const clientes = yield prisma.cliente.findMany({
                include: {
                    alocacoes: {
                        include: {
                            ativo: true
                        }
                    }
                }
            });
            return clientes;
        }));
        // Criar um novo cliente
        app.post('/clientes', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const createClienteSchema = zod_1.z.object({
                nome: zod_1.z.string(),
                email: zod_1.z.string().email(),
                status: zod_1.z.boolean().optional().default(true),
            });
            const { nome, email, status } = createClienteSchema.parse(request.body);
            try {
                const cliente = yield prisma.cliente.create({
                    data: { nome, email, status },
                });
                return reply.code(201).send(cliente);
            }
            catch (error) {
                return reply.code(500).send({ error: 'Erro ao criar cliente', details: error });
            }
        }));
        // Buscar alocações de um cliente específico
        app.get('/clientes/:id/ativos', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const paramsSchema = zod_1.z.object({
                id: zod_1.z.string().regex(/^\d+$/, { message: 'ID inválido' })
            });
            const { id } = paramsSchema.parse(request.params);
            const cliente = yield prisma.cliente.findUnique({
                where: { id: Number(id) },
                include: {
                    alocacoes: {
                        include: {
                            ativo: true
                        }
                    }
                }
            });
            if (!cliente) {
                return reply.code(404).send({ message: 'Cliente não encontrado' });
            }
            return cliente;
        }));
    });
}
//# sourceMappingURL=clientes.js.map
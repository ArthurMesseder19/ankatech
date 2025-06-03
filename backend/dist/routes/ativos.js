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
exports.ativosRoutes = ativosRoutes;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function ativosRoutes(app) {
    return __awaiter(this, void 0, void 0, function* () {
        // Listar todos os ativos
        app.get('/ativos', () => __awaiter(this, void 0, void 0, function* () {
            return yield prisma.ativoFinanceiro.findMany();
        }));
        // Criar novo ativo
        app.post('/ativos', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const createAtivoSchema = zod_1.z.object({
                nome: zod_1.z.string().min(1, 'Nome é obrigatório'),
                valorAtual: zod_1.z.number().positive('O valor deve ser positivo'),
            });
            try {
                const { nome, valorAtual } = createAtivoSchema.parse(request.body);
                const ativo = yield prisma.ativoFinanceiro.create({
                    data: { nome, valorAtual },
                });
                return reply.code(201).send(ativo);
            }
            catch (error) {
                return reply.code(400).send({ message: 'Erro ao criar ativo', error });
            }
        }));
        // Exibir alocações de um ativo específico
        app.get('/ativos/:id/alocacoes', (request, reply) => __awaiter(this, void 0, void 0, function* () {
            const paramsSchema = zod_1.z.object({
                id: zod_1.z.string().regex(/^\d+$/, 'ID inválido'),
            });
            try {
                const { id } = paramsSchema.parse(request.params);
                const ativo = yield prisma.ativoFinanceiro.findUnique({
                    where: {
                        id: Number(id),
                    },
                    include: {
                        alocacoes: {
                            include: {
                                cliente: true,
                            },
                        },
                    },
                });
                if (!ativo) {
                    return reply.status(404).send({ message: 'Ativo não encontrado' });
                }
                return {
                    id: ativo.id,
                    nome: ativo.nome,
                    valorAtual: ativo.valorAtual,
                    alocacoes: ativo.alocacoes.map((aloc) => ({
                        clienteId: aloc.cliente.id,
                        nome: aloc.cliente.nome,
                        email: aloc.cliente.email,
                        quantidade: aloc.quantidade,
                    })),
                };
            }
            catch (error) {
                return reply.code(400).send({ message: 'Erro ao buscar alocações', error });
            }
        }));
    });
}
//# sourceMappingURL=ativos.js.map
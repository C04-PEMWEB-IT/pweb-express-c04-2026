import type { Request, Response } from "express";
import { Rarity } from "../generated/prisma";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";
import { buildMetadata, sendSuccess } from "../utils/response";
import { isEnumValue, parseId, parsePagination } from "../utils/validators";

// GET /api/skins?page=&limit=&heroId=&rarity=
export const getSkins = async (req: Request, res: Response) => {
    const { page, limit, skip } = parsePagination(req.query);
    const heroIdQuery = req.query.heroId;
    const rarityQuery = req.query.rarity;

    const where: Record<string, unknown> = {};

    if (heroIdQuery !== undefined && heroIdQuery !== "") {
        where.heroId = parseId(String(heroIdQuery), "heroId");
    }

    if (typeof rarityQuery === "string" && rarityQuery.trim() !== "") {
        const rarity = rarityQuery.trim();
        if (!isEnumValue(Rarity, rarity)) {
            throw new HttpError(400, "rarity tidak valid");
        }
        where.rarity = rarity;
    }

    const [totalItems, skins] = await Promise.all([
        prisma.skin.count({ where }),
        prisma.skin.findMany({
            where,
            skip,
            take: limit,
            include: {
                hero: {
                    select: { name: true },
                },
            },
            orderBy: { id: "asc" },
        }),
    ]);

    const metadata = buildMetadata(page, limit, totalItems);
    return sendSuccess(res, 200, "Berhasil mengambil data skin", skins, metadata);
};

// GET /api/skins/:skin_id
export const getSkinDetail = async (req: Request, res: Response) => {
    const skinId = parseId(req.params.skin_id, "skin_id");

    const skin = await prisma.skin.findUnique({
        where: { id: skinId },
        include: {
            hero: {
                select: { name: true },
            },
        },
    });

    if (!skin) {
        throw new HttpError(404, "Skin tidak ditemukan");
    }

    return sendSuccess(res, 200, "Berhasil mengambil detail skin", skin);
};

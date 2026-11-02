import type { Request, Response } from "express";
import { Lane, Role } from "../generated/prisma";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";
import { buildMetadata, sendSuccess } from "../utils/response";
import { isBlank, isEnumValue, parseId, parsePagination } from "../utils/validators";

// GET /api/heroes?page=&limit=&search=&role=
export const getHeroes = async (req: Request, res: Response) => {
    const { page, limit, skip } = parsePagination(req.query);
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;
    const role = typeof req.query.role === "string" ? req.query.role.trim() : undefined;

    const where: Record<string, unknown> = {};

    if (search) {
        where.name = { contains: search, mode: "insensitive" };
    }

    if (role) {
        if (!isEnumValue(Role, role)) {
            throw new HttpError(400, "role tidak valid");
        }
        where.role = role;
    }

    const [totalItems, heroes] = await Promise.all([
        prisma.hero.count({ where }),
        prisma.hero.findMany({
            where,
            skip,
            take: limit,
            orderBy: { id: "asc" },
        }),
    ]);

    const metadata = buildMetadata(page, limit, totalItems);
    return sendSuccess(res, 200, "Berhasil mengambil data hero", heroes, metadata);
};

// GET /api/heroes/:hero_id
export const getHeroDetail = async (req: Request, res: Response) => {
    const heroId = parseId(req.params.hero_id, "hero_id");

    const hero = await prisma.hero.findUnique({
        where: { id: heroId },
        include: {
            skins: {
                orderBy: { id: "asc" },
            },
        },
    });

    if (!hero) {
        throw new HttpError(404, "Hero tidak ditemukan");
    }

    return sendSuccess(res, 200, "Berhasil mengambil data hero", hero);
};

// POST /api/heroes
export const createHero = async (req: Request, res: Response) => {
    const { name, role, lane, releaseYear, priceBP, priceDiamond } = req.body ?? {};

    // 1. Validasi field wajib diisi
    if (isBlank(name) || isBlank(role) || isBlank(lane) || isBlank(releaseYear)) {
        throw new HttpError(400, "name, role, lane, dan releaseYear wajib diisi");
    }

    if (!isEnumValue(Role, role)) {
        throw new HttpError(400, "role tidak valid");
    }

    if (!isEnumValue(Lane, lane)) {
        throw new HttpError(400, "lane tidak valid");
    }

    const year = typeof releaseYear === "number" ? releaseYear : Number(releaseYear);
    if (!Number.isInteger(year) || year <= 0) {
        throw new HttpError(400, "releaseYear harus berupa angka tahun yang valid");
    }

    const cleanPriceBP = isBlank(priceBP) ? null : Number(priceBP);
    const cleanPriceDiamond = isBlank(priceDiamond) ? null : Number(priceDiamond);

    // 2. Cek apakah nama hero sudah digunakan
    const existingHero = await prisma.hero.findUnique({
        where: { name: String(name).trim() },
    });

    if (existingHero) {
        throw new HttpError(409, "Hero dengan nama tersebut sudah ada");
    }

    // 3. Simpan hero baru
    const newHero = await prisma.hero.create({
        data: {
            name: String(name).trim(),
            role,
            lane,
            releaseYear: year,
            priceBP: cleanPriceBP,
            priceDiamond: cleanPriceDiamond,
        },
    });

    return sendSuccess(res, 201, "Hero berhasil dibuat", newHero);
};

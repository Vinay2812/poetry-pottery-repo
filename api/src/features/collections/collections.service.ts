import { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { CollectionsWithProductsCount } from "./collections.type";

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCollectionsWithProductsCount(
    { limit, offset }: { limit: number; offset: number } = {
      limit: 10,
      offset: 0,
    },
  ): Promise<CollectionsWithProductsCount[]> {
    const collections = await this.prisma.collection.findMany({
      take: limit,
      where: {
        id: {
          gt: offset,
        },
      },
      select: {
        name: true,
        image_url: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        id: "desc", // latest collections first
      },
    });

    return collections
      .map((collection) => ({
        name: collection.name,
        image_url: collection.image_url,
        products_count: collection._count.products,
      }))
      .toSorted((a, b) => b.products_count - a.products_count); // sort by products count descending
  }
}

import { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<string[]> {
    const categories = await this.prisma.productCategory.findMany({
      select: {
        category: true,
      },
      distinct: ["category"],
    });

    return categories.map((category) => category.category);
  }
}

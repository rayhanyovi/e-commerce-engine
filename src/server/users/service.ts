import { Prisma } from "@prisma/client";

import { type UserListQuery } from "@/shared/contracts";
import { prisma } from "@/server/db";

const userListSelect = {
  id: true,
  role: true,
  name: true,
  email: true,
  phone: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      orders: true,
      addresses: true,
      carts: true,
    },
  },
} satisfies Prisma.UserSelect;

function buildUserWhere(query: UserListQuery): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = {};

  if (query.role) {
    where.role = query.role;
  }

  if (query.search) {
    where.OR = [
      {
        name: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: query.search,
          mode: "insensitive",
        },
      },
      {
        phone: {
          contains: query.search,
          mode: "insensitive",
        },
      },
    ];
  }

  return where;
}

export async function listAdminUsers(query: UserListQuery) {
  const where = buildUserWhere(query);
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      select: userListSelect,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
  };
}

export async function getAdminUserCounts() {
  const [totalUsers, totalCustomers, totalAdmins] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    }),
    prisma.user.count({
      where: {
        role: "ADMIN",
      },
    }),
  ]);

  return {
    totalUsers,
    totalCustomers,
    totalAdmins,
  };
}

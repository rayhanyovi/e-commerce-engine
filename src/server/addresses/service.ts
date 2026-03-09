import { Prisma } from "@prisma/client";

import {
  ErrorCodes,
  type CreateAddressDto,
  type UpdateAddressDto,
} from "@/shared/contracts";
import { prisma } from "@/server/db";
import { AppError } from "@/server/http";

type AddressDbClient = Prisma.TransactionClient | typeof prisma;

const addressSelect = {
  id: true,
  recipientName: true,
  phone: true,
  addressLine1: true,
  addressLine2: true,
  district: true,
  city: true,
  postalCode: true,
  notes: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AddressSelect;

type AddressRecord = Prisma.AddressGetPayload<{
  select: typeof addressSelect;
}>;

function serializeAddress(address: AddressRecord) {
  return {
    ...address,
    addressLine2: address.addressLine2 ?? "",
    district: address.district ?? "",
    city: address.city ?? "",
    postalCode: address.postalCode ?? "",
    notes: address.notes ?? "",
    createdAt: address.createdAt.toISOString(),
    updatedAt: address.updatedAt.toISOString(),
  };
}

function mapCreateAddressInput(dto: CreateAddressDto) {
  return {
    recipientName: dto.recipientName,
    phone: dto.phone,
    addressLine1: dto.addressLine1,
    addressLine2: dto.addressLine2 ?? null,
    district: dto.district ?? null,
    city: dto.city ?? null,
    postalCode: dto.postalCode ?? null,
    notes: dto.notes ?? null,
  };
}

function mapUpdateAddressInput(dto: UpdateAddressDto) {
  return {
    recipientName: dto.recipientName,
    phone: dto.phone,
    addressLine1: dto.addressLine1,
    addressLine2: dto.addressLine2 ?? null,
    district: dto.district ?? null,
    city: dto.city ?? null,
    postalCode: dto.postalCode ?? null,
    notes: dto.notes ?? null,
  };
}

async function getOwnedAddressOrThrow(
  userId: string,
  addressId: string,
  db: AddressDbClient = prisma,
) {
  const address = await db.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
    select: addressSelect,
  });

  if (!address) {
    throw new AppError(404, ErrorCodes.NOT_FOUND, "Address not found");
  }

  return address;
}

export async function listMyAddresses(userId: string, db: AddressDbClient = prisma) {
  const addresses = await db.address.findMany({
    where: {
      userId,
    },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }, { createdAt: "desc" }],
    select: addressSelect,
  });

  return addresses.map(serializeAddress);
}

export async function createAddress(userId: string, dto: CreateAddressDto) {
  return prisma.$transaction(async (tx) => {
    const existingCount = await tx.address.count({
      where: {
        userId,
      },
    });
    const shouldBeDefault = dto.isDefault || existingCount === 0;

    if (shouldBeDefault) {
      await tx.address.updateMany({
        where: {
          userId,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await tx.address.create({
      data: {
        userId,
        ...mapCreateAddressInput(dto),
        isDefault: shouldBeDefault,
      },
      select: addressSelect,
    });

    return serializeAddress(address);
  });
}

export async function updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
  return prisma.$transaction(async (tx) => {
    const existing = await getOwnedAddressOrThrow(userId, addressId, tx);
    let shouldBeDefault =
      dto.isDefault === undefined ? existing.isDefault : dto.isDefault;

    if (dto.isDefault === false && existing.isDefault) {
      const replacement = await tx.address.findFirst({
        where: {
          userId,
          id: {
            not: addressId,
          },
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
        },
      });

      if (replacement) {
        await tx.address.update({
          where: {
            id: replacement.id,
          },
          data: {
            isDefault: true,
          },
        });
        shouldBeDefault = false;
      } else {
        shouldBeDefault = true;
      }
    }

    if (shouldBeDefault) {
      await tx.address.updateMany({
        where: {
          userId,
          id: {
            not: addressId,
          },
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await tx.address.update({
      where: {
        id: addressId,
      },
      data: {
        ...mapUpdateAddressInput(dto),
        isDefault: shouldBeDefault,
      },
      select: addressSelect,
    });

    return serializeAddress(address);
  });
}

export async function deleteAddress(userId: string, addressId: string) {
  return prisma.$transaction(async (tx) => {
    const existing = await getOwnedAddressOrThrow(userId, addressId, tx);

    await tx.address.delete({
      where: {
        id: addressId,
      },
    });

    if (existing.isDefault) {
      const replacement = await tx.address.findFirst({
        where: {
          userId,
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
        },
      });

      if (replacement) {
        await tx.address.update({
          where: {
            id: replacement.id,
          },
          data: {
            isDefault: true,
          },
        });
      }
    }

    return {
      deleted: true,
    };
  });
}

import type { UserDto } from "@mundial-album/shared";
import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { toUserDto } from "../../utils/dto.js";
import { HttpError } from "../../utils/http-error.js";
import type { CreateUserInput } from "./users.schemas.js";

export async function createUser(input: CreateUserInput): Promise<UserDto> {
  const nickname = input.name.toLowerCase();

  try {
    const user = await prisma.user.create({
      data: {
        name: nickname
      }
    });

    return toUserDto(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new HttpError(409, "Ese nickname ya está en uso.");
    }

    throw error;
  }
}

export async function listUsers(): Promise<UserDto[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  });

  return users.map(toUserDto);
}

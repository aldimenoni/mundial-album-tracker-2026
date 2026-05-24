import type { UserDto } from "@mundial-album/shared";
import { prisma } from "../../config/prisma.js";
import { toUserDto } from "../../utils/dto.js";
import type { CreateUserInput } from "./users.schemas.js";

export async function createUser(input: CreateUserInput): Promise<UserDto> {
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.toLowerCase()
    }
  });

  return toUserDto(user);
}

export async function listUsers(): Promise<UserDto[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  });

  return users.map(toUserDto);
}

import type { Blueprint } from "../types/classes/PTypes.interface.ts";
import { AuthType } from "../types/enums/Admin.enum.ts";

export const StructureBlueprint: Blueprint[] = [
  {
    name: "if",
    hover: "if statement flow control",
    auth: AuthType.NONE,
    get: () => undefined,
    set: () => undefined,
  },
];

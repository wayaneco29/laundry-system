"use server";

import { revalidateTag } from "next/cache";

export const customerRevalidateTag = async (tag: string) => revalidateTag(tag);

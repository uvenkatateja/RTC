import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';

/**
 * Ensures the current Clerk user exists in the local `users` table.
 * This is called before any API operation to guarantee the FK constraint
 * on boards.ownerId → users.id is satisfied, even if the Clerk webhook
 * hasn't fired or is misconfigured.
 */
export async function ensureUserExists(userId: string): Promise<void> {
    // Check if user already exists
    const [existing] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (existing) return; // Already synced

    // Fetch user details from Clerk
    const clerkUser = await currentUser();

    if (!clerkUser) return; // Shouldn't happen if auth() passed

    // Insert into local DB
    await db
        .insert(users)
        .values({
            id: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
            avatarUrl: clerkUser.imageUrl || null,
        })
        .onConflictDoNothing(); // Race condition safe
}

import mongoose from 'mongoose';

/**
 * Cascade cleanup helpers.
 *
 * Problem these solve:
 *  - Deleting a Business previously left its staff, orders, bookings, reviews,
 *    shifts, etc. pointing at a now-deleted business → orphaned records that
 *    crash screens when they try to .populate() the missing business.
 *  - Deleting a User (owner) left their Business records pointing at a ghost
 *    owner, and staff Users pointing at nothing.
 *
 * Design notes:
 *  - We AUTO-DISCOVER every model that references 'Business' by scanning the
 *    Mongoose schema for any path whose `ref === 'Business'`. This means new
 *    models added in the future are cleaned up automatically — nothing to
 *    maintain here.
 *  - Models that support soft-delete (have an `isDeleted` field) are
 *    soft-deleted so the data stays recoverable and consistent with the rest
 *    of the codebase. Models without it are hard-deleted.
 *  - Every step is wrapped in try/catch so one failing collection can never
 *    block the rest of the cleanup.
 */

/** Returns the field names on a model's schema that reference 'Business'. */
function getBusinessRefFields(model: mongoose.Model<any>): string[] {
  const fields: string[] = [];
  model.schema.eachPath((pathName, schemaType: any) => {
    const ref =
      schemaType?.options?.ref ??
      schemaType?.caster?.options?.ref; // handles arrays of ObjectId refs
    if (ref === 'Business') fields.push(pathName);
  });
  return fields;
}

/**
 * Soft/hard-deletes every record (across all collections) that belongs to the
 * given business, then soft-deletes any staff User accounts that no longer
 * belong to an active business.
 */
export async function cleanupBusinessRelations(
  businessId: mongoose.Types.ObjectId | string,
): Promise<void> {
  const models = mongoose.connection.models;

  for (const name of Object.keys(models)) {
    if (name === 'Business') continue; // handled by the caller
    const model = models[name];

    const refFields = getBusinessRefFields(model);
    if (refFields.length === 0) continue;

    const filter = { $or: refFields.map((f) => ({ [f]: businessId })) };

    try {
      const supportsSoftDelete = Boolean(model.schema.path('isDeleted'));
      if (supportsSoftDelete) {
        await model.updateMany(filter, { $set: { isDeleted: true } });
      } else {
        await model.deleteMany(filter);
      }
    } catch (err) {
      console.warn(
        `[cascade] failed cleaning ${name} for business ${businessId}:`,
        (err as Error)?.message,
      );
    }
  }

  // Soft-delete staff logins that are now left without any active business.
  // (Runs AFTER the loop above, which already marked their RotaEmployee
  //  records isDeleted, so the "still active" count is accurate.)
  try {
    const RotaEmployee = models['RotaEmployee'];
    const User = models['User'];
    if (RotaEmployee && User) {
      const employees = await RotaEmployee.find({
        business: businessId,
        user: { $ne: null },
      }).select('user');

      for (const emp of employees) {
        if (!emp.user) continue;
        const stillActive = await RotaEmployee.countDocuments({
          user: emp.user,
          isDeleted: false,
        });
        if (stillActive === 0) {
          await User.updateMany(
            { _id: emp.user, role: 'staff' },
            { $set: { isDeleted: true } },
          );
        }
      }
    }
  } catch (err) {
    console.warn(
      `[cascade] failed cleaning staff users for business ${businessId}:`,
      (err as Error)?.message,
    );
  }
}

/**
 * Called before a User is deleted. Cascades into:
 *  - Any businesses they OWN (soft-deletes each + cleans its relations), and
 *  - Any staff RotaEmployee records linked to this user (soft-deleted).
 */
export async function cleanupUserRelations(
  userId: mongoose.Types.ObjectId | string,
): Promise<void> {
  const models = mongoose.connection.models;

  try {
    const Business = models['Business'];
    if (Business) {
      const owned = await Business.find({
        owner: userId,
        isDeleted: false,
      }).select('_id');

      for (const b of owned) {
        await cleanupBusinessRelations(b._id);
        await Business.updateOne(
          { _id: b._id },
          { $set: { isDeleted: true } },
        );
      }
    }
  } catch (err) {
    console.warn(
      `[cascade] failed cleaning owned businesses for user ${userId}:`,
      (err as Error)?.message,
    );
  }

  try {
    const RotaEmployee = models['RotaEmployee'];
    if (RotaEmployee) {
      await RotaEmployee.updateMany(
        { user: userId },
        { $set: { isDeleted: true } },
      );
    }
  } catch (err) {
    console.warn(
      `[cascade] failed cleaning employee records for user ${userId}:`,
      (err as Error)?.message,
    );
  }
}

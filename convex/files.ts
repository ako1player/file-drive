import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
export const createFile = mutation({
  args: {
    name: v.string(),
  },
  async handler(ctx, args) {
    //make sure users are logged in
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new ConvexError("You must be logged in to upload file.");
    }
    //name of the table data is being inserted to
    await ctx.db.insert("files", {
      name: args.name,
    });
  },
});

//fetching all entries in table
export const getFiles = query({
  args: {},
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return [];
    }
    return ctx.db.query("files").collect();
  },
});

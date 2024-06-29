import { getServerSession, User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import mongoose from "mongoose";
import dbConnection from "@/app/lib/dbConnection";
import USER from "@/app/models/User";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  const user: User = session.user as User;

  const userId = new mongoose.Types.ObjectId(user._id);

  await dbConnection();

  try {
    const aggregateUser = await USER.aggregate([
      { $match: { id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    if (!aggregateUser || aggregateUser.length === 0) {
      return Response.json(
        {
          success: false,
          message: "No messages found",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Messages fetched successfully",
        messages: aggregateUser[0].messages,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("error in getting messages: ", error);
    return Response.json(
      {
        success: false,
        message: "error in getting messages",
      },
      {
        status: 500,
      }
    );
  }
}

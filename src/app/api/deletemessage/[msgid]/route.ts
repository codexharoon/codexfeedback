import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import mongoose from "mongoose";
import dbConnection from "@/app/lib/dbConnection";
import USER from "@/app/models/User";

export async function DELETE(
  req: Request,
  { params }: { params: { msgid: string } }
) {
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
    const updateRes = await USER.updateOne(
      { _id: userId },
      {
        $pull: { messages: { _id: new mongoose.Types.ObjectId(params.msgid) } },
      }
    );

    if (updateRes.modifiedCount === 0) {
      return Response.json(
        {
          success: false,
          message: "No message found or message already deleted",
        },
        {
          status: 404,
        }
      );
    }

    return Response.json(
      {
        success: true,
        message: "Message deleted successfully",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log("error to delete message: ", error);
    return Response.json(
      {
        success: false,
        message: "error to delete message",
      },
      {
        status: 500,
      }
    );
  }
}

"use client";

import { Message } from "@/app/models/User";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { X } from "lucide-react";
import axios, { AxiosError } from "axios";
import { useToast } from "./ui/use-toast";
import { ApiResponse } from "@/app/types/ApiResponse";

interface MessageCardProps {
  message: Message;
  onMessageDelete: (id: string) => void;
}

const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`/api/deletemessage/${message._id}`);

      const data = response.data;

      if (!data.success) {
        throw new Error(data.message);
      }

      toast({
        title: data.message,
      });

      onMessageDelete(message._id as string);
    } catch (error) {
      console.log("message delete error", error);
      const axiosErr = error as AxiosError<ApiResponse>;

      toast({
        title: "Failed to delete message",
        description: axiosErr.response?.data.message || "An error occurred",
        variant: "destructive",
      });
    }
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>{message.message}</CardTitle>

        <div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <X />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your message and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleDelete}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <CardDescription>{message.createdAt.toString()}</CardDescription>
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};

export default MessageCard;

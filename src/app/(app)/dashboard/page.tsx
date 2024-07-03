"use client";

import axios, { AxiosError } from "axios";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { acceptMessageSchema } from "@/app/schemas/acceptMessage";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiResponse } from "@/app/types/ApiResponse";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/app/models/User";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, RefreshCcw } from "lucide-react";
import MessageCard from "@/components/MessageCard";

const page = () => {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof acceptMessageSchema>>({
    resolver: zodResolver(acceptMessageSchema),
  });

  const { register, watch, setValue } = form;

  const isAcceptingMessage = watch("acceptMessage");
  const [switchLoading, setSwitchLoading] = useState<boolean>(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [msgLoading, setMsgLoading] = useState<boolean>(false);

  const getIsAcceptingMessage = useCallback(async () => {
    setSwitchLoading(true);

    try {
      const response = await axios.get("/api/is-accepting-message");
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message);
      } else {
        setValue("acceptMessage", data.isAcceptingMessage);
      }
    } catch (error) {
      console.log("error to get accept message status:", error);
    } finally {
      setSwitchLoading(false);
    }
  }, [setValue]);

  const handleSwitchChange = async () => {
    setSwitchLoading(true);
    try {
      const response = await axios.post("/api/is-accepting-message", {
        isAcceptingMessage: !isAcceptingMessage,
      });
      const data = response.data;

      if (!data.success) {
        throw new Error(data.message);
      } else {
        setValue("acceptMessage", !isAcceptingMessage);
        toast({
          title: "Updated",
          description: "Successfully set accept message status",
        });
      }
    } catch (error) {
      console.log("error to set accept message status:", error);
      const axiosErr = error as AxiosError<ApiResponse>;
      toast({
        title: "An Error Occurred",
        description:
          axiosErr.response?.data.message ||
          "Failed to set accept message status",
        variant: "destructive",
      });
    } finally {
      setSwitchLoading(false);
    }
  };

  const getMessages = useCallback(
    async (refresh: boolean = false) => {
      setSwitchLoading(true);
      setMsgLoading(true);

      try {
        const response = await axios.get("/api/getmessages");
        const data = response.data;

        if (refresh) {
          toast({
            title: "success",
            description: "Already latest messages",
          });
        }

        if (!data.success) {
          toast({
            description: data.message,
          });
        } else {
          setMessages(data.messages);
        }
      } catch (error) {
        console.log("error to get messages:", error);
      } finally {
        setSwitchLoading(false);
        setMsgLoading(false);
      }
    },
    [setMsgLoading, setMessages, setSwitchLoading]
  );

  const onMessageDelete = useCallback(
    async (messageId: string) => {
      try {
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg._id !== messageId)
        );

        toast({
          title: "success",
          description: "Successfully deleted message",
        });
      } catch (error) {
        console.log("error to delete message:", error);
        toast({
          title: "An Error Occurred",
          description: "Failed to delete message",
          variant: "destructive",
        });
      }
    },
    [setMessages]
  );

  const { data: session } = useSession();

  useEffect(() => {
    if (!session || !session.user) return;

    getIsAcceptingMessage();
    getMessages();
  }, [session, getIsAcceptingMessage, getMessages]);

  const username = session?.user.username;

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Copied to clipboard",
    });
  };

  if (!session || !session.user)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="font-bold text-2xl text-center">Please, Login first.</h1>
      </div>
    );

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
      <h1 className="font-bold text-3xl">Dashboard</h1>

      <div className="mt-5 flex flex-col gap-3">
        <p className="font-bold">Copy your Unique Link</p>
        <div className="flex gap-2">
          <Input type="text" disabled value={profileUrl} />
          <Button onClick={copyToClipboard}>Copy</Button>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            {...register("acceptMessage")}
            disabled={switchLoading}
            checked={isAcceptingMessage}
            onCheckedChange={handleSwitchChange}
          />

          <span className="text-sm">
            Accept Messages {isAcceptingMessage ? "ON" : "OFF"}
          </span>
        </div>

        <Separator />

        <div>
          <Button
            onClick={(e) => {
              e.preventDefault();
              getMessages();
            }}
            variant={"outline"}
            disabled={msgLoading}
          >
            {msgLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {messages.length > 0
              ? messages.map((msg) => (
                  <MessageCard
                    key={`msg-${msg._id}`}
                    message={msg}
                    onMessageDelete={onMessageDelete}
                  />
                ))
              : "No messages found."}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;

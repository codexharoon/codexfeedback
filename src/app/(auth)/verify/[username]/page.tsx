"use client";

import { useParams } from "next/navigation";
import { verifyCodeSchema } from "@/app/schemas/verifyCode";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ApiResponse } from "@/app/types/ApiResponse";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const page = () => {
  const params = useParams<{ username: string }>();
  const username = decodeURIComponent(params.username);

  const [loading, setLoading] = useState<boolean>(false);

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof verifyCodeSchema>>({
    resolver: zodResolver(verifyCodeSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(values: z.infer<typeof verifyCodeSchema>) {
    setLoading(true);
    try {
      const response = await axios.post(`/api/verifycode`, {
        username,
        code: values.code,
      });

      const data = response.data;

      if (!data.success) {
        toast({
          title: "Failed to verify account",
          description: data.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account verified",
          description: data.message,
        });
        router.replace("/signin");
      }
    } catch (error) {
      console.log("verify code error", error);
      const axiosErr = error as AxiosError<ApiResponse>;
      toast({
        title: "An error occurred",
        description: axiosErr.response?.data.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="p-10 border rounded-lg w-full max-w-lg">
        <div className="text-center mb-5">
          <h1 className="font-bold text-lg">Verify your account</h1>
          <p className="text-xs">A verification code is sent to your email</p>
        </div>
        <div className="w-full">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <Input placeholder="code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <span className="flex gap-2 justify-center items-center">
                    <Loader2 className="h-4 w-4 animate-spin" />{" "}
                    <span>Verifying...</span>
                  </span>
                ) : (
                  "Verify"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default page;

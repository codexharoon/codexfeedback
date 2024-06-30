"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { userSignupSchema } from "@/app/schemas/userSignup";
import { useDebounceValue } from "usehooks-ts";
import { useState } from "react";

const Signup = () => {
  const [username, setUsername] = useState<string>("");
  const [usernameErrMsg, setUsernameErrMsg] = useState<string>("");
  const [findUsernameLoading, setFindUsernameLoading] =
    useState<boolean>(false);
  const [formSubmitLoading, setFormSubmitLoading] = useState<boolean>(false);

  const debouncedUsername = useDebounceValue(username, 300);

  const form = useForm<z.infer<typeof userSignupSchema>>({
    resolver: zodResolver(userSignupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  return <div>Signup</div>;
};

export default Signup;

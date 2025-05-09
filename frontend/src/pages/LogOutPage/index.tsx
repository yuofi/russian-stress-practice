import Cookies from "js-cookie";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import trpc from "../../utils/trpc";
import { Loader } from "../../components/Loader";
import { GetStressPractice } from "../../utils/routes";
import React from "react";

export const LogOutPage = () => {
  const navigate = useNavigate();
  const trpcUtils = trpc.useContext();
  useEffect(() => {
    Cookies.remove("token");
    void trpcUtils.invalidate().then(() => {
      navigate(GetStressPractice());
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Loader size={"45"} speed={"0.7"} color={"blue"} />;
};

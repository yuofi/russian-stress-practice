import { Bouncy } from "ldrs/react";
import React from "react";
import "ldrs/react/Bouncy.css";
import { JellyTriangle } from 'ldrs/react'
import 'ldrs/react/JellyTriangle.css'


interface LoaderProps {
    size?: string
    speed?: string
    color?: string
}

export const Loader = ({size="45px", speed="1.2s", color="rgb(67, 73, 233)"}: LoaderProps) => {
  return (
    <>
      <JellyTriangle size={size} speed={speed} color={color} />
    </>
  );
};

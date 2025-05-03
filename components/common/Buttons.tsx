import React from "react";
import {
  ActionButtonProps,
  ButtonProps,
  StepperButtonProps,
} from "@/types/button";
import Image from "next/image";

export const Button: React.FC<ButtonProps> = ({
  onClick,
  name,
  disabled,
  loading,
}) => {
  return (
    <button
      type="button"
      className={`py-3 px-4 w-full font-medium cursor-pointer text-sm text-snow rounded-2xl bg-gradient-to-r justify-center items-center from-primary to-secondary flex gap-2 ${
        disabled && "pointer-events-none opacity-80"
      }`}
      disabled={disabled}
      onClick={onClick}
    >
      <Image
        src="/images/loading.svg"
        className={`animate-spin ${!loading && "hidden"}`}
        alt="loading"
        width={16}
        height={16}
      />
      {name}
    </button>
  );
};

export const StepperButton: React.FC<StepperButtonProps> = ({
  data,
  onClick,
}) => {
  return (
    <>
      {data.name === "more" ? (
        <button
          className={`rounded-lg border min-w-20 flex justify-center border-royalBlue text-royalBlue items-center gap-2  text-sm font-medium p-2.5 disabled:cursor-not-allowed`}
          disabled={data.disabled}
          onClick={() => onClick(data.name)}
        >
          <Image
            src="/images/plus.svg"
            className=""
            alt="Add more"
            width={16}
            height={16}
          />
          {data.label}
        </button>
      ) : (
        <button
          className={`${
            data.name === "invite" ? "rounded-2xl" : "rounded-lg"
          } border min-w-20 flex justify-center items-center gap-2  ${
            (data.name === "back" || data.name === "cancel") &&
            "border-platinum !bg-snow"
          } ${data.name === "next" && "border-primary "} ${
            data.name === "skip" &&
            "border-primary border-spacing-1 border-dashed"
          } ${
            data.name === "skip" || data.name === "invite"
              ? "text-primary"
              : "text-smokyBlack"
          }  ${
            data.name === "submit" ? "bg-primary text-snow border-none" : "bg-transparent"
          } text-sm font-medium p-2.5 disabled:cursor-not-allowed`}
          disabled={data.disabled}
          onClick={() => onClick(data.name)}
        >
          <Image
            src="/images/loading-black.svg"
            className={`animate-spin ${!data.loading && "hidden"}`}
            alt="loading"
            width={16}
            height={16}
          />
          {data.name === "invite" && (
            <Image
              src="/images/rounded-plus-primary.svg"
              width={20}
              height={20}
              alt="Plus"
            />
          )}
          {data.label}
          {data.name === "skip" && (
            <Image
              src="/images/skip.svg"
              className=""
              alt="loading"
              width={16}
              height={16}
            />
          )}
        </button>
      )}
    </>
  );
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  data,
  onClick,
}) => {
  return (
    <button
      onClick={() => onClick(data.name)}
      className={`${
        data.name === "primary"
          ? "bg-primary text-snow"
          : "bg-snow border text-liver disabled:bg-platinum border-platinum"
      } disabled:cursor-not-allowed rounded-lg text-sm font-medium p-2.5 flex justify-center items-center gap-2 truncate focus-visible:outline-none`}
      disabled={data.disabled}
    >
      <Image
        src={`/images/${data.icon}`}
        className="w-5"
        width={24}
        height={24}
        alt="Actions"
      />
      <span>{data.label}</span>
      <Image
        src="/images/loading-black.svg"
        className={`animate-spin ${!data.loading && "hidden"}`}
        alt="loading"
        width={16}
        height={16}
      />
    </button>
  );
};

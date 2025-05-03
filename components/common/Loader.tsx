import Image from "next/image";

const Loader = () => {
  return (
    <div>
      <Image
        src="/images/loader.png"
        alt="loader"
        width={95}
        height={91}
        className="animate-spin bg-transparent"
        priority
      />
    </div>
  );
};

export default Loader;

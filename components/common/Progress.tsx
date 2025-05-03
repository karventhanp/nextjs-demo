import { motion } from "framer-motion";

interface ProgressBarProps {
  percent: number;
}

interface CircularProgressProps {
  percent: number;
  radius: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percent }) => {
  return (
    <div className="rounded-2xl h-1.5 w-full bg-platinum overflow-hidden">
      <motion.div
        className="h-full bg-primary rounded-2xl"
        initial={{ width: "0%" }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
};

export const CircularProgress: React.FC<CircularProgressProps> = ({
  percent,
  radius,
}) => {
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const progress = (percent / 100) * circumference;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg width="100" height="100" className="absolute">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#F5F5F5"
          strokeWidth={strokeWidth}
        />
      </svg>

      <svg width="100" height="100" className="absolute">
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#29A38B"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </svg>

      <motion.span
        className="absolute text-xs font-medium text-smokyBlack"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {percent}%
      </motion.span>
    </div>
  );
};

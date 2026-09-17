export default function PageContainer({ children }: { children: React.ReactNode }) {
  return <div className="max-w-[1240px] mx-auto px-[clamp(20px,5vw,64px)] pt-[90px]">{children}</div>;
}

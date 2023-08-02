export default function CardWrapper({
  children,
  heading,
}: {
  children: React.ReactNode;
  heading: string;
}) {
  return (
    <div
      className="p-8 md:p-16 mb-10 md:mb-32 w-10/12  border-2 bg-white border-black 
    shadow-[2px_2px_0px_0px_rgba(128,128,128)]
     "
    >
      <div className="text-3xl font-semibold text-black capitalize">
        {heading}
      </div>
      {children}
    </div>
  );
}
